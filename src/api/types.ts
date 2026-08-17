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

// Stats & Dashboard Types
export type StatsPeriod = "today" | "7d" | "30d";
export type StatsInterval = "hour" | "day";
export type StatsMetric = "revenue" | "profit" | "orders" | "users" | "topups";

export interface OverviewOut {
  revenue_uzs: string;
  profit_uzs: string;
  orders_total: number;
  orders_by_status: Record<string, number>;
  new_users: number;
  topups_uzs: string;
  refunds_uzs: string;
  pending_proofs: number;
  failed_orders: number;
}

export interface TimeseriesPointOut {
  bucket: string;
  value: string;
}

export interface TimeseriesOut {
  metric: string;
  interval: string;
  points: TimeseriesPointOut[];
}

export interface TopProductOut {
  offer_id: number;
  name: string;
  product_kind: string;
  orders: number;
  quantity: number;
  revenue_uzs: string;
  profit_uzs: string;
}

// System & Diagnostics Types
export interface FazerCardsStatusOut {
  reachable: boolean;
  balance_usd?: string | null;
  currency?: string | null;
  login?: string | null;
  plan?: string | null;
  subscription_active?: boolean | null;
  low_balance: boolean;
  error?: string | null;
}

// Catalogue Types
export interface CategoryOut {
  id: number;
  kind: string;
  external_id: string;
  name: string;
  is_active: boolean;
  is_visible: boolean;
  sort_order: number;
  spic: string | null;
  package_code: string | null;
  vat_percent: string | null;
  synced_at: string | null;
}

export interface OfferOut {
  id: number;
  category_id: number;
  external_id: string;
  name: string;
  price_usd: string;
  stock: number | null;
  min_quantity: number;
  max_quantity: number | null;
  is_active: boolean;
  is_visible: boolean;
  spic: string | null;
  package_code: string | null;
  vat_percent: string | null;
}

export interface PageCategoryOut {
  items: CategoryOut[];
  next_cursor?: number | null;
  has_more: boolean;
}

export interface PageOfferOut {
  items: OfferOut[];
  next_cursor?: number | null;
  has_more: boolean;
}

export interface CategoryPatch {
  is_visible?: boolean;
  sort_order?: number;
  spic?: string | null;
  package_code?: string | null;
  vat_percent?: number | null;
}

export interface OfferPatch {
  is_visible?: boolean;
  spic?: string | null;
  package_code?: string | null;
  vat_percent?: number | null;
}

// Markup & Pricing Types
export type MarkupScope = "global" | "kind" | "category" | "offer";

export interface MarkupRuleOut {
  id: number;
  scope: MarkupScope | string;
  product_kind: string | null;
  category_id: number | null;
  offer_id: number | null;
  markup_pct: string;
  markup_fixed_uzs: string;
  round_to_uzs: number;
  is_active: boolean;
  note: string | null;
}

export interface MarkupRuleRequest {
  scope: string;
  product_kind?: string | null;
  category_id?: number | null;
  offer_id?: number | null;
  markup_pct: number;
  markup_fixed_uzs?: number;
  round_to_uzs?: number;
  is_active?: boolean;
  note?: string | null;
}

export interface MarkupPreviewRequest {
  offer_id: number;
  quantity?: number;
}

export interface PriceBreakdownOut {
  quantity: number;
  unit_cost_usd: string;
  cost_usd: string;
  fx_rate: string;
  markup_rule_id: number | null;
  markup_pct: string;
  markup_fixed_uzs: string;
  round_to_uzs: number;
  price_uzs: string;
  profit_uzs: string;
}

// Foreign Exchange (FX) Types
export interface FxRateOut {
  id: number;
  rate: string;
  source: "cbu" | "manual" | string;
  note: string | null;
  observed_at: string;
}

export interface ManualRateRequest {
  rate: number;
  note?: string | null;
}

export interface FxModeRequest {
  strict_manual: boolean;
}

// Broadcast (Mass Mailing) Types
export type BroadcastStatus = "draft" | "scheduled" | "running" | "finished" | "cancelled";

export interface BroadcastButton {
  url: string;
  text_uz: string;
  text_ru?: string | null;
  text_en?: string | null;
}

export interface AudienceFilter {
  languages?: ("uz" | "ru" | "en")[] | null;
  include_blocked?: boolean;
  balance_min?: number | string | null;
  balance_max?: number | string | null;
  has_ordered?: boolean | null;
  seen_after?: string | null;
  registered_from?: string | null;
  registered_to?: string | null;
}

export interface BroadcastCreateRequest {
  audience?: AudienceFilter;
  text_uz: string;
  text_ru?: string | null;
  text_en?: string | null;
  buttons?: BroadcastButton[];
  scheduled_at?: string | null;
}

export interface BroadcastOut {
  id: number;
  status: BroadcastStatus | string;
  audience: AudienceFilter;
  text_uz: string;
  text_ru: string | null;
  text_en: string | null;
  buttons: BroadcastButton[];
  scheduled_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  total_count: number;
  sent_count: number;
  blocked_count: number;
  failed_count: number;
  created_by_admin_id: number | null;
  created_at: string;
}

export interface PageBroadcastOut {
  items: BroadcastOut[];
  next_cursor?: number | null;
  has_more: boolean;
}

export interface AudiencePreviewOut {
  total: number;
}

// System & Diagnostics Types
export interface CheckOut {
  name: string;
  status: "ok" | "failing" | "degraded" | string;
  detail?: string | null;
}

export interface HealthOut {
  status: "ok" | "degraded" | string;
  checks: CheckOut[];
}

export interface FazerCardsStatusOut {
  reachable: boolean;
  balance_usd?: string | null;
  currency?: string | null;
  login?: string | null;
  plan?: string | null;
  subscription_active?: boolean | null;
  low_balance: boolean;
  error?: string | null;
}

export interface QueueOut {
  queued: number;
  ready: number;
  deferred: number;
  in_progress: number;
  worker_seen_at?: string | null;
  worker_alive: boolean;
}

export interface FailedJobOut {
  job_id: string;
  function: string;
  args: unknown[];
  attempts: number;
  error: string;
  finished_at?: string | null;
}

export interface WebhookDeliveryOut {
  id: number;
  event: string;
  source: string;
  order_id?: number | null;
  provider_order_id?: string | null;
  received_at: string;
  processed_at?: string | null;
}

export interface WebhookStatusOut {
  url: string;
  secret_configured: boolean;
  deliveries: WebhookDeliveryOut[];
}

export interface WebhookTestOut {
  delivered: boolean;
  status_code?: number | null;
  body?: string | null;
  error?: string | null;
}
