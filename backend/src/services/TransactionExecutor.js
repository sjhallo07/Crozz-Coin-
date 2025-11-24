import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64 } from '@mysten/sui/utils';
import { suiClient } from './SuiClient.js';
import { transactionService } from './TransactionService.js';

const DEFAULT_MODULE = 'crozz_token';
const RETRYABLE_TYPES = new Set(['mint', 'burn', 'distribute', 'freeze_wallet']);

const buildKeypair = (value) => {
  if (!value) return null;
  const normalized = value.startsWith('ed25519:') ? value.split(':')[1] : value;
  const secretKeyBytes = fromB64(normalized);

  if (secretKeyBytes.length === 33 && secretKeyBytes[0] === 0) {
    return Ed25519Keypair.fromSecretKey(secretKeyBytes.slice(1));
  }

  if (secretKeyBytes.length === 64) {
    return Ed25519Keypair.fromSecretKey(secretKeyBytes.slice(0, 32));
  }

  return Ed25519Keypair.fromSecretKey(secretKeyBytes);
};

class TransactionExecutor {
  constructor({ pollInterval = 3000, maxAttempts = 3 } = {}) {
    this.pollInterval = pollInterval;
    this.maxAttempts = maxAttempts;
    this.dryRun = process.env.CROZZ_EXECUTOR_DRY_RUN === 'true';
    this.packageId = process.env.CROZZ_PACKAGE_ID;
    this.moduleName = process.env.CROZZ_MODULE ?? DEFAULT_MODULE;
    this.treasuryCapId = process.env.CROZZ_TREASURY_CAP_ID;
    this.adminCapId = process.env.CROZZ_ADMIN_CAP_ID;
    this.registryId = process.env.CROZZ_REGISTRY_ID;
    this.gasBudget = Number(process.env.SUI_DEFAULT_GAS_BUDGET ?? 10_000_000);
    this.timer = null;
    this.processing = false;
    this.keypair = this.dryRun ? null : buildKeypair(process.env.SUI_ADMIN_PRIVATE_KEY ?? '');
    this.signerAddress = this.keypair
      ? this.keypair.getPublicKey().toSuiAddress()
      : process.env.CROZZ_DEFAULT_SIGNER;
  }

  start() {
    if (this.timer) return;

    if (!this.isConfigured()) {
      console.warn('[tx-executor] Missing configuration. Worker not started.');
      return;
    }

    this.timer = setInterval(() => void this.tick(), this.pollInterval);
    console.log('[tx-executor] Worker started with interval', this.pollInterval, 'ms');
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  isConfigured() {
    if (this.dryRun) {
      return Boolean(this.packageId && this.treasuryCapId);
    }
    return Boolean(
      this.packageId && this.treasuryCapId && this.keypair && this.keypair.getPublicKey()
    );
  }

  async tick() {
    if (this.processing) return;

    const job = transactionService.takeNext();
    if (!job) return;

    this.processing = true;

    try {
      const result = await this.execute(job);
      transactionService.markCompleted(job.id, result);
    } catch (error) {
      console.error(`[tx-executor] Job ${job.id} failed:`, error);
      if (job.attempts < this.maxAttempts && RETRYABLE_TYPES.has(job.type)) {
        transactionService.retryLater(job.id, error);
      } else {
        transactionService.markFailed(job.id, error);
      }
    } finally {
      this.processing = false;
    }
  }

  async execute(job) {
    switch (job.type) {
      case 'mint':
        return this.executeMint(job.payload ?? {});
      case 'burn':
        return this.executeBurn(job.payload ?? {});
      case 'distribute':
        return this.executeDistribute(job.payload ?? {});
      case 'freeze_wallet':
        return this.executeFreezeWallet(job.payload ?? {});
      default:
        throw new Error(`Unsupported transaction type: ${job.type}`);
    }
  }

  createTx() {
    const tx = new Transaction();
    tx.setGasBudget(this.gasBudget);
    return tx;
  }

  async executeMint(payload) {
    const amount = this.parseAmount(payload.amount);
    const recipient = payload.recipient ?? this.signerAddress;
    if (!recipient) {
      throw new Error('Recipient address missing for mint transaction');
    }

    if (this.dryRun) {
      return this.mockResult('mint', { amount: amount.toString(), recipient });
    }

    const tx = this.createTx();
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::mint`,
      arguments: [tx.object(this.treasuryCapId), tx.pure(amount), tx.pure(recipient)],
    });

    return this.submit(tx, 'mint');
  }

  async executeBurn(payload) {
    const coinId = payload.coinId;
    if (!coinId) {
      throw new Error('coinId is required for burn transactions');
    }

    if (this.dryRun) {
      return this.mockResult('burn', { coinId });
    }

    const tx = this.createTx();
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::burn`,
      arguments: [tx.object(this.treasuryCapId), tx.object(coinId)],
    });

    return this.submit(tx, 'burn');
  }

  async executeDistribute(payload) {
    const distributions = Array.isArray(payload.distributions) ? payload.distributions : [];
    if (distributions.length === 0) {
      throw new Error('distributions array is required');
    }

    if (this.dryRun) {
      return this.mockResult('distribute', { distributions });
    }

    const tx = this.createTx();
    distributions.forEach(({ to, amount }) => {
      const parsedAmount = this.parseAmount(amount);
      if (!to) {
        throw new Error('Each distribution entry requires a recipient address');
      }

      tx.moveCall({
        target: `${this.packageId}::${this.moduleName}::mint`,
        arguments: [tx.object(this.treasuryCapId), tx.pure(parsedAmount), tx.pure(to)],
      });
    });

    return this.submit(tx, 'distribute');
  }

  async executeFreezeWallet(payload) {
    const { address, freeze = true } = payload;
    if (!address) {
      throw new Error('Wallet address is required for freeze operations');
    }

    if (!this.adminCapId || !this.registryId) {
      throw new Error('Admin Cap ID and Registry ID required for freeze operations');
    }

    if (this.dryRun) {
      return this.mockResult('freeze_wallet', { address, freeze });
    }

    const tx = this.createTx();
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::set_wallet_freeze`,
      arguments: [
        tx.object(this.adminCapId),
        tx.object(this.registryId),
        tx.pure(address),
        tx.pure(freeze),
      ],
    });

    return this.submit(tx, 'freeze_wallet');
  }

  parseAmount(value) {
    try {
      const amount = typeof value === 'bigint' ? value : BigInt(value ?? 0);
      if (amount <= 0n) {
        throw new Error();
      }
      return amount;
    } catch {
      throw new Error(`Invalid amount: ${value}`);
    }
  }

  async submit(tx, label) {
    if (this.dryRun) {
      return this.mockResult(label, {
        commands: tx.toJSON()?.commands?.length ?? 0,
      });
    }

    if (!this.keypair) {
      throw new Error('SUI_ADMIN_PRIVATE_KEY is not configured');
    }

    const response = await this.keypair.signAndExecuteTransaction({
      transaction: tx,
      client: suiClient,
    });

    return {
      digest: response.digest,
      effects: response.effects,
      label,
    };
  }

  mockResult(type, payload) {
    return {
      mock: true,
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
  }
}

export const transactionExecutor = new TransactionExecutor();
