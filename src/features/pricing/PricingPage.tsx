import { FxRateCard } from "./components/FxRateCard";
import { PriceCalculatorPreview } from "./components/PriceCalculatorPreview";
import { MarkupCascadeList } from "./components/MarkupCascadeList";

export default function PricingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-fg tracking-tight">
          Marja va Valyuta kursi boshqaruvi
        </h1>
        <p className="text-xs text-fg-subtle mt-0.5">
          Valyuta kursi (USD / UZS), dinamik narx kaskadi qoidalari va real vaqtli narx kalkulyatori
        </p>
      </div>

      {/* Top Grid: FX Rate & Price Preview Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FxRateCard />
        <PriceCalculatorPreview />
      </div>

      {/* Bottom Section: Markup Cascade Rules */}
      <MarkupCascadeList />
    </div>
  );
}
