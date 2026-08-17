import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import type { OrderDetailOut } from "@/api/types";

export interface PriceBreakdownProps {
  order: OrderDetailOut;
}

export function PriceBreakdown({ order }: PriceBreakdownProps) {
  const costUsd = Number(order.cost_usd) || 0;
  const fxRate = Number(order.fx_rate) || 0;
  const costUzs = (costUsd * fxRate).toFixed(2);
  const isProfitable = Number(order.profit_uzs) >= 0;

  return (
    <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3.5">
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <Icons.Dollar size="sm" className="text-fg-muted" />
          <h4 className="text-xs font-semibold text-fg">
            Narx shakllanishi va tahlili
          </h4>
        </div>
        <Badge
          variant={isProfitable ? "ok" : "fail"}
          styleType="subtle"
          className="text-xs"
        >
          {isProfitable ? "Foydali" : "Zararli"}
        </Badge>
      </div>

      {/* Calculation Chain Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="rounded-xs border border-hairline bg-surface-2/40 p-2.5 space-y-1">
          <span className="text-fg-subtle text-xs block">Tannarx (USD):</span>
          <span className="font-mono text-sm font-semibold text-fg block">
            ${Number(order.cost_usd).toFixed(4)}
          </span>
          <span className="text-fg-subtle text-xs block">Provayder narxi</span>
        </div>

        <div className="rounded-xs border border-hairline bg-surface-2/40 p-2.5 space-y-1">
          <span className="text-fg-subtle text-xs block">FX Valyuta kursi:</span>
          <span className="font-mono text-sm font-semibold text-fg block">
            {Number(order.fx_rate).toLocaleString("uz-UZ", { maximumFractionDigits: 2 })}
          </span>
          <span className="text-fg-subtle text-xs block">UZS / USD</span>
        </div>

        <div className="rounded-xs border border-hairline bg-surface-2/40 p-2.5 space-y-1">
          <span className="text-fg-subtle text-xs block">Ustama (Marja):</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-semibold text-status-ok">
              +{Number(order.markup_pct).toFixed(2)}%
            </span>
          </div>
          <span className="text-fg-subtle text-xs block truncate">
            {order.markup_rule_id ? `Qoida #${order.markup_rule_id}` : "Global qoida"}
          </span>
        </div>
      </div>

      {/* Step Calculation Flow Box */}
      <div className="p-3 rounded-xs bg-canvas border border-hairline space-y-2 text-xs">
        <div className="flex justify-between items-center text-fg-subtle">
          <span>Provayder tannarxi so'mda (xarajat):</span>
          <Money amount={costUzs} currency="UZS" className="font-mono text-fg" />
        </div>
        <div className="flex justify-between items-center text-fg-subtle">
          <span>Qo'llangan ustama miqdori:</span>
          <span className="font-mono text-status-ok font-medium">
            +{Number(order.markup_pct).toFixed(2)}%
          </span>
        </div>
        <div className="border-t border-hairline pt-2 flex justify-between items-center font-medium">
          <span className="text-fg">Mijoz to'lagan yakuniy narx:</span>
          <Money
            amount={order.price_uzs}
            currency="UZS"
            className="text-sm font-bold text-fg block"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-fg-muted font-medium">Sof daromad (Foyda):</span>
          <Money
            amount={order.profit_uzs}
            currency="UZS"
            className={`text-sm font-bold block ${
              isProfitable ? "text-status-ok" : "text-status-fail"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
