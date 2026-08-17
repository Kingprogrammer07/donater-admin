import { useQuery } from "@tanstack/react-query";
import { systemApi } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { DateTime } from "@/components/ui/datetime";
import type { CheckOut } from "@/api/types";

//  The endpoint speaks in enum values; the panel is read by people.
const CHECK_STATUS_LABELS: Record<string, string> = {
  ok: "Barqaror",
  degraded: "Sekinlashgan",
  failing: "Nosoz",
};

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const SUBSYSTEM_LABELS: Record<string, { label: string; icon: keyof typeof Icons; desc: string }> = {
  database: {
    label: "PostgreSQL Ma'lumotlar bazasi",
    icon: "Database",
    desc: "Asosiy tranzaksiyalar va ma'lumotlar saqlagichi",
  },
  redis: {
    label: "Redis Kesh & Navbat",
    icon: "Layers",
    desc: "Sessiyalar, kesh va arq vazifalar navbati",
  },
  worker: {
    label: "Arq Asinxron Worker",
    icon: "Cpu",
    desc: "Buyurtmalar yetkazish, sinxronizatsiya va audit ishchisi",
  },
  "provider:manual": {
    label: "Qo'lda to'lov (Manual Pay)",
    icon: "CreditCard",
    desc: "Skrinshotli qo'lda to'lovlarni qabul qilish",
  },
  "provider:payme": {
    label: "Payme Provayderi",
    icon: "CreditCard",
    desc: "Payme avtomatlashtirilgan to'lov integratsiyasi",
  },
  "provider:click": {
    label: "Click Provayderi",
    icon: "CreditCard",
    desc: "Click avtomatlashtirilgan to'lov integratsiyasi",
  },
};

export function HealthPanel() {
  const { data: health, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => systemApi.getHealth(),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? false : 15000,
  });

  const checks = health?.checks || [];
  const isAllOk = health?.status === "ok";

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.Activity size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg tracking-tight">
                Tizim Komponentlari Sog'lig'i (System Health)
              </h2>
              {health && (
                <Badge
                  variant={isAllOk ? "ok" : "warn"}
                  styleType="subtle"
                  className="text-[12px] gap-1 font-semibold"
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      isAllOk ? "bg-status-ok" : "bg-status-warn animate-pulse"
                    }`}
                  />
                  <span>{isAllOk ? "Barcha xizmatlar barqaror" : "Nosozliklar mavjud"}</span>
                </Badge>
              )}
            </div>
            <p className="text-[12px] text-fg-subtle">
              Har 15 soniyada avtomatik tekshiriladi
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 self-start sm:self-auto text-xs"
        >
          <Icons.Refresh size={12} className={isFetching ? "animate-spin" : ""} />
          <span>Yangilash</span>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xs border border-status-fail/40 bg-status-fail-bg/20 text-status-fail text-xs flex items-center justify-between">
          <span>Tizim sog'lig'i holatini yuklab bo'lmadi.</span>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-xs">
            Qayta urinish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {checks.map((check: CheckOut) => {
            const meta = SUBSYSTEM_LABELS[check.name] || {
              label: check.name,
              icon: "CheckCircle",
              desc: "Tizim quyi xizmati",
            };
            const IconComp = Icons[meta.icon] || Icons.CheckCircle;
            const isOk = check.status === "ok";
            const isDegraded = check.status === "degraded";

            return (
              <div
                key={check.name}
                className="p-3.5 rounded-xs border border-hairline bg-surface-2/40 space-y-2 hover:bg-surface-2/70 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xs bg-surface border border-hairline text-fg-muted">
                      <IconComp size={14} />
                    </div>
                    <span className="text-xs font-semibold text-fg">
                      {meta.label}
                    </span>
                  </div>

                  <Badge
                    variant={isOk ? "ok" : isDegraded ? "warn" : "fail"}
                    styleType="subtle"
                    className="text-[12px] font-mono capitalize"
                  >
                    {CHECK_STATUS_LABELS[check.status] ?? check.status}
                  </Badge>
                </div>

                <p className="text-[12px] text-fg-subtle leading-normal">
                  {meta.desc}
                </p>

                {check.detail && (
                  <div className="pt-1 border-t border-hairline/60 flex items-center justify-between gap-2 text-[12px] text-fg-muted font-mono">
                    {/*  The worker reports its heartbeat as an instant. A
                        truncated "2026-08-17T15:37:30.3642…" tells an operator
                        nothing; "2 daqiqa oldin" is the whole point of it. */}
                    {ISO_TIMESTAMP.test(check.detail) ? (
                      <>
                        <span>Oxirgi signal:</span>
                        <DateTime value={check.detail} mode="relative" className="text-fg-muted" />
                      </>
                    ) : (
                      <>
                        <span>Holat izohi:</span>
                        <span className="truncate max-w-[170px]" title={check.detail}>
                          {check.detail}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
