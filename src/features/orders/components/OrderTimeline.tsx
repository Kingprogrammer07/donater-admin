import { DateTime } from "@/components/ui/datetime";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import type { OrderEventOut } from "@/api/types";

export interface OrderTimelineProps {
  events: OrderEventOut[];
}

function getEventMeta(event: string) {
  const normalized = event.toLowerCase();
  if (normalized.includes("create") || normalized.includes("held")) {
    return {
      label: "Buyurtma yaratildi & Mablag' ushlandi",
      variant: "ok" as const,
      icon: Icons.Wallet,
    };
  }
  if (normalized.includes("submit") || normalized.includes("send")) {
    return {
      label: "Provayderga yuborildi",
      variant: "neutral" as const,
      icon: Icons.Send,
    };
  }
  if (normalized.includes("complete") || normalized.includes("deliver")) {
    return {
      label: "Muvaffaqiyatli yetkazildi",
      variant: "ok" as const,
      icon: Icons.CheckCircle,
    };
  }
  if (normalized.includes("fail") || normalized.includes("error")) {
    return {
      label: "Yetkazib berishda xatolik",
      variant: "fail" as const,
      icon: Icons.AlertTriangle,
    };
  }
  if (normalized.includes("refund")) {
    return {
      label: "Mablag' qaytarildi (Refund)",
      variant: "warn" as const,
      icon: Icons.Refresh,
    };
  }
  return {
    label: event,
    variant: "neutral" as const,
    icon: Icons.Activity,
  };
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-sm border border-hairline bg-surface p-4 text-center">
        <p className="text-xs text-fg-subtle">
          Hodisalar tarixi mavjud emas
        </p>
      </div>
    );
  }

  // Sort events chronologically
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime()
  );

  return (
    <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3.5">
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <Icons.Activity size="sm" className="text-fg-muted" />
          <h4 className="text-xs font-semibold text-fg">
            Buyurtma hodisalari xronologiyasi
          </h4>
        </div>
        <span className="text-xs text-fg-subtle">
          {events.length} ta yozuv
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-hairline">
        {sortedEvents.map((evt, idx) => {
          const meta = getEventMeta(evt.event);
          const Icon = meta.icon;
          const isLatest = idx === sortedEvents.length - 1;

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 top-0.5 size-5 rounded-full flex items-center justify-center border-2 border-surface shadow-0 z-10 ${
                  isLatest
                    ? "bg-status-ok text-white"
                    : "bg-surface-2 text-fg-muted"
                }`}
              >
                <Icon size={12} />
              </div>

              {/* Event Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-fg leading-tight">
                    {meta.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="neutral" styleType="subtle" className="text-xs font-mono uppercase">
                      {evt.source}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-fg-subtle">
                  <span className="font-mono">{evt.event}</span>
                  <span>·</span>
                  <DateTime value={evt.received_at} mode="relative" className="text-fg-muted" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
