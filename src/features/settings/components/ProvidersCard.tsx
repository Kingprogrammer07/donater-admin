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

export interface ProvidersCardProps {
  initialValue?: Record<string, boolean> | null;
}

const PROVIDER_METAS = [
  {
    id: "manual",
    label: "Qo'lda to'lov (Skrinshotli)",
    desc: "Operator tomonidan to'lov cheki (skrinshot) qo'lda tasdiqlanadi",
    badge: "Asosiy",
  },
  {
    id: "payme",
    label: "Payme Merchant",
    desc: "Payme to'lov tizimi orqali avtomatik to'lovlar qabuli",
    badge: "Avtomatik",
  },
  {
    id: "click",
    label: "Click Merchant",
    desc: "Click to'lov tizimi orqali avtomatik to'lovlar qabuli",
    badge: "Avtomatik",
  },
  {
    id: "crypto",
    label: "Kriptovalyuta (USDT / Crypto)",
    desc: "Kriptovalyuta orqali to'lov qabul qilish",
    badge: "Eksperimental",
  },
];

export function ProvidersCard({ initialValue }: ProvidersCardProps) {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const [providers, setProviders] = useState<Record<string, boolean>>({
    manual: true,
    payme: false,
    click: false,
    crypto: false,
  });

  useEffect(() => {
    if (initialValue) {
      setProviders({
        manual: Boolean(initialValue.manual),
        payme: Boolean(initialValue.payme),
        click: Boolean(initialValue.click),
        crypto: Boolean(initialValue.crypto),
      });
    }
  }, [initialValue]);

  const isDirty = Object.keys(providers).some(
    (key) => Boolean(initialValue?.[key]) !== providers[key]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      return settingsApi.patchSettings({
        providers_enabled: providers,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["app-settings"], data);
      success("To'lov provayderlari holati muvaffaqiyatli saqlandi.");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Provayderlar holatini saqlashda xatolik yuz berdi.");
      }
    },
  });

  const handleReset = () => {
    if (initialValue) {
      setProviders({
        manual: Boolean(initialValue.manual),
        payme: Boolean(initialValue.payme),
        click: Boolean(initialValue.click),
        crypto: Boolean(initialValue.crypto),
      });
    }
  };

  const handleToggle = (id: string) => {
    if (!canManageSettings) return;
    setProviders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
                To'lov Provayderlari (Payment Providers)
              </h2>
              {isDirty && (
                <Badge variant="warn" styleType="subtle" className="text-[12px]">
                  Saqlanmagan
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-fg-subtle">
              Mijozlar to'lov qilishi uchun botda ko'rinadigan to'lov usullari
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

      {/* Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDER_METAS.map((p) => {
          const isEnabled = providers[p.id];
          return (
            <div
              key={p.id}
              onClick={() => handleToggle(p.id)}
              className={`p-3.5 rounded-xs border transition-all select-none ${
                canManageSettings ? "cursor-pointer" : "cursor-default"
              } ${
                isEnabled
                  ? "border-brand bg-brand-muted/30"
                  : "border-hairline bg-surface-2/30 opacity-75"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-fg">
                    {p.label}
                  </span>
                  <Badge variant="neutral" styleType="subtle" className="text-[12px]">
                    {p.badge}
                  </Badge>
                </div>

                <div
                  className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                    isEnabled ? "bg-brand justify-end" : "bg-surface-2 justify-start border border-hairline"
                  }`}
                >
                  <div className="size-4 rounded-full bg-surface shadow-0" />
                </div>
              </div>

              <p className="text-[12px] text-fg-subtle mt-1 leading-normal">
                {p.desc}
              </p>

              <div className="mt-2 pt-2 border-t border-hairline/60 flex items-center justify-between text-[12px]">
                <span className="text-fg-subtle">Holati:</span>
                <span className={`font-semibold ${isEnabled ? "text-brand" : "text-fg-subtle"}`}>
                  {isEnabled ? "Yoqilgan (Faol)" : "O'chirilgan"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
