import { Router } from "express";
import { transactionService } from "../services/TransactionService.js";

const router = Router();

router.get("/recent", (_req, res) => {
  res.json(transactionService.list());
});

export default router;
