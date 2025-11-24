import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { transactionService } from '../services/TransactionService.js';
import { humanizeJob, successResponse } from '../utils/humanize.js';

const router = Router();

router.use(authMiddleware);

router.post('/config', (req, res) => {
  // Persist config to secrets manager / DB in the real implementation.
  res.json(
    successResponse('Configuration updated successfully', {
      status: 'ok',
      config: req.body,
    })
  );
});

router.get('/jobs', (_req, res) => {
  const jobs = transactionService.list({ limit: 100 });
  const humanizedJobs = jobs.map((job) => humanizeJob(job));

  const stats = {
    total: jobs.length,
    queued: jobs.filter((j) => j.status === 'queued').length,
    processing: jobs.filter((j) => j.status === 'processing').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  res.json({
    jobs: humanizedJobs,
    stats,
    message: `Retrieved ${jobs.length} job${jobs.length === 1 ? '' : 's'} from the queue`,
  });
});

export default router;
