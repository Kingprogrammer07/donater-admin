import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "@/lib/chartjs";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeseriesOut } from "@/api/types";
import type { ChartOptions, TooltipItem } from "chart.js";

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
    const labels = points.map((p) => {
      const d = new Date(p.bucket);
      return d.toLocaleDateString("uz-UZ", {
        month: "short",
        day: "numeric",
        hour: revenueSeries?.interval === "hour" ? "2-digit" : undefined,
      });
    });

    const revenueValues = points.map((p) => Number(p.value) || 0);
    const profitValues = profitPoints.map((p) => Number(p.value) || 0);

    return {
      labels,
      datasets: [
        {
          label: "Tushum (Revenue)",
          data: revenueValues,
          borderColor: "#3b82f6", // Brand primary
          backgroundColor: "rgba(59, 130, 246, 0.08)",
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: points.length > 30 ? 0 : 3,
          pointHoverRadius: 5,
        },
        {
          label: "Sof Foyda (Profit)",
          data: profitValues,
          borderColor: "#10b981", // Status OK green
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: profitPoints.length > 30 ? 0 : 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [points, profitPoints, revenueSeries?.interval]);

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: isReducedMotion ? false : { duration: 400 },
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            font: { size: 11, family: "inherit" },
            color: "currentColor",
          },
        },
        tooltip: {
          backgroundColor: "#18181b",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          padding: 10,
          cornerRadius: 4,
          callbacks: {
            label: (context: TooltipItem<"line">) => {
              const val = Number(context.raw) || 0;
              return `${context.dataset.label || ""}: ${val.toLocaleString("uz-UZ")} so'm`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(128, 128, 128, 0.12)",
          },
          ticks: {
            font: { size: 10, family: "inherit" },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8,
          },
        },
        y: {
          grid: {
            color: "rgba(128, 128, 128, 0.12)",
          },
          ticks: {
            font: { size: 10, family: "inherit" },
            callback: (val: string | number) => {
              const num = Number(val);
              if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
              return String(num);
            },
          },
        },
      },
    }),
    [isReducedMotion]
  );

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
        <span className="text-xs text-fg-subtle">UZS valyutasida</span>
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
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
