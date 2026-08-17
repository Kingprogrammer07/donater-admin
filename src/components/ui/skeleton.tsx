import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-surface-2", className)}
      {...props}
    />
  );
}

/**
 * Skeleton replicating table rows and columns to prevent layout shifts.
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full divide-y divide-hairline border-y border-hairline", className)}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn(
                "h-4",
                c === 0 ? "w-28" : c === cols - 1 ? "w-16 ml-auto" : "w-24"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton replicating a KPI/Stat card shape.
 */
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={cn("rounded-md border border-hairline bg-surface p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="size-4 rounded-full" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
