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

export default router;
