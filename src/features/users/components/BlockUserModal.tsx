import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { AnimatePresence, motion } from "motion/react";
import type { UserDetailOut } from "@/api/types";

export interface BlockUserModalProps {
  user: UserDetailOut | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const BLOCK_TEMPLATES = [
  "Firibgarlik gumoni",
  "Qoidabuzarlik va spam",
  "Mijoz so'rovi bo'yicha",
  "Shubhali to'lov urinishlari",
];

export function BlockUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: BlockUserModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      setError("Iltimos, bloklash sababini batafsilroq yozing (kamida 3 ta belgi).");
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

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-user-title"
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
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-full bg-status-fail-bg flex items-center justify-center text-status-fail shrink-0">
              <Icons.UserX size="md" />
            </div>
            <div>
              <h3
                id="block-user-title"
                className="text-sm font-semibold text-fg leading-tight"
              >
                Foydalanuvchini bloklash
              </h3>
              <span className="text-xs text-fg-subtle">
                Foydalanuvchi #{user.id} ({user.first_name || user.username || "Noma'lum"})
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-status-fail/40 bg-status-fail-bg/20 p-3 text-xs text-fg-muted space-y-1">
            <p className="font-semibold text-status-fail flex items-center gap-1">
              <Icons.AlertTriangle size={13} />
              <span>Diqqat:</span>
            </p>
            <p>
              Bloklangan foydalanuvchi botdan foydalana olmaydi va yangi buyurtma yoki to'lov qila olmaydi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-2">
              <label htmlFor="block-reason" className="text-xs font-semibold text-fg block">
                Bloklash sababi (majburiy, min 3 belgi):
              </label>

              <div className="flex flex-wrap gap-1.5 pb-1">
                {BLOCK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setReason(tmpl)}
                    className="text-xs px-2.5 py-1 rounded-full border border-hairline bg-surface-2/60 text-fg-muted hover:text-fg transition-colors cursor-pointer"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              <textarea
                id="block-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Bloklash sababini yozing..."
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
                variant="destructive"
                size="sm"
                disabled={isLoading || reason.trim().length < 3}
                className="gap-2"
              >
                {isLoading && <Icons.Spinner size="sm" className="animate-spin" />}
                <span>Foydalanuvchini bloklash</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
