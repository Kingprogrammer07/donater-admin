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

export interface MaintenanceCardProps {
  initialMode?: boolean | null;
  initialText?: { uz?: string; ru?: string; en?: string } | null;
}

export function MaintenanceCard({ initialMode, initialText }: MaintenanceCardProps) {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const [mode, setMode] = useState<boolean>(false);
  const [activeLang, setActiveLang] = useState<"uz" | "ru" | "en">("uz");
  const [text, setText] = useState<{ uz: string; ru: string; en: string }>({
    uz: "",
    ru: "",
    en: "",
  });

  useEffect(() => {
    setMode(Boolean(initialMode));
    setText({
      uz: initialText?.uz || "",
      ru: initialText?.ru || "",
      en: initialText?.en || "",
    });
  }, [initialMode, initialText]);

  const isModeDirty = Boolean(initialMode) !== mode;
  const isTextDirty =
    (initialText?.uz || "") !== text.uz ||
    (initialText?.ru || "") !== text.ru ||
    (initialText?.en || "") !== text.en;
  const isDirty = isModeDirty || isTextDirty;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const patchValues: Record<string, unknown> = {};
      if (isModeDirty) {
        patchValues.maintenance_mode = mode;
      }
      if (isTextDirty) {
        patchValues.maintenance_text = text;
      }
      return settingsApi.patchSettings(patchValues);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["app-settings"], data);
      success("Texnik tanaffus sozlamalari muvaffaqiyatli saqlandi.");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Texnik tanaffus sozlamalarini saqlashda xatolik yuz berdi.");
      }
    },
  });

  const handleReset = () => {
    setMode(Boolean(initialMode));
    setText({
      uz: initialText?.uz || "",
      ru: initialText?.ru || "",
      en: initialText?.en || "",
    });
  };

  return (
    <div
      className={`rounded-md border p-5 space-y-4 shadow-1 transition-colors ${
        mode
          ? "border-status-warn bg-status-warn-bg/20"
          : "border-hairline bg-surface"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
              mode ? "bg-status-warn/20 text-status-warn" : "bg-brand-muted text-brand"
            }`}
          >
            <Icons.AlertTriangle size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg tracking-tight">
                Texnik Tanaffus Rejimi (Maintenance Mode)
              </h2>
              {mode ? (
                <Badge variant="warn" styleType="subtle" className="text-[12px] font-bold">
                  FAOL (Xizmat to'xtatilgan)
                </Badge>
              ) : (
                <Badge variant="ok" styleType="subtle" className="text-[12px]">
                  Nofaol (Xizmat ishlamoqda)
                </Badge>
              )}
              {isDirty && (
                <Badge variant="neutral" styleType="subtle" className="text-[12px]">
                  Saqlanmagan
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-fg-subtle">
              Yoqilganda bot barcha mijozlar uchun xizmat ko'rsatishni to'xtatadi va belgilangan xabarni ko'rsatadi
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

      {/* Switch & Description */}
      <div className="flex items-center justify-between p-3 rounded-xs border border-hairline bg-surface-2/40">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-fg block">
            Texnik tanaffusni yoqish:
          </span>
          <span className="text-[12px] text-fg-subtle block">
            Foydalanuvchilar buyurtma bera olmaydi va balans to'ldira olmaydi.
          </span>
        </div>

        <button
          type="button"
          disabled={!canManageSettings}
          onClick={() => setMode(!mode)}
          className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer disabled:cursor-not-allowed ${
            mode ? "bg-status-warn justify-end" : "bg-surface-2 justify-start border border-hairline"
          }`}
        >
          <div className="size-5 rounded-full bg-surface shadow-0" />
        </button>
      </div>

      {/* Language message editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-fg">
            Tanaffus paytida foydalanuvchiga ko'rsatiladigan xabar:
          </label>
          <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-xs border border-hairline">
            {(["uz", "ru", "en"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-2.5 py-0.5 rounded-xs text-[12px] font-medium transition-colors cursor-pointer ${
                  activeLang === lang
                    ? "bg-surface text-fg font-bold shadow-0"
                    : "text-fg-subtle hover:text-fg"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          disabled={!canManageSettings}
          placeholder="Hurmatli foydalanuvchi, tizimda rejaviy texnik profilaktika ishlari olib borilmoqda. Tez orada xizmat ko'rsatish tiklanadi."
          value={text[activeLang]}
          onChange={(e) => setText({ ...text, [activeLang]: e.target.value })}
          className="w-full p-3 rounded-xs border border-hairline bg-canvas text-xs text-fg leading-relaxed focus:outline-none focus:border-fg resize-y disabled:bg-surface-2 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
