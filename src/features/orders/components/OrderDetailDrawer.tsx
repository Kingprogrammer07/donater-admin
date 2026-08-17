import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ordersApi } from "@/api/client";
import { Drawer } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import { PriceBreakdown } from "./PriceBreakdown";
import { OrderTimeline } from "./OrderTimeline";
import { PayloadModal } from "./PayloadModal";
import { RefundModal, ForceCompleteModal } from "./OrderActionModals";
import type { OrderStatus } from "@/api/types";

export interface OrderDetailDrawerProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailDrawer({ orderId, isOpen, onClose }: OrderDetailDrawerProps) {
  const { success, error: toastError } = useToast();
  const { admin } = useAuth();

  const isOwnerOrAdmin = admin?.role === "owner" || admin?.role === "admin";
  const isViewer = admin?.role === "viewer";

  // Action Modals State
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isForceCompleteModalOpen, setIsForceCompleteModalOpen] = useState(false);
  const [isRetryConfirmOpen, setIsRetryConfirmOpen] = useState(false);

  // Fetch full order details
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrder(orderId!),
    enabled: isOpen && Boolean(orderId),
  });

  // Retry Mutation (Non-optimistic)
  const retryMutation = useMutation({
    mutationFn: async (id: number) => {
      return ordersApi.retryOrder(id);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", updated.id] });
      success(`Buyurtma #${updated.public_id} qayta yuborish navbatiga qo'yildi.`);
      setIsRetryConfirmOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Qayta yuborishda xatolik yuz berdi.");
      }
      setIsRetryConfirmOpen(false);
    },
  });

  // Refund Mutation (Non-optimistic)
  const refundMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return ordersApi.refundOrder(id, reason);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", updated.user_id] });
      success(`Buyurtma #${updated.public_id} uchun mablag' mijoz hisobiga qaytarildi.`);
      setIsRefundModalOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Mablag'ni qaytarishda xatolik yuz berdi.");
      }
    },
  });

  // Force Complete Mutation (Non-optimistic)
  const forceCompleteMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return ordersApi.forceComplete(id, reason);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", updated.id] });
      success(`Buyurtma #${updated.public_id} yetkazilgan deb belgilandi.`);
      setIsForceCompleteModalOpen(false);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Yakunlashda xatolik yuz berdi.");
      }
    },
  });

  const canRetry = order?.status === "funds_held" && isOwnerOrAdmin;
  const canRefund =
    order &&
    order.status !== "refunded" &&
    order.status !== "completed" &&
    isOwnerOrAdmin;
  const canForceComplete =
    order &&
    order.status !== "completed" &&
    order.status !== "refunded" &&
    isOwnerOrAdmin;

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <span>Buyurtma tafsilotlari</span>
            {order && (
              <span className="text-xs font-mono font-normal text-fg-subtle">
                #{order.public_id}
              </span>
            )}
          </div>
        }
        description={
          order
            ? `${order.offer_snapshot.name || "Mahsulot"} (ID: #${order.id})`
            : "Buyurtma ma'lumotlari yuklanmoqda"
        }
        size="lg"
      >
        {isLoading ? (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <div className="p-6 text-center space-y-4">
            <div className="size-12 rounded-full bg-status-fail-bg flex items-center justify-center text-status-fail mx-auto">
              <Icons.AlertTriangle size="md" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-fg">Yuklashda xatolik</h3>
              <p className="text-xs text-status-fail font-mono">
                {error instanceof Error ? error.message : "Buyurtma topilmadi"}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Qayta urinish
            </Button>
          </div>
        ) : order ? (
          <div className="p-6 space-y-6">
            {/* Top Status & Role Banner */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-sm border border-hairline bg-surface flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-fg-subtle font-medium">Holat:</span>
                <StatusBadge status={order.status as OrderStatus} />
              </div>

              {order.attempts > 0 && (
                <Badge variant="neutral" styleType="subtle" className="text-xs">
                  Urinishlar: {order.attempts}
                </Badge>
              )}
            </div>

            {/* Viewer Notice */}
            {isViewer && (
              <div className="rounded-sm border border-hairline bg-surface-2/40 p-3 text-xs text-fg-muted flex items-center gap-2">
                <Icons.Lock size="sm" className="text-fg-subtle shrink-0" />
                <span>Viewer rolidasiz. Buyurtmani o'zgartirish yoki kalitni ko'rish faqat Admin va Owner uchun ruxsat etilgan.</span>
              </div>
            )}

            {/* Error Banner if failed */}
            {order.error_message && (
              <div className="rounded-sm border border-status-fail/40 bg-status-fail-bg/20 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-status-fail font-semibold">
                  <Icons.AlertCircle size="sm" />
                  <span>Xatolik xabari (Provayder / Tizim):</span>
                </div>
                <p className="font-mono text-fg text-xs bg-surface p-2 rounded-xs border border-status-fail/30">
                  {order.error_message}
                </p>
              </div>
            )}

            {/* Product & Customer Details */}
            <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3">
              <h4 className="text-xs font-semibold text-fg border-b border-hairline pb-2 flex items-center gap-2">
                <Icons.Package size="sm" className="text-fg-muted" />
                <span>Mahsulot va Buyurtmachi</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-fg-subtle block">Mahsulot nomi:</span>
                  <span className="font-semibold text-fg truncate block">
                    {String(order.offer_snapshot.name || "Noma'lum")}
                  </span>
                </div>

                <div>
                  <span className="text-fg-subtle block">Turi:</span>
                  <Badge variant="neutral" styleType="subtle" className="text-xs uppercase font-mono">
                    {order.product_kind}
                  </Badge>
                </div>

                <div>
                  <span className="text-fg-subtle block">Mijoz ID:</span>
                  <span className="font-mono text-fg font-medium">
                    Foydalanuvchi #{order.user_id}
                  </span>
                </div>

                <div>
                  <span className="text-fg-subtle block">Miqdor:</span>
                  <span className="font-medium text-fg">{order.quantity} ta</span>
                </div>

                {order.provider_order_id && (
                  <div className="col-span-2">
                    <span className="text-fg-subtle block">Provayder Buyurtma ID:</span>
                    <span className="font-mono text-xs text-fg bg-surface-2 px-2 py-1 rounded-xs inline-block mt-0.5">
                      {order.provider_order_id}
                    </span>
                  </div>
                )}
              </div>

              {/* Input Fields (e.g. Player ID, Zone ID) */}
              {order.input_fields && Object.keys(order.input_fields).length > 0 && (
                <div className="pt-2 border-t border-hairline space-y-1.5">
                  <span className="text-xs font-semibold text-fg-muted block">
                    Mijoz kiritgan parametrlar:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-canvas p-2.5 rounded-xs border border-hairline">
                    {Object.entries(order.input_fields).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-fg-subtle block capitalize">{key}:</span>
                        <span className="font-mono text-fg font-medium">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown Component */}
            <PriceBreakdown order={order} />

            {/* Order Timeline Component */}
            <OrderTimeline events={order.events} />

            {/* Action Buttons Bar */}
            <div className="rounded-sm border border-hairline bg-surface p-4 space-y-3">
              <h4 className="text-xs font-semibold text-fg">
                Buyurtma ustida amallar
              </h4>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Reveal Delivery Payload Button */}
                {isOwnerOrAdmin && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPayloadModalOpen(true)}
                    className="gap-1.5"
                  >
                    <Icons.Key size="sm" />
                    <span>Kalitni ko'rish</span>
                  </Button>
                )}

                {/* Retry Button */}
                {canRetry && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsRetryConfirmOpen(true)}
                    className="gap-1.5"
                  >
                    <Icons.Refresh size="sm" />
                    <span>Qayta yuborish</span>
                  </Button>
                )}

                {/* Refund Button */}
                {canRefund && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsRefundModalOpen(true)}
                    className="gap-1.5"
                  >
                    <Icons.Refresh size="sm" />
                    <span>Pulni qaytarish (Refund)</span>
                  </Button>
                )}

                {/* Force Complete Button */}
                {canForceComplete && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsForceCompleteModalOpen(true)}
                    className="gap-1.5"
                  >
                    <Icons.CheckCircle size="sm" className="text-status-ok" />
                    <span>Qo'lda yakunlash</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Sub-Modals */}
      {order && (
        <>
          {/* 1. Payload Reveal Modal */}
          <PayloadModal
            isOpen={isPayloadModalOpen}
            onClose={() => setIsPayloadModalOpen(false)}
            orderId={order.id}
            publicId={order.public_id}
          />

          {/* 2. Refund Modal */}
          <RefundModal
            isOpen={isRefundModalOpen}
            onClose={() => setIsRefundModalOpen(false)}
            onConfirm={async (reason) => {
              await refundMutation.mutateAsync({ id: order.id, reason });
            }}
            orderPublicId={order.public_id}
            priceUzs={order.price_uzs}
            isLoading={refundMutation.isPending}
          />

          {/* 3. Force Complete Modal */}
          <ForceCompleteModal
            isOpen={isForceCompleteModalOpen}
            onClose={() => setIsForceCompleteModalOpen(false)}
            onConfirm={async (reason) => {
              await forceCompleteMutation.mutateAsync({ id: order.id, reason });
            }}
            orderPublicId={order.public_id}
            isLoading={forceCompleteMutation.isPending}
          />

          {/* 4. Retry Confirm Dialog */}
          <ConfirmDialog
            isOpen={isRetryConfirmOpen}
            onClose={() => setIsRetryConfirmOpen(false)}
            onConfirm={async () => {
              await retryMutation.mutateAsync(order.id);
            }}
            title="Buyurtmani qayta yuborish"
            description={`#${order.public_id} buyurtmasini provayderga qayta yuborishni tasdiqlaysizmi? Idempotency-Key takroriy hisoblanishning oldini oladi.`}
            confirmLabel="Qayta yuborish"
            variant="primary"
            isLoading={retryMutation.isPending}
          />
        </>
      )}
    </>
  );
}
