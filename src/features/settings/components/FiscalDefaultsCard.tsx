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

export interface FiscalDefaultsCardProps {
  initialSpic?: string | null;
  initialPackageCode?: string | null;
  initialVatPercent?: number | null;
}

export function FiscalDefaultsCard({
  initialSpic,
  initialPackageCode,
  initialVatPercent,
}: FiscalDefaultsCardProps) {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const [spic, setSpic] = useState<string>("");
  const [packageCode, setPackageCode] = useState<string>("");
  const [vatPercent, setVatPercent] = useState<string>("0");

  useEffect(() => {
    setSpic(initialSpic || "");
    setPackageCode(initialPackageCode || "");
    setVatPercent(
      initialVatPercent !== null && initialVatPercent !== undefined
        ? String(initialVatPercent)
        : "0"
    );
  }, [initialSpic, initialPackageCode, initialVatPercent]);

  const isSpicDirty = (initialSpic || "") !== spic.trim();
  const isPackageDirty = (initialPackageCode || "") !== packageCode.trim();
  const currentVatNumber = Number(vatPercent) || 0;
  const initialVatNumber = initialVatPercent || 0;
  const isVatDirty = initialVatNumber !== currentVatNumber;
  const isDirty = isSpicDirty || isPackageDirty || isVatDirty;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const patchValues: Record<string, unknown> = {};
      if (isSpicDirty) {
        patchValues.default_spic = spic.trim();
      }
      if (isPackageDirty) {
        patchValues.default_package_code = packageCode.trim();
      }
      if (isVatDirty) {
        patchValues.default_vat_percent = currentVatNumber;
      }
      return settingsApi.patchSettings(patchValues);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["app-settings"], data);
      success("Birlamchi fiskal parametrlar saqlandi.");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Fiskal parametrlarni saqlashda xatolik yuz berdi.");
      }
    },
  });

  const handleReset = () => {
    setSpic(initialSpic || "");
    setPackageCode(initialPackageCode || "");
    setVatPercent(
      initialVatPercent !== null && initialVatPercent !== undefined
        ? String(initialVatPercent)
        : "0"
    );
  };

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.FileText size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg tracking-tight">
                Birlamchi Fiskal Parametrlar (IKPU & QQS)
              </h2>
              {isDirty && (
                <Badge variant="warn" styleType="subtle" className="text-[12px]">
                  Saqlanmagan
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-fg-subtle">
              Katalogda alohida soliq kodi belgilanmagan tovarlar uchun ishlatiladigan birlamchi rekvizitlar
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

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* SPIC (IKPU) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-fg block">
            Birlamchi IKPU kodi (SPIC):
          </label>
          <input
            type="text"
            disabled={!canManageSettings}
            placeholder="00000000000000000"
            value={spic}
            onChange={(e) => setSpic(e.target.value)}
            className="w-full px-3 py-2 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg disabled:bg-surface-2 disabled:cursor-not-allowed"
          />
          <p className="text-[12px] text-fg-subtle">
            Yagona elektron milliy katalog kodi (17 xonali)
          </p>
        </div>

        {/* Package Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-fg block">
            Birlamchi Paket kodi:
          </label>
          <input
            type="text"
            disabled={!canManageSettings}
            placeholder="Masalan: 123456"
            value={packageCode}
            onChange={(e) => setPackageCode(e.target.value)}
            className="w-full px-3 py-2 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg disabled:bg-surface-2 disabled:cursor-not-allowed"
          />
          <p className="text-[12px] text-fg-subtle">
            Qadoq kodi (mavjud bo'lsa)
          </p>
        </div>

        {/* VAT Percent */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-fg block">
            Birlamchi QQS foizi (%):
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              disabled={!canManageSettings}
              placeholder="0"
              value={vatPercent}
              onChange={(e) => setVatPercent(e.target.value)}
              className="w-full px-3 py-2 pr-8 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg disabled:bg-surface-2 disabled:cursor-not-allowed"
            />
            <span className="absolute right-2.5 text-[12px] text-fg-subtle font-semibold pointer-events-none">
              %
            </span>
          </div>
          <p className="text-[12px] text-fg-subtle">
            O'zbekistonda standart stavka: 12% yoki 0%
          </p>
        </div>
      </div>
    </div>
  );
}
