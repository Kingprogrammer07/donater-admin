import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,border-color,color,opacity] duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 disabled:active:scale-100 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-fg text-canvas shadow-1 hover:opacity-90 active:opacity-95",
        secondary:
          "bg-surface border border-hairline text-fg hover:bg-surface-2 active:bg-surface-2",
        ghost:
          "text-fg hover:bg-surface-2 active:bg-surface-2",
        destructive:
          "text-status-fail hover:bg-status-fail-bg active:bg-status-fail-bg",
        "destructive-filled":
          "bg-status-fail text-canvas hover:opacity-90 active:opacity-95",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-sm min-w-[28px] pointer-coarse:min-h-[44px]",
        sm: "h-8 px-3 text-xs rounded-sm min-w-[32px] pointer-coarse:min-h-[44px]",
        md: "h-9 px-3.5 text-sm rounded-md min-w-[36px] pointer-coarse:min-h-[44px]",
        lg: "h-10 px-4 text-sm rounded-md min-w-[40px] pointer-coarse:min-h-[44px]",
        icon: "size-9 rounded-md min-w-[36px] pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-3.5 animate-spin text-current" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
