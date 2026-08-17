import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "@/lib/chartjs";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeseriesOut } from "@/api/types";
import type { ChartOptions, TooltipItem } from "chart.js";

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
    const labels = points.map((p) => {
      const d = new Date(p.bucket);
      return d.toLocaleDateString("uz-UZ", {
        month: "short",
        day: "numeric",
        hour: ordersSeries?.interval === "hour" ? "2-digit" : undefined,
      });
    });

    const values = points.map((p) => Number(p.value) || 0);

    return {
      labels,
      datasets: [
        {
          label: "Buyurtmalar soni",
          data: values,
          borderColor: "#6366f1", // Indigo
          backgroundColor: "rgba(99, 102, 241, 0.08)",
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: points.length > 30 ? 0 : 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [points, ordersSeries?.interval]);

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: isReducedMotion ? false : { duration: 400 },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#18181b",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          padding: 8,
          cornerRadius: 4,
          callbacks: {
            label: (context: TooltipItem<"line">) => {
              const val = Number(context.raw) || 0;
              return `Buyurtmalar: ${val} ta`;
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
            stepSize: 1,
            precision: 0,
          },
        },
      },
    }),
    [isReducedMotion]
  );

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
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
