import { type ReactNode } from "react";
import { Icons } from "@/components/icons";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: keyof typeof Icons;
  title: ReactNode;
  description?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: keyof typeof Icons;
    variant?: "primary" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "Search",
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  const IconComponent = Icons[icon] || Icons.Search;

  return (
    <div
      className={`rounded-md border border-hairline bg-surface p-8 sm:p-12 text-center select-none ${className}`}
    >
      <div className="flex justify-center mb-4">
        <div className="size-12 rounded-full bg-surface-2 flex items-center justify-center text-fg-muted">
          <IconComponent size="md" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-sm sm:text-base font-semibold text-fg tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-fg-muted leading-relaxed">{description}</p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
          {action && (
            <Button
              variant={action.variant || "primary"}
              size="sm"
              onClick={action.onClick}
              className="gap-2"
            >
              {action.icon && (() => {
                const ActionIcon = Icons[action.icon] || Icons.Plus;
                return <ActionIcon size="sm" />;
              })()}
              <span>{action.label}</span>
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="secondary"
              size="sm"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
