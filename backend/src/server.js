import cors from "cors";
import "dotenv/config";
import express from "express";
import adminRouter from "./routes/admin.js";
import eventsRouter from "./routes/events.js";
import suiRouter from "./routes/sui.js";
import tokensRouter from "./routes/tokens.js";
import { transactionExecutor } from "./services/TransactionExecutor.js";
import { webSocketService } from "./services/WebSocketService.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tokens", tokensRouter);
app.use("/api/events", eventsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/sui", suiRouter);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

webSocketService.attach(server);
transactionExecutor.start();
