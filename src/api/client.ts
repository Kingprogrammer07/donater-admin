import { parseApiError, ApiError } from "./errors";
import type { TokenPairOut, MeOut, TelegramLoginRequest, RefreshRequest } from "./types";

const REFRESH_TOKEN_KEY = "donater_admin_refresh_token";
const BASE_URL = import.meta.env.VITE_API_BASE || "/admin/api/v1";

let inMemoryAccessToken: string | null = null;
let refreshPromise: Promise<TokenPairOut | null> | null = null;
let unauthorizedListeners: Array<() => void> = [];

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function onUnauthorized(callback: () => void): () => void {
  unauthorizedListeners.push(callback);
  return () => {
    unauthorizedListeners = unauthorizedListeners.filter((fn) => fn !== callback);
  };
}

function notifyUnauthorized(): void {
  inMemoryAccessToken = null;
  setStoredRefreshToken(null);
  for (const listener of unauthorizedListeners) {
    listener();
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  if (inMemoryAccessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError({
      status: 0,
      code: "network_error",
      message: err instanceof Error ? err.message : "Tarmoq xatosi",
    });
  }

  // Handle 401 with automatic one-time token refresh
  if (response.status === 401 && allowRetry && !endpoint.includes("/auth/refresh") && !endpoint.includes("/auth/telegram")) {
    const refreshed = await performTokenRefresh();
    if (refreshed) {
      return request<T>(endpoint, options, false);
    }
    notifyUnauthorized();
    throw await parseApiError(response);
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

async function performTokenRefresh(): Promise<TokenPairOut | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const payload: RefreshRequest = { refresh_token: refreshToken };
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Refresh failed");
      }

      const data = (await res.json()) as TokenPairOut;
      setAccessToken(data.access_token);
      // ROTATE refresh token: store the new one
      setStoredRefreshToken(data.refresh_token);
      return data;
    } catch {
      notifyUnauthorized();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const authApi = {
  loginWithTelegram(payload: TelegramLoginRequest): Promise<TokenPairOut> {
    return request<TokenPairOut>("/auth/telegram", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  refresh(): Promise<TokenPairOut | null> {
    return performTokenRefresh();
  },

  async logout(): Promise<void> {
    const refreshToken = getStoredRefreshToken();
    try {
      //  The server revokes the session by refresh token, so sending none
      //  would leave it valid until it expired on its own.
      if (refreshToken) {
        const payload: RefreshRequest = { refresh_token: refreshToken };
        await request<void>(
          "/auth/logout",
          { method: "POST", body: JSON.stringify(payload) },
          false
        );
      }
    } finally {
      notifyUnauthorized();
    }
  },

  getMe(): Promise<MeOut> {
    return request<MeOut>("/auth/me");
  },
};

