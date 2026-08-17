import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import "@/lib/chartjs";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartOptions, TooltipItem } from "chart.js";

export interface OrderStatusDonutProps {
  ordersByStatus?: Record<string, number> | null;
  isLoading?: boolean;
}

const STATUS_COLOR_MAP: Record<string, { bg: string; label: string }> = {
  completed: { bg: "#10b981", label: "Yetkazildi" },
  funds_held: { bg: "#f59e0b", label: "Kutilmoqda (Hold)" },
  submitting: { bg: "#3b82f6", label: "Yuborilmoqda" },
  provider_pending: { bg: "#06b6d4", label: "Provayderda" },
  failed: { bg: "#ef4444", label: "Xatolik (Fail)" },
  refunded: { bg: "#8b5cf6", label: "Qaytarildi (Refund)" },
  cancelled: { bg: "#6b7280", label: "Bekor qilindi" },
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
    const labels = entries.map(([st]) => STATUS_COLOR_MAP[st]?.label || st);
    const data = entries.map(([, count]) => count);
    const backgroundColor = entries.map(
      ([st]) => STATUS_COLOR_MAP[st]?.bg || "#94a3b8"
    );

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 2,
          borderColor: "transparent",
          hoverOffset: 4,
        },
      ],
    };
  }, [entries]);

  const options: ChartOptions<"doughnut"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: isReducedMotion ? false : { duration: 400 },
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            font: { size: 11, family: "inherit" },
            padding: 12,
            color: "currentColor",
          },
        },
        tooltip: {
          backgroundColor: "#18181b",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          padding: 8,
          cornerRadius: 4,
          callbacks: {
            label: (context: TooltipItem<"doughnut">) => {
              const val = Number(context.raw) || 0;
              const pct = totalOrders > 0 ? ((val / totalOrders) * 100).toFixed(1) : "0";
              return `${context.label}: ${val} ta (${pct}%)`;
            },
          },
        },
      },
    }),
    [isReducedMotion, totalOrders]
  );

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
        <div className="h-64 w-full text-fg relative">
          <Doughnut data={chartData} options={options} />
          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-lg font-bold font-mono text-fg">
              {totalOrders}
            </span>
            <span className="text-xs text-fg-subtle">
              buyurtma
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
