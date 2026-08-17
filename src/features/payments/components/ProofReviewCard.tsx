import { useQuery } from "@tanstack/react-query";
import { paymentsApi, usersApi } from "@/api/client";
import type { ProofOut } from "@/api/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { DateTime } from "@/components/ui/datetime";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProofImage } from "./ProofImage";

interface ProofReviewCardProps {
  proof: ProofOut;
  onApprove: (proof: ProofOut) => void;
  onReject: (proof: ProofOut) => void;
  onImageZoom?: (url: string) => void;
  isActionLoading?: boolean;
}

export function ProofReviewCard({
  proof,
  onApprove,
  onReject,
  onImageZoom,
  isActionLoading = false,
}: ProofReviewCardProps) {
  const { hasPermission } = useAuth();
  const canReview = hasPermission("review_payments");

  // Fetch parent payment details
  const {
    data: payment,
    isLoading: isPaymentLoading,
    error: paymentError,
  } = useQuery({
    queryKey: ["payment", proof.payment_id],
    queryFn: () => paymentsApi.getPayment(proof.payment_id),
  });

  // Fetch user details & context
  const {
    data: userDetail,
    isLoading: isUserLoading,
  } = useQuery({
    queryKey: ["user", payment?.user_id],
    queryFn: () => usersApi.getUser(payment!.user_id),
    enabled: !!payment?.user_id,
  });

  // Fetch previous payments history for context
  const {
    data: userPayments,
    isLoading: isHistoryLoading,
  } = useQuery({
    queryKey: ["user-payments", payment?.user_id],
    queryFn: () => usersApi.getUserPayments(payment!.user_id, 4),
    enabled: !!payment?.user_id,
  });

  return (
    <div className="rounded-md border border-hairline bg-surface overflow-hidden shadow-1 select-none">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-hairline bg-surface-2 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-2 rounded-full bg-status-warn animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-fg font-mono">
            Chek #{proof.id}
          </span>
          <span className="text-fg-subtle text-xs">·</span>
          <span className="text-xs text-fg-muted font-mono truncate">
            To'lov ID: #{proof.payment_id}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="warn" styleType="subtle" className="text-xs">
            Tasdiq kutmoqda
          </Badge>
        </div>
      </div>

      {/* Main Grid: Left = Receipt Photo, Right = User & Payment Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-hairline">
        {/* Left Column: Big Receipt Image (5 cols) */}
        <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-surface-2/30">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fg">Chek fotosurati:</span>
              <span className="text-xs text-fg-subtle font-mono truncate max-w-[160px]">
                {proof.tg_file_id ? `TG: ${proof.tg_file_id.slice(0, 14)}...` : ""}
              </span>
            </div>

            <ProofImage
              paymentId={proof.payment_id}
              onZoom={onImageZoom}
              className="w-full shadow-1"
            />
          </div>

          <div className="pt-4 text-xs text-fg-subtle text-center">
            💡 Rasmni kattalashtirish uchun ustiga bosing
          </div>
        </div>

        {/* Right Column: Payment & User Context (7 cols) */}
        <div className="lg:col-span-7 p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Top Payment Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-sm bg-surface-2 border border-hairline space-y-1">
                <span className="text-xs text-fg-subtle font-medium block">
                  To'lov Summasi:
                </span>
                {isPaymentLoading ? (
                  <Skeleton className="h-6 w-28" />
                ) : payment ? (
                  <Money
                    amount={payment.amount_uzs}
                    currency="UZS"
                    className="text-lg font-bold text-fg block text-left"
                  />
                ) : (
                  <span className="text-xs text-status-fail">Topilmadi</span>
                )}
              </div>

              <div className="p-3.5 rounded-sm bg-surface-2 border border-hairline space-y-1">
                <span className="text-xs text-fg-subtle font-medium block">
                  Yuborilgan Vaqt:
                </span>
                {isPaymentLoading ? (
                  <Skeleton className="h-5 w-32" />
                ) : payment ? (
                  <DateTime value={payment.created_at} mode="both" className="text-xs font-semibold text-fg" />
                ) : (
                  <span className="text-xs text-fg-subtle">—</span>
                )}
              </div>
            </div>

            {/* User Details & Context Card */}
            <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
                  <Icons.User size="sm" className="text-fg-muted" />
                  <span>Mijoz profili va balansi</span>
                </span>
                {userDetail?.is_blocked && (
                  <Badge variant="fail" styleType="subtle" className="text-xs">
                    Bloklangan
                  </Badge>
                )}
              </div>

              {isUserLoading ? (
                <div className="space-y-2 py-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : userDetail ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-fg-subtle block">Telegram Foydalanuvchi:</span>
                    <span className="font-semibold text-fg truncate block">
                      {userDetail.username ? `@${userDetail.username}` : userDetail.first_name || "Noma'lum"}
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-subtle block">Telegram ID:</span>
                    <span className="font-mono text-fg font-medium">
                      {userDetail.tg_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-subtle block">Joriy Balans:</span>
                    <Money
                      amount={userDetail.balance_uzs}
                      currency="UZS"
                      className="font-bold text-status-ok text-left block"
                    />
                  </div>
                  <div>
                    <span className="text-fg-subtle block">Buyurtmalar:</span>
                    <span className="font-medium text-fg">{userDetail.orders_total ?? 0} ta</span>
                  </div>
                  <div>
                    <span className="text-fg-subtle block">Sarflangan:</span>
                    <Money
                      amount={userDetail.spent_uzs || "0.00"}
                      currency="UZS"
                      className="font-medium text-fg text-left block"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-fg-subtle">Foydalanuvchi ma'lumotlari mavjud emas</p>
              )}
            </div>

            {/* Previous Payments History */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-fg">
                Oldingi to'lovlar tarixi:
              </span>

              {isHistoryLoading ? (
                <Skeleton className="h-14 w-full" />
              ) : userPayments && userPayments.items.length > 0 ? (
                <div className="divide-y divide-hairline rounded-sm border border-hairline overflow-hidden bg-surface">
                  {userPayments.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 text-xs hover:bg-surface-2/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-fg-muted">#{item.id}</span>
                        <StatusBadge type="payment" status={item.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Money amount={item.amount_uzs} currency="UZS" />
                        <DateTime value={item.created_at} mode="relative" className="text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-fg-subtle italic">Oldingi to'lovlar mavjud emas (bu birinchi to'lov).</p>
              )}
            </div>
          </div>

          {/* Action Buttons with Keyboard Shortcuts */}
          <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-fg-muted">
              <Icons.Clock size="sm" />
              <span>Tezkor tugmalar:</span>
              <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-surface-2 font-mono text-xs text-fg font-semibold shadow-0">
                A
              </kbd>
              <span>Tasdiqlash</span>
              <kbd className="px-1.5 py-0.5 rounded border border-hairline bg-surface-2 font-mono text-xs text-fg font-semibold shadow-0">
                R
              </kbd>
              <span>Rad etish</span>
            </div>

            {canReview ? (
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="destructive"
                  size="md"
                  onClick={() => onReject(proof)}
                  disabled={isActionLoading || isPaymentLoading}
                  className="gap-2 flex-1 sm:flex-initial"
                >
                  <Icons.XCircle size="sm" />
                  <span>Rad etish</span>
                  <span className="text-xs opacity-75 font-mono">(R)</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onApprove(proof)}
                  disabled={isActionLoading || isPaymentLoading || !!paymentError}
                  className="gap-2 flex-1 sm:flex-initial bg-status-ok hover:bg-status-ok/90 text-white"
                >
                  <Icons.CheckCircle size="sm" />
                  <span>Tasdiqlash</span>
                  <span className="text-xs opacity-75 font-mono">(A)</span>
                </Button>
              </div>
            ) : (
              <Badge variant="neutral" styleType="subtle" className="text-xs">
                Ko'rib chiqish huquqi yo'q (Viewer)
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
