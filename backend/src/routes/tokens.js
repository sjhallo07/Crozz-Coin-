import { Router } from 'express';
import { transactionService } from '../services/TransactionService.js';
import {
  successResponse,
  errorResponse,
  humanizeTokenSummary,
  formatTokenAmount,
} from '../utils/humanize.js';

const router = Router();

router.get('/summary', (_req, res) => {
  const summary = { totalSupply: '0', circulating: '0', holderCount: 0 };
  const humanized = humanizeTokenSummary(summary);
  res.json({
    ...summary,
    ...humanized,
    message: 'Token summary retrieved successfully',
  });
});

router.post('/mint', (req, res) => {
  const { amount, recipient } = req.body;
  const record = transactionService.enqueue({
    type: 'mint',
    payload: req.body,
  });

  const message = `Mint request queued successfully! ${formatTokenAmount(
    amount || 0
  )} will be minted${recipient ? ' to the specified recipient' : ''}.`;

  res.status(202).json(
    successResponse(message, {
      job: record,
      nextSteps: 'Track progress in the job queue or check back in a few moments.',
    })
  );
});

router.post('/burn', (req, res) => {
  const { coinId } = req.body ?? {};
  if (!coinId) {
    return res
      .status(400)
      .json(
        errorResponse('Please provide a coin ID to burn.', { field: 'coinId', required: true })
      );
  }

  const record = transactionService.enqueue({
    type: 'burn',
    payload: { coinId },
  });

  res.status(202).json(
    successResponse(
      'Burn request queued successfully! The specified coin will be permanently destroyed.',
      {
        job: record,
        coinId: coinId.slice(0, 10) + '...',
      }
    )
  );
});

router.post('/distribute', (req, res) => {
  const { distributions } = req.body ?? {};
  if (!Array.isArray(distributions) || distributions.length === 0) {
    return res
      .status(400)
      .json(
        errorResponse('Please provide at least one recipient in the distributions array.', {
          field: 'distributions',
          format: 'Array of {to, amount} objects',
        })
      );
  }

  const record = transactionService.enqueue({
    type: 'distribute',
    payload: { distributions },
  });

  const totalRecipients = distributions.length;
  res.status(202).json(
    successResponse(
      `Distribution request queued! Tokens will be sent to ${totalRecipients} recipient${
        totalRecipients === 1 ? '' : 's'
      }.`,
      {
        job: record,
        recipientCount: totalRecipients,
      }
    )
  );
});

export default router;
