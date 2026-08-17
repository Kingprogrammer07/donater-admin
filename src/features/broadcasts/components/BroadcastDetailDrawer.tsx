import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { broadcastApi } from "@/api/client";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DateTime } from "@/components/ui/datetime";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { BroadcastStatusBadge, broadcastStatusLabel } from "./BroadcastStatusBadge";
import { TelegramMessagePreview } from "./TelegramMessagePreview";
import { AudienceFilterSummary } from "./AudienceFilterSummary";
import type { BroadcastOut } from "@/api/types";

export interface BroadcastDetailDrawerProps {
  broadcastId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BroadcastDetailDrawer({
  broadcastId,
  isOpen,
  onClose,
}: BroadcastDetailDrawerProps) {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageBroadcast = hasPermission("broadcast");

  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Fetch Broadcast Details with Live Polling if running
  const {
    data: broadcast,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["broadcast-detail", broadcastId],
    queryFn: () => broadcastApi.get(broadcastId!),
    enabled: isOpen && Boolean(broadcastId),
    refetchInterval: (query) => {
      const data = query.state.data as BroadcastOut | undefined;
      return data?.status === "running" ? 5000 : false;
    },
  });

  //  total_count stays 0 until the server freezes the audience inside start(),
  //  so a draft cannot report its own reach. The confirm dialog is the last
  //  screen before a message goes to everyone, and it has to show a real
  //  number - ask the same endpoint the wizard asks.
  const isBeforeSend = broadcast?.status === "draft" || broadcast?.status === "scheduled";
  const { data: reachPreview, isLoading: isReachLoading } = useQuery({
    queryKey: ["audience-preview", broadcast?.audience],
    queryFn: () => broadcastApi.previewAudience(broadcast!.audience),
    //  /preview requires the broadcast permission; a viewer asking would only
    //  collect a 403.
    enabled: isOpen && Boolean(broadcast) && isBeforeSend && canManageBroadcast,
    staleTime: 30_000,
  });

