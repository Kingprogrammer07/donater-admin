import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { AnimatePresence, motion } from "motion/react";

export interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  orderPublicId: string;
  priceUzs: string;
  isLoading?: boolean;
}

const REFUND_TEMPLATES = [
  "Provayder yetkazib berishni rad etdi",
  "Hisob rekvizitlari xato ko'rsatilgan",
  "Tizim xatoligi sababli to'xtatildi",
  "Mijoz so'rovi bo'yicha bekor qilindi",
];

export function RefundModal({
  isOpen,
  onClose,
  onConfirm,
  orderPublicId,
  isLoading = false,
}: RefundModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      setError("Iltimos, qaytarish sababini batafsilroq yozing (kamida 3 ta belgi).");
      return;
    }
    setError(null);
    await onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-modal-title"
      >
        {/* Backdrop Scrim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-[460px] rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-full bg-status-fail-bg flex items-center justify-center text-status-fail shrink-0">
              <Icons.Refresh size="md" />
            </div>
            <div>
              <h3
                id="refund-modal-title"
                className="text-sm font-semibold text-fg leading-tight"
              >
                Mablag'ni qaytarish (Refund)
              </h3>
              <span className="text-xs text-fg-subtle font-mono">
                Buyurtma: {orderPublicId}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-sm border border-status-warn/40 bg-status-warn-bg/20 p-3 space-y-1.5 text-xs text-fg-muted">
            <div className="flex items-center gap-1.5 text-status-warn font-semibold">
              <Icons.AlertTriangle size={14} />
              <span>Diqqat: Ushbu amal pul operatsiyasiga tegishli!</span>
            </div>
            <p>
              Buyurtma uchun ushlab turilgan mablag' to'liq foydalanuvchi hisobiga
              qaytariladi va ledger tarixiga yoziladi.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-2">
              <label htmlFor="refund-reason" className="text-xs font-semibold text-fg block">
                Qaytarish sababi (majburiy):
              </label>

              {/* Quick Template Chips */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {REFUND_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setReason(tmpl)}
                    className="text-xs px-2.5 py-1 rounded-full border border-hairline bg-surface-2/60 text-fg-muted hover:text-fg hover:border-fg-muted/40 transition-colors cursor-pointer"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              <textarea
                id="refund-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Qaytarish sababini aniq yozing..."
                rows={3}
                required
                className="w-full rounded-sm border border-hairline bg-canvas p-2.5 text-xs text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
                disabled={isLoading}
              />
              {error && <p className="text-xs text-status-fail">{error}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={isLoading || reason.trim().length < 3}
                className="gap-2"
              >
                {isLoading && <Icons.Spinner size="sm" className="animate-spin" />}
                <span>Mablag'ni qaytarish</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export interface ForceCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  orderPublicId: string;
  isLoading?: boolean;
}

const COMPLETE_TEMPLATES = [
  "Qo'lda yetkazib berildi",
  "Provayder orqali to'g'ridan-to'g'ri muvaffaqiyatli yakunlandi",
  "Mijoz qabul qilgani tasdiqlandi",
];

export function ForceCompleteModal({
  isOpen,
  onClose,
  onConfirm,
  orderPublicId,
  isLoading = false,
}: ForceCompleteModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      setError("Iltimos, izohni to'liqroq yozing (kamida 3 ta belgi).");
      return;
    }
    setError(null);
    await onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
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
            <div className="size-9 rounded-full bg-status-ok-bg flex items-center justify-center text-status-ok shrink-0">
              <Icons.CheckCircle size="md" />
            </div>
            <div>
              <h3
                id="complete-modal-title"
                className="text-sm font-semibold text-fg leading-tight"
              >
                Qo'lda yakunlash (Force Complete)
              </h3>
              <span className="text-xs text-fg-subtle font-mono">
                Buyurtma: {orderPublicId}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-2">
              <label htmlFor="complete-reason" className="text-xs font-semibold text-fg block">
                Yakunlash sababi va izoh (majburiy):
              </label>

              <div className="flex flex-wrap gap-1.5 pb-1">
                {COMPLETE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setReason(tmpl)}
                    className="text-xs px-2.5 py-1 rounded-full border border-hairline bg-surface-2/60 text-fg-muted hover:text-fg hover:border-fg-muted/40 transition-colors cursor-pointer"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              <textarea
                id="complete-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Masalan: Provayder orqali qo'lda kiritildi..."
                rows={3}
                required
                className="w-full rounded-sm border border-hairline bg-canvas p-2.5 text-xs text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
                disabled={isLoading}
              />
              {error && <p className="text-xs text-status-fail">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={isLoading}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading || reason.trim().length < 3}
                className="gap-2"
              >
                {isLoading && <Icons.Spinner size="sm" className="animate-spin" />}
                <span>Yetkazilgan deb belgilash</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
