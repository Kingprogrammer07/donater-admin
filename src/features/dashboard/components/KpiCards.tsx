import { Money } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import type { OverviewOut } from "@/api/types";

export interface KpiCardsProps {
  overview?: OverviewOut | null;
  isLoading?: boolean;
}

export function KpiCards({ overview, isLoading = false }: KpiCardsProps) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3.5 rounded-sm border border-hairline bg-surface space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>
    );
  }

  const isProfitPositive = Number(overview.profit_uzs) >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Revenue */}
      <div className="p-3.5 rounded-sm border border-hairline bg-surface space-y-1.5 shadow-0">
        <div className="flex items-center justify-between text-fg-subtle text-xs">
          <span>Jami tushum</span>
          <Icons.Dollar size="sm" className="text-fg-muted" />
        </div>
        <Money
          amount={overview.revenue_uzs}
          currency="UZS"
          className="font-mono text-base font-bold text-fg block truncate"
        />
        <span className="text-xs text-fg-subtle block">Bajarilgan buyurtmalar</span>
      </div>

      {/* 2. Profit */}
      <div className="p-3.5 rounded-sm border border-hairline bg-surface space-y-1.5 shadow-0">
        <div className="flex items-center justify-between text-fg-subtle text-xs">
          <span>Sof foyda</span>
          <Icons.TrendingUp
            size="sm"
            className={isProfitPositive ? "text-status-ok" : "text-status-fail"}
          />
        </div>
        <Money
          amount={overview.profit_uzs}
          currency="UZS"
          className={`font-mono text-base font-bold block truncate ${
            isProfitPositive ? "text-status-ok" : "text-status-fail"
          }`}
        />
        <span className="text-xs text-fg-subtle block">Marja daromadi</span>
      </div>

      {/* 3. Orders Total */}
      <div className="p-3.5 rounded-sm border border-hairline bg-surface space-y-1.5 shadow-0">
        <div className="flex items-center justify-between text-fg-subtle text-xs">
          <span>Buyurtmalar</span>
          <Icons.ShoppingCart size="sm" className="text-fg-muted" />
        </div>
        <div className="font-mono text-base font-bold text-fg truncate">
          {overview.orders_total.toLocaleString("uz-UZ")} ta
        </div>
        <span className="text-xs text-fg-subtle block">Yetkazilgan soni</span>
      </div>

      {/* 4. New Users */}
      <div className="p-3.5 rounded-sm border border-hairline bg-surface space-y-1.5 shadow-0">
        <div className="flex items-center justify-between text-fg-subtle text-xs">
          <span>Yangi mijozlar</span>
          <Icons.Users size="sm" className="text-fg-muted" />
        </div>
        <div className="font-mono text-base font-bold text-fg truncate">
          +{overview.new_users.toLocaleString("uz-UZ")}
        </div>
        <span className="text-xs text-fg-subtle block">Ro'yxatdan o'tgan</span>
      </div>

      {/* 5. Topups */}
      <div className="p-3.5 rounded-sm border border-hairline bg-surface space-y-1.5 shadow-0">
        <div className="flex items-center justify-between text-fg-subtle text-xs">
          <span>To'ldirishlar</span>
          <Icons.Wallet size="sm" className="text-fg-muted" />
        </div>
        <Money
          amount={overview.topups_uzs}
          currency="UZS"
          className="font-mono text-base font-bold text-fg block truncate"
        />
        <span className="text-xs text-fg-subtle block">Hamyon kirimi</span>
      </div>

      {/* 6. Refunds */}
      <div className="p-3.5 rounded-sm border border-hairline bg-surface space-y-1.5 shadow-0">
        <div className="flex items-center justify-between text-fg-subtle text-xs">
          <span>Qaytarilgan</span>
          <Icons.Refresh size="sm" className="text-fg-muted" />
        </div>
        <Money
          amount={overview.refunds_uzs}
          currency="UZS"
          className="font-mono text-base font-bold text-fg-muted block truncate"
        />
        <span className="text-xs text-fg-subtle block">Refund summasi</span>
      </div>
    </div>
  );
}