  // Start Mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      return broadcastApi.start(broadcastId!);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      queryClient.invalidateQueries({ queryKey: ["broadcast-detail", broadcastId] });
      success(`Xabarnoma #${res.id} yuborish boshlandi (worker qabul qildi).`);
      setIsStartConfirmOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Xabarnomani boshlashda xatolik yuz berdi.");
      }
    },
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return broadcastApi.cancel(broadcastId!);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      queryClient.invalidateQueries({ queryKey: ["broadcast-detail", broadcastId] });
      success(`Xabarnoma #${res.id} bekor qilindi.`);
      setIsCancelConfirmOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Xabarnomani bekor qilishda xatolik yuz berdi.");
      }
    },
  });

  if (!isOpen) return null;

  const status = broadcast?.status;
  const isTerminal = status === "finished" || status === "cancelled";
  const canStart = (status === "draft" || status === "scheduled") && canManageBroadcast;
  const canCancel = (status === "draft" || status === "scheduled" || status === "running") && canManageBroadcast;

  const total = broadcast?.total_count || 0;
  const sent = broadcast?.sent_count || 0;
  const blocked = broadcast?.blocked_count || 0;
  const failed = broadcast?.failed_count || 0;
  const processed = sent + blocked + failed;
  const progressPct = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  //  Green means "everyone got it". A finished run where every message failed
  //  is still 100% processed, and painting that bar green reads as success.
  const barClass = !isTerminal
    ? "bg-brand"
    : sent === 0
      ? "bg-status-fail"
      : blocked + failed > 0
        ? "bg-status-warn"
        : "bg-status-ok";

  const reach = isBeforeSend ? reachPreview?.total : total;
  const reachLabel =
    reach === undefined
      ? isReachLoading
        ? "hisoblanmoqda..."
        : "noma'lum"
      : `${reach.toLocaleString("uz-UZ")} ta`;

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={broadcast ? `Xabarnoma #${broadcast.id}` : "Xabarnoma tafsilotlari"}
        description={
          broadcast
            ? `${broadcastStatusLabel(broadcast.status)} • ${
                isBeforeSend ? `taxminiy qamrov ${reachLabel}` : `${reachLabel} qamrov`
              }`
            : "Yuklanmoqda..."
        }
        size="lg"
        footer={
          !isTerminal && (canStart || canCancel) ? (
            <div className="flex items-center justify-between w-full gap-3">
              {canCancel ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsCancelConfirmOpen(true)}
                  disabled={cancelMutation.isPending}
                  className="gap-1.5"
                >
                  <Icons.XCircle size="sm" />
                  <span>Bekor qilish</span>
                </Button>
              ) : <div />}

              {canStart && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsStartConfirmOpen(true)}
                  disabled={startMutation.isPending}
                  className="gap-1.5"
                >
                  <Icons.Send size="sm" />
                  <span>Yuborishni boshlash</span>
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xs bg-status-fail-bg/20 border border-status-fail/40 text-status-fail text-xs">
            Xabarnoma ma'lumotlarini yuklab bo'lmadi.
          </div>
        ) : broadcast ? (
          <div className="space-y-6 p-4">
            {/* Top Status & Progress Card */}
            <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3.5 shadow-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BroadcastStatusBadge status={broadcast.status} />
                  {broadcast.status === "running" && (
                    <span className="text-xs text-brand font-medium">
                      (Har 5 soniyada yangilanmoqda)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => refetch()}
                    className="p-1.5"
                    title="Yangilash"
                  >
                    <Icons.Refresh size={12} />
                  </Button>
                </div>
              </div>

              {/* Progress, once there is a frozen audience to measure against */}
              {total > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-fg-subtle">
                      Yuborish jarayoni: {processed} / {total}
                    </span>
                    <span className="font-bold text-fg">{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-hairline/60">
                    <div
                      className={`h-full transition-all duration-500 ${barClass}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xs border border-hairline bg-surface-2/50 space-y-0.5">
                  <span className="text-fg-subtle block">
                    {isBeforeSend ? "Taxminiy qamrov:" : "Jami qamrov:"}
                  </span>
                  <span className="font-bold font-mono text-fg text-sm">{reachLabel}</span>
                </div>

                <div className="p-2.5 rounded-xs border border-status-ok/30 bg-status-ok-bg/20 space-y-0.5">
                  <span className="text-status-ok font-medium block">Yetkazildi:</span>
                  <span className="font-bold font-mono text-status-ok text-sm">
                    {sent.toLocaleString("uz-UZ")}
                  </span>
                </div>

                <div className="p-2.5 rounded-xs border border-status-warn/30 bg-status-warn-bg/20 space-y-0.5">
                  <span className="text-status-warn font-medium block">Botni bloklagan:</span>
                  <span className="font-bold font-mono text-status-warn text-sm">
                    {blocked.toLocaleString("uz-UZ")}
                  </span>
                </div>

                <div className="p-2.5 rounded-xs border border-status-fail/30 bg-status-fail-bg/20 space-y-0.5">
                  <span className="text-status-fail font-medium block">Xatolik:</span>
                  <span className="font-bold font-mono text-status-fail text-sm">
                    {failed.toLocaleString("uz-UZ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Timing Timeline */}
            <div className="p-3 rounded-xs border border-hairline bg-surface-2/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-fg-subtle block">Yaratildi:</span>
                <DateTime value={broadcast.created_at} mode="relative" className="text-fg font-medium" />
              </div>

              {broadcast.scheduled_at && (
                <div>
                  <span className="text-fg-subtle block">Rejalashtirilgan:</span>
                  <DateTime value={broadcast.scheduled_at} mode="relative" className="text-fg font-medium" />
                </div>
              )}

              {broadcast.started_at && (
                <div>
                  <span className="text-fg-subtle block">Boshlandi:</span>
                  <DateTime value={broadcast.started_at} mode="relative" className="text-fg font-medium" />
                </div>
              )}

              {broadcast.finished_at && (
                <div>
                  <span className="text-fg-subtle block">Yakunlandi:</span>
                  <DateTime value={broadcast.finished_at} mode="relative" className="text-fg font-medium" />
                </div>
              )}
            </div>

            {/* Audience Summary */}
            <AudienceFilterSummary filter={broadcast.audience} />

            {/* Message Preview */}
            <TelegramMessagePreview
              textUz={broadcast.text_uz}
              textRu={broadcast.text_ru}
              textEn={broadcast.text_en}
              buttons={broadcast.buttons}
            />
          </div>
        ) : null}
      </Drawer>

      {/* Start Broadcast Confirm Dialog */}
      <ConfirmDialog
        isOpen={isStartConfirmOpen}
        onClose={() => setIsStartConfirmOpen(false)}
        onConfirm={async () => {
          await startMutation.mutateAsync();
        }}
        title="Xabarnomani yuborishni boshlash"
        description={
          reach === 0
            ? "Bu filtr hozir hech kimga to'g'ri kelmayapti. Yuborish boshlanmaydi — avval auditoriya filtrini tekshiring."
            : `Bu ${reachLabel} foydalanuvchiga xabar yuboradi. Auditoriya aynan boshlash payti muzlatiladi, shuning uchun son shu daqiqadagi holatga qarab bir oz farq qilishi mumkin. Bu amalni orqaga qaytarib bo'lmaydi.`
        }
        confirmLabel="Yuborishni boshlash"
        variant="primary"
        isLoading={startMutation.isPending}
      />

      {/* Cancel Broadcast Confirm Dialog */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={async () => {
          await cancelMutation.mutateAsync();
        }}
        title="Xabarnomani bekor qilish"
        description={`Xabarnoma #${broadcastId} ni bekor qilishni tasdiqlaysizmi? Hali yetkazilmagan xabarlar yuborilishi to'xtatiladi.`}
        confirmLabel="Xabarnomani bekor qilish"
        variant="destructive"
        isLoading={cancelMutation.isPending}
      />
    </>
  );
}
