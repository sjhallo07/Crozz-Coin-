import cors from "cors";
import "dotenv/config";
import express from "express";
import adminRouter from "./routes/admin.js";
import authRouter from "./routes/auth.js";
import eventsRouter from "./routes/events.js";
import suiRouter from "./routes/sui.js";
import tokensRouter from "./routes/tokens.js";
import { initDatabase } from "./services/Database.js";
import { authService } from "./services/AuthService.js";
import { transactionService } from "./services/TransactionService.js";
import { transactionExecutor } from "./services/TransactionExecutor.js";
import { webSocketService } from "./services/WebSocketService.js";

// Initialize database and services
initDatabase();
transactionService.initStatements();
authService.initStatements();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tokens", tokensRouter);
app.use("/api/events", eventsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/sui", suiRouter);
app.use("/api/auth", authRouter);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

webSocketService.attach(server);
transactionExecutor.start();
