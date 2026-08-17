import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

export interface OrderStatusDonutProps {
  ordersByStatus?: Record<string, number> | null;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { colorVar: string; label: string }> = {
  completed: { colorVar: "var(--status-ok)", label: "Yetkazildi" },
  funds_held: { colorVar: "var(--status-warn)", label: "Kutilmoqda (Hold)" },
  submitting: { colorVar: "var(--chart-status-submitting)", label: "Yuborilmoqda" },
  failed: { colorVar: "var(--status-fail)", label: "Xatolik (Fail)" },
  refunded: { colorVar: "var(--chart-status-refunded)", label: "Qaytarildi (Refund)" },
  cancelled: { colorVar: "var(--status-neutral)", label: "Bekor qilindi" },
};

export function OrderStatusDonut({
  ordersByStatus,
  isLoading = false,
}: OrderStatusDonutProps) {
  const isReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const entries = useMemo(() => {
    if (!ordersByStatus) return [];
    return Object.entries(ordersByStatus).filter(([, count]) => count > 0);
  }, [ordersByStatus]);

  const totalOrders = useMemo(
    () => entries.reduce((acc, [, count]) => acc + count, 0),
    [entries]
  );

  const chartData = useMemo(() => {
    return entries.map(([statusKey, count]) => {
      const conf = STATUS_CONFIG[statusKey] || {
        colorVar: "var(--status-neutral)",
        label: statusKey,
      };
      return {
        key: statusKey,
        name: conf.label,
        value: count,
        colorVar: conf.colorVar,
      };
    });
  }, [entries]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-sm border border-hairline bg-surface space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 rounded-sm border border-hairline bg-surface space-y-3 shadow-0 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <Icons.Package size="sm" className="text-fg-muted" />
          <h3 className="text-xs font-semibold text-fg">
            Buyurtmalar holat taqsimoti
          </h3>
        </div>
        <span className="text-xs text-fg-subtle">
          Jami: {totalOrders} ta
        </span>
      </div>

      {totalOrders === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 bg-canvas/50 rounded-xs border border-hairline/60">
          <Icons.ShoppingCart size="md" className="text-fg-subtle" />
          <h4 className="text-xs font-semibold text-fg">Buyurtmalar yo'q</h4>
          <p className="text-xs text-fg-subtle">
            Tanlangan vaqt oralig'ida hech qanday buyurtma bo'lmagan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Donut Chart Container */}
          <div className="h-52 w-full text-fg relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  isAnimationActive={!isReducedMotion}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.colorVar}
                      stroke="var(--surface)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload[0];
                    if (!item) return null;
                    const val = Number(item.value) || 0;
                    const pct = totalOrders > 0 ? ((val / totalOrders) * 100).toFixed(1) : "0";
                    return (
                      <div className="rounded-xs border border-hairline bg-surface p-2 shadow-2 text-xs space-y-0.5 pointer-events-none">
                        <div className="font-semibold text-fg">{item.name}</div>
                        <div className="text-fg-muted font-mono">
                          {val} ta ({pct}%)
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Summary inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold font-mono text-fg leading-none">
                {totalOrders}
              </span>
              <span className="text-xs text-fg-subtle mt-0.5">
                buyurtma
              </span>
            </div>
          </div>

          {/* Accessible Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-1 border-t border-hairline/60">
            {chartData.map((item) => {
              const pct = totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(0) : "0";
              return (
                <div key={item.key} className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.colorVar }}
                  />
                  <span>{item.name}</span>
                  <span className="font-mono text-fg font-medium">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
