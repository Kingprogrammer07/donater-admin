import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentInstructionsCard } from "./components/PaymentInstructionsCard";
import { ProvidersCard } from "./components/ProvidersCard";
import { SupportAlertsCard } from "./components/SupportAlertsCard";
import { TopupLimitsCard } from "./components/TopupLimitsCard";
import { MaintenanceCard } from "./components/MaintenanceCard";
import { FiscalDefaultsCard } from "./components/FiscalDefaultsCard";

export default function SettingsPage() {
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const {
    data: settings,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => settingsApi.getSettings(),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">
            Tizim Sozlamalari (System Settings)
          </h1>
          <p className="text-xs text-fg-subtle mt-0.5">
            To'lov rekvizitlari, provayderlar faolligi, qo'llab-quvvatlash havolalari va tizim limitlari
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs"
          >
            <Icons.Refresh size={12} className={isFetching ? "animate-spin" : ""} />
            <span>Yangilash</span>
          </Button>
        </div>
      </div>

      {/* Permission Notice if Viewer */}
      {!canManageSettings && (
        <div className="p-3.5 rounded-xs border border-status-warn/40 bg-status-warn-bg/20 text-status-warn text-xs flex items-center gap-2.5">
          <Icons.Shield size={16} className="shrink-0" />
          <span>
            Sizda sozlamalarni o'zgartirish ruxsati (<strong>manage_settings</strong>) yo'q. Barcha parametrlar faqat o'qish (read-only) rejimida ko'rsatilmoqda.
          </span>
        </div>
      )}

      {/* Audit Log Reminder */}
      <div className="p-3 rounded-xs border border-hairline bg-surface-2/40 text-[12px] text-fg-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Clock size={13} className="text-fg-muted" />
          <span>
            Sozlamalarga kiritilgan har bir o'zgarish operator identifikatori bilan birga audit jurnalida qayd etiladi.
          </span>
        </div>
      </div>

      {/* Loading / Error States */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xs border border-status-fail/40 bg-status-fail-bg/20 text-status-fail text-xs flex items-center justify-between">
          <span>Sozlamalarni serverdan yuklab bo'lmadi.</span>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-xs">
            Qayta urinish
          </Button>
        </div>
      ) : settings ? (
        <div className="space-y-6">
          {/* 1. Payment Instructions */}
          <PaymentInstructionsCard
            initialValue={
              settings.manual_payment_instructions as
                | { uz?: string; ru?: string; en?: string }
                | null
            }
          />

          {/* 2. Payment Providers */}
          <ProvidersCard
            initialValue={settings.providers_enabled as Record<string, boolean> | null}
          />

          {/* 3. Support Contact & Admin Chat ID */}
          <SupportAlertsCard
            initialSupportContact={settings.support_contact as string | null}
            initialAdminChatId={
              settings.admin_chat_id as number | string | null
            }
          />

          {/* 4. Topup Limits & FazerCards Low Balance */}
          <TopupLimitsCard
            initialMinTopup={settings.min_topup_uzs as string | null}
            initialMaxTopup={settings.max_topup_uzs as string | null}
            initialFazerLowBalance={
              settings.fazercards_low_balance_usd as string | null
            }
          />

          {/* 5. Maintenance Mode */}
          <MaintenanceCard
            initialMode={settings.maintenance_mode as boolean | null}
            initialText={
              settings.maintenance_text as
                | { uz?: string; ru?: string; en?: string }
                | null
            }
          />

          {/* 6. Fiscal Defaults (SPIC & VAT) */}
          <FiscalDefaultsCard
            initialSpic={settings.default_spic as string | null}
            initialPackageCode={settings.default_package_code as string | null}
            initialVatPercent={settings.default_vat_percent as number | null}
          />
        </div>
      ) : null}
    </div>
  );
}
