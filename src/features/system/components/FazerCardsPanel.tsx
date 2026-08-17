import { useQuery } from "@tanstack/react-query";
import { systemApi } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

export function FazerCardsPanel() {
  const { data: status, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["system-fazercards"],
    queryFn: () => systemApi.getFazerCards(),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? false : 15000,
  });

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.Layers size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-fg tracking-tight">
              FazerCards Provayder Balansi va Holati
            </h2>
            <p className="text-[12px] text-fg-subtle">
              Tashqi tovarlar yetkazib beruvchi reseller hisob-kitobi
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 text-xs"
          title="Yangilash"
        >
          <Icons.Refresh size={12} className={isFetching ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xs border border-status-fail/40 bg-status-fail-bg/20 text-status-fail text-xs">
          FazerCards holatini olishda server xatosi.
        </div>
      ) : status ? (
        <div className="space-y-3.5">
          {/* Reachability & Balance Status */}
          {status.reachable ? (
            <div className="p-4 rounded-xs border border-hairline bg-surface-2/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-fg-subtle">Provayder hisobidagi qoldiq:</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="ok" styleType="subtle" className="text-[12px] gap-1">
                    <span className="size-1.5 rounded-full bg-status-ok" />
                    <span>Ulangan</span>
                  </Badge>
                  {status.low_balance && (
                    <Badge variant="fail" styleType="subtle" className="text-[12px] gap-1 font-bold">
                      <Icons.AlertTriangle size={11} />
                      <span>Kritik kam qoldiq</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Large Balance Display */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-fg">
                  ${Number(status.balance_usd || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs text-fg-subtle font-mono">
                  {status.currency || "USD"}
                </span>
              </div>

              {/* Account Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-hairline/60 text-xs">
                <div>
                  <span className="text-[12px] text-fg-subtle block">Login:</span>
                  <span className="font-mono font-semibold text-fg">
                    {status.login || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[12px] text-fg-subtle block">Ta'rif (Plan):</span>
                  <span className="font-medium text-fg uppercase">
                    {status.plan || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[12px] text-fg-subtle block">Obuna holati:</span>
                  <span
                    className={`font-semibold ${
                      status.subscription_active ? "text-status-ok" : "text-fg-subtle"
                    }`}
                  >
                    {status.subscription_active ? "Faol (Active)" : "Nofaol"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xs border border-status-warn/40 bg-status-warn-bg/20 space-y-2">
              <div className="flex items-center gap-2 text-status-warn font-semibold text-xs">
                <Icons.AlertTriangle size={15} />
                <span>Provayder API bilan aloqa yo'q</span>
              </div>

              <p className="text-[12px] text-fg-muted">
                Server FazerCards API bilan bog'lana olmadi.
              </p>

              {status.error && (
                <div className="p-2 rounded-xs bg-surface border border-hairline font-mono text-[12px] text-status-fail break-all">
                  Xato xabari: {status.error}
                </div>
              )}

              <p className="text-[12px] text-fg-subtle">
                Iltimos, server konfiguratsiyasida `FAZERCARDS_API_KEY` to'g'ri sozlanganligini tekshiring.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
