/**
 * Humanized response utilities for user-friendly API messages
 */

/**
 * Format a number with thousands separators
 * @param {number|string} value - The number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "0";
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

/**
 * Format a token amount with CROZZ suffix
 * @param {number|string} amount - Token amount
 * @returns {string} Formatted token amount
 */
export const formatTokenAmount = (amount) => {
  return `${formatNumber(amount)} CROZZ`;
};

/**
 * Get humanized message for transaction status
 * @param {string} status - Transaction status
 * @returns {string} User-friendly status message
 */
export const getStatusMessage = (status) => {
  const messages = {
    queued: "Your transaction is waiting in line and will be processed shortly.",
    pending: "Your transaction is being prepared for submission.",
    processing: "Your transaction is currently being processed on the blockchain.",
    completed: "Success! Your transaction has been completed.",
    failed: "We encountered an issue processing your transaction. Please try again.",
  };
  return messages[status] || "Transaction status is being updated.";
};

const COIN_ID_DISPLAY_LENGTH = 8;

/**
 * Get humanized message for transaction type
 * @param {string} type - Transaction type
 * @param {object} payload - Transaction payload
 * @returns {string} User-friendly transaction description
 */
export const getTransactionDescription = (type, payload = {}) => {
  switch (type) {
    case "mint":
      return `Minting ${formatTokenAmount(payload.amount || 0)} to ${
        payload.recipient ? "specified wallet" : "default account"
      }`;
    case "burn":
      return `Burning tokens from coin ${
        payload.coinId ? payload.coinId.slice(0, COIN_ID_DISPLAY_LENGTH) + "..." : ""
      }`;
    case "distribute":
      return `Distributing tokens to ${payload.distributions?.length || 0} recipient${
        payload.distributions?.length === 1 ? "" : "s"
      }`;
    default:
      return `Processing ${type} transaction`;
  }
};

/**
 * Create a success response with humanized message
 * @param {string} message - Human-readable success message
 * @param {object} data - Response data
 * @returns {object} Formatted success response
 */
export const successResponse = (message, data = {}) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create an error response with humanized message
 * @param {string} message - Human-readable error message
 * @param {object} details - Error details
 * @returns {object} Formatted error response
 */
export const errorResponse = (message, details = {}) => {
  return {
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Humanize job status for display
 * @param {object} job - Job object
 * @returns {object} Job with humanized fields
 */
export const humanizeJob = (job) => {
  return {
    ...job,
    statusMessage: getStatusMessage(job.status),
    description: getTransactionDescription(job.type, job.payload),
    formattedUpdatedAt: job.updatedAt
      ? new Date(job.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : null,
  };
};

/**
 * Humanize token summary for display
 * @param {object} summary - Token summary object
 * @returns {object} Summary with humanized fields
 */
export const humanizeTokenSummary = (summary) => {
  const totalSupply = parseInt(summary.totalSupply || "0", 10);
  const circulating = parseInt(summary.circulating || "0", 10);
  const holderCount = summary.holderCount || 0;

  return {
    ...summary,
    totalSupplyFormatted: formatTokenAmount(totalSupply),
    circulatingFormatted: formatTokenAmount(circulating),
    holderCountFormatted: formatNumber(holderCount),
    summaryText: `${formatNumber(holderCount)} holder${
      holderCount === 1 ? "" : "s"
    } currently hold ${formatTokenAmount(
      circulating
    )} in circulation out of ${formatTokenAmount(totalSupply)} total supply.`,
  };
};

/**
 * Get humanized error message from common errors
 * @param {Error|string} error - Error object or message
 * @returns {string} User-friendly error message
 */
export const humanizeError = (error) => {
  const errorString = error instanceof Error ? error.message : String(error);

  // Common error patterns
  if (errorString.includes("ECONNREFUSED")) {
    return "Unable to connect to the blockchain network. Please check your connection and try again.";
  }
  if (errorString.includes("insufficient funds")) {
    return "Insufficient funds to complete this transaction. Please ensure you have enough tokens.";
  }
  if (errorString.includes("unauthorized") || errorString.includes("401")) {
    return "You don't have permission to perform this action. Please sign in again.";
  }
  if (errorString.includes("not found") || errorString.includes("404")) {
    return "The requested resource could not be found. Please verify and try again.";
  }
  if (errorString.includes("timeout")) {
    return "The request took too long to complete. Please try again.";
  }
  if (errorString.includes("validation") || errorString.includes("invalid")) {
    return "The information provided is invalid. Please check your input and try again.";
  }

  // Default fallback
  return "An unexpected error occurred. Please try again or contact support if the issue persists.";
};
