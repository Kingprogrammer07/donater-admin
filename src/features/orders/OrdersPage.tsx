import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/api/client";
import { DataTable, type ColumnDef } from "@/components/ui/data-table/DataTable";
import { Money } from "@/components/ui/money";
import { DateTime } from "@/components/ui/datetime";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { OrderDetailDrawer } from "./components/OrderDetailDrawer";
import type { OrderOut, OrderStatus } from "@/api/types";

const QUICK_FILTERS = [
  { id: "all", label: "Barchasi", status: "all" },
  { id: "failed", label: "Fail bo'lganlar", status: "failed", icon: Icons.AlertTriangle },
  { id: "pending", label: "Kutayotganlar", status: "funds_held,submitting,provider_pending", icon: Icons.Clock },
  { id: "completed", label: "Yetkazilganlar", status: "completed", icon: Icons.CheckCircle },
];

export default function OrdersPage() {
  const { id: routeOrderId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state filters
  const currentStatus = searchParams.get("status") || "all";
  const currentKind = searchParams.get("product_kind") || "all";
  const currentQuery = searchParams.get("q") || "";
  const beforeId = searchParams.get("before_id") ? Number(searchParams.get("before_id")) : null;

  // Search input state
  const [searchInput, setSearchInput] = useState(currentQuery);

  // Selected Order for Drawer
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    routeOrderId ? Number(routeOrderId) : null
  );

  // Sync route param with drawer state
  useEffect(() => {
    if (routeOrderId) {
      const parsed = Number(routeOrderId);
      if (!Number.isNaN(parsed)) {
        setSelectedOrderId(parsed);
      }
    }
  }, [routeOrderId]);

  // Update query params helper
  const updateFilters = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === "" || val === "all") {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    // Reset cursor on filter changes
    if (!updates.before_id) {
      next.delete("before_id");
    }
    setSearchParams(next, { replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleDrawerClose = () => {
    setSelectedOrderId(null);
    if (routeOrderId) {
      navigate("/orders", { replace: true });
    }
  };

  // Fetch orders with TanStack Query
  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders", { status: currentStatus, product_kind: currentKind, q: currentQuery, before_id: beforeId }],
    queryFn: () =>
      ordersApi.listOrders({
        status: currentStatus,
        q: currentQuery || null,
        before_id: beforeId,
        limit: 25,
      }),
  });

  const orders = pageData?.items || [];
  const hasMore = pageData?.has_more || false;
  const nextCursor = pageData?.next_cursor;

  // Active quick filter ID
  const activeQuickFilter = useMemo(() => {
    const found = QUICK_FILTERS.find((f) => f.status === currentStatus);
    return found ? found.id : "all";
  }, [currentStatus]);

  // DataTable Columns definition
  const columns: ColumnDef<OrderOut>[] = useMemo(
    () => [
      {
        id: "public_id",
        header: "Buyurtma ID",
        width: "160px",
        cell: (row: OrderOut) => (
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-fg block">
              {row.public_id}
            </span>
            <span className="font-mono text-fg-subtle text-xs block">
              DB #{row.id}
            </span>
          </div>
        ),
      },
      {
        id: "user_id",
        header: "Mijoz",
        width: "120px",
        cell: (row: OrderOut) => (
          <span className="font-mono text-xs text-fg font-medium">
            #{row.user_id}
          </span>
        ),
      },
      {
        id: "product_kind",
        header: "Mahsulot turi",
        width: "140px",
        cell: (row: OrderOut) => (
          <Badge variant="neutral" styleType="subtle" className="text-xs uppercase font-mono">
            {row.product_kind}
          </Badge>
        ),
      },
      {
        id: "quantity",
        header: "Soni",
        width: "80px",
        align: "center",
        cell: (row: OrderOut) => (
          <span className="text-xs font-medium text-fg">{row.quantity} ta</span>
        ),
      },
      {
        id: "price_uzs",
        header: "Narx",
        width: "140px",
        align: "right",
        cell: (row: OrderOut) => (
          <Money
            amount={row.price_uzs}
            currency="UZS"
            className="text-xs font-semibold text-fg block text-right"
          />
        ),
      },
      {
        id: "profit_uzs",
        header: "Foyda",
        width: "130px",
        align: "right",
        cell: (row: OrderOut) => {
          const isProfitable = Number(row.profit_uzs) >= 0;
          return (
            <Money
              amount={row.profit_uzs}
              currency="UZS"
              className={`text-xs font-semibold block text-right ${
                isProfitable ? "text-status-ok" : "text-status-fail"
              }`}
            />
          );
        },
      },
      {
        id: "status",
        header: "Holat",
        width: "140px",
        cell: (row: OrderOut) => <StatusBadge status={row.status as OrderStatus} />,
      },
      {
        id: "created_at",
        header: "Sana",
        width: "140px",
        cell: (row: OrderOut) => (
          <DateTime value={row.created_at} mode="relative" className="text-xs text-fg-muted" />
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">
            Buyurtmalar boshqaruvi
          </h1>
          <p className="text-xs text-fg-subtle mt-0.5">
            Yetkazib berish holati, narx tahlili va provayder operatsiyalari
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5"
          >
            <Icons.Refresh size="sm" />
            <span>Yangilash</span>
          </Button>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        {QUICK_FILTERS.map((f) => {
          const Icon = f.icon;
          const isActive = activeQuickFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => updateFilters({ status: f.status })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? "bg-surface text-fg border-fg/30 shadow-0 font-semibold"
                  : "bg-surface-2/40 text-fg-muted border-hairline hover:text-fg hover:border-fg-muted/30"
              }`}
            >
              {Icon && <Icon size={13} className={isActive ? "text-fg" : "text-fg-subtle"} />}
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-sm border border-hairline bg-surface">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Icons.Search
            size="sm"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buyurtma ID yoki Provayder ID bo'yicha..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
          />
        </form>

        {/* Clear Filters */}
        {(currentStatus !== "all" || currentQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-fg-muted hover:text-fg self-start sm:self-center"
          >
            Filtrlarni tozalash
          </Button>
        )}
      </div>

      {/* DataTable */}
      <DataTable<OrderOut>
        columns={columns}
        data={orders}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(row) => {
          setSelectedOrderId(row.id);
          navigate(`/orders/${row.id}`, { replace: true });
        }}
        emptyTitle="Buyurtmalar topilmadi"
        emptyDescription="Tanlangan parametrlar bo'yicha hech qanday buyurtma mavjud emas."
        hasMore={hasMore}
        onLoadMore={() => {
          if (nextCursor) {
            updateFilters({ before_id: String(nextCursor) });
          }
        }}
      />

      {/* Detail Drawer */}
      <OrderDetailDrawer
        orderId={selectedOrderId}
        isOpen={Boolean(selectedOrderId)}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
