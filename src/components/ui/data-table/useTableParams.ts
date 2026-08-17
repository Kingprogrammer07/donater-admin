import { useSearchParams } from "react-router";
import { useCallback, useTransition } from "react";

export interface UseTableParamsOptions {
  defaultLimit?: number;
  defaultSortKey?: string;
  defaultSortDir?: "asc" | "desc";
}

export function useTableParams(options: UseTableParamsOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  const query = searchParams.get("q") || "";
  const sortKey = searchParams.get("sort_by") || options.defaultSortKey || null;
  const sortDir = (searchParams.get("order") as "asc" | "desc") || options.defaultSortDir || null;
  const limit = Number(searchParams.get("limit")) || options.defaultLimit || 50;
  const beforeId = searchParams.get("before_id") || null;
  const status = searchParams.get("status") || "all";

  const setParam = useCallback(
    (key: string, value: string | null | undefined) => {
      startTransition(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (value === null || value === undefined || value === "" || value === "all") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          // Reset cursor pagination when search/filter changes
          if (key !== "before_id" && key !== "limit") {
            next.delete("before_id");
          }
          return next;
        });
      });
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (newSortKey: string) => {
      startTransition(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          const currentSortKey = prev.get("sort_by");
          const currentSortDir = prev.get("order");

          if (currentSortKey === newSortKey) {
            if (currentSortDir === "asc") {
              next.set("order", "desc");
            } else if (currentSortDir === "desc") {
              next.delete("sort_by");
              next.delete("order");
            } else {
              next.set("order", "asc");
            }
          } else {
            next.set("sort_by", newSortKey);
            next.set("order", "asc");
          }
          return next;
        });
      });
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    startTransition(() => {
      setSearchParams(new URLSearchParams());
    });
  }, [setSearchParams]);

  return {
    query,
    sortKey,
    sortDir,
    limit,
    beforeId,
    status,
    searchParams,
    setParam,
    handleSortChange,
    resetFilters,
  };
}
