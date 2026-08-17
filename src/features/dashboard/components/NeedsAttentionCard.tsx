import { Link } from "react-router";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { FazerCardsStatusOut } from "@/api/types";

export interface NeedsAttentionCardProps {
  pendingProofs: number;
  failedOrders: number;
  fazerCards?: FazerCardsStatusOut | null;
  isLoading?: boolean;
}

export function NeedsAttentionCard({
  pendingProofs,
  failedOrders,
  fazerCards,
  isLoading = false,
}: NeedsAttentionCardProps) {
  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  const hasPendingProofs = pendingProofs > 0;
  const hasFailedOrders = failedOrders > 0;
  const hasFazerCardsAlert = Boolean(fazerCards && (!fazerCards.reachable || fazerCards.low_balance));

  const totalAlerts = (hasPendingProofs ? 1 : 0) + (hasFailedOrders ? 1 : 0) + (hasFazerCardsAlert ? 1 : 0);

  if (totalAlerts === 0) {
    return (
      <div className="rounded-sm border border-status-ok/30 bg-status-ok-bg/15 p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-status-ok/20 flex items-center justify-center text-status-ok shrink-0">
            <Icons.CheckCircle size="sm" />
          </div>
          <div>
            <span className="font-semibold text-fg block">
              Tizim bir maromda ishlamoqda
            </span>
            <span className="text-fg-subtle">
              Kutayotgan to'lovlar yoki fail bo'lgan buyurtmalar yo'q
            </span>
          </div>
        </div>
        <Badge variant="ok" styleType="subtle" className="text-xs">
          Normal holat
        </Badge>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-status-warn/40 bg-status-warn-bg/20 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-status-warn/20 pb-2">
        <div className="flex items-center gap-2 text-status-warn font-semibold text-xs">
          <Icons.AlertTriangle size="sm" />
          <span>Diqqat talab qiladi ({totalAlerts} ta masala)</span>
        </div>
        <span className="text-xs text-fg-subtle">Zudlik bilan ko'rib chiqish tavsiya etiladi</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Pending Proofs Alert */}
        {hasPendingProofs && (
          <div className="rounded-xs border border-status-warn/30 bg-surface p-3 flex items-center justify-between gap-2 shadow-0">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-fg block">
                {pendingProofs} ta chek tasdiqlashda
              </span>
              <span className="text-xs text-fg-subtle block">
                Manual to'lov kvitansiyalari
              </span>
            </div>
            <Link
              to="/payments?status=pending_check"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 shrink-0 p-1.5 rounded-xs hover:bg-surface-2 transition-colors"
            >
              <span>Tekshirish</span>
              <Icons.ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Failed Orders Alert */}
        {hasFailedOrders && (
          <div className="rounded-xs border border-status-fail/30 bg-surface p-3 flex items-center justify-between gap-2 shadow-0">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-status-fail block">
                {failedOrders} ta buyurtmada xatolik
              </span>
              <span className="text-xs text-fg-subtle block">
                Qayta yuborish yoki refund talab etiladi
              </span>
            </div>
            <Link
              to="/orders?status=failed"
              className="text-xs font-semibold text-status-fail hover:underline flex items-center gap-1 shrink-0 p-1.5 rounded-xs hover:bg-surface-2 transition-colors"
            >
              <span>Ko'rish</span>
              <Icons.ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* FazerCards Alert */}
        {hasFazerCardsAlert && (
          <div className="rounded-xs border border-status-warn/30 bg-surface p-3 flex items-center justify-between gap-2 shadow-0">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-fg block">
                {!fazerCards?.reachable ? "FazerCards aloqa yo'q" : "FazerCards past balans"}
              </span>
              <span className="text-xs text-fg-subtle block font-mono">
                {fazerCards?.balance_usd ? `$${Number(fazerCards.balance_usd).toFixed(2)}` : "Ulanib bo'lmadi"}
              </span>
            </div>
            <Link
              to="/settings"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 shrink-0 p-1.5 rounded-xs hover:bg-surface-2 transition-colors"
            >
              <span>Sozlamalar</span>
              <Icons.ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
