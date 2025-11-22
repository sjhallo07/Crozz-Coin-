import {
  formatNumber,
  formatTokenAmount,
  getStatusMessage,
  getTransactionDescription,
  successResponse,
  errorResponse,
  humanizeJob,
  humanizeTokenSummary,
  humanizeError,
} from "../../utils/humanize.js";

describe("Humanize Utilities", () => {
  describe("formatNumber", () => {
    it("should format numbers with thousands separators", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber("5000")).toBe("5,000");
    });

    it("should handle zero and small numbers", () => {
      expect(formatNumber(0)).toBe("0");
      expect(formatNumber(5)).toBe("5");
    });
  });

  describe("formatTokenAmount", () => {
    it("should format token amounts with CROZZ suffix", () => {
      expect(formatTokenAmount(1000)).toBe("1,000 CROZZ");
      expect(formatTokenAmount("500")).toBe("500 CROZZ");
    });
  });

  describe("getStatusMessage", () => {
    it("should return humanized status messages", () => {
      expect(getStatusMessage("queued")).toContain("waiting");
      expect(getStatusMessage("processing")).toContain("processed");
      expect(getStatusMessage("completed")).toContain("Success");
      expect(getStatusMessage("failed")).toContain("issue");
    });

    it("should return default message for unknown status", () => {
      expect(getStatusMessage("unknown")).toContain("status");
    });
  });

  describe("getTransactionDescription", () => {
    it("should describe mint transactions", () => {
      const desc = getTransactionDescription("mint", { amount: 1000 });
      expect(desc).toContain("Minting");
      expect(desc).toContain("1,000 CROZZ");
    });

    it("should describe burn transactions", () => {
      const desc = getTransactionDescription("burn", { coinId: "0x123456789" });
      expect(desc).toContain("Burning");
      expect(desc).toContain("0x123456");
    });

    it("should describe distribute transactions", () => {
      const desc = getTransactionDescription("distribute", {
        distributions: [{ to: "0xabc", amount: "100" }],
      });
      expect(desc).toContain("Distributing");
      expect(desc).toContain("1 recipient");
    });

    it("should handle multiple recipients", () => {
      const desc = getTransactionDescription("distribute", {
        distributions: [
          { to: "0xabc", amount: "100" },
          { to: "0xdef", amount: "200" },
        ],
      });
      expect(desc).toContain("2 recipients");
    });
  });

  describe("successResponse", () => {
    it("should create properly formatted success responses", () => {
      const response = successResponse("Operation successful", { id: "123" });
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("message", "Operation successful");
      expect(response).toHaveProperty("data", { id: "123" });
      expect(response).toHaveProperty("timestamp");
    });
  });

  describe("errorResponse", () => {
    it("should create properly formatted error responses", () => {
      const response = errorResponse("Something went wrong", { code: "ERR_001" });
      expect(response).toHaveProperty("success", false);
      expect(response).toHaveProperty("error", "Something went wrong");
      expect(response).toHaveProperty("details", { code: "ERR_001" });
      expect(response).toHaveProperty("timestamp");
    });
  });

  describe("humanizeJob", () => {
    it("should add humanized fields to job objects", () => {
      const job = {
        id: "job-123",
        type: "mint",
        status: "queued",
        attempts: 1,
        payload: { amount: 1000 },
        updatedAt: new Date().toISOString(),
      };

      const humanized = humanizeJob(job);
      expect(humanized).toHaveProperty("statusMessage");
      expect(humanized).toHaveProperty("description");
      expect(humanized).toHaveProperty("formattedUpdatedAt");
      expect(humanized.description).toContain("Minting");
    });

    it("should handle jobs without updatedAt", () => {
      const job = {
        id: "job-123",
        type: "burn",
        status: "completed",
        attempts: 1,
        payload: { coinId: "0xabc" },
      };

      const humanized = humanizeJob(job);
      expect(humanized.formattedUpdatedAt).toBeNull();
    });
  });

  describe("humanizeTokenSummary", () => {
    it("should add formatted fields to token summary", () => {
      const summary = {
        totalSupply: "1000000",
        circulating: "750000",
        holderCount: 42,
      };

      const humanized = humanizeTokenSummary(summary);
      expect(humanized).toHaveProperty("totalSupplyFormatted", "1,000,000 CROZZ");
      expect(humanized).toHaveProperty("circulatingFormatted", "750,000 CROZZ");
      expect(humanized).toHaveProperty("holderCountFormatted", "42");
      expect(humanized).toHaveProperty("summaryText");
      expect(humanized.summaryText).toContain("42 holders");
    });

    it("should handle singular holder", () => {
      const summary = {
        totalSupply: "1000",
        circulating: "1000",
        holderCount: 1,
      };

      const humanized = humanizeTokenSummary(summary);
      expect(humanized.summaryText).toContain("1 holder");
      expect(humanized.summaryText).not.toContain("holders");
    });
  });

  describe("humanizeError", () => {
    it("should humanize connection errors", () => {
      const error = new Error("ECONNREFUSED connection failed");
      const message = humanizeError(error);
      expect(message).toContain("connect");
      expect(message).toContain("blockchain network");
    });

    it("should humanize authorization errors", () => {
      const error = "401 unauthorized";
      const message = humanizeError(error);
      expect(message).toContain("permission");
    });

    it("should humanize not found errors", () => {
      const error = "404 not found";
      const message = humanizeError(error);
      expect(message).toContain("could not be found");
    });

    it("should provide default message for unknown errors", () => {
      const error = "Random error";
      const message = humanizeError(error);
      expect(message).toContain("unexpected error");
    });

    it("should handle string errors", () => {
      const message = humanizeError("timeout occurred");
      expect(message).toContain("took too long");
    });
  });
});
