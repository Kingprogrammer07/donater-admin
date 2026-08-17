import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { broadcastApi } from "@/api/client";
import { DataTable, type ColumnDef } from "@/components/ui/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth/AuthContext";
import { BroadcastStatusBadge } from "./components/BroadcastStatusBadge";
import { CreateBroadcastWizard } from "./components/CreateBroadcastWizard";
import { BroadcastDetailDrawer } from "./components/BroadcastDetailDrawer";
import type { BroadcastOut } from "@/api/types";

const STATUS_TABS: { id: string; label: string; icon?: keyof typeof Icons }[] = [
  { id: "all", label: "Barchasi" },
  { id: "draft", label: "Qoralamalar" },
  { id: "scheduled", label: "Rejalashtirilgan" },
  { id: "running", label: "Yuborilmoqda" },
  { id: "finished", label: "Yakunlangan" },
  { id: "cancelled", label: "Bekor qilingan" },
];

export default function BroadcastsPage() {
  const { hasPermission } = useAuth();
  const canCreateBroadcast = hasPermission("broadcast");

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [beforeId, setBeforeId] = useState<number | null>(null);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch broadcasts query
  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["broadcasts", { status: selectedStatus, before_id: beforeId }],
    queryFn: () =>
      broadcastApi.list({
        broadcast_status: selectedStatus === "all" ? null : selectedStatus,
        before_id: beforeId,
        limit: 25,
      }),
  });

  const broadcasts = pageData?.items || [];
  const hasMore = pageData?.has_more || false;
  const nextCursor = pageData?.next_cursor;

  const columns: ColumnDef<BroadcastOut>[] = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        width: "90px",
        cell: (row: BroadcastOut) => (
          <span className="font-mono text-xs font-bold text-fg">
            #{row.id}
          </span>
        ),
      },
      {
        id: "status",
        header: "Holati",
        width: "150px",
        cell: (row: BroadcastOut) => <BroadcastStatusBadge status={row.status} />,
      },
      {
        id: "text_uz",
        header: "Xabar matni",
        width: "280px",
        cell: (row: BroadcastOut) => (
          <div className="space-y-0.5">
            <span className="text-xs text-fg font-medium block truncate max-w-[260px]" title={row.text_uz}>
              {row.text_uz}
            </span>
            {row.buttons && row.buttons.length > 0 && (
              <span className="text-[12px] text-brand font-mono block">
                {row.buttons.length} ta inline tugma
              </span>
            )}
          </div>
        ),
      },
      {
        id: "progress",
        header: "Qamrov / Jarayon",
        width: "160px",
        cell: (row: BroadcastOut) => {
          const total = row.total_count || 0;
          const sent = row.sent_count || 0;
          const unsent = (row.blocked_count || 0) + (row.failed_count || 0);
          const processed = sent + unsent;
          const pct = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

          //  A cancelled run that had already started keeps its counters, so
          //  the frozen audience - not the status - decides whether there is
          //  progress to show.
          if (total > 0) {
            //  The bar tracks how far the run got; the colour tracks how it
            //  went. A finished run that failed on every recipient is 100%
            //  processed and must not be green.
            const barClass =
              row.status === "running"
                ? "bg-brand"
                : sent === 0
                  ? "bg-status-fail"
                  : unsent > 0
                    ? "bg-status-warn"
                    : "bg-status-ok";

            return (
              <div className="space-y-1 text-xs">
                <div
                  className="flex items-center justify-between font-mono"
                  title={`Yetkazildi: ${sent}, yetkazilmadi: ${unsent}, jami: ${total}`}
                >
                  <span className="text-fg-subtle">{processed} / {total}</span>
                  <span className="font-bold text-fg">{pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-hairline/60">
                  <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          }

          //  Before the send starts the audience is not frozen yet, so
          //  total_count is 0 - which is a fact about the run, not about the
          //  filter. Printing "0 ta qamrov" here read as "this reaches nobody".
          return (
            <span className="font-mono text-xs text-fg-subtle">
              {row.status === "cancelled" ? "Yuborilmadi" : "Hali boshlanmagan"}
            </span>
          );
        },
      },
      {
        id: "blocked",
        header: "Bloklangan",
        width: "100px",
        align: "center",
        cell: (row: BroadcastOut) => (
          <span className={`font-mono text-xs ${row.blocked_count > 0 ? "text-status-warn font-semibold" : "text-fg-subtle"}`}>
            {row.blocked_count || 0}
          </span>
        ),
      },
      {
        id: "failed",
        header: "Xatolik",
        width: "90px",
        align: "center",
        cell: (row: BroadcastOut) => (
          <span className={`font-mono text-xs ${row.failed_count > 0 ? "text-status-fail font-semibold" : "text-fg-subtle"}`}>
            {row.failed_count || 0}
          </span>
        ),
      },
      {
        id: "created_at",
        header: "Yaratildi",
        width: "140px",
        cell: (row: BroadcastOut) => (
          <DateTime value={row.created_at} mode="relative" className="text-xs text-fg-subtle" />
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">
            Broadcast (Ommaviy Xabarnomalar)
          </h1>
          <p className="text-xs text-fg-subtle mt-0.5">
            Telegram foydalanuvchilariga maqsadli va ko'p tilli ommaviy xabarnomalar yuborish
          </p>
        </div>

        {canCreateBroadcast && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsWizardOpen(true)}
            className="gap-1.5 self-start sm:self-auto"
          >
            <Icons.Plus size="sm" />
            <span>Yangi xabarnoma</span>
          </Button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-sm border border-hairline bg-surface overflow-x-auto select-none">
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedStatus(tab.id);
                setBeforeId(null);
              }}
              className={`px-3 py-1.5 rounded-xs text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? "bg-surface-2 text-fg font-semibold shadow-0 border border-fg/20"
                  : "text-fg-muted hover:text-fg hover:bg-surface-2/50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* DataTable */}
      <DataTable<BroadcastOut>
        columns={columns}
        data={broadcasts}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(row) => {
          setSelectedBroadcastId(row.id);
          setIsDetailOpen(true);
        }}
        emptyTitle="Xabarnomalar topilmadi"
        emptyDescription="Hozirda tanlangan holat bo'yicha hech qanday xabarnoma mavjud emas."
        hasMore={hasMore}
        onLoadMore={() => {
          if (nextCursor) {
            setBeforeId(nextCursor);
          }
        }}
      />

      {/* Create Broadcast Wizard */}
      <CreateBroadcastWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      {/* Broadcast Detail Drawer */}
      <BroadcastDetailDrawer
        broadcastId={selectedBroadcastId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBroadcastId(null);
        }}
      />
    </div>
  );
}
