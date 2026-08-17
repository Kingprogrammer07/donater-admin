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

export interface PaymentInstructionsCardProps {
  initialValue?: { uz?: string; ru?: string; en?: string } | null;
}

export function PaymentInstructionsCard({ initialValue }: PaymentInstructionsCardProps) {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const [activeLang, setActiveLang] = useState<"uz" | "ru" | "en">("uz");
  const [instructions, setInstructions] = useState<{ uz: string; ru: string; en: string }>({
    uz: "",
    ru: "",
    en: "",
  });

  useEffect(() => {
    if (initialValue) {
      setInstructions({
        uz: initialValue.uz || "",
        ru: initialValue.ru || "",
        en: initialValue.en || "",
      });
    }
  }, [initialValue]);

  const isDirty =
    (initialValue?.uz || "") !== instructions.uz ||
    (initialValue?.ru || "") !== instructions.ru ||
    (initialValue?.en || "") !== instructions.en;

  const saveMutation = useMutation({
    mutationFn: async () => {
      return settingsApi.patchSettings({
        manual_payment_instructions: instructions,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["app-settings"], data);
      success("To'lov rekvizitlari muvaffaqiyatli saqlandi.");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Sozlamalarni saqlashda xatolik yuz berdi.");
      }
    },
  });

  const handleReset = () => {
    if (initialValue) {
      setInstructions({
        uz: initialValue.uz || "",
        ru: initialValue.ru || "",
        en: initialValue.en || "",
      });
    }
  };

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.CreditCard size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg tracking-tight">
                Qo'lda To'lov Rekvizitlari va Yo'riqnoma
              </h2>
              {isDirty && (
                <Badge variant="warn" styleType="subtle" className="text-[12px]">
                  Saqlanmagan
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-fg-subtle">
              Foydalanuvchilarga botda to'lov uchun ko'rsatiladigan karta raqami, karta egasi va yo'riqnoma
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
              disabled={saveMutation.isPending}
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

      {/* Language Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-xs border border-hairline">
          {(["uz", "ru", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 rounded-xs text-xs font-medium transition-colors cursor-pointer ${
                activeLang === lang
                  ? "bg-surface text-fg font-bold shadow-0"
                  : "text-fg-subtle hover:text-fg"
              }`}
            >
              {lang === "uz" ? "O'zbekcha (UZ)" : lang === "ru" ? "Ruscha (RU)" : "Inglizcha (EN)"}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <textarea
          rows={5}
          disabled={!canManageSettings}
          placeholder={
            activeLang === "uz"
              ? "💳 Karta raqami: 8600 0000 0000 0000\n👤 Karta egasi: FALONCHI PISTONCHIYEV\n🏦 Bank: Humo / Uzcard\n\n📌 To'lovni amalga oshirib, chek (skrinshot)ni yuboring."
              : "To'lov yo'riqnomasi..."
          }
          value={instructions[activeLang]}
          onChange={(e) =>
            setInstructions({ ...instructions, [activeLang]: e.target.value })
          }
          className="w-full p-3 rounded-xs border border-hairline bg-canvas text-xs text-fg leading-relaxed font-mono focus:outline-none focus:border-fg resize-y disabled:bg-surface-2 disabled:cursor-not-allowed"
        />
        <p className="text-[12px] text-fg-subtle">
          Mijoz "Qo'lda to'lov"ni tanlaganda bot ushbu matnni to'lov rekviziti sifatida yuboradi.
        </p>
      </div>
    </div>
  );
}
