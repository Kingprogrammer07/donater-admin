import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { motion, AnimatePresence } from "motion/react";

export interface CreateAdminModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAdminModal({ open, onClose }: CreateAdminModalProps) {
  const { success, error: toastError } = useToast();

  const [tgId, setTgId] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string>("viewer");
  const [localError, setLocalError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      setLocalError(null);
      const parsedTgId = parseInt(tgId.trim(), 10);
      if (isNaN(parsedTgId) || parsedTgId <= 0) {
        throw new Error("Telegram ID to'g'ri musbat butun son bo'lishi kerak.");
      }

      return adminApi.createAdmin({
        tg_id: parsedTgId,
        full_name: fullName.trim() || undefined,
        role,
      });
    },
    onSuccess: (admin) => {
      queryClient.invalidateQueries({ queryKey: ["admins-list"] });
      queryClient.invalidateQueries({ queryKey: ["audit-list"] });
      success(`Yangi admin (#${admin.tg_id}) muvaffaqiyatli yaratildi.`);
      handleClose();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setLocalError(err.message);
        toastError(err.message, { requestId: err.requestId });
      } else if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Admin qo'shishda kutilmagan xatolik yuz berdi.");
      }
    },
  });

  const handleClose = () => {
    setTgId("");
    setFullName("");
    setRole("viewer");
    setLocalError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-admin-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md rounded-md border border-hairline bg-surface p-6 space-y-4 shadow-3 z-10"
        >
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand">
                <Icons.UserCheck size={16} />
              </div>
              <div>
                <h2 id="create-admin-title" className="text-sm font-bold text-fg">
                  Yangi Admin Qo'shish
                </h2>
                <p className="text-[12px] text-fg-subtle">
                  Telegram foydalanuvchisiga admin panel ruxsatini berish
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="text-fg-subtle hover:text-fg p-1 rounded-xs hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Icons.X size={16} />
            </button>
          </div>

          {/* Local Error alert */}
          {localError && (
            <div className="p-3 rounded-xs border border-status-fail/40 bg-status-fail-bg/20 text-status-fail text-xs flex items-center gap-2">
              <Icons.AlertCircle size={14} className="shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="space-y-4 text-xs"
          >
            {/* Telegram ID */}
            <div className="space-y-1.5">
              <label className="font-semibold text-fg block">
                Telegram ID <span className="text-status-fail">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="Masalan: 777967425"
                value={tgId}
                onChange={(e) => setTgId(e.target.value)}
                className="w-full px-3 py-2 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
              />
              <p className="text-[12px] text-fg-subtle">
                Foydalanuvchining <code>@userinfobot</code> orqali olinadigan raqamli IDsi
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-fg block">
                Ism / Izoh (Ixtiyoriy)
              </label>
              <input
                type="text"
                placeholder="Masalan: Azizbek (Menejer)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg"
              />
            </div>

            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="font-semibold text-fg block">
                Admin Roli <span className="text-status-fail">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg cursor-pointer"
              >
                <option value="viewer">Viewer (Faqat ko'rish huquqi)</option>
                <option value="support">Support (Cheklarni tasdiqlash va buyurtmalar)</option>
                <option value="admin">Admin (Katalog, foydalanuvchilar, marja, broadcast)</option>
                <option value="owner">Owner (Tizim egasi — to'liq boshqaruv)</option>
              </select>
            </div>

            <div className="p-3 rounded-xs border border-hairline bg-surface-2/40 text-[12px] text-fg-subtle">
              💡 Yangi admin yaratilgandan so'ng Telegram orqali login qilib tizimga kira oladi.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={createMutation.isPending}
                className="text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={createMutation.isPending || !tgId.trim()}
                className="gap-1 text-xs font-semibold"
              >
                {createMutation.isPending ? (
                  <Icons.Spinner size={12} className="animate-spin" />
                ) : (
                  <Icons.Plus size={12} />
                )}
                <span>Qo'shish</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
