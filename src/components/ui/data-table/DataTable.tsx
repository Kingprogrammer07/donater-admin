import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";

export interface ColumnDef<T> {
  id: string;
  header: ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  sortKey?: string | null;
  sortDir?: "asc" | "desc" | null;
  onSortChange?: (key: string) => void;
  virtualize?: boolean;
  maxHeight?: string | number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = "Ma'lumot topilmadi",
  emptyDescription = "Qidiruv parametrlarini o'zgartirib ko'ring yoki filtrlarni tozalang.",
  onRowClick,
  sortKey = null,
  sortDir = null,
  onSortChange,
  virtualize = false,
  maxHeight = 520,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  className = "",
}: DataTableProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Enable virtualization if specified or if row count > 50
  const isVirtualized = virtualize || data.length > 50;

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
    enabled: isVirtualized && !isLoading && !error && data.length > 0,
  });

  // 1. Loading State
  if (isLoading) {
    return (
      <div className={`rounded-md border border-hairline bg-surface overflow-hidden ${className}`}>
        <TableSkeleton rows={6} cols={columns.length} />
      </div>
    );
  }

  // 2. Error State
  if (error) {
    const errorMsg = typeof error === "string" ? error : error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi.";
    return (
      <div className={`rounded-md border border-status-fail/30 bg-surface p-8 text-center space-y-4 ${className}`}>
        <div className="flex justify-center">
          <div className="size-12 rounded-full bg-status-fail-bg flex items-center justify-center text-status-fail">
            <Icons.AlertTriangle size="md" />
          </div>
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-fg">Yuklashda xatolik yuz berdi</h3>
          <p className="text-xs text-status-fail font-mono">{errorMsg}</p>
        </div>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} className="gap-2">
            <Icons.Refresh size="sm" />
            <span>Qayta urinish</span>
          </Button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div className={`rounded-md border border-hairline bg-surface overflow-hidden shadow-1 flex flex-col ${className}`}>
      {/* Scrollable Table Area */}
      <div
        ref={tableContainerRef}
        style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
        className="w-full overflow-auto overscroll-contain"
      >
        <table className="w-full text-left text-xs border-collapse" role="table">
          {/* Table Header */}
          <thead className="sticky top-0 z-20 bg-surface-2 border-b border-hairline select-none">
            <tr role="row">
              {columns.map((col) => {
                const isSorted = sortKey === col.id;
                const ariaSort = !col.sortable
                  ? undefined
                  : isSorted
                  ? sortDir === "asc"
                    ? "ascending"
                    : "descending"
                  : "none";

                const alignClass =
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left";

                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={ariaSort}
                    style={{ width: col.width }}
                    className={`px-4 py-3 font-semibold text-fg-subtle uppercase tracking-wider text-[11px] ${alignClass} ${col.className || ""}`}
                  >
                    {col.sortable && onSortChange ? (
                      <button
                        onClick={() => onSortChange(col.id)}
                        className={`inline-flex items-center gap-1.5 hover:text-fg transition-colors cursor-pointer group font-semibold uppercase tracking-wider ${
                          isSorted ? "text-fg" : ""
                        }`}
                        title={`${col.id} bo'yicha saralash`}
                      >
                        <span>{col.header}</span>
                        <span className="text-fg-subtle group-hover:text-fg transition-colors">
                          {isSorted ? (
                            sortDir === "asc" ? (
                              <Icons.ChevronUp size="sm" />
                            ) : (
                              <Icons.ChevronDown size="sm" />
                            )
                          ) : (
                            <Icons.ChevronsUpDown size="sm" className="opacity-40 group-hover:opacity-100" />
                          )}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          {isVirtualized ? (
            <tbody
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
              role="rowgroup"
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = data[virtualRow.index];
                if (row === undefined) return null;
                const key = keyExtractor(row, virtualRow.index);

                return (
                  <tr
                    key={key}
                    role="row"
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={`flex items-center border-b border-hairline/60 transition-colors ${
                      onRowClick
                        ? "cursor-pointer hover:bg-surface-2/70 active:bg-surface-2"
                        : "hover:bg-surface-2/30"
                    }`}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left";

                      let content: ReactNode = null;
                      if (col.cell) {
                        content = col.cell(row, virtualRow.index);
                      } else if (col.accessorKey && row != null) {
                        content = String((row as any)[col.accessorKey] ?? "");
                      }

                      return (
                        <td
                          key={col.id}
                          role="cell"
                          style={{ width: col.width }}
                          className={`px-4 py-2.5 truncate text-fg flex-1 ${alignClass} ${col.className || ""}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          ) : (
            <tbody className="divide-y divide-hairline" role="rowgroup">
              {data.map((row, idx) => {
                const key = keyExtractor(row, idx);
                return (
                  <tr
                    key={key}
                    role="row"
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`transition-colors ${
                      onRowClick
                        ? "cursor-pointer hover:bg-surface-2/70 active:bg-surface-2"
                        : "hover:bg-surface-2/30"
                    }`}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left";

                      let content: ReactNode = null;
                      if (col.cell) {
                        content = col.cell(row, idx);
                      } else if (col.accessorKey) {
                        content = String(row[col.accessorKey] ?? "");
                      }

                      return (
                        <td
                          key={col.id}
                          role="cell"
                          style={{ width: col.width }}
                          className={`px-4 py-3 truncate text-fg ${alignClass} ${col.className || ""}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination / Cursor Load More Bar */}
      {(hasMore || onLoadMore) && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-hairline bg-surface-2 text-xs select-none">
          <div className="text-fg-muted font-mono">
            Jami ko'rsatilmoqda: <span className="font-semibold text-fg">{data.length}</span> ta
          </div>

          {hasMore && onLoadMore && (
            <Button
              variant="secondary"
              size="xs"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="gap-2 font-medium"
            >
              {isLoadingMore ? (
                <Icons.Spinner size="sm" className="animate-spin" />
              ) : (
                <Icons.ArrowDown size="sm" />
              )}
              <span>Yana yuklash</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
