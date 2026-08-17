import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { AnimatePresence, motion } from "motion/react";
import type { OfferOut, OfferPatch } from "@/api/types";

export interface EditOfferModalProps {
  offer: OfferOut | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: OfferPatch) => Promise<void>;
  isLoading?: boolean;
}

export function EditOfferModal({
  offer,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: EditOfferModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [spic, setSpic] = useState("");
  const [packageCode, setPackageCode] = useState("");
  const [vatPercent, setVatPercent] = useState<string>("0");

  useEffect(() => {
    if (offer) {
      setIsVisible(offer.is_visible);
      setSpic(offer.spic || "");
      setPackageCode(offer.package_code || "");
      setVatPercent(offer.vat_percent !== null ? String(offer.vat_percent) : "0");
    }
  }, [offer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      is_visible: isVisible,
      spic: spic.trim() || null,
      package_code: packageCode.trim() || null,
      vat_percent: vatPercent ? Number(vatPercent) : null,
    });
  };

  if (!isOpen || !offer) return null;

  const isFiscalMissing = !spic.trim() || !packageCode.trim();

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-offer-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-[480px] rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
                <Icons.Tag size="md" />
              </div>
              <div>
                <h3
                  id="edit-offer-title"
                  className="text-sm font-semibold text-fg leading-tight"
                >
                  Taklifni tahrirlash (Offer)
                </h3>
                <span className="text-xs text-fg-subtle">
                  #{offer.id} — {offer.name} (${offer.price_usd})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-fg-subtle hover:text-fg p-1 rounded-xs transition-colors"
            >
              <Icons.X size="sm" />
            </button>
          </div>

          {/* Fiscal Missing Notice */}
          {isFiscalMissing && (
            <div className="rounded-sm border border-status-warn/40 bg-status-warn-bg/20 p-3 text-xs text-fg-muted space-y-1">
              <div className="flex items-center gap-1.5 text-status-warn font-semibold">
                <Icons.AlertTriangle size={13} />
                <span>Fiskal parametrlar to'liq emas</span>
              </div>
              <p>
                IKPU (spic) yoki paket kodi (package_code) kiritilmasa, ushbu taklif bo'yicha chek yuborilmaydi.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Visibility toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-fg block">
                Mijozlarga ko'rinishi
              </label>
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xs border text-xs font-medium transition-colors ${
                  isVisible
                    ? "border-status-ok/40 bg-status-ok-bg/30 text-status-ok font-semibold"
                    : "border-hairline bg-surface-2 text-fg-muted"
                }`}
              >
                <span>{isVisible ? "🟢 Faol (Ko'rinadi)" : "👁️‍🗨️ Yashirin"}</span>
                <Icons.CheckCircle size={14} className={isVisible ? "opacity-100" : "opacity-0"} />
              </button>
            </div>

            {/* IKPU (spic) */}
            <div className="space-y-1.5">
              <label htmlFor="offer-spic" className="text-xs font-semibold text-fg block">
                IKPU kodi (SPIC / 17 ta belgi)
              </label>
              <input
                id="offer-spic"
                type="text"
                maxLength={17}
                placeholder="Masalan: 06209001001000000"
                value={spic}
                onChange={(e) => setSpic(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg placeholder:text-fg-subtle"
              />
            </div>

            {/* Package Code */}
            <div className="space-y-1.5">
              <label htmlFor="offer-package" className="text-xs font-semibold text-fg block">
                Paket kodi (Package code)
              </label>
              <input
                id="offer-package"
                type="text"
                maxLength={20}
                placeholder="Masalan: 1475142"
                value={packageCode}
                onChange={(e) => setPackageCode(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg placeholder:text-fg-subtle"
              />
            </div>

            {/* VAT Percent */}
            <div className="space-y-1.5">
              <label htmlFor="offer-vat" className="text-xs font-semibold text-fg block">
                QQS foizi (VAT %)
              </label>
              <input
                id="offer-vat"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Masalan: 0 yoki 12"
                value={vatPercent}
                onChange={(e) => setVatPercent(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg placeholder:text-fg-subtle"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-hairline">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading && <Icons.Spinner size="sm" className="animate-spin" />}
                <span>Saqlash</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
