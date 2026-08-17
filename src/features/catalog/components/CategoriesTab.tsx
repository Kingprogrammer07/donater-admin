import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { catalogApi } from "@/api/client";
import { DataTable, type ColumnDef } from "@/components/ui/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { EditCategoryModal } from "./EditCategoryModal";
import type { CategoryOut, CategoryPatch } from "@/api/types";

export function CategoriesTab() {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const isViewer = !hasPermission("manage_catalog");

  const [selectedCategory, setSelectedCategory] = useState<CategoryOut | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [beforeId, setBeforeId] = useState<number | null>(null);

  // Fetch categories query
  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories", { kind: kindFilter, before_id: beforeId }],
    queryFn: () =>
      catalogApi.listCategories({
        kind: kindFilter === "all" ? null : kindFilter,
        before_id: beforeId,
        limit: 25,
      }),
  });

  const categories = pageData?.items || [];
  const hasMore = pageData?.has_more || false;
  const nextCursor = pageData?.next_cursor;

  // Patch Category Mutation
  const patchMutation = useMutation({
    mutationFn: async (payload: CategoryPatch) => {
      return catalogApi.patchCategory(selectedCategory!.id, payload);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      success(`Kategoriya "${updated.name}" muvaffaqiyatli saqlandi.`);
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Kategoriyani saqlashda xatolik yuz berdi.");
      }
    },
  });

  const columns: ColumnDef<CategoryOut>[] = useMemo(
    () => [
      {
        id: "id",
        header: "ID / Tashqi ID",
        width: "140px",
        cell: (row: CategoryOut) => (
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-semibold text-fg block">
              #{row.id}
            </span>
            <span className="font-mono text-fg-subtle text-xs block truncate">
              Ext: {row.external_id}
            </span>
          </div>
        ),
      },
      {
        id: "name",
        header: "Kategoriya nomi",
        width: "200px",
        cell: (row: CategoryOut) => (
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-fg block truncate">
              {row.name}
            </span>
            <div className="flex items-center gap-1.5">
              <Badge variant="neutral" styleType="subtle" className="text-xs font-mono">
                {row.kind}
              </Badge>
              <span className="text-xs text-fg-subtle">
                Tartib: {row.sort_order}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "is_visible",
        header: "Ko'rinish",
        width: "120px",
        cell: (row: CategoryOut) =>
          row.is_visible ? (
            <Badge variant="ok" styleType="subtle" className="text-xs">
              🟢 Ko'rinadi
            </Badge>
          ) : (
            <Badge variant="neutral" styleType="subtle" className="text-xs">
              👁️‍🗨️ Yashirin
            </Badge>
          ),
      },
      {
        id: "fiscal",
        header: "Fiskal parametrlar",
        width: "220px",
        cell: (row: CategoryOut) => {
          const isMissing = !row.spic || !row.package_code;
          if (isMissing) {
            return (
              <div className="space-y-1">
                <Badge variant="warn" styleType="subtle" className="text-xs flex items-center gap-1">
                  <Icons.AlertTriangle size={11} />
                  <span>IKPU / Paket kodi yo'q</span>
                </Badge>
                <span className="text-xs text-fg-subtle block font-mono">
                  Chek yuborilmaydi
                </span>
              </div>
            );
          }
          return (
            <div className="space-y-0.5 text-xs font-mono">
              <span className="text-fg block truncate">IKPU: {row.spic}</span>
              <span className="text-fg-subtle block">Paket: {row.package_code} (QQS: {row.vat_percent || 0}%)</span>
            </div>
          );
        },
      },
      {
        id: "synced_at",
        header: "Sinxronizatsiya",
        width: "140px",
        cell: (row: CategoryOut) => (
          row.synced_at ? (
            <DateTime value={row.synced_at} mode="relative" className="text-xs text-fg-subtle" />
          ) : (
            <span className="text-xs text-fg-subtle">—</span>
          )
        ),
      },
      {
        id: "actions",
        header: "",
        width: "90px",
        align: "right",
        cell: (row: CategoryOut) =>
          !isViewer ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory(row);
                setIsEditModalOpen(true);
              }}
              className="text-xs gap-1"
            >
              <Icons.Edit size="sm" />
              <span>Tahrirlash</span>
            </Button>
          ) : null,
      },
    ],
    [isViewer]
  );

  return (
    <div className="space-y-4">
      {/* Category Kind Filters */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-sm border border-hairline bg-surface flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-subtle font-medium">Tur bo'yicha:</span>
          {["all", "game", "gift_card", "subscription", "in_app"].map((k) => (
            <button
              key={k}
              onClick={() => {
                setKindFilter(k);
                setBeforeId(null);
              }}
              className={`px-2.5 py-1 rounded-xs text-xs font-medium transition-colors cursor-pointer border ${
                kindFilter === k
                  ? "bg-surface-2 text-fg border-fg/30 font-semibold"
                  : "bg-surface text-fg-muted border-hairline hover:text-fg"
              }`}
            >
              {k === "all" ? "Barchasi" : k}
            </button>
          ))}
        </div>

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

      {/* DataTable */}
      <DataTable<CategoryOut>
        columns={columns}
        data={categories}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(row) => {
          if (!isViewer) {
            setSelectedCategory(row);
            setIsEditModalOpen(true);
          }
        }}
        emptyTitle="Kategoriyalar topilmadi"
        emptyDescription="Hozirda tanlangan parametrlar bo'yicha kategoriya mavjud emas."
        hasMore={hasMore}
        onLoadMore={() => {
          if (nextCursor) {
            setBeforeId(nextCursor);
          }
        }}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        category={selectedCategory}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={async (payload) => {
          await patchMutation.mutateAsync(payload);
        }}
        isLoading={patchMutation.isPending}
      />
    </div>
  );
}
