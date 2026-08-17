import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { pricingApi } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { EditMarkupRuleModal } from "./EditMarkupRuleModal";
import type { MarkupRuleOut, MarkupRuleRequest } from "@/api/types";

const SCOPE_BADGE_CONFIG: Record<string, { label: string; variant: "ok" | "warn" | "brand" | "neutral" }> = {
  offer: { label: "Offer darajasi (1-daraja)", variant: "brand" },
  category: { label: "Kategoriya (2-daraja)", variant: "brand" },
  kind: { label: "Mahsulot turi (3-daraja)", variant: "neutral" },
  global: { label: "Global asosiy (Fallback)", variant: "ok" },
};

export function MarkupCascadeList() {
  const { success, error: toastError } = useToast();
  const { admin } = useAuth();
  const isViewer = admin?.role === "viewer";

  const [selectedRule, setSelectedRule] = useState<MarkupRuleOut | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<MarkupRuleOut | null>(null);

  // Fetch rules query
  const {
    data: rules,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["markup-rules"],
    queryFn: () => pricingApi.listRules(),
  });

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: MarkupRuleRequest) => {
      if (selectedRule) {
        return pricingApi.updateRule(selectedRule.id, payload);
      }
      return pricingApi.createRule(payload);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["markup-rules"] });
      success(`Marja qoidasi #${saved.id} muvaffaqiyatli saqlandi.`);
      setIsEditModalOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Marja qoidasini saqlashda xatolik yuz berdi.");
      }
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      return pricingApi.deleteRule(ruleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markup-rules"] });
      success("Marja qoidasi muvaffaqiyatli o'chirildi.");
      setRuleToDelete(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Qoidani o'chirishda xatolik yuz berdi.");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const items = rules || [];

  return (
    <div className="rounded-sm border border-hairline bg-surface p-4 space-y-4 shadow-0">
      {/* Header & Add Rule */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Icons.TrendingUp size="sm" className="text-fg-muted" />
            <h3 className="text-sm font-semibold text-fg">
              Narx kaskadi va Marja qoidalari (Markup Rules)
            </h3>
          </div>
          <p className="text-xs text-fg-subtle mt-0.5">
            Narx hisoblash kaskad bo'yicha eng aniq qoidadan global qoidagacha yuradi: Offer → Kategoriya → Kind → Global
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

          {!isViewer && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedRule(null);
                setIsEditModalOpen(true);
              }}
              className="gap-1.5"
            >
              <Icons.Plus size="sm" />
              <span>Qoida qo'shish</span>
            </Button>
          )}
        </div>
      </div>

      {/* Rules Cascade Cards */}
      <div className="space-y-2.5">
        {items.map((rule) => {
          const isGlobal = rule.scope === "global";
          const conf = SCOPE_BADGE_CONFIG[rule.scope] || {
            label: rule.scope,
            variant: "neutral",
          };

          return (
            <div
              key={rule.id}
              className={`p-3.5 rounded-xs border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                rule.is_active
                  ? "border-hairline bg-surface hover:bg-surface-2/40"
                  : "border-hairline/60 bg-canvas/60 opacity-70"
              }`}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={conf.variant} styleType="subtle" className="text-xs font-semibold">
                    {conf.label}
                  </Badge>

                  <span className="font-mono text-xs font-bold text-fg">
                    #{rule.id}
                  </span>

                  {rule.product_kind && (
                    <span className="text-xs text-fg-muted font-mono bg-surface-2 px-2 py-0.5 rounded-xs">
                      kind: {rule.product_kind}
                    </span>
                  )}

                  {rule.category_id !== null && (
                    <span className="text-xs text-fg-muted font-mono bg-surface-2 px-2 py-0.5 rounded-xs">
                      category_id: {rule.category_id}
                    </span>
                  )}

                  {rule.offer_id !== null && (
                    <span className="text-xs text-fg-muted font-mono bg-surface-2 px-2 py-0.5 rounded-xs">
                      offer_id: {rule.offer_id}
                    </span>
                  )}

                  {rule.is_active ? (
                    <span className="text-xs text-status-ok font-medium">🟢 Faol</span>
                  ) : (
                    <span className="text-xs text-fg-subtle font-medium">⚪ Nofaol</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-fg-muted flex-wrap">
                  <span>
                    Marja: <strong className="text-fg font-mono">+{rule.markup_pct}%</strong>
                  </span>

                  {Number(rule.markup_fixed_uzs) > 0 && (
                    <span>
                      Qo'shimcha: <strong className="text-fg font-mono">+{Number(rule.markup_fixed_uzs).toLocaleString("uz-UZ")} UZS</strong>
                    </span>
                  )}

                  <span>
                    Yaxlitlash: <strong className="text-fg font-mono">{rule.round_to_uzs} UZS</strong>
                  </span>

                  {rule.note && (
                    <span className="text-fg-subtle italic truncate">
                      "{rule.note}"
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {!isViewer && (
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedRule(rule);
                      setIsEditModalOpen(true);
                    }}
                    className="text-xs gap-1"
                  >
                    <Icons.Edit size="sm" />
                    <span>Tahrirlash</span>
                  </Button>

                  {isGlobal ? (
                    <span
                      title="Global asosiy qoidani o'chirib bo'lmaydi (har doim fallback bo'lishi shart)"
                      className="text-xs text-fg-subtle px-2 py-1 bg-surface-2 rounded-xs cursor-not-allowed select-none"
                    >
                      O'chirilmaydi
                    </span>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setRuleToDelete(rule)}
                      className="text-xs gap-1"
                    >
                      <Icons.Trash size="sm" />
                      <span>O'chirish</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Rule Modal */}
      <EditMarkupRuleModal
        rule={selectedRule}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={async (payload) => {
          await saveMutation.mutateAsync(payload);
        }}
        isLoading={saveMutation.isPending}
      />

      {/* Delete Rule Confirm Dialog */}
      {ruleToDelete && (
        <ConfirmDialog
          isOpen={Boolean(ruleToDelete)}
          onClose={() => setRuleToDelete(null)}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(ruleToDelete.id);
          }}
          title="Marja qoidasini o'chirish"
          description={`Qoida #${ruleToDelete.id} (${ruleToDelete.scope}) ni o'chirishni tasdiqlaysizmi? Bu amal ushbu qoidaga tegishli barcha yangi hisob-kitoblarni kaskad bo'yicha keyingi qoidaga o'tkazadi.`}
          confirmLabel="Qoidani o'chirish"
          variant="destructive"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
