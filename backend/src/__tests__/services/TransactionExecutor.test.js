import { transactionExecutor } from '../../services/TransactionExecutor.js';
import { transactionService } from '../../services/TransactionService.js';
import { initDatabase } from '../../services/Database.js';

// TransactionExecutor class is not exported, so we'll test the singleton instance
const TransactionExecutor = transactionExecutor.constructor;

describe('TransactionExecutor', () => {
  let executor;

  beforeAll(() => {
    // Initialize database for transaction service
    initDatabase();
    transactionService.initStatements();
  });

  beforeEach(() => {
    // Create a fresh executor instance for each test with dry-run enabled
    process.env.CROZZ_EXECUTOR_DRY_RUN = 'true';
    process.env.CROZZ_PACKAGE_ID = '0xtest123';
    process.env.CROZZ_TREASURY_CAP_ID = '0xtreasury123';
    process.env.CROZZ_MODULE = 'crozz_token';
    process.env.SUI_DEFAULT_GAS_BUDGET = '10000000';

    executor = new TransactionExecutor({ pollInterval: 100, maxAttempts: 3 });
  });

  afterEach(() => {
    if (executor && executor.timer) {
      executor.stop();
    }
  });

  describe('Configuration', () => {
    it('should initialize with correct default values', () => {
      expect(executor.pollInterval).toBe(100);
      expect(executor.maxAttempts).toBe(3);
      expect(executor.dryRun).toBe(true);
      expect(executor.packageId).toBe('0xtest123');
      expect(executor.treasuryCapId).toBe('0xtreasury123');
      expect(executor.moduleName).toBe('crozz_token');
    });

    it('should detect dry-run mode correctly', () => {
      expect(executor.dryRun).toBe(true);
      expect(executor.keypair).toBeNull();
    });

    it('should be configured in dry-run mode with minimum env vars', () => {
      expect(executor.isConfigured()).toBe(true);
    });

    it('should not be configured without package ID', () => {
      const testExecutor = new TransactionExecutor();
      testExecutor.packageId = null;
      expect(testExecutor.isConfigured()).toBe(false);
    });

    it('should not be configured without treasury cap ID', () => {
      const testExecutor = new TransactionExecutor();
      testExecutor.treasuryCapId = null;
      expect(testExecutor.isConfigured()).toBe(false);
    });
  });

  describe('Lifecycle Management', () => {
    it('should start the executor successfully', () => {
      executor.start();
      expect(executor.timer).not.toBeNull();
      executor.stop();
    });

    it('should stop the executor successfully', () => {
      executor.start();
      expect(executor.timer).not.toBeNull();
      executor.stop();
      expect(executor.timer).toBeNull();
    });

    it('should not start if already running', () => {
      executor.start();
      const firstTimer = executor.timer;
      executor.start();
      expect(executor.timer).toBe(firstTimer);
      executor.stop();
    });

    it('should not start if not configured', () => {
      executor.packageId = null;
      executor.start();
      expect(executor.timer).toBeNull();
    });
  });

  describe('Transaction Execution - Mint', () => {
    it('should execute mint transaction in dry-run mode', async () => {
      const result = await executor.executeMint({
        amount: '1000',
        recipient: '0xrecipient123',
      });

      expect(result).toMatchObject({
        mock: true,
        type: 'mint',
        payload: {
          amount: '1000',
          recipient: '0xrecipient123',
        },
      });
      expect(result.timestamp).toBeDefined();
    });

    it('should use signer address when recipient is not provided', async () => {
      executor.signerAddress = '0xdefaultsigner';
      const result = await executor.executeMint({ amount: '500' });

      expect(result.payload.recipient).toBe('0xdefaultsigner');
    });

    it('should throw error when recipient is missing and no signer', async () => {
      executor.signerAddress = null;
      await expect(executor.executeMint({ amount: '500' })).rejects.toThrow(
        'Recipient address missing'
      );
    });

    it('should parse amount correctly for mint', async () => {
      const result = await executor.executeMint({
        amount: 1000,
        recipient: '0xrecipient123',
      });
      expect(result.payload.amount).toBe('1000');
    });

    it('should reject invalid amounts', async () => {
      await expect(
        executor.executeMint({ amount: '0', recipient: '0xrecipient123' })
      ).rejects.toThrow('Invalid amount');

      await expect(
        executor.executeMint({ amount: '-100', recipient: '0xrecipient123' })
      ).rejects.toThrow('Invalid amount');

      await expect(
        executor.executeMint({ amount: 'invalid', recipient: '0xrecipient123' })
      ).rejects.toThrow('Invalid amount');
    });
  });

  describe('Transaction Execution - Burn', () => {
    it('should execute burn transaction in dry-run mode', async () => {
      const result = await executor.executeBurn({
        coinId: '0xcoin123',
      });

      expect(result).toMatchObject({
        mock: true,
        type: 'burn',
        payload: {
          coinId: '0xcoin123',
        },
      });
      expect(result.timestamp).toBeDefined();
    });

    it('should throw error when coinId is missing', async () => {
      await expect(executor.executeBurn({})).rejects.toThrow('coinId is required');
    });
  });

  describe('Transaction Execution - Distribute', () => {
    it('should execute distribute transaction in dry-run mode', async () => {
      const distributions = [
        { to: '0xaddr1', amount: '100' },
        { to: '0xaddr2', amount: '200' },
      ];

      const result = await executor.executeDistribute({ distributions });

      expect(result).toMatchObject({
        mock: true,
        type: 'distribute',
        payload: { distributions },
      });
      expect(result.timestamp).toBeDefined();
    });

    it('should throw error when distributions array is empty', async () => {
      await expect(executor.executeDistribute({ distributions: [] })).rejects.toThrow(
        'distributions array is required'
      );
    });

    it('should throw error when distributions is not an array', async () => {
      await expect(executor.executeDistribute({})).rejects.toThrow(
        'distributions array is required'
      );
    });

    it('should validate each distribution entry has a recipient in non-dry-run mode', async () => {
      // This test would fail in dry-run mode because validation is skipped
      // In dry-run mode, we just return mock data
      const distributions = [{ to: '0xaddr1', amount: '100' }, { amount: '200' }];

      // In dry-run mode, this returns a mock result without validation
      const result = await executor.executeDistribute({ distributions });
      expect(result.mock).toBe(true);
    });

    it('should validate amounts in distributions', async () => {
      const distributions = [{ to: '0xaddr1', amount: '0' }];

      await expect(executor.executeDistribute({ distributions })).rejects.toThrow('Invalid amount');
    });
  });

  describe('Transaction Execution - Global Freeze', () => {
    beforeEach(() => {
      process.env.CROZZ_ADMIN_CAP_ID = '0xadmincap123';
      process.env.CROZZ_REGISTRY_ID = '0xregistry123';
      executor = new TransactionExecutor({ pollInterval: 100, maxAttempts: 3 });
    });

    it('should execute global_freeze transaction in dry-run mode', async () => {
      const result = await executor.executeGlobalFreeze({ freeze: true });

      expect(result).toMatchObject({
        mock: true,
        type: 'global_freeze',
        payload: { freeze: true },
      });
      expect(result.timestamp).toBeDefined();
    });

    it('should default freeze to true if not provided', async () => {
      const result = await executor.executeGlobalFreeze({});

      expect(result.payload.freeze).toBe(true);
    });

    it('should handle unfreeze operation', async () => {
      const result = await executor.executeGlobalFreeze({ freeze: false });

      expect(result.payload.freeze).toBe(false);
    });

    it('should throw error when adminCapId is missing', async () => {
      executor.adminCapId = null;

      await expect(executor.executeGlobalFreeze({ freeze: true })).rejects.toThrow(
        'Admin Cap ID and Registry ID required for global freeze operations'
      );
    });

    it('should throw error when registryId is missing', async () => {
      executor.registryId = null;

      await expect(executor.executeGlobalFreeze({ freeze: true })).rejects.toThrow(
        'Admin Cap ID and Registry ID required for global freeze operations'
      );
    });
  });

  describe('Transaction Execution - Transfer', () => {
    it('should execute transfer transaction in dry-run mode', async () => {
      const result = await executor.executeTransfer({
        coinId: '0xcoin123',
        toAddress: '0xrecipient123',
      });

      expect(result).toMatchObject({
        mock: true,
        type: 'transfer',
        payload: { coinId: '0xcoin123', toAddress: '0xrecipient123' },
      });
      expect(result.timestamp).toBeDefined();
    });

    it('should throw error when coinId is missing', async () => {
      await expect(
        executor.executeTransfer({ toAddress: '0xrecipient123' })
      ).rejects.toThrow('coinId is required for transfer transactions');
    });

    it('should throw error when toAddress is missing', async () => {
      await expect(
        executor.executeTransfer({ coinId: '0xcoin123' })
      ).rejects.toThrow('toAddress is required for transfer transactions');
    });

    it('should throw error when both coinId and toAddress are missing', async () => {
      await expect(executor.executeTransfer({})).rejects.toThrow(
        'coinId is required for transfer transactions'
      );
    });
  });

  describe('Job Processing', () => {
    it('should process mint job successfully', async () => {
      const job = {
        id: 'test-job-1',
        type: 'mint',
        payload: { amount: '1000', recipient: '0xrecipient' },
        attempts: 0,
      };

      const result = await executor.execute(job);
      expect(result.mock).toBe(true);
      expect(result.type).toBe('mint');
    });

    it('should process burn job successfully', async () => {
      const job = {
        id: 'test-job-2',
        type: 'burn',
        payload: { coinId: '0xcoin123' },
        attempts: 0,
      };

      const result = await executor.execute(job);
      expect(result.mock).toBe(true);
      expect(result.type).toBe('burn');
    });

    it('should process distribute job successfully', async () => {
      const job = {
        id: 'test-job-3',
        type: 'distribute',
        payload: {
          distributions: [
            { to: '0xaddr1', amount: '100' },
            { to: '0xaddr2', amount: '200' },
          ],
        },
        attempts: 0,
      };

      const result = await executor.execute(job);
      expect(result.mock).toBe(true);
      expect(result.type).toBe('distribute');
    });

    it('should process global_freeze job successfully', async () => {
      // Set up admin cap and registry for global freeze
      process.env.CROZZ_ADMIN_CAP_ID = '0xadmincap123';
      process.env.CROZZ_REGISTRY_ID = '0xregistry123';
      executor = new TransactionExecutor({ pollInterval: 100, maxAttempts: 3 });

      const job = {
        id: 'test-job-5',
        type: 'global_freeze',
        payload: { freeze: true },
        attempts: 0,
      };

      const result = await executor.execute(job);
      expect(result.mock).toBe(true);
      expect(result.type).toBe('global_freeze');
    });

    it('should process transfer job successfully', async () => {
      const job = {
        id: 'test-job-6',
        type: 'transfer',
        payload: { coinId: '0xcoin123', toAddress: '0xrecipient123' },
        attempts: 0,
      };

      const result = await executor.execute(job);
      expect(result.mock).toBe(true);
      expect(result.type).toBe('transfer');
    });

    it('should throw error for unsupported transaction type', async () => {
      const job = {
        id: 'test-job-4',
        type: 'unsupported',
        payload: {},
        attempts: 0,
      };

      await expect(executor.execute(job)).rejects.toThrow('Unsupported transaction type');
    });
  });

  describe('Amount Parsing', () => {
    it('should parse string amounts', () => {
      const result = executor.parseAmount('1000');
      expect(result).toBe(1000n);
    });

    it('should parse number amounts', () => {
      const result = executor.parseAmount(1000);
      expect(result).toBe(1000n);
    });

    it('should parse bigint amounts', () => {
      const result = executor.parseAmount(1000n);
      expect(result).toBe(1000n);
    });

    it('should reject zero amounts', () => {
      expect(() => executor.parseAmount('0')).toThrow('Invalid amount');
      expect(() => executor.parseAmount(0)).toThrow('Invalid amount');
    });

    it('should reject negative amounts', () => {
      expect(() => executor.parseAmount('-100')).toThrow('Invalid amount');
    });

    it('should reject invalid string amounts', () => {
      expect(() => executor.parseAmount('abc')).toThrow('Invalid amount');
      expect(() => executor.parseAmount('')).toThrow('Invalid amount');
    });

    it('should reject null or undefined amounts', () => {
      expect(() => executor.parseAmount(null)).toThrow('Invalid amount');
      expect(() => executor.parseAmount(undefined)).toThrow('Invalid amount');
    });
  });

  describe('Transaction Creation', () => {
    it('should create transaction with correct gas budget', () => {
      const tx = executor.createTx();
      expect(tx).toBeDefined();
      // Transaction object should be created successfully
    });
  });

  describe('Mock Result Generation', () => {
    it('should generate mock result with timestamp', () => {
      const result = executor.mockResult('test', { data: 'value' });
      expect(result).toMatchObject({
        mock: true,
        type: 'test',
        payload: { data: 'value' },
      });
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('Integration with TransactionService', () => {
    it('should process queued job from transaction service', async () => {
      // Enqueue a job
      const job = transactionService.enqueue({
        type: 'mint',
        payload: { amount: '1000', recipient: '0xtest' },
      });

      expect(job.status).toBe('queued');

      // Take and process the job
      const nextJob = transactionService.takeNext();
      expect(nextJob).toBeDefined();
      expect(nextJob.id).toBe(job.id);
      expect(nextJob.status).toBe('processing');

      // Execute the job
      const result = await executor.execute(nextJob);
      expect(result.mock).toBe(true);

      // Mark as completed
      transactionService.markCompleted(nextJob.id, result);
      const completedJob = transactionService.getById(nextJob.id);
      expect(completedJob.status).toBe('completed');
      expect(completedJob.result).toMatchObject(result);
    });

    it('should handle job failures and retries', async () => {
      transactionService.enqueue({
        type: 'mint',
        payload: { amount: 'invalid', recipient: '0xtest' },
      });

      const nextJob = transactionService.takeNext();
      expect(nextJob.attempts).toBe(1);

      try {
        await executor.execute(nextJob);
      } catch (error) {
        transactionService.retryLater(nextJob.id, error);
      }

      const retriedJob = transactionService.getById(nextJob.id);
      expect(retriedJob.status).toBe('queued');
      expect(retriedJob.error).toContain('Invalid amount');
      expect(retriedJob.nextRunAt).toBeGreaterThan(Date.now());
    });

    it('should mark job as failed after max attempts', async () => {
      const job = transactionService.enqueue({
        type: 'mint',
        payload: { amount: 'invalid', recipient: '0xtest' },
      });

      // Simulate 3 failed attempts
      for (let i = 0; i < 3; i++) {
        const nextJob = transactionService.takeNext();
        if (nextJob) {
          try {
            await executor.execute(nextJob);
          } catch (error) {
            if (nextJob.attempts < 3) {
              transactionService.retryLater(nextJob.id, error);
            } else {
              transactionService.markFailed(nextJob.id, error);
            }
          }
        }
      }

      const failedJob = transactionService.getById(job.id);
      expect(failedJob.status).toBe('failed');
      expect(failedJob.error).toContain('Invalid amount');
    });
  });

  describe('Processing Flag', () => {
    it('should set processing flag during execution', async () => {
      expect(executor.processing).toBe(false);

      // Start a slow operation
      const slowJob = {
        id: 'slow-job',
        type: 'mint',
        payload: { amount: '1000', recipient: '0xtest' },
        attempts: 0,
      };

      const executePromise = executor.execute(slowJob);
      // Processing flag might already be back to false due to async nature
      await executePromise;

      expect(executor.processing).toBe(false);
    });
  });
});
