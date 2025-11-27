import { Router } from 'express';
import { suiClient, currentNetwork, isMainnet, isTestnet } from '../services/SuiClient.js';

const router = Router();

const DEFAULT_GAS_BUDGET = Number(process.env.SUI_DEFAULT_GAS_BUDGET ?? 10_000_000);

/**
 * GET /api/sui/network
 * Returns current network configuration
 */
router.get('/network', (_req, res) => {
  res.json({
    network: currentNetwork,
    isMainnet,
    isTestnet,
    packageId: process.env.CROZZ_PACKAGE_ID ?? null,
    module: process.env.CROZZ_MODULE ?? 'crozz_token',
  });
});

router.post('/token-address', async (req, res) => {
  const {
    packageId,
    module: moduleName,
    functionName,
    typeArguments = [],
    arguments: manualArgs,
    creator,
    collection,
    name,
    gasBudget,
  } = req.body;

  if (!packageId || !moduleName || !functionName) {
    return res.status(400).json({ error: 'packageId, module, and functionName are required.' });
  }

  const callArgs =
    Array.isArray(manualArgs) && manualArgs.length > 0
      ? manualArgs
      : [creator, collection, name].filter(
          (value) => typeof value === 'string' && value.length > 0
        );

  try {
    const result = await suiClient.call({
      packageObjectId: packageId,
      module: moduleName,
      function: functionName,
      typeArguments,
      arguments: callArgs,
      gasBudget: gasBudget ?? DEFAULT_GAS_BUDGET,
    });

    res.json({ tokenAddress: result });
  } catch (error) {
    console.error('/api/sui/token-address failed', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
