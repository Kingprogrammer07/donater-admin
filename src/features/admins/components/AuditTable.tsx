import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "@/components/ui/datetime";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditDiffViewer } from "./AuditDiffViewer";
import type { AuditEntryOut } from "@/api/types";

export function AuditTable() {
  const [cursor, setCursor] = useState<number | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<number | null>>([]);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const {
    data: auditPage,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["audit-list", cursor, actionFilter, targetTypeFilter],
    queryFn: () =>
      auditApi.listAudit({
        limit: 25,
        before_id: cursor,
        action: actionFilter.trim() || undefined,
        target_type: targetTypeFilter.trim() || undefined,
      }),
  });

  const entries = auditPage?.items || [];
  const hasMore = Boolean(auditPage?.has_more);
  const nextCursor = auditPage?.next_cursor || null;

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorHistory((prev) => [...prev, cursor]);
      setCursor(nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prevCursor = cursorHistory[cursorHistory.length - 1];
      setCursorHistory((prev) => prev.slice(0, -1));
      setCursor(prevCursor ?? null);
    }
  };

  const handleResetFilters = () => {
    setActionFilter("");
    setTargetTypeFilter("");
    setCursor(null);
    setCursorHistory([]);
  };

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.Clock size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg tracking-tight">
                Tizim Auditi Jurnali (Audit Log)
              </h2>
            </div>
            <p className="text-[12px] text-fg-subtle">
              Operatorlarning tizimdagi barcha muhim harakatlari va parametrlarni o'zgartirish tarixi
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 text-xs self-start sm:self-auto"
          title="Yangilash"
        >
          <Icons.Refresh size={12} className={isFetching ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xs border border-hairline bg-surface-2/30 text-xs">
        {/* Action Filter */}
        <div className="flex-1 min-w-[160px] space-y-1">
          <label className="text-[12px] font-semibold text-fg-subtle block">Amal (Action):</label>
          <input
            type="text"
            placeholder="Masalan: settings.patch yoki admin.create"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCursor(null);
              setCursorHistory([]);
            }}
            className="w-full px-2.5 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
          />
        </div>

        {/* Target Type Filter */}
        <div className="flex-1 min-w-[160px] space-y-1">
          <label className="text-[12px] font-semibold text-fg-subtle block">Obyekt turi (Target):</label>
          <input
            type="text"
            placeholder="Masalan: settings, admin, order"
            value={targetTypeFilter}
            onChange={(e) => {
              setTargetTypeFilter(e.target.value);
              setCursor(null);
              setCursorHistory([]);
            }}
            className="w-full px-2.5 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
          />
        </div>

        {(actionFilter || targetTypeFilter) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetFilters}
            className="self-end text-xs"
          >
            Filtrlarni tozalash
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xs border border-status-fail/40 bg-status-fail-bg/20 text-status-fail text-xs flex items-center justify-between">
          <span>Audit yozuvlarini yuklab bo'lmadi.</span>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-xs">
            Qayta urinish
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-6 rounded-xs border border-hairline bg-surface-2/30 text-xs text-fg-subtle text-center">
          Hech qanday audit yozuvi topilmadi.
        </div>
      ) : (
        <div className="border border-hairline rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-surface-2/60 text-fg-subtle text-[12px]">
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Amal (Action)</th>
                <th className="p-3 font-medium">Bajaruvchi (Actor)</th>
                <th className="p-3 font-medium">Obyekt (Target)</th>
                <th className="p-3 font-medium">Sana</th>
                <th className="p-3 font-medium text-right">Tafsilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {entries.map((entry: AuditEntryOut) => {
                const isExpanded = expandedId === entry.id;
                const hasDiff = Boolean(entry.before || entry.after);

                return (
                  <tr key={entry.id} className="group">
                    <td colSpan={6} className="p-0">
                      <div
                        onClick={() => hasDiff && setExpandedId(isExpanded ? null : entry.id)}
                        className={`flex items-center justify-between p-3 transition-colors ${
                          hasDiff ? "cursor-pointer hover:bg-surface-2/50" : ""
                        } ${isExpanded ? "bg-surface-2/60" : ""}`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full items-center">
                          {/* ID */}
                          <span className="font-mono text-fg-subtle text-[12px]">
                            #{entry.id}
                          </span>

                          {/* Action */}
                          <div className="flex items-center gap-1.5 font-mono font-bold text-fg">
                            <span className="truncate">{entry.action}</span>
                          </div>

                          {/* Actor */}
                          <div className="text-fg-subtle">
                            {entry.actor_tg_id ? (
                              <span className="font-mono text-fg">
                                TG: {entry.actor_tg_id}
                              </span>
                            ) : (
                              <span className="text-[12px] text-fg-subtle">Tizim (Worker)</span>
                            )}
                          </div>

                          {/* Target */}
                          <div className="text-fg-subtle">
                            {entry.target_type ? (
                              <Badge variant="neutral" styleType="subtle" className="text-[12px] font-mono">
                                {entry.target_type}
                                {entry.target_id ? ` #${entry.target_id}` : ""}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </div>

                          {/* Date & Expand Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 text-right">
                            <DateTime value={entry.created_at} mode="relative" />
                            {hasDiff && (
                              <span className="text-brand p-1 rounded-xs hover:bg-surface-2">
                                <Icons.ChevronDown
                                  size={14}
                                  className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Diff Viewer */}
                      {isExpanded && (
                        <div className="p-4 bg-canvas border-t border-hairline/60">
                          <AuditDiffViewer before={entry.before} after={entry.after} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-hairline text-xs">
        <span className="text-[12px] text-fg-subtle">
          Sahifadagi yozuvlar: {entries.length} ta
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevPage}
            disabled={cursorHistory.length === 0 || isFetching}
            className="gap-1 text-xs"
          >
            <Icons.ChevronLeft size={12} />
            <span>Oldingi</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasMore || isFetching}
            className="gap-1 text-xs"
          >
            <span>Keyingi</span>
            <Icons.ChevronRight size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}
