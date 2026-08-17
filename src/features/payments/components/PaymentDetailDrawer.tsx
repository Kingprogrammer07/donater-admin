import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/client";
import type { PaymentOut } from "@/api/types";
import { Drawer } from "@/components/ui/drawer";
import { Money } from "@/components/ui/money";
import { DateTime } from "@/components/ui/datetime";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProofImage } from "./ProofImage";

interface PaymentDetailDrawerProps {
  payment: PaymentOut | null;
  isOpen: boolean;
  onClose: () => void;
  onImageZoom?: (url: string) => void;
}

export function PaymentDetailDrawer({
  payment,
  isOpen,
  onClose,
  onImageZoom,
}: PaymentDetailDrawerProps) {
  // Fetch user details for context
  const { data: userDetail, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", payment?.user_id],
    queryFn: () => usersApi.getUser(payment!.user_id),
    enabled: isOpen && !!payment?.user_id,
  });

  if (!payment) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`To'lov #${payment.id}`}
      description={`Public ID: ${payment.public_id}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Top Summary Card */}
        <div className="p-4 rounded-sm bg-surface-2 border border-hairline space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-fg-subtle font-medium">To'lov holati:</span>
            <StatusBadge type="payment" status={payment.status} size="md" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-fg-subtle font-medium">Summa:</span>
            <Money
              amount={payment.amount_uzs}
              currency="UZS"
              className="text-xl font-bold text-fg block text-right"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-fg-subtle font-medium">Provayder:</span>
            <Badge variant="neutral" styleType="subtle" className="text-xs font-mono capitalize">
              {payment.provider}
            </Badge>
          </div>
        </div>

        {/* User Context */}
        <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3">
          <h4 className="text-xs font-semibold text-fg border-b border-hairline pb-2">
            Mijoz haqida
          </h4>

          {isUserLoading ? (
            <div className="space-y-2 py-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : userDetail ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-fg-subtle">Telegram ID:</span>
                <span className="font-mono text-fg font-medium">
                  {userDetail.tg_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-subtle">Foydalanuvchi:</span>
                <span className="text-fg font-medium">
                  {userDetail.username ? `@${userDetail.username}` : userDetail.first_name || "Noma'lum"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-subtle">Joriy hisob balansi:</span>
                <Money
                  amount={userDetail.balance_uzs}
                  currency="UZS"
                  className="font-bold text-status-ok block text-right"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-fg-subtle">Jami buyurtmalari:</span>
                <span className="text-fg font-medium">{userDetail.orders_total ?? 0} ta</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between text-xs">
              <span className="text-fg-subtle">Foydalanuvchi ID:</span>
              <span className="font-mono text-fg">{payment.user_id}</span>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="rounded-sm border border-hairline bg-surface p-4 space-y-2 text-xs">
          <h4 className="text-xs font-semibold text-fg border-b border-hairline pb-2">
            Vaqt yozuvlari
          </h4>
          <div className="flex justify-between">
            <span className="text-fg-subtle">Yaratilgan:</span>
            <DateTime value={payment.created_at} mode="both" className="text-fg font-medium text-xs" />
          </div>
          {payment.credited_at && (
            <div className="flex justify-between">
              <span className="text-fg-subtle">Hisobga o'tkazilgan:</span>
              <DateTime value={payment.credited_at} mode="both" className="text-status-ok font-medium text-xs" />
            </div>
          )}
        </div>

        {/* Receipt Photo if Manual Provider */}
        {payment.provider === "manual" && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-fg">Chek fotosurati</h4>
            <ProofImage paymentId={payment.id} onZoom={onImageZoom} />
          </div>
        )}
      </div>
    </Drawer>
  );
}
