import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import type { TopProductOut } from "@/api/types";

export interface TopProductsCardProps {
  products?: TopProductOut[] | null;
  isLoading?: boolean;
}

export function TopProductsCard({ products, isLoading = false }: TopProductsCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 rounded-sm border border-hairline bg-surface space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const items = products || [];

  return (
    <div className="p-4 rounded-sm border border-hairline bg-surface space-y-3 shadow-0 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <Icons.Tag size="sm" className="text-fg-muted" />
          <h3 className="text-xs font-semibold text-fg">
            Eng ko'p sotilgan mahsulotlar (Top)
          </h3>
        </div>
        <span className="text-xs text-fg-subtle">
          {items.length} ta mahsulot
        </span>
      </div>

      {items.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2 bg-canvas/50 rounded-xs border border-hairline/60">
          <Icons.Package size="md" className="text-fg-subtle" />
          <h4 className="text-xs font-semibold text-fg">Sotuvlar mavjud emas</h4>
          <p className="text-xs text-fg-subtle">
            Tanlangan davrda muvaffaqiyatli buyurtmalar qayd etilmagan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((prod, idx) => {
            const isProfitable = Number(prod.profit_uzs) >= 0;
            return (
              <div
                key={prod.offer_id || idx}
                className="p-2.5 rounded-xs border border-hairline bg-surface hover:bg-surface-2/40 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-6 rounded-full bg-surface-2 text-fg-muted font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-fg block truncate">
                        {prod.name}
                      </span>
                      {prod.product_kind && (
                        <Badge variant="neutral" styleType="subtle" className="text-xs shrink-0">
                          {prod.product_kind}
                        </Badge>
                      )}
                    </div>
                    <span className="text-fg-subtle text-xs block">
                      {prod.orders} ta buyurtma ({prod.quantity} dona)
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-0.5 font-mono">
                  <Money
                    amount={prod.revenue_uzs}
                    currency="UZS"
                    className="font-bold text-fg block"
                  />
                  <span
                    className={`text-xs block ${
                      isProfitable ? "text-status-ok" : "text-status-fail"
                    }`}
                  >
                    +{Number(prod.profit_uzs).toLocaleString("uz-UZ")} UZS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
