import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { catalogApi } from "@/api/client";
import { DataTable, type ColumnDef } from "@/components/ui/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { EditOfferModal } from "./EditOfferModal";
import type { OfferOut, OfferPatch } from "@/api/types";

export function OffersTab() {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const isViewer = !hasPermission("manage_catalog");

  const [selectedOffer, setSelectedOffer] = useState<OfferOut | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [beforeId, setBeforeId] = useState<number | null>(null);

  // Fetch categories for filtering dropdown
  const { data: categoriesPage } = useQuery({
    queryKey: ["categories-filter-list"],
    queryFn: () => catalogApi.listCategories({ limit: 100 }),
  });
  const categories = categoriesPage?.items || [];

  // Fetch offers query
  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["offers", { category_id: selectedCategoryId, before_id: beforeId }],
    queryFn: () =>
      catalogApi.listOffers({
        category_id: selectedCategoryId,
        before_id: beforeId,
        limit: 25,
      }),
  });

  const offers = pageData?.items || [];
  const hasMore = pageData?.has_more || false;
  const nextCursor = pageData?.next_cursor;

  // Patch Offer Mutation
  const patchMutation = useMutation({
    mutationFn: async (payload: OfferPatch) => {
      return catalogApi.patchOffer(selectedOffer!.id, payload);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      success(`Taklif "${updated.name}" muvaffaqiyatli saqlandi.`);
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Taklifni saqlashda xatolik yuz berdi.");
      }
    },
  });

  const columns: ColumnDef<OfferOut>[] = useMemo(
    () => [
      {
        id: "id",
        header: "ID / Tashqi ID",
        width: "140px",
        cell: (row: OfferOut) => (
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
        header: "Taklif (Offer) nomi",
        width: "220px",
        cell: (row: OfferOut) => (
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-fg block truncate">
              {row.name}
            </span>
            <span className="text-xs text-fg-subtle font-mono block">
              Kat: #{row.category_id}
            </span>
          </div>
        ),
      },
      {
        id: "price_usd",
        header: "Tannarx (USD)",
        width: "120px",
        align: "right",
        cell: (row: OfferOut) => (
          <span className="font-mono text-xs font-semibold text-fg block text-right">
            ${Number(row.price_usd).toFixed(2)}
          </span>
        ),
      },
      {
        id: "stock",
        header: "Qoldiq",
        width: "110px",
        align: "center",
        cell: (row: OfferOut) => (
          <span className="font-mono text-xs text-fg-muted block text-center">
            {row.stock !== null ? `${row.stock} dona` : "Cheksiz ∞"}
          </span>
        ),
      },
      {
        id: "is_visible",
        header: "Ko'rinish",
        width: "120px",
        cell: (row: OfferOut) =>
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
        cell: (row: OfferOut) => {
          const isMissing = !row.spic || !row.package_code;
          if (isMissing) {
            return (
              <div className="space-y-1">
                <Badge variant="warn" styleType="subtle" className="text-xs flex items-center gap-1">
                  <Icons.AlertTriangle size={11} />
                  <span>IKPU / Paket kodi yo'q</span>
                </Badge>
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
        id: "actions",
        header: "",
        width: "90px",
        align: "right",
        cell: (row: OfferOut) =>
          !isViewer ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOffer(row);
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
      {/* Category Filter & Refresh */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-sm border border-hairline bg-surface flex-wrap">
        <div className="flex items-center gap-2.5">
          <label htmlFor="offer-cat-filter" className="text-xs text-fg-subtle font-medium">
            Kategoriya bo'yicha:
          </label>
          <select
            id="offer-cat-filter"
            value={selectedCategoryId !== null ? String(selectedCategoryId) : "all"}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCategoryId(val === "all" ? null : Number(val));
              setBeforeId(null);
            }}
            className="px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg"
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.kind})
              </option>
            ))}
          </select>
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
      <DataTable<OfferOut>
        columns={columns}
        data={offers}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(row) => {
          if (!isViewer) {
            setSelectedOffer(row);
            setIsEditModalOpen(true);
          }
        }}
        emptyTitle="Takliflar topilmadi"
        emptyDescription="Tanlangan kategoriya bo'yicha takliflar mavjud emas."
        hasMore={hasMore}
        onLoadMore={() => {
          if (nextCursor) {
            setBeforeId(nextCursor);
          }
        }}
      />

      {/* Edit Offer Modal */}
      <EditOfferModal
        offer={selectedOffer}
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
