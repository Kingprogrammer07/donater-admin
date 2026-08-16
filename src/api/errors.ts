export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly retryAfter?: number;
  readonly details?: unknown;

  constructor(params: {
    status: number;
    code?: string;
    message: string;
    requestId?: string;
    retryAfter?: number;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code || `HTTP_${params.status}`;
    this.requestId = params.requestId;
    this.retryAfter = params.retryAfter;
    this.details = params.details;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  const requestId =
    response.headers.get("x-request-id") ||
    response.headers.get("X-Request-ID") ||
    undefined;

  const retryAfterHeader = response.headers.get("retry-after") || response.headers.get("Retry-After");
  const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;

  let code = `HTTP_${status}`;
  let message = `So'rov xatolik bilan yakunlandi (${status})`;
  let details: unknown = undefined;
  let parsedRequestId = requestId;

  try {
    const data = await response.json();
    if (data && typeof data === "object") {
      if (typeof data.request_id === "string") {
        parsedRequestId = data.request_id;
      }
      if (data.error && typeof data.error === "object") {
        if (typeof data.error.code === "string") code = data.error.code;
        if (typeof data.error.message === "string") message = data.error.message;
        if (data.error.details) details = data.error.details;
      } else if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        code = "validation_error";
        message = "Kiritilgan ma'lumotlarda xatolik bor";
        details = data.detail;
      }
    }
  } catch {
    // If body is not JSON or empty
    if (status === 401) {
      message = "Autentifikatsiya talab qilinadi";
    } else if (status === 403) {
      message = "Ushbu amal uchun ruxsat yetarli emas";
    } else if (status === 429) {
      message = retryAfter
        ? `Juda ko'p so'rov yuborildi. Iltimos, ${retryAfter} soniyadan keyin qayta urinib ko'ring.`
        : "Juda ko'p so'rov yuborildi. Iltimos, birozdan so'ng qayta urinib ko'ring.";
    } else if (status >= 500) {
      message = "Serverda ichki xatolik yuz berdi";
    }
  }

  if (status === 403 && (code === "forbidden" || !code)) {
    message = "Ushbu Telegram akkaunt adminlar ro'yxatida mavjud emas.";
  }

  return new ApiError({
    status,
    code,
    message,
    requestId: parsedRequestId,
    retryAfter,
    details,
  });
}
