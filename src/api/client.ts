import { parseApiError, ApiError } from "./errors";
import type {
  TokenPairOut,
  MeOut,
  TelegramLoginRequest,
  RefreshRequest,
  PaymentOut,
  ProofOut,
  PagePaymentOut,
  UserOut,
  UserDetailOut,
  PageUserOut,
  LedgerEntryOut,
  PageLedgerEntryOut,
  BalanceAdjustRequest,
  OrderOut,
  OrderDetailOut,
  PageOrderOut,
  RevealPayloadOut,
  OverviewOut,
  TimeseriesOut,
  TopProductOut,
  FazerCardsStatusOut,
  StatsPeriod,
  StatsInterval,
  StatsMetric,
  CategoryOut,
  OfferOut,
  PageCategoryOut,
  PageOfferOut,
  CategoryPatch,
  OfferPatch,
  MarkupRuleOut,
  MarkupRuleRequest,
  MarkupPreviewRequest,
  PriceBreakdownOut,
  FxRateOut,
  ManualRateRequest,
  FxModeRequest,
} from "./types";

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

//  Signing in and refreshing are how a session is obtained; a 401 from them is
//  the answer, not a stale token. Running the refresh dance there replaces the
//  real reason ("invalid telegram payload") with "your session expired", which
//  is both wrong and unactionable.
function isSessionEndpoint(endpoint: string): boolean {
  return endpoint.includes("/auth/telegram") || endpoint.includes("/auth/refresh");
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && allowRetry && !isSessionEndpoint(endpoint)) {
      const refreshedTokens = await performTokenRefresh();
      if (refreshedTokens) {
        headers.set("Authorization", `Bearer ${refreshedTokens.access_token}`);
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw await parseApiError(retryResponse);
        }

        if (retryResponse.status === 204) {
          return undefined as T;
        }

        return (await retryResponse.json()) as T;
      } else {
        throw new ApiError({
          status: 401,
          message: "Sessiya muddati tugadi. Iltimos qaytadan kiring.",
          requestId: response.headers.get("X-Request-ID") || undefined,
        });
      }
    }

    if (!response.ok) {
      throw await parseApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      status: 0,
      message: "Server bilan bog'lanishda xatolik yuz berdi. Internet ulanishini tekshiring.",
    });
  }
}

export async function requestBlob(
  endpoint: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<Blob> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  if (inMemoryAccessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && allowRetry && !isSessionEndpoint(endpoint)) {
      const refreshedTokens = await performTokenRefresh();
      if (refreshedTokens) {
        headers.set("Authorization", `Bearer ${refreshedTokens.access_token}`);
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw await parseApiError(retryResponse);
        }

        return await retryResponse.blob();
      } else {
        throw new ApiError({
          status: 401,
          message: "Sessiya muddati tugadi. Iltimos qaytadan kiring.",
          requestId: response.headers.get("X-Request-ID") || undefined,
        });
      }
    }

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      status: 0,
      message: "Faylni yuklab olishda tarmoq xatoligi yuz berdi.",
    });
  }
}

