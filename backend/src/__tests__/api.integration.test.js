import request from "supertest";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase } from "../services/Database.js";
import { transactionService } from "../services/TransactionService.js";
import { authService } from "../services/AuthService.js";
import adminRouter from "../routes/admin.js";
import authRouter from "../routes/auth.js";
import eventsRouter from "../routes/events.js";
import suiRouter from "../routes/sui.js";
import tokensRouter from "../routes/tokens.js";

// Load .env from root directory using a more robust path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../../.env") });

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.use("/api/tokens", tokensRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/sui", suiRouter);
  app.use("/api/auth", authRouter);
  
  return app;
};

describe("API Integration Tests", () => {
  let app;
  
  beforeAll(() => {
    // Initialize database and services
    initDatabase();
    transactionService.initStatements();
    authService.initStatements();
    
    app = createTestApp();
  });

  describe("GET /api/tokens/summary", () => {
    it("should return token summary", async () => {
      const response = await request(app)
        .get("/api/tokens/summary")
        .expect(200);

      expect(response.body).toHaveProperty("totalSupply");
      expect(response.body).toHaveProperty("circulating");
      expect(response.body).toHaveProperty("holderCount");
      expect(typeof response.body.totalSupply).toBe("string");
      expect(typeof response.body.circulating).toBe("string");
      expect(typeof response.body.holderCount).toBe("number");
    });
  });

  describe("POST /api/tokens/mint", () => {
    it("should enqueue mint transaction", async () => {
      const response = await request(app)
        .post("/api/tokens/mint")
        .send({ amount: "1000", recipient: "0xtest" })
        .expect(202);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("status", "queued");
      expect(response.body).toHaveProperty("type", "mint");
      expect(response.body.payload).toEqual({ amount: "1000", recipient: "0xtest" });
    });

    it("should accept mint without recipient", async () => {
      const response = await request(app)
        .post("/api/tokens/mint")
        .send({ amount: "500" })
        .expect(202);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("status", "queued");
      expect(response.body.payload).toHaveProperty("amount", "500");
    });
  });

  describe("POST /api/tokens/burn", () => {
    it("should enqueue burn transaction with valid coinId", async () => {
      const response = await request(app)
        .post("/api/tokens/burn")
        .send({ coinId: "0xcoinstub" })
        .expect(202);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("status", "queued");
      expect(response.body).toHaveProperty("type", "burn");
      expect(response.body.payload).toHaveProperty("coinId", "0xcoinstub");
    });

    it("should return 400 when coinId is missing", async () => {
      const response = await request(app)
        .post("/api/tokens/burn")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error", "coinId is required");
    });
  });

  describe("POST /api/tokens/distribute", () => {
    it("should enqueue distribute transaction with valid distributions", async () => {
      const distributions = [
        { to: "0xabc", amount: "100" },
        { to: "0xdef", amount: "200" },
      ];

      const response = await request(app)
        .post("/api/tokens/distribute")
        .send({ distributions })
        .expect(202);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("status", "queued");
      expect(response.body).toHaveProperty("type", "distribute");
      expect(response.body.payload).toHaveProperty("distributions");
      expect(response.body.payload.distributions).toEqual(distributions);
    });

    it("should return 400 when distributions array is missing", async () => {
      const response = await request(app)
        .post("/api/tokens/distribute")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error", "distributions array is required");
    });

    it("should return 400 when distributions is empty", async () => {
      const response = await request(app)
        .post("/api/tokens/distribute")
        .send({ distributions: [] })
        .expect(400);

      expect(response.body).toHaveProperty("error", "distributions array is required");
    });
  });

  describe("GET /api/events/recent", () => {
    it("should return recent events list", async () => {
      const response = await request(app)
        .get("/api/events/recent")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/admin/jobs", () => {
    it("should return 401 without auth token", async () => {
      await request(app)
        .get("/api/admin/jobs")
        .expect(401);
    });

    it("should return 401 with invalid auth token", async () => {
      await request(app)
        .get("/api/admin/jobs")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("should return jobs list with valid auth token", async () => {
      const validToken = process.env.ADMIN_TOKEN;
      if (!validToken) {
        throw new Error("ADMIN_TOKEN environment variable is required for testing");
      }
      
      const response = await request(app)
        .get("/api/admin/jobs")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("jobs");
      expect(Array.isArray(response.body.jobs)).toBe(true);
    });
  });

  describe("POST /api/admin/config", () => {
    it("should return 401 without auth token", async () => {
      await request(app)
        .post("/api/admin/config")
        .send({ key: "value" })
        .expect(401);
    });

    it("should accept config with valid auth token", async () => {
      const validToken = process.env.ADMIN_TOKEN;
      if (!validToken) {
        throw new Error("ADMIN_TOKEN environment variable is required for testing");
      }
      
      const response = await request(app)
        .post("/api/admin/config")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ key: "value" })
        .expect(200);

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("config");
    });
  });

  describe("POST /api/sui/token-address", () => {
    it("should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/sui/token-address")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("packageId");
    });

    it("should return 400 when module is missing", async () => {
      const response = await request(app)
        .post("/api/sui/token-address")
        .send({ packageId: "0xtest" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 when functionName is missing", async () => {
      const response = await request(app)
        .post("/api/sui/token-address")
        .send({ packageId: "0xtest", module: "test" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    // Note: We can't test successful calls without a valid Sui setup
    // This would require mocking the SuiClient
  });

  describe("POST /api/auth/register", () => {
    it("should return 422 when email is invalid", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          username: "testuser",
          password: "password123",
        })
        .expect(422);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("details");
    });

    it("should return 422 when username is too short", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          username: "ab",
          password: "password123",
        })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 422 when password is too short", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          username: "testuser",
          password: "short",
        })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 422 when identifier is too short", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          identifier: "ab",
          password: "password123",
        })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 422 when password is too short", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          identifier: "testuser",
          password: "short",
        })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should return 422 when refreshToken is too short", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "short" })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should return 422 when refreshToken is missing", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .send({})
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should return 422 when email is invalid", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "invalid-email" })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/forgot-username", () => {
    it("should return 422 when email is invalid", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-username")
        .send({ email: "invalid-email" })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should return 422 when token is too short", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "short", password: "password123" })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 422 when password is too short", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "validtoken123", password: "short" })
        .expect(422);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 401 without auth token", async () => {
      await request(app)
        .get("/api/auth/me")
        .expect(401);
    });

    it("should return 401 with invalid token format", async () => {
      await request(app)
        .get("/api/auth/me")
        .set("Authorization", "InvalidFormat")
        .expect(401);
    });
  });
});
