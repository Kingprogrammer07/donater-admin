import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "flex h-9 w-full rounded-md border border-hairline bg-surface px-3 py-1.5 text-base text-fg transition-colors",
          "placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "pointer-coarse:min-h-[44px]",
          error && "border-status-fail focus-visible:ring-status-fail",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
