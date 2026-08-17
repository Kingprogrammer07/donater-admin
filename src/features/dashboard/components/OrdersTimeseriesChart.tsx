import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartTooltip } from "./ChartTooltip";
import type { TimeseriesOut } from "@/api/types";

export interface OrdersTimeseriesChartProps {
  ordersSeries?: TimeseriesOut | null;
  isLoading?: boolean;
}

export function OrdersTimeseriesChart({
  ordersSeries,
  isLoading = false,
}: OrdersTimeseriesChartProps) {
  const isReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const points = ordersSeries?.points || [];
  const hasData = points.length > 0 && points.some((p) => Number(p.value) > 0);

  const chartData = useMemo(() => {
    return points.map((p) => {
      const d = new Date(p.bucket);
      const label = d.toLocaleDateString("uz-UZ", {
        month: "short",
        day: "numeric",
        hour: ordersSeries?.interval === "hour" ? "2-digit" : undefined,
      });

      return {
        bucket: p.bucket,
        label,
        orders: Number(p.value) || 0,
      };
    });
  }, [points, ordersSeries?.interval]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-sm border border-hairline bg-surface space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 rounded-sm border border-hairline bg-surface space-y-3 shadow-0">
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <Icons.ShoppingCart size="sm" className="text-fg-muted" />
          <h3 className="text-xs font-semibold text-fg">
            Buyurtmalar soni dinamikasi
          </h3>
        </div>
        <span className="text-xs text-fg-subtle">
          Vaqt kesimida
        </span>
      </div>

      {!hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2 bg-canvas/50 rounded-xs border border-hairline/60">
          <Icons.ShoppingCart size="md" className="text-fg-subtle" />
          <h4 className="text-xs font-semibold text-fg">Buyurtmalar mavjud emas</h4>
          <p className="text-xs text-fg-subtle max-w-sm">
            Tanlangan vaqt oralig'ida buyurtmalar soni 0 ga teng.
          </p>
        </div>
      ) : (
        <div className="h-56 w-full text-fg">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-orders)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--chart-orders)" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="var(--chart-grid)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "var(--chart-grid)" }}
                tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
              />

              <Tooltip
                content={
                  <ChartTooltip
                    unit="ta"
                  />
                }
              />

              <Area
                type="monotone"
                name="Buyurtmalar"
                dataKey="orders"
                stroke="var(--chart-orders)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ordersGradient)"
                isAnimationActive={!isReducedMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
