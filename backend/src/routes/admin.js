import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { transactionService } from "../services/TransactionService.js";

const router = Router();

router.use(authMiddleware);

router.post("/config", (req, res) => {
  // Persist config to secrets manager / DB in the real implementation.
  res.json({ status: "ok", config: req.body });
});

router.get("/jobs", (_req, res) => {
  res.json({ jobs: transactionService.list({ limit: 100 }) });
});

export default router;
