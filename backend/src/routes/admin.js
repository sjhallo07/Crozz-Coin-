import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/config", (req, res) => {
  // Persist config to secrets manager / DB in the real implementation.
  res.json({ status: "ok", config: req.body });
});

export default router;
