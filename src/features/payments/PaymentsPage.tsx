import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { paymentsApi } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { ProofOut, PaymentOut } from "@/api/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table/DataTable";
import { Money } from "@/components/ui/money";
import { DateTime } from "@/components/ui/datetime";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProofReviewCard } from "./components/ProofReviewCard";
import { RejectReasonModal } from "./components/RejectReasonModal";
import { PaymentDetailDrawer } from "./components/PaymentDetailDrawer";

type TabType = "queue" | "all";

export default function PaymentsPage() {
  const { hasPermission } = useAuth();
  const canReview = hasPermission("review_payments");
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab from URL search params (defaults to "queue")
  const activeTab: TabType = (searchParams.get("tab") as TabType) || "queue";

  const handleTabChange = (tab: TabType) => {
    const next = new URLSearchParams(searchParams);
    if (tab === "queue") {
      next.delete("tab");
    } else {
      next.set("tab", tab);
    }
    setSearchParams(next, { replace: true });
  };

  // Toast / Alert Notification State
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warn";
    message: string;
    requestId?: string | null;
  } | null>(null);

  const showToast = useCallback(
    (type: "success" | "error" | "warn", message: string, requestId?: string | null) => {
      setToast({ type, message, requestId });
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    },
    []
  );

  // --- TAB 1: PENDING PROOFS QUEUE ---
  const {
    data: pendingProofs = [],
    isLoading: isQueueLoading,
    error: queueError,
    refetch: refetchQueue,
  } = useQuery({
    queryKey: ["pending-proofs"],
    queryFn: () => paymentsApi.getPendingProofs(50),
    refetchInterval: 30000,
  });

  // Modal / Action States for Queue
  const [activeProofForApprove, setActiveProofForApprove] = useState<ProofOut | null>(null);
  const [activeProofForReject, setActiveProofForReject] = useState<ProofOut | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Lightbox Zoom Image State
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  // Approve Mutation (No optimistic UI - invalidate on success)
  const approveMutation = useMutation({
    mutationFn: async (proof: ProofOut) => {
      const idempotencyKey = crypto.randomUUID();
      return paymentsApi.approveProof(proof.id, idempotencyKey);
    },
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ["pending-proofs"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", payment.id] });
      queryClient.invalidateQueries({ queryKey: ["user", payment.user_id] });
      showToast(
        "success",
        `To'lov #${payment.id} muvaffaqiyatli tasdiqlandi. Hisobga summa o'tkazildi.`
      );
      setActiveProofForApprove(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          showToast("warn", `Ogohlantirish: ${err.message}`, err.requestId);
          queryClient.invalidateQueries({ queryKey: ["pending-proofs"] });
        } else {
          showToast("error", err.message, err.requestId);
        }
      } else {
        showToast("error", "Tasdiqlashda kutilmagan xatolik yuz berdi.");
      }
      setActiveProofForApprove(null);
    },
  });

  // Reject Mutation (No optimistic UI - invalidate on success)
  const rejectMutation = useMutation({
    mutationFn: async ({ proof, reason }: { proof: ProofOut; reason: string }) => {
      return paymentsApi.rejectProof(proof.id, reason);
    },
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ["pending-proofs"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", payment.id] });
      queryClient.invalidateQueries({ queryKey: ["user", payment.user_id] });
      showToast(
        "success",
        `Chek #${activeProofForReject?.id} rad etildi va mijozga xabar yuborildi.`
      );
      setActiveProofForReject(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          showToast("warn", `Ogohlantirish: ${err.message}`, err.requestId);
          queryClient.invalidateQueries({ queryKey: ["pending-proofs"] });
        } else {
          showToast("error", err.message, err.requestId);
        }
      } else {
        showToast("error", "Rad etishda kutilmagan xatolik yuz berdi.");
      }
      setActiveProofForReject(null);
    },
  });

  const handleApproveConfirm = async () => {
    if (!activeProofForApprove) return;
    setIsApproving(true);
    try {
      await approveMutation.mutateAsync(activeProofForApprove);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!activeProofForReject) return;
    setIsRejecting(true);
    try {
      await rejectMutation.mutateAsync({ proof: activeProofForReject, reason });
    } finally {
      setIsRejecting(false);
    }
  };

  // Keyboard Shortcuts (A for approve, R for reject) on the top pending proof
  useEffect(() => {
    if (activeTab !== "queue" || pendingProofs.length === 0 || !canReview) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable ||
        activeProofForApprove != null ||
        activeProofForReject != null ||
        zoomedImageUrl != null
      ) {
        return;
      }

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        const topProof = pendingProofs[0];
        if (topProof) setActiveProofForApprove(topProof);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        const topProof = pendingProofs[0];
        if (topProof) setActiveProofForReject(topProof);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeTab,
    pendingProofs,
    canReview,
    activeProofForApprove,
    activeProofForReject,
    zoomedImageUrl,
  ]);

  // --- TAB 2: ALL PAYMENTS TABLE ---
  const tableStatus = searchParams.get("status") || "all";
  const tableProvider = searchParams.get("provider") || "all";
  const tableSearch = searchParams.get("q") || "";
  const beforeId = searchParams.get("before_id")
    ? Number(searchParams.get("before_id"))
    : undefined;

  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["payments", tableStatus, tableProvider, beforeId],
    queryFn: () =>
      paymentsApi.listPayments({
        limit: 50,
        status: tableStatus !== "all" ? tableStatus : undefined,
        provider: tableProvider !== "all" ? tableProvider : undefined,
        before_id: beforeId,
      }),
    enabled: activeTab === "all",
  });

  const [selectedPaymentForDrawer, setSelectedPaymentForDrawer] = useState<PaymentOut | null>(null);

  // Filter items in memory if search query `q` is specified (e.g. public_id or ID)
  const filteredPaymentItems = useMemo(() => {
    if (!paymentsData?.items) return [];
    if (!tableSearch) return paymentsData.items;
    const lower = tableSearch.toLowerCase();
    return paymentsData.items.filter(
      (item) =>
        item.public_id.toLowerCase().includes(lower) ||
        String(item.id).includes(lower) ||
        String(item.user_id).includes(lower)
    );
  }, [paymentsData?.items, tableSearch]);

  const handleFilterStatus = (statusVal: string) => {
    const next = new URLSearchParams(searchParams);
    if (statusVal === "all") {
      next.delete("status");
    } else {
      next.set("status", statusVal);
    }
    setSearchParams(next, { replace: true });
  };

  const handleFilterProvider = (provVal: string) => {
    const next = new URLSearchParams(searchParams);
    if (provVal === "all") {
      next.delete("provider");
    } else {
      next.set("provider", provVal);
    }
    setSearchParams(next, { replace: true });
  };

  const handleSearchChange = (queryVal: string) => {
    const next = new URLSearchParams(searchParams);
    if (!queryVal) {
      next.delete("q");
    } else {
      next.set("q", queryVal);
    }
    setSearchParams(next, { replace: true });
  };

  const paymentColumns: ColumnDef<PaymentOut>[] = useMemo(
    () => [
      {
        id: "id",
        header: "# ID",
        accessorKey: "id",
        className: "w-[80px] font-mono font-medium",
        cell: (row) => `#${row.id}`,
      },
      {
        id: "public_id",
        header: "Public ID",
        accessorKey: "public_id",
        className: "w-[130px] font-mono text-fg-muted",
      },
      {
        id: "user_id",
        header: "Mijoz ID",
        accessorKey: "user_id",
        className: "w-[120px]",
        cell: (row) => (
          <span className="font-mono text-fg font-medium">
            User #{row.user_id}
          </span>
        ),
      },
      {
        id: "provider",
        header: "Provayder",
        accessorKey: "provider",
        className: "w-[110px]",
        cell: (row) => (
          <Badge variant="neutral" styleType="subtle" className="text-xs font-mono capitalize">
            {row.provider}
          </Badge>
        ),
      },
      {
        id: "amount_uzs",
        header: "Summa",
        accessorKey: "amount_uzs",
        align: "right",
        className: "w-[150px]",
        cell: (row) => <Money amount={row.amount_uzs} currency="UZS" />,
      },
      {
        id: "status",
        header: "Holat",
        accessorKey: "status",
        align: "center",
        className: "w-[140px]",
        cell: (row) => <StatusBadge type="payment" status={row.status} />,
      },
      {
        id: "created_at",
        header: "Sana",
        accessorKey: "created_at",
        align: "right",
        className: "w-[160px]",
        cell: (row) => <DateTime value={row.created_at} mode="relative" className="text-xs" />,
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="alert"
          className={`flex items-center justify-between px-4 py-3 rounded-md border shadow-2 text-xs font-medium animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-status-ok-bg text-status-ok border-status-ok/30"
              : toast.type === "warn"
              ? "bg-status-warn-bg text-status-warn border-status-warn/30"
              : "bg-status-fail-bg text-status-fail border-status-fail/30"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {toast.type === "success" ? (
              <Icons.CheckCircle size="sm" />
            ) : (
              <Icons.AlertCircle size="sm" />
            )}
            <span>{toast.message}</span>
            {toast.requestId && (
              <span className="font-mono text-fg-subtle opacity-80 truncate">
                (Request ID: {toast.requestId})
              </span>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
            aria-label="Xabarni yopish"
          >
            <Icons.X size="sm" />
          </button>
        </div>
      )}

      {/* Page Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-hairline">
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">
            To'lovlar boshqaruvi
          </h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Mijozlar tomonidan amalga oshirilgan to'lovlar va cheklarni tekshirish navbati.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 rounded-md bg-surface-2 border border-hairline self-start sm:self-auto">
          <button
            onClick={() => handleTabChange("queue")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer ${
              activeTab === "queue"
                ? "bg-surface text-fg shadow-0 font-semibold"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            <Icons.Clock size="sm" />
            <span>Navbat</span>
            {pendingProofs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-status-warn text-surface font-mono text-xs font-bold">
                {pendingProofs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("all")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-surface text-fg shadow-0 font-semibold"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            <Icons.List size="sm" />
            <span>Barcha to'lovlar</span>
          </button>
        </div>
      </div>

      {/* TAB 1 CONTENT: REVIEW QUEUE */}
      {activeTab === "queue" && (
        <div className="space-y-6">
          {/* Viewer Role Warning */}
          {!canReview && (
            <div className="flex items-center gap-3 p-3.5 rounded-md bg-surface-2 border border-hairline text-xs text-fg-muted">
              <Icons.AlertCircle size="md" className="text-status-neutral shrink-0" />
              <span>
                Siz <strong>Viewer</strong> rolidasiz. Cheklarni tasdiqlash yoki rad etish faqat
                support, admin va owner foydalanuvchilariga ruxsat etilgan.
              </span>
            </div>
          )}

          {isQueueLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[380px] w-full rounded-md" />
            </div>
          ) : queueError ? (
            <EmptyState
              icon="AlertTriangle"
              title="Navbatni yuklab bo'lmadi"
              description={queueError instanceof ApiError ? queueError.message : "Server xatosi."}
              action={{
                label: "Qayta urinish",
                onClick: () => refetchQueue(),
              }}
            />
          ) : pendingProofs.length === 0 ? (
            <EmptyState
              icon="CheckCircle"
              title="Barcha cheklar ko'rib chiqilgan"
              description="Hozirda tasdiq kutayotgan yangi cheklar yo'q. Barcha to'lovlar holatini 'Barcha to'lovlar' tabida ko'rishingiz mumkin."
              action={{
                label: "Barcha to'lovlarni ko'rish",
                onClick: () => handleTabChange("all"),
              }}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-fg-muted">
                <span>
                  Tasdiq kutayotgan cheklar: <strong>{pendingProofs.length} ta</strong>
                </span>
                <span className="font-mono text-fg-subtle">
                  Klaviatura: [A] = Tasdiqlash, [R] = Rad etish
                </span>
              </div>

              <div className="space-y-6">
                {pendingProofs.map((proof) => (
                  <ProofReviewCard
                    key={proof.id}
                    proof={proof}
                    onApprove={(p) => setActiveProofForApprove(p)}
                    onReject={(p) => setActiveProofForReject(p)}
                    onImageZoom={(url) => setZoomedImageUrl(url)}
                    isActionLoading={isApproving || isRejecting}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2 CONTENT: ALL PAYMENTS TABLE */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-md border border-hairline bg-surface">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Icons.Search size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="ID yoki Public ID bo'yicha qidirish..."
                className="w-full pl-9 pr-3 py-1.5 rounded-sm border border-hairline bg-surface-2 text-xs text-fg placeholder:text-fg-subtle focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            {/* Provider and Status Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-fg-subtle font-medium">Holat:</span>
              {(
                [
                  { label: "Barchasi", value: "all" },
                  { label: "Kutilmoqda", value: "pending_check" },
                  { label: "Tasdiqlangan", value: "approved" },
                  { label: "To'langan", value: "paid" },
                  { label: "Rad etilgan", value: "rejected" },
                ] as const
              ).map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => handleFilterStatus(chip.value)}
                  className={`px-2.5 py-1 rounded-sm text-xs transition-colors cursor-pointer border ${
                    tableStatus === chip.value
                      ? "bg-fg text-canvas border-fg font-semibold"
                      : "bg-surface-2 text-fg-muted border-hairline hover:text-fg"
                  }`}
                >
                  {chip.label}
                </button>
              ))}

              <span className="text-xs text-fg-subtle font-medium ml-2">Provayder:</span>
              {(
                [
                  { label: "Barchasi", value: "all" },
                  { label: "Manual", value: "manual" },
                  { label: "Payme", value: "payme" },
                  { label: "Click", value: "click" },
                ] as const
              ).map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => handleFilterProvider(chip.value)}
                  className={`px-2.5 py-1 rounded-sm text-xs transition-colors cursor-pointer border ${
                    tableProvider === chip.value
                      ? "bg-fg text-canvas border-fg font-semibold"
                      : "bg-surface-2 text-fg-muted border-hairline hover:text-fg"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <DataTable<PaymentOut>
            columns={paymentColumns}
            data={filteredPaymentItems}
            keyExtractor={(row) => row.id}
            isLoading={isPaymentsLoading}
            error={paymentsError ? (paymentsError as Error).message : null}
            onRetry={() => refetchPayments()}
            onRowClick={(row) => setSelectedPaymentForDrawer(row)}
            emptyTitle="To'lovlar topilmadi"
            emptyDescription="Tanlangan filtrlar bo'yicha hech qanday to'lov yozuvi mavjud emas."
          />
        </div>
      )}

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={activeProofForApprove != null}
        onClose={() => {
          if (!isApproving) setActiveProofForApprove(null);
        }}
        onConfirm={handleApproveConfirm}
        title={`Chek #${activeProofForApprove?.id} ni tasdiqlash`}
        description="Diqqat: Ushbu amal qaytarilmaydi! Tasdiqlangandan so'ng tegishli summa foydalanuvchi hisob balansiga darhol to'ldiriladi."
        confirmLabel="Tasdiqlash va hisobga o'tkazish"
        variant="primary"
        isLoading={isApproving}
      />

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={activeProofForReject != null}
        onClose={() => {
          if (!isRejecting) setActiveProofForReject(null);
        }}
        onConfirm={handleRejectConfirm}
        paymentId={activeProofForReject?.payment_id}
        isLoading={isRejecting}
      />

      {/* Detail Drawer */}
      <PaymentDetailDrawer
        payment={selectedPaymentForDrawer}
        isOpen={selectedPaymentForDrawer != null}
        onClose={() => setSelectedPaymentForDrawer(null)}
        onImageZoom={(url) => setZoomedImageUrl(url)}
      />

      {/* Zoomed Image Lightbox */}
      {zoomedImageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Kattalashtirilgan chek rasmi"
          className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={zoomedImageUrl}
              alt="Chek fotosurati"
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-3 border border-hairline"
            />
            <button
              onClick={() => setZoomedImageUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-white/80 transition-colors cursor-pointer"
              aria-label="Rasmni yopish"
            >
              <Icons.X size="lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
