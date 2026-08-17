import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/client";
import { DataTable, type ColumnDef } from "@/components/ui/data-table/DataTable";
import { DateTime } from "@/components/ui/datetime";
import { Money } from "@/components/ui/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { UserDetailDrawer } from "./components/UserDetailDrawer";
import type { UserOut } from "@/api/types";

const QUICK_FILTERS = [
  { id: "all", label: "Barchasi", is_blocked: null },
  { id: "active", label: "Faollar", is_blocked: false, icon: Icons.UserCheck },
  { id: "blocked", label: "Bloklanganlar", is_blocked: true, icon: Icons.UserX },
];

export default function UsersPage() {
  const { id: routeUserId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state filters
  const currentBlockedParam = searchParams.get("is_blocked");
  const currentBlocked =
    currentBlockedParam === "true"
      ? true
      : currentBlockedParam === "false"
      ? false
      : null;
  const currentQuery = searchParams.get("q") || "";
  const beforeId = searchParams.get("before_id") ? Number(searchParams.get("before_id")) : null;

  // Search input state
  const [searchInput, setSearchInput] = useState(currentQuery);

  // Selected User for Drawer
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    routeUserId ? Number(routeUserId) : null
  );

  // Sync route param with drawer state
  useEffect(() => {
    if (routeUserId) {
      const parsed = Number(routeUserId);
      if (!Number.isNaN(parsed)) {
        setSelectedUserId(parsed);
      }
    }
  }, [routeUserId]);

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
    setSelectedUserId(null);
    if (routeUserId) {
      navigate("/users", { replace: true });
    }
  };

  // Fetch users with TanStack Query
  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", { is_blocked: currentBlocked, q: currentQuery, before_id: beforeId }],
    queryFn: () =>
      usersApi.listUsers({
        is_blocked: currentBlocked,
        q: currentQuery || null,
        before_id: beforeId,
        limit: 25,
      }),
  });

  const users = pageData?.items || [];
  const hasMore = pageData?.has_more || false;
  const nextCursor = pageData?.next_cursor;

  // Active quick filter ID
  const activeQuickFilter = useMemo(() => {
    if (currentBlocked === true) return "blocked";
    if (currentBlocked === false) return "active";
    return "all";
  }, [currentBlocked]);

  // DataTable Columns definition
  const columns: ColumnDef<UserOut>[] = useMemo(
    () => [
      {
        id: "id",
        header: "Foydalanuvchi ID",
        width: "140px",
        cell: (row: UserOut) => (
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-fg block">
              #{row.id}
            </span>
            <span className="font-mono text-fg-subtle text-xs block">
              TG: {row.tg_id}
            </span>
          </div>
        ),
      },
      {
        id: "username",
        header: "Foydalanuvchi / Ism",
        width: "180px",
        cell: (row: UserOut) => (
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-fg block truncate">
              {row.username ? `@${row.username}` : "—"}
            </span>
            <span className="text-xs text-fg-subtle block truncate">
              {row.first_name || row.full_name || "—"}
            </span>
          </div>
        ),
      },
      {
        id: "language",
        header: "Til",
        width: "80px",
        align: "center",
        cell: (row: UserOut) => (
          <Badge variant="neutral" styleType="subtle" className="text-xs uppercase font-mono">
            {row.language || "uz"}
          </Badge>
        ),
      },
      {
        id: "is_blocked",
        header: "Holat",
        width: "130px",
        cell: (row: UserOut) =>
          row.is_blocked ? (
            <Badge variant="fail" styleType="subtle" className="text-xs font-medium">
              ⛔ Bloklangan
            </Badge>
          ) : (
            <Badge variant="ok" styleType="subtle" className="text-xs font-medium">
              🟢 Faol
            </Badge>
          ),
      },
      {
        id: "balance_uzs",
        header: "Balans",
        width: "150px",
        align: "right",
        cell: (row: UserOut) =>
          row.balance_uzs !== undefined ? (
            <Money
              amount={row.balance_uzs}
              currency="UZS"
              className="text-xs font-semibold text-fg block text-right"
            />
          ) : (
            <span className="text-xs text-fg-subtle text-right block">—</span>
          ),
      },
      {
        id: "last_seen_at",
        header: "Oxirgi faollik",
        width: "140px",
        cell: (row: UserOut) => (
          row.last_seen_at ? (
            <DateTime value={row.last_seen_at} mode="relative" className="text-xs text-fg-muted" />
          ) : (
            <span className="text-xs text-fg-subtle">—</span>
          )
        ),
      },
      {
        id: "created_at",
        header: "Ro'yxatdan o'tgan",
        width: "140px",
        cell: (row: UserOut) => (
          row.created_at ? (
            <DateTime value={row.created_at} mode="relative" className="text-xs text-fg-subtle" />
          ) : (
            <span className="text-xs text-fg-subtle">—</span>
          )
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
            Foydalanuvchilar boshqaruvi
          </h1>
          <p className="text-xs text-fg-subtle mt-0.5">
            Mijozlar hisoblari, balans harakatlari tarixi va profil ma'lumotlari
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
              onClick={() =>
                updateFilters({
                  is_blocked: f.is_blocked === null ? null : String(f.is_blocked),
                })
              }
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
            placeholder="Telegram ID yoki @username bo'yicha..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
          />
        </form>

        {/* Clear Filters */}
        {(currentBlocked !== null || currentQuery) && (
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
      <DataTable<UserOut>
        columns={columns}
        data={users}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(row) => {
          setSelectedUserId(row.id);
          navigate(`/users/${row.id}`, { replace: true });
        }}
        emptyTitle="Foydalanuvchilar topilmadi"
        emptyDescription="Tanlangan parametrlar bo'yicha hech qanday foydalanuvchi mavjud emas."
        hasMore={hasMore}
        onLoadMore={() => {
          if (nextCursor) {
            updateFilters({ before_id: String(nextCursor) });
          }
        }}
      />

      {/* Detail Drawer */}
      <UserDetailDrawer
        userId={selectedUserId}
        isOpen={Boolean(selectedUserId)}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
