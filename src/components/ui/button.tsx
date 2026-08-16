import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,border-color,color,opacity] duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-1 hover:brightness-105 active:brightness-95",
        secondary:
          "bg-secondary text-primary-foreground shadow-1 hover:brightness-105 active:brightness-95",
        destructive:
          "bg-destructive text-primary-foreground shadow-1 hover:brightness-105 active:brightness-95",
        outline:
          "border border-border bg-surface text-foreground shadow-1 hover:bg-muted active:bg-muted/80",
        ghost:
          "text-foreground hover:bg-muted active:bg-muted/80",
        accent:
          "bg-accent text-primary-foreground shadow-1 hover:brightness-105 active:brightness-95",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm min-w-[32px]",
        md: "h-11 px-4 text-sm rounded-md min-h-[44px]", // 44px min touch target for iOS
        lg: "h-12 px-6 text-base rounded-lg min-h-[48px]",
        icon: "size-11 rounded-md min-h-[44px] min-w-[44px]",
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
            <Loader2 className="size-4 animate-spin text-current" />
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
