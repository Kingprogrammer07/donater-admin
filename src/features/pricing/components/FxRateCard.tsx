import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fxApi } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { AnimatePresence, motion } from "motion/react";

export function FxRateCard() {
  const { success, error: toastError } = useToast();
  const { admin } = useAuth();
  const isViewer = admin?.role === "viewer";

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualRateInput, setManualRateInput] = useState<string>("");
  const [manualNoteInput, setManualNoteInput] = useState<string>("");
  const [isStrictConfirmOpen, setIsStrictConfirmOpen] = useState(false);
  const [targetStrictMode, setTargetStrictMode] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 1. Current Rate Query
  const {
    data: currentFx,
    isLoading,
    error,
    refetch: refetchCurrent,
  } = useQuery({
    queryKey: ["fx-current"],
    queryFn: () => fxApi.getCurrentRate(),
  });

  // 2. FX History Query
  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["fx-history"],
    queryFn: () => fxApi.getRateHistory({ limit: 15 }),
    enabled: isHistoryOpen,
  });

  // 3. Set Manual Rate Mutation
  const manualRateMutation = useMutation({
    mutationFn: async ({ rate, note }: { rate: number; note: string }) => {
      return fxApi.setManualRate({ rate, note });
    },
    onSuccess: (newRate) => {
      queryClient.invalidateQueries({ queryKey: ["fx-current"] });
      queryClient.invalidateQueries({ queryKey: ["fx-history"] });
      queryClient.invalidateQueries({ queryKey: ["markup-preview"] });
      success(`Yangi kurs muvaffaqiyatli belgilandi: ${Number(newRate.rate).toLocaleString("uz-UZ")} UZS`);
      setIsManualModalOpen(false);
      setManualRateInput("");
      setManualNoteInput("");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Qo'lda kurs belgilashda xatolik yuz berdi.");
      }
    },
  });

  // 4. Set Mode Mutation (Strict Manual)
  const modeMutation = useMutation({
    mutationFn: async (strictManual: boolean) => {
      return fxApi.setMode({ strict_manual: strictManual });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["fx-current"] });
      success(
        res.strict_manual
          ? "Strict manual rejimi yoqildi (CBU avtomatik kursi yozilmaydi)."
          : "Strict manual rejimi o'chirildi (CBU avtomatik kursi faol)."
      );
      setIsStrictConfirmOpen(false);
    },
    onError: () => {
      toastError("Kurs rejimini o'zgartirishda xatolik yuz berdi.");
    },
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = Number(manualRateInput);
    if (!rateNum || rateNum <= 0) {
      toastError("Iltimos, musbat kurs qiymatini kiriting.");
      return;
    }
    await manualRateMutation.mutateAsync({
      rate: rateNum,
      note: manualNoteInput.trim() || "Admin tomonidan qo'lda belgilangan",
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  const isManualSource = currentFx?.source === "manual";

  return (
    <div className="rounded-sm border border-hairline bg-surface p-4 space-y-4 shadow-0 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <Icons.Dollar size="sm" className="text-fg-muted" />
          <h3 className="text-sm font-semibold text-fg">
            Valyuta kursi (USD / UZS)
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="text-xs text-fg-muted hover:text-fg gap-1"
          >
            <Icons.Activity size={13} />
            <span>Tarix</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetchCurrent()}
            className="p-1.5"
            title="Yangilash"
          >
            <Icons.Refresh size={13} />
          </Button>
        </div>
      </div>

      {/* Main Rate Value & Source */}
      {currentFx ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-fg tracking-tight">
                {Number(currentFx.rate).toLocaleString("uz-UZ")}
              </span>
              <span className="text-xs font-semibold text-fg-subtle">
                UZS / 1 USD
              </span>
            </div>

            {isManualSource ? (
              <Badge variant="warn" styleType="subtle" className="text-xs font-semibold">
                ✏️ Qo'lda belgilangan (Manual)
              </Badge>
            ) : (
              <Badge variant="ok" styleType="subtle" className="text-xs font-semibold">
                🏦 CBU Markaziy Bank
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-fg-subtle">
            <span>
              Kuzatilgan: <DateTime value={currentFx.observed_at} mode="relative" className="text-fg font-medium" />
            </span>

            {currentFx.note && (
              <span className="italic truncate max-w-[200px]" title={currentFx.note}>
                "{currentFx.note}"
              </span>
            )}
          </div>
        </div>
      ) : error ? (
        <div className="p-3 bg-status-fail-bg/20 rounded-xs text-xs text-status-fail">
          Kurs ma'lumotlarini yuklashda xatolik yuz berdi.
        </div>
      ) : null}

      {/* Actions & Strict Mode */}
      {!isViewer && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-hairline flex-wrap">
          {/* Manual Rate Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setManualRateInput(currentFx ? String(currentFx.rate) : "");
              setIsManualModalOpen(true);
            }}
            className="gap-1.5 text-xs"
          >
            <Icons.Edit size="sm" />
            <span>Qo'lda kurs qo'yish</span>
          </Button>

          {/* Strict Mode Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTargetStrictMode(!isManualSource);
              setIsStrictConfirmOpen(true);
            }}
            className="text-xs text-fg-muted hover:text-fg gap-1.5"
          >
            <Icons.Lock size="sm" />
            <span>Strict Manual rejimini boshqarish</span>
          </Button>
        </div>
      )}

      {/* History Drawer / Accordion */}
      {isHistoryOpen && (
        <div className="rounded-xs border border-hairline bg-surface-2/40 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-fg border-b border-hairline pb-1">
            <span>Kurs tarixi (Oxirgi o'zgarishlar)</span>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="text-fg-subtle hover:text-fg"
            >
              <Icons.X size={13} />
            </button>
          </div>

          {isHistoryLoading ? (
            <div className="space-y-1 py-1">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {history.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between p-1.5 bg-surface rounded-xs border border-hairline/60 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-fg">
                      {Number(row.rate).toLocaleString("uz-UZ")} UZS
                    </span>
                    <Badge variant={row.source === "manual" ? "warn" : "ok"} styleType="subtle" className="text-xs uppercase">
                      {row.source}
                    </Badge>
                  </div>
                  <DateTime value={row.observed_at} mode="relative" className="text-fg-subtle" />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-fg-subtle block text-center py-2">
              Tarix mavjud emas
            </span>
          )}
        </div>
      )}

      {/* Manual Rate Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-rate-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsManualModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-[460px] rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-full bg-status-warn-bg flex items-center justify-center text-status-warn shrink-0">
                  <Icons.Edit size="md" />
                </div>
                <div>
                  <h3
                    id="manual-rate-title"
                    className="text-sm font-semibold text-fg leading-tight"
                  >
                    Qo'lda yangi kurs belgilash
                  </h3>
                  <span className="text-xs text-fg-subtle">
                    1 USD uchun UZS valyutasidagi qiymat
                  </span>
                </div>
              </div>

              <div className="rounded-sm border border-status-warn/40 bg-status-warn-bg/20 p-3 text-xs text-fg-muted space-y-1">
                <div className="flex items-center gap-1.5 text-status-warn font-semibold">
                  <Icons.AlertTriangle size={13} />
                  <span>Diqqat:</span>
                </div>
                <p>
                  Belgilangan kurs barcha yangi tovar hisob-kitoblariga darhol ta'sir qiladi.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <label htmlFor="manual-rate" className="text-xs font-semibold text-fg block">
                    Yangi kurs (UZS):
                  </label>
                  <input
                    id="manual-rate"
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="Masalan: 12900"
                    value={manualRateInput}
                    onChange={(e) => setManualRateInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xs border border-hairline bg-canvas text-sm text-fg font-mono font-bold focus:outline-none focus:border-fg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="manual-note" className="text-xs font-semibold text-fg block">
                    Sabab / Izoh:
                  </label>
                  <input
                    id="manual-note"
                    type="text"
                    maxLength={255}
                    placeholder="Masalan: Bozor o'zgarishi munosabati bilan"
                    value={manualNoteInput}
                    onChange={(e) => setManualNoteInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg placeholder:text-fg-subtle"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-hairline">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsManualModalOpen(false)}
                    disabled={manualRateMutation.isPending}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={manualRateMutation.isPending || !manualRateInput}
                    className="gap-2"
                  >
                    {manualRateMutation.isPending && (
                      <Icons.Spinner size="sm" className="animate-spin" />
                    )}
                    <span>Kursni tasdiqlash</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Strict Mode Confirm Dialog */}
      <ConfirmDialog
        isOpen={isStrictConfirmOpen}
        onClose={() => setIsStrictConfirmOpen(false)}
        onConfirm={async () => {
          await modeMutation.mutateAsync(targetStrictMode);
        }}
        title="Strict Manual rejimini sozlash"
        description={
          targetStrictMode
            ? "Strict manual rejimini yoqishni xohlaysizmi? Bu yoqilsa CBU markaziy bank cron vazifasi kursni avtomatik yangilamaydi."
            : "Strict manual rejimini o'chirishni xohlaysizmi? Markaziy bank (CBU) kursi avtomatik ravishda yangilanib boradi."
        }
        confirmLabel="Rejimni o'zgartirish"
        variant="primary"
        isLoading={modeMutation.isPending}
      />
    </div>
  );
}
