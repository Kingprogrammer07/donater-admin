import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { AnimatePresence, motion } from "motion/react";
import { ApiError } from "@/api/errors";

export interface PayloadModalProps {
  orderId: number | null;
  publicId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PayloadModal({ orderId, publicId, isOpen, onClose }: PayloadModalProps) {
  const [hasConfirmedAuditWarning, setHasConfirmedAuditWarning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch payload only after user explicitly confirms the audit warning
  const {
    data: payloadData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order-payload", orderId],
    queryFn: () => ordersApi.revealPayload(orderId!),
    enabled: isOpen && Boolean(orderId) && hasConfirmedAuditWarning,
    retry: false,
  });

  const handleClose = () => {
    setHasConfirmedAuditWarning(false);
    setCopied(false);
    onClose();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payload-modal-title"
      >
        {/* Backdrop Scrim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-[480px] rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-hairline pb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-status-warn-bg flex items-center justify-center text-status-warn shrink-0">
                <Icons.Key size="md" />
              </div>
              <div>
                <h3
                  id="payload-modal-title"
                  className="text-sm font-semibold text-fg leading-tight"
                >
                  Yetkazilgan mahsulot kaliti
                </h3>
                <span className="text-xs text-fg-subtle font-mono">
                  Buyurtma: {publicId}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1 rounded-sm text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Yopish"
            >
              <Icons.X size="sm" />
            </button>
          </div>

          {!hasConfirmedAuditWarning ? (
            /* Security Audit Warning Screen */
            <div className="space-y-4">
              <div className="rounded-sm border border-status-warn/40 bg-status-warn-bg/20 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-status-warn font-semibold">
                  <Icons.AlertTriangle size="sm" />
                  <span>Xavfsizlik va Audit Ogohlantirishi</span>
                </div>
                <p className="text-fg-muted leading-relaxed">
                  Yetkazilgan PIN-kod, vaucher yoki hisob ma'lumotlari maxfiy hisoblanadi.
                  Ushbu kalitni ko'rish amali administrator xavfsizlik <strong>Audit Log</strong>iga yoziladi.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button variant="secondary" size="sm" onClick={handleClose}>
                  Bekor qilish
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setHasConfirmedAuditWarning(true)}
                  className="gap-1.5"
                >
                  <Icons.Eye size="sm" />
                  <span>Kalitni ko'rish (Auditga yozish)</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Payload Display Screen */
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-fg-muted">
                  <Icons.Spinner size="md" className="animate-spin text-fg" />
                  <span className="text-xs font-medium">
                    Maxfiy kalit shifrlangan manbadan olinmoqda...
                  </span>
                </div>
              ) : error ? (
                <div className="rounded-sm border border-status-fail/40 bg-status-fail-bg/20 p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-status-fail font-semibold">
                    <Icons.AlertCircle size="sm" />
                    <span>Yuklashda xatolik</span>
                  </div>
                  <p className="text-fg-muted font-mono">
                    {error instanceof ApiError
                      ? error.status === 403
                        ? "Ruxsat etilmadi: Ushbu kalitni ko'rish huquqiga ega emassiz (Faqat Owner va Admin)."
                        : error.message
                      : "Kalitni yuklab bo'lmadi"}
                  </p>
                  {error instanceof ApiError && error.status !== 403 && (
                    <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-2">
                      Qayta urinish
                    </Button>
                  )}
                </div>
              ) : payloadData?.delivered_payload ? (
                <div className="space-y-3">
                  <div className="rounded-sm border border-hairline bg-canvas p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-fg-subtle font-medium">
                        Yetkazilgan ma'lumot (Payload):
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleCopy(
                            typeof payloadData.delivered_payload === "object"
                              ? JSON.stringify(payloadData.delivered_payload, null, 2)
                              : String(payloadData.delivered_payload)
                          )
                        }
                        className="gap-1.5 h-7 text-xs"
                      >
                        {copied ? <Icons.Check size="sm" className="text-status-ok" /> : <Icons.Copy size="sm" />}
                        <span>{copied ? "Nusxalandi" : "Nusxa olish"}</span>
                      </Button>
                    </div>

                    <pre className="text-xs font-mono bg-surface-2/60 p-2.5 rounded-xs overflow-x-auto text-fg max-h-48 select-all">
                      {JSON.stringify(payloadData.delivered_payload, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="rounded-sm border border-hairline bg-surface-2/30 p-4 text-center">
                  <p className="text-xs text-fg-subtle">
                    Ushbu buyurtmaga biriktirilgan maxsus kalit mavjud emas.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="secondary" size="sm" onClick={handleClose}>
                  Yopish
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
