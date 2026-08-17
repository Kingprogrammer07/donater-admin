import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  paymentAmount?: string;
  paymentId?: number;
  isLoading?: boolean;
}

const COMMON_REASONS = [
  "Chek noaniq yoki to'liq ko'rinmayapti",
  "To'lov summasi buyurtmaga mos kelmadi",
  "Ushbu chek allaqachon hisobga olingan",
  "To'lov rekvizitlari xato ko'rsatilgan",
];

export function RejectReasonModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      const timer = setTimeout(() => textareaRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    } else {
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === "function") {
        previouslyFocusedRef.current.focus();
      }
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Iltimos, rad etish sababini kiriting.");
      textareaRef.current?.focus();
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  const handleSelectReason = (text: string) => {
    setReason(text);
    setError(null);
    textareaRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
        >
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-[480px] rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-5 select-none"
          >
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-status-fail-bg flex items-center justify-center text-status-fail shrink-0">
                <Icons.AlertTriangle size="md" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <h3 id="reject-dialog-title" className="text-base font-semibold text-fg tracking-tight">
                  Chekni rad etish
                </h3>
                <p className="text-xs text-status-fail font-medium">
                  ⚠️ Diqqat: Kiritilgan sabab to'g'ridan-to'g'ri bot orqali mijozga xabar qilinadi.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick suggestion chips */}
              <div className="space-y-1.5">
                <span className="text-xs text-fg-subtle font-medium">Tezkor sabablar:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_REASONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelectReason(item)}
                      className="px-2 py-1 rounded-sm bg-surface-2 text-xs text-fg-muted hover:text-fg hover:bg-surface-2/80 transition-colors cursor-pointer border border-hairline"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason input */}
              <div className="space-y-1.5">
                <label htmlFor="reject-reason" className="block text-xs font-semibold text-fg">
                  Rad etish sababi (majburiy):
                </label>
                <textarea
                  id="reject-reason"
                  ref={textareaRef}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError(null);
                  }}
                  rows={3}
                  placeholder="Mijozga yuboriladigan aniq sababni yozing..."
                  className={`w-full rounded-sm border bg-surface px-3 py-2 text-xs text-fg placeholder:text-fg-subtle focus:outline-none transition-colors ${
                    error ? "border-status-fail focus:ring-1 focus:ring-status-fail" : "border-hairline focus:border-brand"
                  }`}
                />
                {error && <p className="text-xs text-status-fail">{error}</p>}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-hairline">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading && <Icons.Spinner size="sm" className="animate-spin" />}
                  <span>Rad etish va xabar yuborish</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
