import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icons } from "@/components/icons";
import { Button } from "./button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "primary" | "default";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Focus trap & Escape key
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const timer = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === "function") {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, isLoading, onClose]);

  const isDestructive = variant === "destructive";

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
        >
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-[440px] rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-5 select-none"
          >
            <div className="flex items-start gap-4">
              <div
                className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                  isDestructive
                    ? "bg-status-fail-bg text-status-fail"
                    : "bg-surface-2 text-fg"
                }`}
              >
                {isDestructive ? (
                  <Icons.AlertTriangle size="md" />
                ) : (
                  <Icons.HelpCircle size="md" />
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <h3
                  id="confirm-dialog-title"
                  className="text-base font-semibold text-fg tracking-tight leading-snug"
                >
                  {title}
                </h3>
                <div
                  id="confirm-dialog-desc"
                  className="text-xs text-fg-muted leading-relaxed"
                >
                  {description}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                ref={cancelButtonRef}
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>

              <Button
                variant={isDestructive ? "destructive" : "primary"}
                size="sm"
                onClick={onConfirm}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading && <Icons.Spinner size="sm" className="animate-spin" />}
                <span>{confirmLabel}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
