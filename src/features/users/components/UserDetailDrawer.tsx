import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { usersApi } from "@/api/client";
import { Drawer } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { DateTime } from "@/components/ui/datetime";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { UserLedgerTab } from "./UserLedgerTab";
import { BalanceAdjustModal } from "./BalanceAdjustModal";
import { BlockUserModal } from "./BlockUserModal";

export interface UserDetailDrawerProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailDrawer({ userId, isOpen, onClose }: UserDetailDrawerProps) {
  const { success, error: toastError } = useToast();
  const { admin } = useAuth();

  const isOwnerOrAdmin = admin?.role === "owner" || admin?.role === "admin";
  const isViewer = admin?.role === "viewer";

  // Action Modals State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnblockConfirmOpen, setIsUnblockConfirmOpen] = useState(false);

  // Fetch full user details
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: isOpen && Boolean(userId),
  });

  // Balance Adjust Mutation (Non-optimistic)
  const adjustMutation = useMutation({
    mutationFn: async ({
      amountUzs,
      comment,
      idempotencyKey,
    }: {
      amountUzs: number;
      comment: string;
      idempotencyKey: string;
    }) => {
      return usersApi.adjustBalance(
        userId!,
        { amount_uzs: amountUzs, comment },
        idempotencyKey
      );
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-ledger", userId] });
      success(`Balans muvaffaqiyatli o'zgartirildi. Yangi balans: ${Number(entry.balance_after).toLocaleString("uz-UZ")} UZS`);
      setIsAdjustModalOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Balansni o'zgartirishda xatolik yuz berdi.");
      }
    },
  });

  // Block Mutation
  const blockMutation = useMutation({
    mutationFn: async (reason: string) => {
      return usersApi.blockUser(userId!, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      success("Foydalanuvchi muvaffaqiyatli bloklandi.");
      setIsBlockModalOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Foydalanuvchini bloklashda xatolik yuz berdi.");
      }
    },
  });

  // Unblock Mutation
  const unblockMutation = useMutation({
    mutationFn: async () => {
      return usersApi.unblockUser(userId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      success("Foydalanuvchi blokdan chiqarildi.");
      setIsUnblockConfirmOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Blokdan chiqarishda xatolik yuz berdi.");
      }
    },
  });

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <span>Foydalanuvchi profili</span>
            {user && (
              <span className="text-xs font-mono font-normal text-fg-subtle">
                #{user.id}
              </span>
            )}
          </div>
        }
        description={
          user
            ? `${user.first_name || user.username || "Foydalanuvchi"} (TG ID: ${user.tg_id})`
            : "Ma'lumotlar yuklanmoqda"
        }
        size="lg"
      >
        {isLoading ? (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <div className="p-6 text-center space-y-4">
            <div className="size-12 rounded-full bg-status-fail-bg flex items-center justify-center text-status-fail mx-auto">
              <Icons.AlertTriangle size="md" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-fg">Yuklashda xatolik</h3>
              <p className="text-xs text-status-fail font-mono">
                {error instanceof Error ? error.message : "Foydalanuvchi topilmadi"}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Qayta urinish
            </Button>
          </div>
        ) : user ? (
          <div className="p-6 space-y-6">
            {/* Top Status & Role Info */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-sm border border-hairline bg-surface flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-subtle font-medium">Holat:</span>
                {user.is_blocked ? (
                  <Badge variant="fail" styleType="subtle" className="text-xs">
                    ⛔ Bloklangan
                  </Badge>
                ) : (
                  <Badge variant="ok" styleType="subtle" className="text-xs">
                    🟢 Faol
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-fg-subtle">Til:</span>
                <Badge variant="neutral" styleType="subtle" className="text-xs uppercase font-mono">
                  {user.language || "uz"}
                </Badge>
              </div>
            </div>

            {/* Viewer Notice */}
            {isViewer && (
              <div className="rounded-sm border border-hairline bg-surface-2/40 p-3 text-xs text-fg-muted flex items-center gap-2">
                <Icons.Lock size="sm" className="text-fg-subtle shrink-0" />
                <span>Viewer rolidasiz. Balansni tuzatish va bloklash faqat Admin va Owner uchun ruxsat etilgan.</span>
              </div>
            )}

            {/* Financial Stats Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-sm border border-hairline bg-surface p-3 space-y-1">
                <span className="text-xs text-fg-subtle block">Mavjud balans:</span>
                <Money
                  amount={user.balance_uzs}
                  currency="UZS"
                  className="font-mono text-sm font-bold text-fg block"
                />
              </div>

              <div className="rounded-sm border border-hairline bg-surface p-3 space-y-1">
                <span className="text-xs text-fg-subtle block">Buyurtmalar soni:</span>
                <span className="font-mono text-sm font-bold text-fg block">
                  {user.orders_total || 0} ta
                </span>
              </div>

              <div className="rounded-sm border border-hairline bg-surface p-3 space-y-1">
                <span className="text-xs text-fg-subtle block">Jami xarajat:</span>
                <Money
                  amount={user.spent_uzs || "0"}
                  currency="UZS"
                  className="font-mono text-sm font-bold text-fg block"
                />
              </div>
            </div>

            {/* Profile Information Card */}
            <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3">
              <h4 className="text-xs font-semibold text-fg border-b border-hairline pb-2 flex items-center gap-2">
                <Icons.User size="sm" className="text-fg-muted" />
                <span>Profil ma'lumotlari</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-fg-subtle block">Telegram ID:</span>
                  <span className="font-mono font-medium text-fg">{user.tg_id}</span>
                </div>

                <div>
                  <span className="text-fg-subtle block">Foydalanuvchi nomi:</span>
                  <span className="font-medium text-fg">
                    {user.username ? `@${user.username}` : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-fg-subtle block">Ism:</span>
                  <span className="font-medium text-fg">{user.first_name || "—"}</span>
                </div>

                <div>
                  <span className="text-fg-subtle block">Ro'yxatdan o'tgan:</span>
                  <DateTime value={user.created_at} mode="relative" className="text-fg font-medium" />
                </div>

                {user.last_seen_at && (
                  <div className="col-span-2">
                    <span className="text-fg-subtle block">Oxirgi faollik:</span>
                    <DateTime value={user.last_seen_at} mode="absolute" className="text-fg font-medium" />
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            {isOwnerOrAdmin && (
              <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3">
                <h4 className="text-xs font-semibold text-fg">
                  Foydalanuvchi ustida amallar
                </h4>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Balance Adjust Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAdjustModalOpen(true)}
                    className="gap-1.5"
                  >
                    <Icons.Dollar size="sm" />
                    <span>Balansni tuzatish</span>
                  </Button>

                  {/* Block / Unblock Button */}
                  {user.is_blocked ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsUnblockConfirmOpen(true)}
                      className="gap-1.5 text-status-ok hover:text-status-ok"
                    >
                      <Icons.UserCheck size="sm" />
                      <span>Blokdan chiqarish</span>
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsBlockModalOpen(true)}
                      className="gap-1.5"
                    >
                      <Icons.UserX size="sm" />
                      <span>Bloklash</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Ledger Tab History */}
            <UserLedgerTab userId={user.id} />
          </div>
        ) : null}
      </Drawer>

      {/* Sub-Modals */}
      {user && (
        <>
          {/* 1. Balance Adjust Modal */}
          <BalanceAdjustModal
            user={user}
            isOpen={isAdjustModalOpen}
            onClose={() => setIsAdjustModalOpen(false)}
            onConfirm={async (amountUzs, comment, idempotencyKey) => {
              await adjustMutation.mutateAsync({ amountUzs, comment, idempotencyKey });
            }}
            isLoading={adjustMutation.isPending}
          />

          {/* 2. Block Modal */}
          <BlockUserModal
            user={user}
            isOpen={isBlockModalOpen}
            onClose={() => setIsBlockModalOpen(false)}
            onConfirm={async (reason) => {
              await blockMutation.mutateAsync(reason);
            }}
            isLoading={blockMutation.isPending}
          />

          {/* 3. Unblock Confirm Dialog */}
          <ConfirmDialog
            isOpen={isUnblockConfirmOpen}
            onClose={() => setIsUnblockConfirmOpen(false)}
            onConfirm={async () => {
              await unblockMutation.mutateAsync();
            }}
            title="Blokdan chiqarish"
            description={`Foydalanuvchi #${user.id} (${user.username || user.first_name}) ni blokdan chiqarishni tasdiqlaysizmi? U qaytadan botdan to'liq foydalana oladi.`}
            confirmLabel="Blokdan chiqarish"
            variant="primary"
            isLoading={unblockMutation.isPending}
          />
        </>
      )}
    </>
  );
}
