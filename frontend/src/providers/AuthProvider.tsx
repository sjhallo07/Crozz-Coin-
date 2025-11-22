import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_BASE = (import.meta.env.VITE_CROZZ_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);
const STORAGE_KEY = "crozz.auth.session";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  authenticated: boolean;
  loading: boolean;
  authError: string | null;
  register: (input: {
    email: string;
    username: string;
    password: string;
  }) => Promise<void>;
  login: (input: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  forgotUsername: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const buildUrl = (path: string) => `${API_BASE}${path}`;

const getStoredSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const persistSession = useCallback((session: AuthSession | null) => {
    if (typeof window === "undefined") {
      console.warn("persistSession called during SSR; session will not be persisted.");
      return;
    }
    if (!session) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, []);

  const applySession = useCallback(
    (session: AuthSession | null) => {
      setAuthError(null);
      if (!session) {
        setUser(null);
        setTokens(null);
        persistSession(null);
        return;
      }
      setUser(session.user);
      setTokens(session.tokens);
      persistSession(session);
    },
    [persistSession]
  );
  const request = useCallback(
    async <T,>(path: string, init: RequestInit = {}, includeAuth = true) => {
      const headers = new Headers(init.headers ?? {});
      if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }
      if (includeAuth && tokens?.accessToken) {
        headers.set("Authorization", `Bearer ${tokens.accessToken}`);
      }
      const response = await fetch(buildUrl(path), {
        ...init,
        headers,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error ?? "Request failed");
      }
      return data as T;
    },
    [tokens?.accessToken]
  );

  const refresh = useCallback(async () => {
    if (!tokens?.refreshToken) {
      applySession(null);
      return;
    }
    try {
      const session = await request<AuthSession>(
        "/api/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        },
        false
      );
      applySession(session);
    } catch (error) {
      console.error("Failed to refresh token", error);
      applySession(null);
    }
  }, [applySession, request, tokens?.refreshToken]);

  const authenticate = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      try {
        const session = await request<AuthSession>(
          path,
          { method: "POST", body: JSON.stringify(body) },
          false
        );
        applySession(session);
        setAuthError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Authentication failed";
        setAuthError(message);
        throw error;
      }
    },
    [applySession, request]
  );

  const register = useCallback(
    async (input: { email: string; username: string; password: string }) => {
      setAuthError(null);
      await authenticate("/api/auth/register", input);
    },
    [authenticate]
  );

  const login = useCallback(
    async (input: { identifier: string; password: string }) => {
      setAuthError(null);
      await authenticate("/api/auth/login", input);
    },
    [authenticate]
  );

  const logout = useCallback(async () => {
    if (tokens?.refreshToken) {
      try {
        await request(
          "/api/auth/logout",
          {
            method: "POST",
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          },
          false
        );
      } catch (error) {
        console.warn("Logout request failed", error);
      }
    }
    applySession(null);
  }, [applySession, request, tokens?.refreshToken]);

  const forgotPassword = useCallback(
    async (email: string) => {
      await request(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
        false
      );
    },
    [request]
  );

  const forgotUsername = useCallback(
    async (email: string) => {
      await request(
        "/api/auth/forgot-username",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
        false
      );
    },
    [request]
  );

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      await authenticate("/api/auth/reset-password", { token, password });
    },
    [authenticate]
  );
  const applySessionRef = useRef(applySession);
  const refreshRef = useRef(refresh);
  const requestRef = useRef(request);

  useEffect(() => {
    applySessionRef.current = applySession;
    refreshRef.current = refresh;
    requestRef.current = request;
  }, [applySession, refresh, request]);
  useEffect(() => {
    let active = true;

    const boot = async () => {
      const stored = getStoredSession();
      if (!stored) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      applySessionRef.current(stored);
      try {
        const data = await requestRef.current<{ user: AuthUser }>("/api/auth/me");
        if (!active) {
          return;
        }
        applySessionRef.current({ user: data.user, tokens: stored.tokens });
      } catch (error) {
        console.warn("Session validation failed", error);
        await refreshRef.current();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void boot();

    return () => {
      active = false;
    };
  }, []); // Only run on mount

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
      authenticated: Boolean(tokens?.accessToken),
      loading,
      authError,
      register,
      login,
      logout,
      refresh,
      forgotPassword,
      forgotUsername,
      resetPassword,
    }),
    [
      user,
      tokens?.accessToken,
      tokens?.refreshToken,
      loading,
      authError,
      register,
      login,
      logout,
      refresh,
      forgotPassword,
      forgotUsername,
      resetPassword,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
