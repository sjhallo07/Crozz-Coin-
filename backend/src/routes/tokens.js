import { Router } from "express";
import { transactionService } from "../services/TransactionService.js";

const router = Router();

router.get("/summary", (_req, res) => {
  res.json({ totalSupply: "0", circulating: "0", holderCount: 0 });
});

router.post("/mint", (req, res) => {
  const record = transactionService.enqueue({
    type: "mint",
    payload: req.body,
  });
  res.status(202).json(record);
});

router.post("/burn", (req, res) => {
  const { coinId } = req.body ?? {};
  if (!coinId) {
    return res.status(400).json({ error: "coinId is required" });
  }

  const record = transactionService.enqueue({
    type: "burn",
    payload: { coinId },
  });

  res.status(202).json(record);
});

router.post("/distribute", (req, res) => {
  const { distributions } = req.body ?? {};
  if (!Array.isArray(distributions) || distributions.length === 0) {
    return res.status(400).json({ error: "distributions array is required" });
  }

  const record = transactionService.enqueue({
    type: "distribute",
    payload: { distributions },
  });

  res.status(202).json(record);
});

export default router;
