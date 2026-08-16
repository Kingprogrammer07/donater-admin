import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, onUnauthorized, setAccessToken, setStoredRefreshToken } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { AdminOut, TelegramLoginRequest } from "@/api/types";

interface AuthContextValue {
  admin: AdminOut | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: ApiError | null;
  loginWithTelegram: (payload: TelegramLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminOut | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<ApiError | null>(null);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAdmin(null);
      setPermissions([]);
      setAuthError(null);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const tokens = await authApi.refresh();
      if (tokens) {
        const me = await authApi.getMe();
        setAdmin(me.admin);
        setPermissions(me.permissions);
      }
    } catch {
      setAdmin(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setAdmin(null);
      setPermissions([]);
    });

    restoreSession();

    return () => {
      unsubscribe();
    };
  }, [restoreSession]);

  const loginWithTelegram = useCallback(async (payload: TelegramLoginRequest) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const tokenPair = await authApi.loginWithTelegram(payload);
      setAccessToken(tokenPair.access_token);
      setStoredRefreshToken(tokenPair.refresh_token);
      setAdmin(tokenPair.admin);
      const me = await authApi.getMe();
      setAdmin(me.admin);
      setPermissions(me.permissions);
    } catch (err) {
      if (err instanceof ApiError) {
        setAuthError(err);
      } else {
        setAuthError(
          new ApiError({
            status: 0,
            code: "unknown_error",
            message: err instanceof Error ? err.message : "Tizimga kirishda kutilmagan xatolik yuz berdi",
          })
        );
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value: AuthContextValue = {
    admin,
    permissions,
    isAuthenticated: !!admin,
    isLoading,
    authError,
    loginWithTelegram,
    logout,
    hasPermission,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
