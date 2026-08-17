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

export interface RevenueProfitChartProps {
  revenueSeries?: TimeseriesOut | null;
  profitSeries?: TimeseriesOut | null;
  isLoading?: boolean;
}

export function RevenueProfitChart({
  revenueSeries,
  profitSeries,
  isLoading = false,
}: RevenueProfitChartProps) {
  const isReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const points = revenueSeries?.points || [];
  const profitPoints = profitSeries?.points || [];

  const hasData =
    points.length > 0 &&
    (points.some((p) => Number(p.value) > 0) || profitPoints.some((p) => Number(p.value) > 0));

  const chartData = useMemo(() => {
    const profitMap = new Map<string, number>();
    profitPoints.forEach((p) => {
      profitMap.set(p.bucket, Number(p.value) || 0);
    });

    return points.map((p) => {
      const d = new Date(p.bucket);
      const label = d.toLocaleDateString("uz-UZ", {
        month: "short",
        day: "numeric",
        hour: revenueSeries?.interval === "hour" ? "2-digit" : undefined,
      });

      return {
        bucket: p.bucket,
        label,
        revenue: Number(p.value) || 0,
        profit: profitMap.get(p.bucket) || 0,
      };
    });
  }, [points, profitPoints, revenueSeries?.interval]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-sm border border-hairline bg-surface space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 rounded-sm border border-hairline bg-surface space-y-3 shadow-0">
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <Icons.TrendingUp size="sm" className="text-fg-muted" />
          <h3 className="text-xs font-semibold text-fg">
            Daromad va Sof Foyda dinamikasi
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-fg-muted">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: "var(--chart-revenue)" }}
            />
            <span>Tushum</span>
          </div>
          <div className="flex items-center gap-1.5 text-fg-muted">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: "var(--chart-profit)" }}
            />
            <span>Sof Foyda</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 bg-canvas/50 rounded-xs border border-hairline/60">
          <Icons.Activity size="md" className="text-fg-subtle" />
          <h4 className="text-xs font-semibold text-fg">Tranzaksiyalar mavjud emas</h4>
          <p className="text-xs text-fg-subtle max-w-sm">
            Tanlangan davr uchun hech qanday daromad yoki buyurtma qayd etilmagan.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full text-fg">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-revenue)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--chart-revenue)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-profit)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--chart-profit)" stopOpacity={0.0} />
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
                tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
                tickFormatter={(val) => {
                  const num = Number(val);
                  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
                  return String(num);
                }}
              />

              <Tooltip
                content={
                  <ChartTooltip
                    isCurrency
                    unit="so'm"
                  />
                }
              />

              <Area
                type="monotone"
                name="Tushum"
                dataKey="revenue"
                stroke="var(--chart-revenue)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                isAnimationActive={!isReducedMotion}
              />

              <Area
                type="monotone"
                name="Sof Foyda"
                dataKey="profit"
                stroke="var(--chart-profit)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#profitGradient)"
                isAnimationActive={!isReducedMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
