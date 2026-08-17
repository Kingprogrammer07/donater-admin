import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { settingsApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";

export interface SupportAlertsCardProps {
  initialSupportContact?: string | null;
  initialAdminChatId?: number | string | null;
}

export function SupportAlertsCard({
  initialSupportContact,
  initialAdminChatId,
}: SupportAlertsCardProps) {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const [supportContact, setSupportContact] = useState<string>("");
  const [adminChatId, setAdminChatId] = useState<string>("");

  useEffect(() => {
    setSupportContact(initialSupportContact || "");
    setAdminChatId(initialAdminChatId !== null && initialAdminChatId !== undefined ? String(initialAdminChatId) : "");
  }, [initialSupportContact, initialAdminChatId]);

  const isSupportDirty = (initialSupportContact || "") !== supportContact.trim();
  const currentChatIdNumber = adminChatId.trim() ? Number(adminChatId.trim()) : null;
  const initialChatIdNumber = initialAdminChatId !== null && initialAdminChatId !== undefined ? Number(initialAdminChatId) : null;
  const isChatIdDirty = initialChatIdNumber !== currentChatIdNumber;
  const isDirty = isSupportDirty || isChatIdDirty;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const patchValues: Record<string, unknown> = {};
      if (isSupportDirty) {
        patchValues.support_contact = supportContact.trim();
      }
      if (isChatIdDirty) {
        patchValues.admin_chat_id = currentChatIdNumber;
      }
      return settingsApi.patchSettings(patchValues);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["app-settings"], data);
      success("Qo'llab-quvvatlash va ogohlantirish sozlamalari saqlandi.");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Sozlamalarni saqlashda xatolik yuz berdi.");
      }
    },
  });

  const handleReset = () => {
    setSupportContact(initialSupportContact || "");
    setAdminChatId(initialAdminChatId !== null && initialAdminChatId !== undefined ? String(initialAdminChatId) : "");
  };

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.Radio size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg tracking-tight">
                Qo'llab-quvvatlash va Ogohlantirishlar
              </h2>
              {isDirty && (
                <Badge variant="warn" styleType="subtle" className="text-[12px]">
                  Saqlanmagan
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-fg-subtle">
              Foydalanuvchilar murojaat qiladigan yordam havolasi va admin guruhiga bildirishnomalar
            </p>
          </div>
        </div>

        {canManageSettings && isDirty && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={saveMutation.isPending}
              className="text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-1 text-xs font-semibold"
            >
              {saveMutation.isPending && (
                <Icons.Spinner size={12} className="animate-spin" />
              )}
              <span>Saqlash</span>
            </Button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Support Contact */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-fg block">
            Qo'llab-quvvatlash kontakti (Support):
          </label>
          <input
            type="text"
            disabled={!canManageSettings}
            placeholder="@donater_support yoki https://t.me/..."
            value={supportContact}
            onChange={(e) => setSupportContact(e.target.value)}
            className="w-full px-3 py-2 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg disabled:bg-surface-2 disabled:cursor-not-allowed"
          />
          <p className="text-[12px] text-fg-subtle">
            Mijozlar Telegram bot orqali "Yordam" tugmasini bosganda ushbu manzilga yo'naltiriladi.
          </p>
        </div>

        {/* Admin Chat ID */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-fg block">
            Admin Chat ID (Xabardor qilish):
          </label>
          <input
            type="number"
            disabled={!canManageSettings}
            placeholder="Masalan: -1001234567890 yoki 777967425"
            value={adminChatId}
            onChange={(e) => setAdminChatId(e.target.value)}
            className="w-full px-3 py-2 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg disabled:bg-surface-2 disabled:cursor-not-allowed"
          />
          <p className="text-[12px] text-fg-subtle">
            Yangi to'lovlar, xatoliklar va tizim ogohlantirishlari yuboriladigan Telegram chat/guruhi IDsi.
          </p>
        </div>
      </div>
    </div>
  );
}
