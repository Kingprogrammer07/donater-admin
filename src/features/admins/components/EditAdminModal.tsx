import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { motion, AnimatePresence } from "motion/react";
import type { AdminOut } from "@/api/types";

export interface EditAdminModalProps {
  admin: AdminOut | null;
  open: boolean;
  onClose: () => void;
}

export function EditAdminModal({ admin, open, onClose }: EditAdminModalProps) {
  const { success, error: toastError } = useToast();

  const [role, setRole] = useState<string>("viewer");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setRole(admin.role || "viewer");
      setIsActive(admin.is_active ?? true);
      setLocalError(null);
    }
  }, [admin]);

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!admin) return;
      setLocalError(null);

      const payload: { role?: string; is_active?: boolean } = {};
      if (role !== admin.role) payload.role = role;
      if (isActive !== admin.is_active) payload.is_active = isActive;

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }

      return adminApi.patchAdmin(admin.id, payload);
    },
    onSuccess: (updated) => {
      if (updated) {
        queryClient.invalidateQueries({ queryKey: ["admins-list"] });
        queryClient.invalidateQueries({ queryKey: ["audit-list"] });
        success(`Admin (#${updated.tg_id}) ma'lumotlari muvaffaqiyatli yangilandi.`);
      }
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setLocalError(err.message);
        toastError(err.message, { requestId: err.requestId });
      } else if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Adminni tahrirlashda kutilmagan xatolik yuz berdi.");
      }
    },
  });

  if (!open || !admin) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-overlay"
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
                <Icons.Edit size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-fg">Adminni Tahrirlash</h2>
                <p className="text-[12px] text-fg-subtle font-mono">
                  TG ID: {admin.tg_id} {admin.full_name ? `(${admin.full_name})` : ""}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
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
              patchMutation.mutate();
            }}
            className="space-y-4 text-xs"
          >
            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="font-semibold text-fg block">
                Admin Roli
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

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 rounded-xs border border-hairline bg-surface-2/40">
              <div className="space-y-0.5">
                <span className="font-bold text-fg block">Admin Holati:</span>
                <span className="text-[12px] text-fg-subtle block">
                  {isActive ? "Faol (Tizimga kira oladi)" : "Bloklangan (Kirish taqiqlangan)"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                  isActive ? "bg-status-ok justify-end" : "bg-surface-2 justify-start border border-hairline"
                }`}
              >
                <div className="size-4 rounded-full bg-surface shadow-0" />
              </button>
            </div>

            {/* Invalidation Warning */}
            <div className="p-3 rounded-xs border border-status-warn/40 bg-status-warn-bg/20 text-status-warn text-[12px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Icons.AlertTriangle size={13} />
                <span>Muhim ogohlantirish:</span>
              </div>
              <p className="leading-normal">
                Rol o'zgartirilsa yoki admin bloklansa, server ushbu foydalanuvchining barcha faol sessiyalarini darhol bekor qiladi va uni tizimdan chiqaradi.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={patchMutation.isPending}
                className="text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={patchMutation.isPending}
                className="gap-1 text-xs font-semibold"
              >
                {patchMutation.isPending ? (
                  <Icons.Spinner size={12} className="animate-spin" />
                ) : (
                  <Icons.Check size={12} />
                )}
                <span>Saqlash</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
