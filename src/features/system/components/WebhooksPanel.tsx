import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { systemApi } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/api/errors";
import type { WebhookDeliveryOut, WebhookTestOut } from "@/api/types";

export function WebhooksPanel() {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const [testResult, setTestResult] = useState<WebhookTestOut | null>(null);
  const [copied, setCopied] = useState(false);

  // Webhooks Query
  const {
    data: webhooks,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["system-webhooks"],
    queryFn: () => systemApi.getWebhooks(20),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? false : 15000,
  });

  // Test Webhook Mutation
  const testMutation = useMutation({
    mutationFn: async () => {
      return systemApi.testWebhook();
    },
    onSuccess: (res) => {
      setTestResult(res);
      if (res.delivered) {
        success("Test webhook muvaffaqiyatli qabul qilindi!");
      } else {
        toastError(`Test webhook yetib bormadi: ${res.error || "Server xatosi"}`);
      }
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Test webhook jo'natishda xatolik yuz berdi.");
      }
    },
  });

  const handleCopyUrl = () => {
    if (webhooks?.url) {
      navigator.clipboard.writeText(webhooks.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deliveries = webhooks?.deliveries || [];

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.Radio size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-fg tracking-tight">
              FazerCards Webhook Integratsiyasi
            </h2>
            <p className="text-[12px] text-fg-subtle">
              Tashqi provayderdan keluvchi hodisalar (callbacks) va imzo nazorati
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canManageSettings && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              className="gap-1.5 text-xs font-semibold"
            >
              {testMutation.isPending ? (
                <Icons.Spinner size={12} className="animate-spin" />
              ) : (
                <Icons.Send size={12} />
              )}
              <span>Test Webhook</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 text-xs"
            title="Yangilash"
          >
            <Icons.Refresh size={12} className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xs border border-status-fail/40 bg-status-fail-bg/20 text-status-fail text-xs">
          Webhook holatini yuklab bo'lmadi.
        </div>
      ) : webhooks ? (
        <div className="space-y-4">
          {/* URL & Secret Status */}
          <div className="p-3.5 rounded-xs border border-hairline bg-surface-2/40 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-fg-subtle">
                FazerCards Panelida kiritilishi kerak bo'lgan URL:
              </span>

              <div className="flex items-center gap-1.5">
                <Badge
                  variant={webhooks.secret_configured ? "ok" : "warn"}
                  styleType="subtle"
                  className="text-[12px] gap-1"
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      webhooks.secret_configured ? "bg-status-ok" : "bg-status-warn"
                    }`}
                  />
                  <span>
                    {webhooks.secret_configured
                      ? "HMAC Imzo Kaliti Sozlangan"
                      : "Imzo Kaliti Sozlanmagan"}
                  </span>
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-1.5 rounded-xs border border-hairline bg-canvas font-mono text-xs text-fg select-all truncate">
                {webhooks.url}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyUrl}
                className="gap-1 text-xs shrink-0"
              >
                {copied ? <Icons.Check size={12} /> : <Icons.Copy size={12} />}
                <span>{copied ? "Nusxalandi" : "Nusxalash"}</span>
              </Button>
            </div>
          </div>

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`p-3 rounded-xs border text-xs space-y-1.5 ${
                testResult.delivered
                  ? "border-status-ok/40 bg-status-ok-bg/20 text-fg"
                  : "border-status-fail/40 bg-status-fail-bg/20 text-status-fail"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  {testResult.delivered ? (
                    <Icons.CheckCircle size={14} className="text-status-ok" />
                  ) : (
                    <Icons.XCircle size={14} className="text-status-fail" />
                  )}
                  <span>
                    {testResult.delivered
                      ? `Test hodisasi yetib keldi (Status: ${testResult.status_code})`
                      : "Test hodisasi yetib bormadi"}
                  </span>
                </div>

                <button
                  onClick={() => setTestResult(null)}
                  className="text-fg-subtle hover:text-fg text-[12px]"
                >
                  Yopish
                </button>
              </div>

              {testResult.body && (
                <div className="p-2 rounded-xs bg-surface border border-hairline font-mono text-[12px] text-fg-muted truncate">
                  Javob: {testResult.body}
                </div>
              )}

              {testResult.error && (
                <div className="p-2 rounded-xs bg-surface border border-hairline font-mono text-[12px] text-status-fail">
                  Xato: {testResult.error}
                </div>
              )}
            </div>
          )}

          {/* Deliveries Table */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fg">
                So'nggi qabul qilingan Webhook hodisalari ({deliveries.length}):
              </span>
            </div>

            {deliveries.length === 0 ? (
              <div className="p-4 rounded-xs border border-hairline bg-surface-2/30 text-xs text-fg-subtle text-center">
                Hozircha hech qanday webhook hodisasi kelib tushmagan.
              </div>
            ) : (
              <div className="border border-hairline rounded-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-hairline bg-surface-2/60 text-fg-subtle text-[12px]">
                      <th className="p-2.5 font-medium">Hodisa (Event)</th>
                      <th className="p-2.5 font-medium">Manba</th>
                      <th className="p-2.5 font-medium">Buyurtma ID</th>
                      <th className="p-2.5 font-medium text-right">Qabul qilindi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {deliveries.map((d: WebhookDeliveryOut) => (
                      <tr key={d.id} className="hover:bg-surface-2/40 transition-colors">
                        <td className="p-2.5 font-mono font-medium text-fg">
                          <span
                            className={
                              d.event.includes("completed")
                                ? "text-status-ok"
                                : d.event.includes("failed")
                                ? "text-status-fail"
                                : "text-fg"
                            }
                          >
                            {d.event}
                          </span>
                        </td>
                        <td className="p-2.5 text-fg-subtle capitalize">{d.source}</td>
                        <td className="p-2.5 font-mono text-fg">
                          {d.order_id ? `#${d.order_id}` : "—"}
                        </td>
                        <td className="p-2.5 text-right text-fg-subtle">
                          <DateTime value={d.received_at} mode="relative" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
