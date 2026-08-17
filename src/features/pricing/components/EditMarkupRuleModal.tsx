import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { AnimatePresence, motion } from "motion/react";
import type { MarkupRuleOut, MarkupRuleRequest } from "@/api/types";

export interface EditMarkupRuleModalProps {
  rule: MarkupRuleOut | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: MarkupRuleRequest) => Promise<void>;
  isLoading?: boolean;
}

export function EditMarkupRuleModal({
  rule,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: EditMarkupRuleModalProps) {
  const isEditing = Boolean(rule);

  const [scope, setScope] = useState<string>("global");
  const [productKind, setProductKind] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [offerId, setOfferId] = useState<string>("");
  const [markupPct, setMarkupPct] = useState<string>("12");
  const [markupFixedUzs, setMarkupFixedUzs] = useState<string>("0");
  const [roundToUzs, setRoundToUzs] = useState<string>("100");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (rule) {
      setScope(rule.scope);
      setProductKind(rule.product_kind || "");
      setCategoryId(rule.category_id !== null ? String(rule.category_id) : "");
      setOfferId(rule.offer_id !== null ? String(rule.offer_id) : "");
      setMarkupPct(String(rule.markup_pct));
      setMarkupFixedUzs(String(rule.markup_fixed_uzs || 0));
      setRoundToUzs(String(rule.round_to_uzs || 100));
      setIsActive(rule.is_active);
      setNote(rule.note || "");
    } else {
      setScope("kind");
      setProductKind("game");
      setCategoryId("");
      setOfferId("");
      setMarkupPct("12");
      setMarkupFixedUzs("0");
      setRoundToUzs("100");
      setIsActive(true);
      setNote("");
    }
  }, [rule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      scope,
      product_kind: scope === "kind" ? productKind : null,
      category_id: scope === "category" && categoryId ? Number(categoryId) : null,
      offer_id: scope === "offer" && offerId ? Number(offerId) : null,
      markup_pct: Number(markupPct) || 0,
      markup_fixed_uzs: Number(markupFixedUzs) || 0,
      round_to_uzs: Number(roundToUzs) || 100,
      is_active: isActive,
      note: note.trim() || null,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="markup-modal-title"
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
          className="relative w-full max-w-[500px] rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
                <Icons.TrendingUp size="md" />
              </div>
              <div>
                <h3
                  id="markup-modal-title"
                  className="text-sm font-semibold text-fg leading-tight"
                >
                  {isEditing ? "Marja qoidasini tahrirlash" : "Yangi marja qoidasi qo'shish"}
                </h3>
                <span className="text-xs text-fg-subtle">
                  {isEditing ? `Qoida #${rule?.id} (${rule?.scope})` : "Narx kaskadi darajasini tanlang"}
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

          {/* Pricing Impact Warning */}
          <div className="rounded-sm border border-status-warn/40 bg-status-warn-bg/20 p-3 text-xs text-fg-muted space-y-1">
            <div className="flex items-center gap-1.5 text-status-warn font-semibold">
              <Icons.AlertTriangle size={13} />
              <span>Narx kaskadiga ta'siri:</span>
            </div>
            <p>
              Qoida saqlangach, bu barcha <strong>YANGI buyurtmalar</strong> narxi va hisob-kitoblariga darhol ta'sir qiladi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {/* Scope Selection */}
            {!isEditing && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fg block">
                  Qoida ko'lami (Scope)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "kind", label: "Mahsulot turi (Kind)" },
                    { id: "category", label: "Kategoriya" },
                    { id: "offer", label: "Alohida Offer" },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setScope(sc.id)}
                      className={`px-2.5 py-1.5 rounded-xs border text-xs font-medium text-center transition-colors cursor-pointer ${
                        scope === sc.id
                          ? "border-brand bg-brand-muted text-brand font-semibold"
                          : "border-hairline bg-canvas text-fg-muted hover:text-fg"
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scope Targets */}
            {scope === "kind" && !isEditing && (
              <div className="space-y-1.5">
                <label htmlFor="rule-kind" className="text-xs font-semibold text-fg block">
                  Mahsulot turi (Kind)
                </label>
                <select
                  id="rule-kind"
                  value={productKind}
                  onChange={(e) => setProductKind(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg"
                >
                  <option value="game">game (O'yinlar)</option>
                  <option value="gift_card">gift_card (Sovg'a kartalari)</option>
                  <option value="subscription">subscription (Obunalar)</option>
                  <option value="in_app">in_app (Ilova ichi to'lovlar)</option>
                </select>
              </div>
            )}

            {scope === "category" && !isEditing && (
              <div className="space-y-1.5">
                <label htmlFor="rule-cat-id" className="text-xs font-semibold text-fg block">
                  Kategoriya ID
                </label>
                <input
                  id="rule-cat-id"
                  type="number"
                  required
                  placeholder="Kategoriya ID raqami"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
                />
              </div>
            )}

            {scope === "offer" && !isEditing && (
              <div className="space-y-1.5">
                <label htmlFor="rule-offer-id" className="text-xs font-semibold text-fg block">
                  Taklif (Offer) ID
                </label>
                <input
                  id="rule-offer-id"
                  type="number"
                  required
                  placeholder="Offer ID raqami"
                  value={offerId}
                  onChange={(e) => setOfferId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
                />
              </div>
            )}

            {/* Markup Pct & Fixed UZS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="rule-pct" className="text-xs font-semibold text-fg block">
                  Marja foizi (% / markup_pct)
                </label>
                <div className="relative">
                  <input
                    id="rule-pct"
                    type="number"
                    min="0"
                    max="999"
                    step="0.1"
                    required
                    value={markupPct}
                    onChange={(e) => setMarkupPct(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-fg-subtle">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rule-fixed" className="text-xs font-semibold text-fg block">
                  Qo'shimcha summa (UZS)
                </label>
                <input
                  id="rule-fixed"
                  type="number"
                  min="0"
                  step="100"
                  value={markupFixedUzs}
                  onChange={(e) => setMarkupFixedUzs(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
                />
              </div>
            </div>

            {/* Round to UZS & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="rule-round" className="text-xs font-semibold text-fg block">
                  Yaxlitlash (UZS)
                </label>
                <select
                  id="rule-round"
                  value={roundToUzs}
                  onChange={(e) => setRoundToUzs(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
                >
                  <option value="1">1 UZS (Yaxlitlanmaydi)</option>
                  <option value="10">10 UZS</option>
                  <option value="50">50 UZS</option>
                  <option value="100">100 UZS (Standart)</option>
                  <option value="500">500 UZS</option>
                  <option value="1000">1 000 UZS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fg block">
                  Holat
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xs border text-xs font-medium transition-colors ${
                    isActive
                      ? "border-status-ok/40 bg-status-ok-bg/30 text-status-ok font-semibold"
                      : "border-hairline bg-surface-2 text-fg-muted"
                  }`}
                >
                  <span>{isActive ? "🟢 Faol" : "⚪ Nofaol"}</span>
                  <Icons.CheckCircle size={14} className={isActive ? "opacity-100" : "opacity-0"} />
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label htmlFor="rule-note" className="text-xs font-semibold text-fg block">
                Izoh / Sabab
              </label>
              <input
                id="rule-note"
                type="text"
                maxLength={255}
                placeholder="Qoida maqsadi yoki izohi..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg placeholder:text-fg-subtle"
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
