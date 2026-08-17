import { useState, useMemo } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { DateTime } from "@/components/ui/datetime";
import { StatusBadge, type OrderStatus } from "@/components/ui/status-badge";
import { Drawer } from "@/components/ui/drawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { DataTable, type ColumnDef } from "@/components/ui/data-table/DataTable";
import { useTableParams } from "@/components/ui/data-table/useTableParams";

interface MockItem {
  id: number;
  orderNumber: string;
  customer: string;
  tgId: number;
  amount: string;
  status: OrderStatus;
  createdAt: string;
}

// Generate 1000 deterministic mock records for performance & virtualization testing
const MOCK_ITEMS: MockItem[] = Array.from({ length: 1000 }).map((_, i) => {
  const statuses: OrderStatus[] = ["completed", "processing", "pending", "failed", "cancelled", "refunded"];
  const status: OrderStatus = statuses[i % statuses.length] || "pending";
  const amountVal = ((i * 37) % 500 + 15) * 1000;
  const daysAgo = i % 60;
  const date = new Date(Date.now() - daysAgo * 86400000 - (i % 24) * 3600000);
  const names = ["Azizbek", "Shohruh", "Dilshod", "Jasur", "Farrux", "Bobur"];
  const name = names[i % names.length];

  return {
    id: i + 1,
    orderNumber: `ORD-${10000 + i}`,
    customer: `${name}_${i}`,
    tgId: 77000000 + i,
    amount: `${amountVal}.00`,
    status,
    createdAt: date.toISOString(),
  };
});

