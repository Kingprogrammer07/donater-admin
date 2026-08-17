import { type HTMLAttributes } from "react";
import { Badge, type BadgeProps } from "./badge";

export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | string;

export type PaymentStatus =
  | "pending_check"
  | "approved"
  | "rejected"
  | "paid"
  | "refunded"
  | "expired"
  | string;

export type GenericStatus =
  | "active"
  | "inactive"
  | "blocked"
  | "healthy"
  | "unhealthy"
  | "queued"
  | "running"
  | string;

export interface StatusBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  status: OrderStatus | PaymentStatus | GenericStatus;
  type?: "order" | "payment" | "user" | "system" | "generic";
  label?: string;
  size?: "sm" | "md";
}

interface StatusMeta {
  label: string;
  variant: BadgeProps["variant"];
  dotClass: string;
}

const ORDER_STATUS_MAP: Record<string, StatusMeta> = {
  pending: { label: "Kutilmoqda", variant: "warn", dotClass: "bg-status-warn" },
  processing: { label: "Jarayonda", variant: "brand", dotClass: "bg-brand" },
  completed: { label: "Yetkazildi", variant: "ok", dotClass: "bg-status-ok" },
  failed: { label: "Yiqildi", variant: "fail", dotClass: "bg-status-fail" },
  cancelled: { label: "Bekor qilindi", variant: "neutral", dotClass: "bg-fg-subtle" },
  refunded: { label: "Qaytarildi", variant: "neutral", dotClass: "bg-fg-subtle" },
  partially_refunded: { label: "Qisman qaytarildi", variant: "neutral", dotClass: "bg-fg-subtle" },
};

const PAYMENT_STATUS_MAP: Record<string, StatusMeta> = {
  pending_check: { label: "Chek kutilmoqda", variant: "warn", dotClass: "bg-status-warn" },
  approved: { label: "Tasdiqlandi", variant: "ok", dotClass: "bg-status-ok" },
  rejected: { label: "Rad etildi", variant: "fail", dotClass: "bg-status-fail" },
  paid: { label: "To'landi", variant: "ok", dotClass: "bg-status-ok" },
  refunded: { label: "Qaytarildi", variant: "neutral", dotClass: "bg-fg-subtle" },
  expired: { label: "Muddati o'tdi", variant: "neutral", dotClass: "bg-fg-subtle" },
};

const USER_STATUS_MAP: Record<string, StatusMeta> = {
  active: { label: "Faol", variant: "ok", dotClass: "bg-status-ok" },
  blocked: { label: "Bloklangan", variant: "fail", dotClass: "bg-status-fail" },
};

const SYSTEM_STATUS_MAP: Record<string, StatusMeta> = {
  healthy: { label: "Barqaror", variant: "ok", dotClass: "bg-status-ok" },
  unhealthy: { label: "Xatolik", variant: "fail", dotClass: "bg-status-fail" },
  queued: { label: "Navbatda", variant: "neutral", dotClass: "bg-fg-subtle" },
  running: { label: "Ishlamoqda", variant: "brand", dotClass: "bg-brand" },
};

export function StatusBadge({
  status,
  type = "generic",
  label,
  size = "sm",
  className = "",
  ...props
}: StatusBadgeProps) {
  let meta: StatusMeta | undefined;

  if (type === "order") meta = ORDER_STATUS_MAP[status];
  else if (type === "payment") meta = PAYMENT_STATUS_MAP[status];
  else if (type === "user") meta = USER_STATUS_MAP[status];
  else if (type === "system") meta = SYSTEM_STATUS_MAP[status];

  // Fallback lookup across all maps
  if (!meta) {
    meta =
      ORDER_STATUS_MAP[status] ||
      PAYMENT_STATUS_MAP[status] ||
      USER_STATUS_MAP[status] ||
      SYSTEM_STATUS_MAP[status] || {
        label: label || status,
        variant: "neutral",
        dotClass: "bg-fg-subtle",
      };
  }

  const displayLabel = label || meta.label;

  return (
    <Badge
      variant={meta.variant}
      styleType="subtle"
      className={`inline-flex items-center gap-1.5 font-medium ${
        size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-xs"
      } ${className}`}
      {...props}
    >
      <span className={`size-1.5 rounded-full ${meta.dotClass} shrink-0`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </Badge>
  );
}
