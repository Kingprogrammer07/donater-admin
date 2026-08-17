import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { statsApi, systemApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { NeedsAttentionCard } from "./components/NeedsAttentionCard";
import { KpiCards } from "./components/KpiCards";
import { RevenueProfitChart } from "./components/RevenueProfitChart";
import { OrderStatusDonut } from "./components/OrderStatusDonut";
import { OrdersTimeseriesChart } from "./components/OrdersTimeseriesChart";
import { TopProductsCard } from "./components/TopProductsCard";
import type { StatsPeriod } from "@/api/types";

const PERIOD_OPTIONS: { id: StatsPeriod; label: string }[] = [
  { id: "today", label: "Bugun" },
  { id: "7d", label: "Oxirgi 7 kun" },
  { id: "30d", label: "Oxirgi 30 kun" },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<StatsPeriod>("7d");
  const interval = period === "today" ? "hour" : "day";

  // 1. Overview stats query
  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["stats-overview", period],
    queryFn: () => statsApi.getOverview(period),
  });

  // 2. Revenue timeseries query
  const {
    data: revenueSeries,
    isLoading: isRevenueLoading,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: ["stats-timeseries-revenue", period, interval],
    queryFn: () =>
      statsApi.getTimeseries({ metric: "revenue", period, interval }),
  });

  // 3. Profit timeseries query
  const {
    data: profitSeries,
    isLoading: isProfitLoading,
    refetch: refetchProfit,
  } = useQuery({
    queryKey: ["stats-timeseries-profit", period, interval],
    queryFn: () =>
      statsApi.getTimeseries({ metric: "profit", period, interval }),
  });

  // 4. Orders timeseries query
  const {
    data: ordersSeries,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["stats-timeseries-orders", period, interval],
    queryFn: () =>
      statsApi.getTimeseries({ metric: "orders", period, interval }),
  });

  // 5. Top products query
  const {
    data: topProducts,
    isLoading: isTopProductsLoading,
    refetch: refetchTopProducts,
  } = useQuery({
    queryKey: ["stats-top-products", period],
    queryFn: () => statsApi.getTopProducts(period, 5),
  });

  // 6. FazerCards status query
  const { data: fazerCards } = useQuery({
    queryKey: ["system-fazercards"],
    queryFn: () => systemApi.getFazerCards(),
    retry: 1,
  });

  const handleRefreshAll = () => {
    refetchOverview();
    refetchRevenue();
    refetchProfit();
    refetchOrders();
    refetchTopProducts();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">
            Boshqaruv Paneli (Dashboard)
          </h1>
          <p className="text-xs text-fg-subtle mt-0.5">
            Real vaqtdagi do'kon ko'rsatkichlari, savdo tahlili va tizim holati
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Selector Tabs */}
          <div className="inline-flex p-1 rounded-sm border border-hairline bg-surface select-none">
            {PERIOD_OPTIONS.map((p) => {
              const isActive = period === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-surface-2 text-fg shadow-0 font-semibold"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            className="gap-1.5"
          >
            <Icons.Refresh size="sm" />
            <span>Yangilash</span>
          </Button>
        </div>
      </div>

      {/* 1. Needs Attention Alert Box */}
      <NeedsAttentionCard
        pendingProofs={overview?.pending_proofs || 0}
        failedOrders={overview?.failed_orders || 0}
        fazerCards={fazerCards}
        isLoading={isOverviewLoading}
      />

      {/* 2. KPI Summary Metrics */}
      <KpiCards overview={overview} isLoading={isOverviewLoading} />

      {/* 3. Main Charts Section (Revenue/Profit + Status Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueProfitChart
            revenueSeries={revenueSeries}
            profitSeries={profitSeries}
            isLoading={isRevenueLoading || isProfitLoading}
          />
        </div>

        <div>
          <OrderStatusDonut
            ordersByStatus={overview?.orders_by_status}
            isLoading={isOverviewLoading}
          />
        </div>
      </div>

      {/* 4. Secondary Trends (Orders Timeline + Top Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersTimeseriesChart
          ordersSeries={ordersSeries}
          isLoading={isOrdersLoading}
        />

        <TopProductsCard
          products={topProducts}
          isLoading={isTopProductsLoading}
        />
      </div>
    </div>
  );
}
