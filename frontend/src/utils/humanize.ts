/**
 * Humanized display utilities for user-friendly UI messages
 */

/**
 * Format a number with thousands separators
 */
export const formatNumber = (value: number | string): string => {
  if (value === null || value === undefined || value === "") return "0";
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

/**
 * Format a token amount with CROZZ suffix
 */
export const formatTokenAmount = (amount: number | string): string => {
  return `${formatNumber(amount)} CROZZ`;
};

/**
 * Get humanized status badge text
 */
export const getStatusBadgeText = (status: string): string => {
  const badges: Record<string, string> = {
    queued: "⏳ Queued",
    pending: "⏳ Pending",
    processing: "⚙️ Processing",
    completed: "✅ Completed",
    failed: "❌ Failed",
  };
  return badges[status] || status;
};

/**
 * Get humanized message for transaction status
 */
export const getStatusMessage = (status: string): string => {
  const messages: Record<string, string> = {
    queued: "Your transaction is waiting in line and will be processed shortly.",
    pending: "Your transaction is being prepared for submission.",
    processing: "Your transaction is currently being processed on the blockchain.",
    completed: "Success! Your transaction has been completed.",
    failed: "We encountered an issue. Please review the error details below.",
  };
  return messages[status] || "Transaction status is being updated.";
};

const COIN_ID_DISPLAY_LENGTH = 8;

/**
 * Get humanized description for transaction type
 */
export const getTransactionDescription = (
  type: string,
  payload?: Record<string, unknown>
): string => {
  if (!payload) return `${type} transaction`;

  switch (type) {
    case "mint":
      return `Mint ${formatTokenAmount(payload.amount as string | number)} ${
        payload.recipient ? "to specified wallet" : "to default account"
      }`;
    case "burn":
      return `Burn tokens from ${
        payload.coinId
          ? String(payload.coinId).slice(0, COIN_ID_DISPLAY_LENGTH) + "..."
          : "coin"
      }`;
    case "distribute": {
      const distributions = payload.distributions as Array<unknown> | undefined;
      const count = distributions?.length || 0;
      return `Distribute to ${count} recipient${count === 1 ? "" : "s"}`;
    }
    default:
      return `${type} transaction`;
  }
};

/**
 * Format a timestamp to relative time (e.g., "2 minutes ago")
 */
export const timeAgo = (timestamp: string | Date): string => {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

/**
 * Format a date to human-readable string
 */
export const formatDate = (timestamp: string | Date): string => {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Truncate address for display
 */
export const truncateAddress = (address: string, start = 6, end = 4): string => {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * Get humanized error message from API errors
 */
export const humanizeError = (error: unknown): string => {
  if (!error) return "An unknown error occurred";

  // Handle structured error responses
  if (typeof error === "object" && error !== null) {
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  const errorString = String(error);

  // Common error patterns
  if (errorString.includes("Failed to fetch") || errorString.includes("NetworkError")) {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  if (errorString.includes("401") || errorString.includes("unauthorized")) {
    return "Authentication required. Please sign in again.";
  }
  if (errorString.includes("403") || errorString.includes("forbidden")) {
    return "You don't have permission to perform this action.";
  }
  if (errorString.includes("404") || errorString.includes("not found")) {
    return "The requested resource could not be found.";
  }
  if (errorString.includes("500") || errorString.includes("server error")) {
    return "A server error occurred. Please try again later.";
  }
  if (errorString.includes("timeout")) {
    return "The request timed out. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
};

/**
 * Get success message for transaction actions
 */
export const getSuccessMessage = (action: string): string => {
  const messages: Record<string, string> = {
    mint: "🎉 Mint request submitted successfully! Check the job queue for progress.",
    burn: "🔥 Burn request submitted successfully! Tokens will be destroyed shortly.",
    distribute: "📤 Distribution request submitted successfully! Recipients will receive tokens soon.",
  };
  return messages[action] || "Request submitted successfully!";
};

/**
 * Format supply metrics with context
 */
export const formatSupplyMetric = (
  total: string | number,
  circulating: string | number
): string => {
  const totalNum = typeof total === "string" ? parseInt(total, 10) : total;
  const circNum = typeof circulating === "string" ? parseInt(circulating, 10) : circulating;

  if (totalNum === 0) return "No tokens minted yet";

  const percentage = ((circNum / totalNum) * 100).toFixed(1);
  return `${percentage}% in circulation`;
};
