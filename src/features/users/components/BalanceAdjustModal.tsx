import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Icons } from "@/components/icons";
import { AnimatePresence, motion } from "motion/react";
import type { UserDetailOut } from "@/api/types";

export interface BalanceAdjustModalProps {
  user: UserDetailOut | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountUzs: number, comment: string, idempotencyKey: string) => Promise<void>;
  isLoading?: boolean;
}

const PRESET_AMOUNTS = [
  { label: "+10 000", value: 10000, type: "plus" },
  { label: "+50 000", value: 50000, type: "plus" },
  { label: "+100 000", value: 100000, type: "plus" },
  { label: "+500 000", value: 500000, type: "plus" },
  { label: "-10 000", value: -10000, type: "minus" },
  { label: "-50 000", value: -50000, type: "minus" },
];

export function BalanceAdjustModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: BalanceAdjustModalProps) {
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amountStr, setAmountStr] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  // Idempotency Key - persistent for retries, fresh on modal open
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (isOpen) {
      idempotencyKeyRef.current = crypto.randomUUID();
      setAmountStr("");
      setComment("");
      setError(null);
      setDirection("credit");
      setIsConfirming(false);
    }
  }, [isOpen]);

  const currentBalance = user ? Number(user.balance_uzs) : 0;
  const rawAmount = parseFloat(amountStr.replace(/\s+/g, "")) || 0;
  const delta = direction === "credit" ? Math.abs(rawAmount) : -Math.abs(rawAmount);
  const calculatedNewBalance = currentBalance + delta;
  const isBalanceNegative = calculatedNewBalance < 0;

  const handlePresetClick = (val: number) => {
    if (val > 0) {
      setDirection("credit");
      setAmountStr(String(val));
    } else {
      setDirection("debit");
      setAmountStr(String(Math.abs(val)));
    }
    if (error) setError(null);
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) {
      setError("Iltimos, noldan katta summa kiriting.");
      return;
    }
    if (direction === "debit" && isBalanceNegative) {
      setError("Foydalanuvchi hisobida yetarli mablag' mavjud emas (balans manfiy bo'la olmaydi).");
      return;
    }
    if (!comment.trim() || comment.trim().length < 3) {
      setError("Iltimos, tuzatish sababini batafsilroq yozing (kamida 3 ta belgi).");
      return;
    }

    setError(null);
    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    try {
      await onConfirm(delta, comment.trim(), idempotencyKeyRef.current);
      handleClose();
    } catch {
      // Upon error, keep the exact same idempotencyKeyRef for safe retries
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsConfirming(false);
    setError(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="balance-adjust-title"
      >
        {/* Backdrop Scrim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-[480px] rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-hairline pb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-surface-2 flex items-center justify-center text-fg shrink-0">
                <Icons.Wallet size="md" />
              </div>
              <div>
                <h3
                  id="balance-adjust-title"
                  className="text-sm font-semibold text-fg leading-tight"
                >
                  Balansni qo'lda tuzatish
                </h3>
                <span className="text-xs text-fg-subtle">
                  Foydalanuvchi: #{user.id} ({user.first_name || user.username || "Noma'lum"})
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-1 rounded-sm text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Yopish"
            >
              <Icons.X size="sm" />
            </button>
          </div>

          {!isConfirming ? (
            /* Step 1: Input Form */
            <form onSubmit={handleProceedToConfirm} className="space-y-4">
              {/* Direction selector: Credit (+) vs Debit (-) */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-sm bg-surface-2 border border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setDirection("credit");
                    if (error) setError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
                    direction === "credit"
                      ? "bg-status-ok text-white shadow-0"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  <Icons.Plus size="sm" />
                  <span>To'ldirish (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDirection("debit");
                    if (error) setError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
                    direction === "debit"
                      ? "bg-status-fail text-white shadow-0"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  <Icons.ArrowDown size="sm" />
                  <span>Yechish (-)</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label htmlFor="adjust-amount" className="text-xs font-semibold text-fg block">
                  Tuzatish summasi (UZS):
                </label>
                <div className="relative">
                  <input
                    id="adjust-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={amountStr}
                    onChange={(e) => {
                      setAmountStr(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Masalan: 50000"
                    required
                    className="w-full rounded-sm border border-hairline bg-canvas p-2.5 font-mono text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-fg-subtle pointer-events-none">
                    UZS
                  </span>
                </div>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetClick(preset.value)}
                    className="text-xs px-2.5 py-1 rounded-full border border-hairline bg-surface-2/60 text-fg font-mono hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Reason / Comment */}
              <div className="space-y-1.5">
                <label htmlFor="adjust-comment" className="text-xs font-semibold text-fg block">
                  Tuzatish sababi / Izoh (majburiy, min 3 belgi):
                </label>
                <textarea
                  id="adjust-comment"
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Masalan: Manual to'lov kvitansiyasi asosida yoki texnik nosozlik kompensatsiyasi..."
                  rows={2}
                  required
                  className="w-full rounded-sm border border-hairline bg-canvas p-2.5 text-xs text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
                />
              </div>

              {/* Real-time Calculation Preview Box */}
              {rawAmount > 0 && (
                <div
                  className={`p-3 rounded-xs border space-y-1.5 text-xs ${
                    isBalanceNegative
                      ? "border-status-fail/40 bg-status-fail-bg/20 text-status-fail"
                      : "border-hairline bg-canvas text-fg"
                  }`}
                >
                  <div className="flex justify-between items-center text-fg-subtle">
                    <span>Hozirgi balans:</span>
                    <Money amount={user.balance_uzs} currency="UZS" className="font-mono text-fg font-medium" />
                  </div>

                  <div className="flex justify-between items-center text-fg-subtle">
                    <span>O'zgarish miqdori:</span>
                    <span
                      className={`font-mono font-bold ${
                        direction === "credit" ? "text-status-ok" : "text-status-fail"
                      }`}
                    >
                      {direction === "credit" ? "+" : "-"}
                      {rawAmount.toLocaleString("uz-UZ")} UZS
                    </span>
                  </div>

                  <div className="border-t border-hairline pt-1.5 flex justify-between items-center font-semibold">
                    <span className="text-fg">Kutilayotgan yangi balans:</span>
                    <Money
                      amount={String(calculatedNewBalance)}
                      currency="UZS"
                      className={`font-mono text-sm font-bold ${
                        isBalanceNegative ? "text-status-fail" : "text-fg"
                      }`}
                    />
                  </div>

                  {isBalanceNegative && (
                    <p className="text-status-fail text-xs pt-1">
                      ⚠️ Xatolik: Hisobda yetarli mablag' yo'q (balans 0 dan kam bo'la olmaydi).
                    </p>
                  )}
                </div>
              )}

              {error && <p className="text-xs text-status-fail">{error}</p>}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  variant={direction === "credit" ? "primary" : "destructive"}
                  size="sm"
                  disabled={rawAmount <= 0 || (direction === "debit" && isBalanceNegative) || comment.trim().length < 3}
                >
                  Ko'rib chiqish va Tasdiqlash
                </Button>
              </div>
            </form>
          ) : (
            /* Step 2: Confirm Dialog View */
            <div className="space-y-4">
              <div className="rounded-sm border border-status-warn/40 bg-status-warn-bg/20 p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-status-warn font-semibold">
                  <Icons.AlertTriangle size="sm" />
                  <span>Moliyaviy operatsiyani tasdiqlash</span>
                </div>
                <p className="text-fg-muted leading-relaxed">
                  Ushbu amal to'g'ridan-to'g'ri foydalanuvchi hamyoniga ta'sir qiladi va audit logiga yoziladi.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-xs border border-hairline bg-canvas p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-fg-subtle">
                  <span>Foydalanuvchi:</span>
                  <span className="font-mono text-fg font-medium">#{user.id} ({user.username || user.first_name})</span>
                </div>
                <div className="flex justify-between items-center text-fg-subtle">
                  <span>Hozirgi balans:</span>
                  <Money amount={user.balance_uzs} currency="UZS" className="font-mono text-fg" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-fg-subtle">Tuzatish:</span>
                  <span
                    className={`font-mono font-bold ${
                      direction === "credit" ? "text-status-ok" : "text-status-fail"
                    }`}
                  >
                    {direction === "credit" ? "+" : "-"}
                    {rawAmount.toLocaleString("uz-UZ")} UZS
                  </span>
                </div>
                <div className="border-t border-hairline pt-2 flex justify-between items-center font-bold">
                  <span className="text-fg">Yangi balans:</span>
                  <Money
                    amount={String(calculatedNewBalance)}
                    currency="UZS"
                    className="font-mono text-sm text-fg"
                  />
                </div>
                <div className="pt-1 border-t border-hairline/60">
                  <span className="text-fg-subtle block">Izoh:</span>
                  <p className="font-medium text-fg italic mt-0.5">"{comment}"</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsConfirming(false)}
                  disabled={isLoading}
                >
                  Orqaga
                </Button>
                <Button
                  type="button"
                  variant={direction === "credit" ? "primary" : "destructive"}
                  size="sm"
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading && <Icons.Spinner size="sm" className="animate-spin" />}
                  <span>Balansni o'zgartirish</span>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
