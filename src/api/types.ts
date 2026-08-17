import type { components } from "./schema";

export type AdminOut = components["schemas"]["AdminOut"] & {
  id: number;
  tg_id: number;
  username: string | null;
  full_name: string | null;
  role: "owner" | "admin" | "support" | "viewer" | string;
  is_active: boolean;
  last_login_at: string | null;
};

export type TokenPairOut = components["schemas"]["TokenPairOut"] & {
  access_token: string;
  access_expires_at: string;
  refresh_token: string;
  admin: AdminOut;
};

export type MeOut = components["schemas"]["MeOut"] & {
  admin: AdminOut;
  permissions: string[];
};

export type TelegramLoginRequest = components["schemas"]["TelegramLoginRequest"];
export type RefreshRequest = components["schemas"]["RefreshRequest"];
export type ValidationError = components["schemas"]["ValidationError"];

// Payment & Proof Types
export interface PaymentOut {
  id: number;
  public_id: string;
  user_id: number;
  provider: "manual" | "payme" | "click" | string;
  amount_uzs: string;
  status: "pending_check" | "approved" | "rejected" | "paid" | "refunded" | "expired" | string;
  credited_at: string | null;
  created_at: string;
}

export interface ProofOut {
  id: number;
  payment_id: number;
  tg_file_id: string;
  decision: "pending" | "approved" | "rejected" | string;
  reviewed_by_tg_id: number | null;
  reviewed_at: string | null;
  reject_reason: string | null;
}

export interface PagePaymentOut {
  items: PaymentOut[];
  next_cursor?: number | null;
  has_more: boolean;
}

// User Types
export interface UserOut {
  id: number;
  tg_id: number;
  username: string | null;
  first_name?: string | null;
  full_name?: string | null;
  language?: "uz" | "ru" | "en" | string;
  is_blocked: boolean;
  blocked_reason?: string | null;
  balance_uzs?: string;
  orders_count?: number;
  payments_count?: number;
  last_seen_at?: string | null;
  created_at?: string;
}

export interface UserDetailOut {
  id: number;
  tg_id: number;
  username: string | null;
  first_name?: string | null;
  language?: "uz" | "ru" | "en" | string;
  is_blocked: boolean;
  blocked_reason?: string | null;
  balance_uzs: string;
  orders_total?: number;
  spent_uzs?: string;
  created_at?: string;
  last_seen_at?: string | null;
}

export interface PageUserOut {
  items: UserOut[];
  next_cursor?: number | null;
  has_more: boolean;
}

// Ledger Types
export interface LedgerEntryOut {
  id: number;
  amount_uzs: string;
  balance_after: string;
  kind: "topup" | "order_hold" | "order_refund" | "admin_adjust" | string;
  ref_type: "payment" | "order" | "admin" | string;
  ref_id: string;
  comment: string | null;
  created_at: string;
}

export interface PageLedgerEntryOut {
  items: LedgerEntryOut[];
  next_cursor?: number | null;
  has_more: boolean;
}

export interface BalanceAdjustRequest {
  amount_uzs: number | string;
  comment: string;
}

export interface BlockRequest {
  reason: string;
}

// Order Types
export type OrderStatus =
  | "funds_held"
  | "submitting"
  | "provider_pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled"
  | string;

export interface OrderOut {
  id: number;
  public_id: string;
  user_id: number;
  product_kind: "direct" | "evoucher" | "gift_card" | string;
  quantity: number;
  price_uzs: string;
  profit_uzs: string;
  status: OrderStatus;
  provider_order_id: string | null;
  provider_status: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface OrderEventOut {
  id: number;
  source: string;
  event: string;
  received_at: string;
  processed_at: string | null;
}

export interface OrderDetailOut extends OrderOut {
  offer_snapshot: {
    name?: string;
    category_name?: string;
    product_kind?: string;
    denomination?: number;
    currency?: string;
    [key: string]: unknown;
  };
  input_fields: Record<string, unknown>;
  cost_usd: string;
  fx_rate: string;
  markup_pct: string;
  markup_rule_id: number | null;
  attempts: number;
  events: OrderEventOut[];
}

export interface PageOrderOut {
  items: OrderOut[];
  next_cursor?: number | null;
  has_more: boolean;
}

export interface RevealPayloadOut {
  public_id: string;
  delivered_payload: Record<string, unknown> | null;
}
