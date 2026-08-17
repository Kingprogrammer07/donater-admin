import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pricingApi, catalogApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";

export function PriceCalculatorPreview() {
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Fetch offers for dropdown
  const { data: offersPage } = useQuery({
    queryKey: ["offers-calculator-list"],
    queryFn: () => catalogApi.listOffers({ limit: 50 }),
  });
  const offers = offersPage?.items || [];
  const activeOfferId = selectedOfferId ?? (offers[0]?.id || 2);

  // Fetch Preview Quote
  const {
    data: quote,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["markup-preview", activeOfferId, quantity],
    queryFn: () =>
      pricingApi.preview({
        offer_id: activeOfferId,
        quantity: Math.max(1, quantity),
      }),
    enabled: Boolean(activeOfferId),
  });

  return (
    <div className="rounded-sm border border-hairline bg-surface p-4 space-y-4 shadow-0 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <Icons.Dollar size="sm" className="text-fg-muted" />
          <h3 className="text-sm font-semibold text-fg">
            Narx kalkulyatori (Quote Preview)
          </h3>
        </div>
        <Badge variant="brand" styleType="subtle" className="text-xs font-mono">
          Kaskad simulyatsiyasi
        </Badge>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="calc-offer" className="text-xs font-semibold text-fg block">
            Mahsulot taklifi (Offer)
          </label>
          <select
            id="calc-offer"
            value={activeOfferId}
            onChange={(e) => setSelectedOfferId(Number(e.target.value))}
            className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg"
          >
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.id} — {o.name} (${Number(o.price_usd).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="calc-qty" className="text-xs font-semibold text-fg block">
            Miqdor (Quantity)
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="calc-qty"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              className="shrink-0 p-2"
              title="Qayta hisoblash"
            >
              <Icons.Refresh size="sm" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calculation Breakdown Cards */}
      {isLoading ? (
        <div className="space-y-2 py-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <div className="p-3 bg-status-fail-bg/20 border border-status-fail/30 rounded-xs text-xs text-status-fail flex items-center gap-2">
          <Icons.AlertTriangle size="sm" />
          <span>Narxni hisoblashda xatolik: {error instanceof Error ? error.message : "Offer topilmadi"}</span>
        </div>
      ) : quote ? (
        <div className="space-y-3 pt-1">
          {/* Formula Chips */}
          <div className="p-3 rounded-xs border border-hairline bg-surface-2/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <span className="text-fg-subtle block">Tannarx (USD):</span>
              <span className="font-mono font-bold text-fg">
                ${Number(quote.cost_usd).toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-fg-subtle block">FX kursi:</span>
              <span className="font-mono font-bold text-fg">
                {Number(quote.fx_rate).toLocaleString("uz-UZ")} UZS
              </span>
            </div>

            <div>
              <span className="text-fg-subtle block">Qo'llangan qoida:</span>
              <span className="font-mono font-bold text-brand">
                {quote.markup_rule_id ? `#${quote.markup_rule_id} (+${quote.markup_pct}%)` : `+${quote.markup_pct}%`}
              </span>
            </div>

            <div>
              <span className="text-fg-subtle block">Yaxlitlash:</span>
              <span className="font-mono font-bold text-fg">
                {quote.round_to_uzs} UZS
              </span>
            </div>
          </div>

          {/* Final Result Card */}
          <div className="p-3.5 rounded-xs border border-brand/30 bg-brand-muted/40 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-fg-subtle font-medium block">
                Mijozga ko'rinadigan yakuniy narx:
              </span>
              <Money
                amount={quote.price_uzs}
                currency="UZS"
                className="font-mono text-lg font-bold text-fg block"
              />
            </div>

            <div className="text-right">
              <span className="text-xs text-status-ok font-medium block">
                Kutilayotgan sof foyda:
              </span>
              <Money
                amount={quote.profit_uzs}
                currency="UZS"
                className="font-mono text-base font-bold text-status-ok block"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
