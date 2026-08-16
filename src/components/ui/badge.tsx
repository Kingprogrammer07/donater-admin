import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-sm border transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        ok: "border-status-ok/30 bg-status-ok-bg text-status-ok",
        warn: "border-status-warn/30 bg-status-warn-bg text-status-warn",
        fail: "border-status-fail/30 bg-status-fail-bg text-status-fail",
        neutral: "border-status-neutral/30 bg-status-neutral-bg text-status-neutral",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  showIcon?: boolean;
}

const statusIcons = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
  neutral: HelpCircle,
  default: null,
};

export function Badge({
  className,
  variant = "default",
  showIcon = true,
  children,
  ...props
}: BadgeProps) {
  const IconComponent = showIcon && variant ? statusIcons[variant] : null;

  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {IconComponent && <IconComponent className="size-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

export { badgeVariants };