export function StyleguidePage() {
  const [activeTab, setActiveTab] = useState<"primitives" | "table" | "dialogs">("table");

  // Table params synchronized with URL search params
  const { query, sortKey, sortDir, status, setParam, handleSortChange } = useTableParams({
    defaultSortKey: "id",
    defaultSortDir: "asc",
  });

  // Interactive states for testing
  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [tableState, setTableState] = useState<"normal" | "loading" | "error" | "empty">("normal");
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Sort Mock Data
  const filteredData = useMemo(() => {
    let result = [...MOCK_ITEMS];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.orderNumber.toLowerCase().includes(q) ||
          item.customer.toLowerCase().includes(q) ||
          String(item.tgId).includes(q)
      );
    }

    if (status && status !== "all") {
      result = result.filter((item) => item.status === status);
    }

    if (sortKey) {
      result.sort((a, b) => {
        let valA: string | number = a[sortKey as keyof MockItem];
        let valB: string | number = b[sortKey as keyof MockItem];

        if (sortKey === "amount") {
          valA = Number(a.amount);
          valB = Number(b.amount);
        }

        if (valA < valB) return sortDir === "desc" ? 1 : -1;
        if (valA > valB) return sortDir === "desc" ? -1 : 1;
        return 0;
      });
    }

    return result;
  }, [query, status, sortKey, sortDir]);

  const columns: ColumnDef<MockItem>[] = [
    {
      id: "id",
      header: "# ID",
      accessorKey: "id",
      sortable: true,
      width: "80px",
      align: "left",
      cell: (row) => <span className="font-mono text-fg-muted">#{row.id}</span>,
    },
    {
      id: "orderNumber",
      header: "Buyurtma",
      accessorKey: "orderNumber",
      sortable: true,
      width: "140px",
      cell: (row) => (
        <span className="font-mono font-medium text-fg">{row.orderNumber}</span>
      ),
    },
    {
      id: "customer",
      header: "Mijoz",
      accessorKey: "customer",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-fg truncate">@{row.customer}</span>
          <span className="font-mono text-xs text-fg-subtle truncate">ID: {row.tgId}</span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Summa",
      accessorKey: "amount",
      sortable: true,
      align: "right",
      width: "160px",
      cell: (row) => <Money amount={row.amount} currency="UZS" align="right" />,
    },
    {
      id: "status",
      header: "Holat",
      accessorKey: "status",
      sortable: true,
      width: "140px",
      cell: (row) => <StatusBadge type="order" status={row.status} />,
    },
    {
      id: "createdAt",
      header: "Sana",
      accessorKey: "createdAt",
      sortable: true,
      align: "right",
      width: "160px",
      cell: (row) => <DateTime value={row.createdAt} mode="relative" />,
    },
  ];

  const handleRowClick = (item: MockItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsDeleting(false);
    setIsConfirmOpen(false);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="label-caps">3-QADAM</span>
            <Badge variant="brand" styleType="subtle" className="text-xs">
              Umumiy Primitivlar
            </Badge>
          </div>
          <h1 className="text-display font-semibold tracking-tight text-fg">
            Primitivlar & DataTable Ko'rgazmasi
          </h1>
          <p className="text-xs text-fg-muted max-w-2xl leading-relaxed">
            Qolgan 9 ta ekran uchun umumiy yadro: DataTable, Virtual Scroll, Drawer, Money, DateTime, StatusBadge, ConfirmDialog.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 rounded-sm border border-hairline bg-surface p-1 self-start">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "table" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            DataTable (1000 qator)
          </button>
          <button
            onClick={() => setActiveTab("primitives")}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "primitives" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            Money, Date, Status
          </button>
          <button
            onClick={() => setActiveTab("dialogs")}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "dialogs" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            Drawer & Modal
          </button>
        </div>
      </div>

      {/* TAB 1: DATA TABLE */}
      {activeTab === "table" && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Status Filter, State Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-hairline">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              <div className="w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Qidirish (Buyurtma, Mijoz, ID)..."
                  value={query}
                  onChange={(e) => setParam("q", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {(["all", "completed", "processing", "pending", "failed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setParam("status", s)}
                    className={`px-2.5 py-1 rounded-sm text-xs transition-colors cursor-pointer font-medium ${
                      status === s || (s === "all" && !status)
                        ? "bg-fg text-canvas"
                        : "bg-surface-2 text-fg-muted hover:text-fg"
                    }`}
                  >
                    {s === "all" ? "Barchasi" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Test State Simulator */}
            <div className="flex items-center gap-1.5 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0">
              <span className="text-xs text-fg-subtle">Holat:</span>
              <button
                onClick={() => setTableState("normal")}
                className={`px-2 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                  tableState === "normal" ? "bg-surface-2 font-semibold text-fg" : "text-fg-muted"
                }`}
              >
                1000 Qator
              </button>
              <button
                onClick={() => setTableState("loading")}
                className={`px-2 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                  tableState === "loading" ? "bg-surface-2 font-semibold text-fg" : "text-fg-muted"
                }`}
              >
                Yuklanmoqda
              </button>
              <button
                onClick={() => setTableState("error")}
                className={`px-2 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                  tableState === "error" ? "bg-surface-2 font-semibold text-fg" : "text-fg-muted"
                }`}
              >
                Xatolik
              </button>
              <button
                onClick={() => setTableState("empty")}
                className={`px-2 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                  tableState === "empty" ? "bg-surface-2 font-semibold text-fg" : "text-fg-muted"
                }`}
              >
                Bo'sh
              </button>
            </div>
          </div>

          {/* Render Table */}
          <DataTable
            data={tableState === "empty" ? [] : filteredData}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={tableState === "loading"}
            error={tableState === "error" ? "Serverdan ma'lumot olishda 503 xatosi yuz berdi" : null}
            onRetry={() => setTableState("normal")}
            onRowClick={handleRowClick}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            hasMore={true}
            onLoadMore={() => {}}
            emptyTitle="Buyurtmalar topilmadi"
            emptyDescription="Qidiruv matnini o'zgartiring yoki filtrlarni tozalang."
          />

          <div className="text-xs text-fg-subtle flex items-center justify-between px-1">
            <span>💡 Qator ustiga bosing — batafsil Drawer ochiladi.</span>
            <span>Filtrlar URL (`useSearchParams`) bilan to'liq sinxron.</span>
          </div>
        </div>
      )}

      {/* TAB 2: PRIMITIVES */}
      {activeTab === "primitives" && (
        <div className="space-y-6">
          {/* Money Primitive */}
          <div className="rounded-md border border-hairline bg-surface p-6 space-y-4">
            <h3 className="text-sm font-semibold text-fg uppercase tracking-wider">
              1. Money Primitive (parseFloat ishlatilmaydi, tabular-nums)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-sm bg-surface-2 space-y-1">
                <span className="text-xs text-fg-subtle block">UZS Valyutasi:</span>
                <Money amount="1250000.00" currency="UZS" className="text-base" />
              </div>
              <div className="p-3.5 rounded-sm bg-surface-2 space-y-1">
                <span className="text-xs text-fg-subtle block">Foyda / Musbat:</span>
                <Money amount="45000.50" currency="UZS" showSign colored className="text-base" />
              </div>
              <div className="p-3.5 rounded-sm bg-surface-2 space-y-1">
                <span className="text-xs text-fg-subtle block">Zarar / Manfiy:</span>
                <Money amount="-18500.00" currency="UZS" showSign colored className="text-base" />
              </div>
              <div className="p-3.5 rounded-sm bg-surface-2 space-y-1">
                <span className="text-xs text-fg-subtle block">USD Valyutasi:</span>
                <Money amount="89.99" currency="USD" className="text-base" />
              </div>
            </div>
          </div>

          {/* DateTime Primitive */}
          <div className="rounded-md border border-hairline bg-surface p-6 space-y-4">
            <h3 className="text-sm font-semibold text-fg uppercase tracking-wider">
              2. DateTime Primitive (Asia/Tashkent, nisbiy vaqt, tooltip)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-sm bg-surface-2 space-y-1">
                <span className="text-xs text-fg-subtle block">Nisbiy ko'rinish:</span>
                <DateTime value={new Date(Date.now() - 1000 * 60 * 12).toISOString()} mode="relative" />
              </div>
              <div className="p-3.5 rounded-sm bg-surface-2 space-y-1">
                <span className="text-xs text-fg-subtle block">To'liq sana:</span>
                <DateTime value={new Date().toISOString()} mode="absolute" />
              </div>
              <div className="p-3.5 rounded-sm bg-surface-2 space-y-1">
                <span className="text-xs text-fg-subtle block">Ikkala ko'rinish:</span>
                <DateTime value={new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()} mode="both" />
              </div>
            </div>
          </div>

          {/* StatusBadge Primitive */}
          <div className="rounded-md border border-hairline bg-surface p-6 space-y-4">
            <h3 className="text-sm font-semibold text-fg uppercase tracking-wider">
              3. StatusBadge Primitive (Domen holatlari, nuqta + matn)
            </h3>
            <div className="space-y-3">
              <div className="text-xs text-fg-subtle font-medium">Buyurtma holatlari (Order):</div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge type="order" status="completed" />
                <StatusBadge type="order" status="processing" />
                <StatusBadge type="order" status="pending" />
                <StatusBadge type="order" status="failed" />
                <StatusBadge type="order" status="cancelled" />
                <StatusBadge type="order" status="refunded" />
              </div>

              <div className="text-xs text-fg-subtle font-medium pt-2">To'lov holatlari (Payment):</div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge type="payment" status="approved" />
                <StatusBadge type="payment" status="pending_check" />
                <StatusBadge type="payment" status="rejected" />
                <StatusBadge type="payment" status="paid" />
                <StatusBadge type="payment" status="expired" />
              </div>
            </div>
          </div>

          {/* Skeletons & Empty States */}
          <div className="rounded-md border border-hairline bg-surface p-6 space-y-4">
            <h3 className="text-sm font-semibold text-fg uppercase tracking-wider">
              4. Skeleton & EmptyState (Tarkib shaklini takrorlash)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="pt-2">
              <EmptyState
                icon="ShoppingCart"
                title="Hozircha buyurtmalar mavjud emas"
                description="Yangi buyurtmalar kelib tushishi bilan ushbu ro'yxatda aks etadi."
                action={{
                  label: "Katalogni ko'rish",
                  onClick: () => {},
                  icon: "FolderTree",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIALOGS & DRAWERS */}
      {activeTab === "dialogs" && (
        <div className="rounded-md border border-hairline bg-surface p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-fg uppercase tracking-wider">
              Modal & Drawer Sinovi (Fokus tuzog'i va Escape boshqaruvi)
            </h3>
            <p className="text-xs text-fg-muted">
              Drawer va ConfirmDialog ochilganda Tab bosilganda fokus tuzoqda qoladi, Escape bosilganda yoki yopilganda fokus ochgan tugmaga qaytadi.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setSelectedItem(MOCK_ITEMS[0] ?? null);
                setIsDrawerOpen(true);
              }}
              className="gap-2"
            >
              <Icons.FolderTree size="sm" />
              <span>O'ngdan Drawer Ochish</span>
            </Button>

            <Button
              variant="destructive"
              size="md"
              onClick={() => setIsConfirmOpen(true)}
              className="gap-2"
            >
              <Icons.AlertTriangle size="sm" />
              <span>ConfirmDialog (Qaytarib bo'lmaydigan amal)</span>
            </Button>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER COMPONENT */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedItem ? `Buyurtma ${selectedItem.orderNumber}` : "Batafsil ma'lumot"}
        description="Foydalanuvchi va operatsiya tafsilotlari"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Yopish
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsConfirmOpen(true);
              }}
            >
              Bekor qilish
            </Button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-5">
            <div className="p-4 rounded-sm bg-surface-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-fg-subtle">Holat:</span>
                <StatusBadge type="order" status={selectedItem.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-fg-subtle">Summa:</span>
                <Money amount={selectedItem.amount} currency="UZS" className="text-sm font-semibold" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-fg-subtle">Sana:</span>
                <DateTime value={selectedItem.createdAt} mode="both" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-fg">Mijoz haqida:</span>
              <div className="p-3.5 rounded-sm border border-hairline space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-fg-subtle">Telegram Foydalanuvchi:</span>
                  <span className="font-mono text-fg font-medium">@{selectedItem.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-subtle">Telegram ID:</span>
                  <span className="font-mono text-fg">{selectedItem.tgId}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* CONFIRM DIALOG COMPONENT */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isDeleting}
        title="Ushbu buyurtmani bekor qilmoqchimisiz?"
        description="Bu amal audit jurnaliga yoziladi va uni qaytarib bo'lmaydi. Mablag' foydalanuvchi balansiga avtomatik qaytariladi."
        confirmLabel="Ha, bekor qilinsin"
        cancelLabel="Qaytish"
        variant="destructive"
      />
    </div>
  );
}
