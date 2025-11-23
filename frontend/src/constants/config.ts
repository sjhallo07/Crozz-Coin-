/**
 * Shared configuration constants for the Crozz Token application
 */

/**
 * Insecure/default token values that should not be used in production
 */
export const INSECURE_ADMIN_TOKENS = ['changeme', 'change-me', 'admin', 'password'];

/**
 * Check if an admin token is insecure
 */
export const isInsecureToken = (token: string | undefined): boolean => {
  if (!token) return true;
  return INSECURE_ADMIN_TOKENS.includes(token.toLowerCase());
};
