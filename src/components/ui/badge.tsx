import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        neutral: "text-fg-muted",
        ok: "text-status-ok",
        warn: "text-status-warn",
        fail: "text-status-fail",
        brand: "text-brand",
      },
      styleType: {
        dot: "py-0.5",
        subtle: "px-2.5 py-0.5 rounded-pill",
      },
    },
    compoundVariants: [
      { variant: "ok", styleType: "subtle", className: "bg-status-ok-bg" },
      { variant: "warn", styleType: "subtle", className: "bg-status-warn-bg" },
      { variant: "fail", styleType: "subtle", className: "bg-status-fail-bg" },
      { variant: "neutral", styleType: "subtle", className: "bg-surface-2" },
      { variant: "brand", styleType: "subtle", className: "bg-brand-muted" },
    ],
    defaultVariants: {
      variant: "neutral",
      styleType: "dot",
    },
  }
);

const dotColors = {
  ok: "bg-status-ok",
  warn: "bg-status-warn",
  fail: "bg-status-fail",
  neutral: "bg-fg-muted",
  brand: "bg-brand",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  styleType = "dot",
  showDot = true,
  children,
  ...props
}: BadgeProps) {
  const dotColorClass = variant ? dotColors[variant] : dotColors.neutral;

  return (
    <span className={cn(badgeVariants({ variant, styleType }), className)} {...props}>
      {showDot && (
        <span className={cn("size-1.5 rounded-full shrink-0", dotColorClass)} aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
}

export { badgeVariants };
