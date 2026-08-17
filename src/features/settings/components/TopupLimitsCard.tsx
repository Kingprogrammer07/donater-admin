import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { settingsApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";

//  Money leaves this form as a string, so it is checked as one: an amount that
//  is not a number is stored happily by nobody and then raises inside the bot,
//  for every user trying to top up. The server refuses it too - this is just
//  the half that tells the operator before they press save.
const AMOUNT = /^\d+(\.\d{1,4})?$/;

function amountError(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label}: qiymat bo'sh.`;
  if (!AMOUNT.test(trimmed)) return `${label}: faqat raqam, masalan 2000.00`;
  return null;
}

export interface TopupLimitsCardProps {
  initialMinTopup?: string | null;
  initialMaxTopup?: string | null;
  initialFazerLowBalance?: string | null;
}

export function TopupLimitsCard({
  initialMinTopup,
  initialMaxTopup,
  initialFazerLowBalance,
}: TopupLimitsCardProps) {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const [minTopup, setMinTopup] = useState<string>("");
  const [maxTopup, setMaxTopup] = useState<string>("");
  const [fazerLowBalance, setFazerLowBalance] = useState<string>("");

  useEffect(() => {
    setMinTopup(initialMinTopup || "2000.00");
    setMaxTopup(initialMaxTopup || "10000000.00");
    setFazerLowBalance(initialFazerLowBalance || "50.0000");
  }, [initialMinTopup, initialMaxTopup, initialFazerLowBalance]);

  const isMinDirty = (initialMinTopup || "") !== minTopup.trim();
  const isMaxDirty = (initialMaxTopup || "") !== maxTopup.trim();
  const isFazerDirty = (initialFazerLowBalance || "") !== fazerLowBalance.trim();
  const isDirty = isMinDirty || isMaxDirty || isFazerDirty;

  const minError = amountError(minTopup, "Minimal summa");
  const maxError = amountError(maxTopup, "Maksimal summa");
  const fazerError = amountError(fazerLowBalance, "Kam qoldiq chegarasi");
  const rangeError =
    !minError && !maxError && Number(minTopup.trim()) > Number(maxTopup.trim())
      ? "Minimal summa maksimal summadan katta bo'lishi mumkin emas."
      : null;
  const hasError = Boolean(minError || maxError || fazerError || rangeError);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const patchValues: Record<string, unknown> = {};
      if (isMinDirty) {
        patchValues.min_topup_uzs = minTopup.trim();
      }
      if (isMaxDirty) {
        patchValues.max_topup_uzs = maxTopup.trim();
      }
      if (isFazerDirty) {
        patchValues.fazercards_low_balance_usd = fazerLowBalance.trim();
      }
      return settingsApi.patchSettings(patchValues);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["app-settings"], data);
      success("To'ldirish limitlari va chegaralar saqlandi.");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else if (err instanceof Error) {
        toastError(err.message);
      } else {
        toastError("Limitlarni saqlashda xatolik yuz berdi.");
      }
    },
  });

  const handleReset = () => {
    setMinTopup(initialMinTopup || "2000.00");
    setMaxTopup(initialMaxTopup || "10000000.00");
    setFazerLowBalance(initialFazerLowBalance || "50.0000");
  };

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.Dollar size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg tracking-tight">
                To'ldirish Limitlari va Provayder Chegaralari
              </h2>
              {isDirty && (
                <Badge variant="warn" styleType="subtle" className="text-[12px]">
                  Saqlanmagan
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-fg-subtle">
              Foydalanuvchi hisobini to'ldirish summasi diapazoni va FazerCards past balans ogohlantirish chegarasi
            </p>
          </div>
        </div>

        {canManageSettings && isDirty && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={saveMutation.isPending}
              className="text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || hasError}
              className="gap-1 text-xs font-semibold"
            >
              {saveMutation.isPending && (
                <Icons.Spinner size={12} className="animate-spin" />
              )}
              <span>Saqlash</span>
            </Button>
          </div>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Min Topup */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-fg block">
            Minimal to'ldirish summasi (UZS):
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              disabled={!canManageSettings}
              placeholder="2000.00"
              value={minTopup}
              onChange={(e) => setMinTopup(e.target.value)}
              className="w-full px-3 py-2 pr-12 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg disabled:bg-surface-2 disabled:cursor-not-allowed"
            />
            <span className="absolute right-2.5 text-[12px] text-fg-subtle font-semibold pointer-events-none">
              UZS
            </span>
          </div>
          <p className={`text-[12px] ${minError ? "text-status-fail" : "text-fg-subtle"}`}>
            {minError ?? "Bitta to'lovdagi eng kam summa"}
          </p>
        </div>

        {/* Max Topup */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-fg block">
            Maksimal to'ldirish summasi (UZS):
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              disabled={!canManageSettings}
              placeholder="10000000.00"
              value={maxTopup}
              onChange={(e) => setMaxTopup(e.target.value)}
              className="w-full px-3 py-2 pr-12 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg disabled:bg-surface-2 disabled:cursor-not-allowed"
            />
            <span className="absolute right-2.5 text-[12px] text-fg-subtle font-semibold pointer-events-none">
              UZS
            </span>
          </div>
          <p
            className={`text-[12px] ${maxError || rangeError ? "text-status-fail" : "text-fg-subtle"}`}
          >
            {maxError ?? rangeError ?? "Bitta to'lovdagi eng ko'p summa"}
          </p>
        </div>

        {/* FazerCards Low Balance Threshold */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-fg block">
            FazerCards Kam Qoldiq Chegarasi (USD):
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              disabled={!canManageSettings}
              placeholder="50.0000"
              value={fazerLowBalance}
              onChange={(e) => setFazerLowBalance(e.target.value)}
              className="w-full px-3 py-2 pr-12 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg disabled:bg-surface-2 disabled:cursor-not-allowed"
            />
            <span className="absolute right-2.5 text-[12px] text-fg-subtle font-semibold pointer-events-none">
              USD
            </span>
          </div>
          <p className={`text-[12px] ${fazerError ? "text-status-fail" : "text-fg-subtle"}`}>
            {fazerError ?? "Balans shu miqdordan kamaysa ogohlantirish beriladi"}
          </p>
        </div>
      </div>
    </div>
  );
}