async function performTokenRefresh(): Promise<TokenPairOut | null> {
  const storedRefreshToken = getStoredRefreshToken();
  if (!storedRefreshToken) {
    notifyUnauthorized();
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const payload: RefreshRequest = { refresh_token: storedRefreshToken };
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        notifyUnauthorized();
        return null;
      }

      const data = (await res.json()) as TokenPairOut;
      setAccessToken(data.access_token);
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

export const paymentsApi = {
  getPendingProofs(limit = 50): Promise<ProofOut[]> {
    return request<ProofOut[]>(`/payments/pending-proofs?limit=${limit}`);
  },

  getPayment(paymentId: number): Promise<PaymentOut> {
    return request<PaymentOut>(`/payments/${paymentId}`);
  },

  async getProofFileBlobUrl(paymentId: number): Promise<string> {
    const blob = await requestBlob(`/payments/${paymentId}/proof-file`);
    return URL.createObjectURL(blob);
  },

  approveProof(proofId: number, idempotencyKey?: string): Promise<PaymentOut> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return request<PaymentOut>(`/payments/proofs/${proofId}/approve`, {
      method: "POST",
      headers,
    });
  },

  rejectProof(proofId: number, reason: string): Promise<PaymentOut> {
    return request<PaymentOut>(`/payments/proofs/${proofId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  listPayments(
    params: {
      limit?: number;
      before_id?: number | null;
      provider?: string | null;
      status?: string | null;
      user_id?: number | null;
    } = {}
  ): Promise<PagePaymentOut> {
    const search = new URLSearchParams();
    if (params.limit) search.set("limit", String(params.limit));
    if (params.before_id) search.set("before_id", String(params.before_id));
    if (params.provider && params.provider !== "all") search.set("provider", params.provider);
    if (params.status && params.status !== "all") search.set("status", params.status);
    if (params.user_id) search.set("user_id", String(params.user_id));

    const qs = search.toString();
    return request<PagePaymentOut>(`/payments${qs ? `?${qs}` : ""}`);
  },
};

export const usersApi = {
  listUsers(
    params: {
      limit?: number;
      before_id?: number | null;
      q?: string | null;
      is_blocked?: boolean | null;
    } = {}
  ): Promise<PageUserOut> {
    const search = new URLSearchParams();
    if (params.limit) search.set("limit", String(params.limit));
    if (params.before_id) search.set("before_id", String(params.before_id));
    if (params.q) search.set("q", params.q);
    if (params.is_blocked !== undefined && params.is_blocked !== null) {
      search.set("is_blocked", String(params.is_blocked));
    }
    const qs = search.toString();
    return request<PageUserOut>(`/users${qs ? `?${qs}` : ""}`);
  },

  getUser(userId: number): Promise<UserDetailOut> {
    return request<UserDetailOut>(`/users/${userId}`);
  },

  getUserLedger(
    userId: number,
    params: {
      limit?: number;
      before_id?: number | null;
    } = {}
  ): Promise<PageLedgerEntryOut> {
    const search = new URLSearchParams();
    if (params.limit) search.set("limit", String(params.limit));
    if (params.before_id) search.set("before_id", String(params.before_id));
    const qs = search.toString();
    return request<PageLedgerEntryOut>(`/users/${userId}/ledger${qs ? `?${qs}` : ""}`);
  },

  getUserPayments(userId: number, limit = 10): Promise<PagePaymentOut> {
    return request<PagePaymentOut>(`/payments?user_id=${userId}&limit=${limit}`);
  },

  adjustBalance(
    userId: number,
    data: BalanceAdjustRequest,
    idempotencyKey: string
  ): Promise<LedgerEntryOut> {
    return request<LedgerEntryOut>(
      `/users/${userId}/balance-adjust?idempotency_key=${encodeURIComponent(idempotencyKey)}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  blockUser(userId: number, reason: string): Promise<UserOut> {
    return request<UserOut>(`/users/${userId}/block`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  unblockUser(userId: number): Promise<UserOut> {
    return request<UserOut>(`/users/${userId}/unblock`, {
      method: "POST",
    });
  },
};

export const ordersApi = {
  listOrders(
    params: {
      limit?: number;
      before_id?: number | null;
      status?: string | null;
      user_id?: number | null;
      q?: string | null;
    } = {}
  ): Promise<PageOrderOut> {
    const search = new URLSearchParams();
    if (params.limit) search.set("limit", String(params.limit));
    if (params.before_id) search.set("before_id", String(params.before_id));
    if (params.status && params.status !== "all") search.set("status", params.status);
    if (params.user_id) search.set("user_id", String(params.user_id));
    if (params.q) search.set("q", params.q);

    const qs = search.toString();
    return request<PageOrderOut>(`/orders${qs ? `?${qs}` : ""}`);
  },

  getOrder(orderId: number): Promise<OrderDetailOut> {
    return request<OrderDetailOut>(`/orders/${orderId}`);
  },

  revealPayload(orderId: number): Promise<RevealPayloadOut> {
    return request<RevealPayloadOut>(`/orders/${orderId}/payload`);
  },

  retryOrder(orderId: number): Promise<OrderOut> {
    return request<OrderOut>(`/orders/${orderId}/retry`, {
      method: "POST",
    });
  },

  refundOrder(orderId: number, reason: string): Promise<OrderOut> {
    return request<OrderOut>(`/orders/${orderId}/refund`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  forceComplete(orderId: number, reason: string): Promise<OrderOut> {
    return request<OrderOut>(`/orders/${orderId}/force-complete`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};

export const statsApi = {
  getOverview(period: StatsPeriod = "7d"): Promise<OverviewOut> {
    return request<OverviewOut>(`/stats/overview?period=${period}`);
  },

  getTimeseries(
    params: {
      metric?: StatsMetric;
      interval?: StatsInterval;
      period?: StatsPeriod;
    } = {}
  ): Promise<TimeseriesOut> {
    const search = new URLSearchParams();
    if (params.metric) search.set("metric", params.metric);
    if (params.interval) search.set("interval", params.interval);
    if (params.period) search.set("period", params.period);
    const qs = search.toString();
    return request<TimeseriesOut>(`/stats/timeseries${qs ? `?${qs}` : ""}`);
  },

  getTopProducts(period: StatsPeriod = "7d", limit = 10): Promise<TopProductOut[]> {
    return request<TopProductOut[]>(`/stats/top-products?period=${period}&limit=${limit}`);
  },
};

export const systemApi = {
  getFazerCards(): Promise<FazerCardsStatusOut> {
    return request<FazerCardsStatusOut>("/system/fazercards");
  },
};

export const catalogApi = {
  listCategories(
    params: {
      limit?: number;
      before_id?: number | null;
      kind?: string | null;
    } = {}
  ): Promise<PageCategoryOut> {
    const search = new URLSearchParams();
    if (params.limit) search.set("limit", String(params.limit));
    if (params.before_id) search.set("before_id", String(params.before_id));
    if (params.kind && params.kind !== "all") search.set("kind", params.kind);
    const qs = search.toString();
    return request<PageCategoryOut>(`/catalog/categories${qs ? `?${qs}` : ""}`);
  },

  listOffers(
    params: {
      limit?: number;
      before_id?: number | null;
      category_id?: number | null;
    } = {}
  ): Promise<PageOfferOut> {
    const search = new URLSearchParams();
    if (params.limit) search.set("limit", String(params.limit));
    if (params.before_id) search.set("before_id", String(params.before_id));
    if (params.category_id) search.set("category_id", String(params.category_id));
    const qs = search.toString();
    return request<PageOfferOut>(`/catalog/offers${qs ? `?${qs}` : ""}`);
  },

  patchCategory(categoryId: number, payload: CategoryPatch): Promise<CategoryOut> {
    return request<CategoryOut>(`/catalog/categories/${categoryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  patchOffer(offerId: number, payload: OfferPatch): Promise<OfferOut> {
    return request<OfferOut>(`/catalog/offers/${offerId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  syncCatalog(): Promise<{ status: string }> {
    return request<{ status: string }>("/catalog/sync", {
      method: "POST",
    });
  },
};

export const pricingApi = {
  listRules(): Promise<MarkupRuleOut[]> {
    return request<MarkupRuleOut[]>("/markup/rules");
  },

  createRule(payload: MarkupRuleRequest): Promise<MarkupRuleOut> {
    return request<MarkupRuleOut>("/markup/rules", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateRule(ruleId: number, payload: MarkupRuleRequest): Promise<MarkupRuleOut> {
    return request<MarkupRuleOut>(`/markup/rules/${ruleId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteRule(ruleId: number): Promise<void> {
    return request<void>(`/markup/rules/${ruleId}`, {
      method: "DELETE",
    });
  },

  preview(payload: MarkupPreviewRequest): Promise<PriceBreakdownOut> {
    return request<PriceBreakdownOut>("/markup/preview", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const fxApi = {
  getCurrentRate(): Promise<FxRateOut> {
    return request<FxRateOut>("/fx/current");
  },

  getRateHistory(
    params: {
      limit?: number;
      before_id?: number | null;
    } = {}
  ): Promise<FxRateOut[]> {
    const search = new URLSearchParams();
    if (params.limit) search.set("limit", String(params.limit));
    if (params.before_id) search.set("before_id", String(params.before_id));
    const qs = search.toString();
    return request<FxRateOut[]>(`/fx/history${qs ? `?${qs}` : ""}`);
  },

  setManualRate(payload: ManualRateRequest): Promise<FxRateOut> {
    return request<FxRateOut>("/fx/manual", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setMode(payload: FxModeRequest): Promise<{ strict_manual: boolean }> {
    return request<{ strict_manual: boolean }>("/fx/mode", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};



