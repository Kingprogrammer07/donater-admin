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
import { queryClient } from "@/lib/queryClient";
import { ApiError } from "@/api/errors";
import type { FailedJobOut } from "@/api/types";

export function QueueWorkerPanel() {
  const { success, error: toastError } = useToast();
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission("manage_settings");

  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  // Queue Query
  const {
    data: queue,
    isLoading: isQueueLoading,
    error: queueError,
    refetch: refetchQueue,
  } = useQuery({
    queryKey: ["system-queue"],
    queryFn: () => systemApi.getQueue(),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? false : 15000,
  });

  // Failed Jobs Query
  const {
    data: failedJobs = [],
    isLoading: isFailedLoading,
    refetch: refetchFailed,
  } = useQuery({
    queryKey: ["system-failed-jobs"],
    queryFn: () => systemApi.getFailedJobs(20),
    refetchInterval: () =>
      typeof document !== "undefined" && document.hidden ? false : 15000,
  });

  // Retry Failed Job Mutation
  const retryMutation = useMutation({
    mutationFn: async (jobId: string) => {
      setRetryingJobId(jobId);
      return systemApi.retryFailedJob(jobId);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["system-failed-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["system-queue"] });
      success(`Vazifa (${res.function}) qayta navbatga qo'shildi.`);
      setRetryingJobId(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Vazifani qayta yuborishda xatolik yuz berdi.");
      }
      setRetryingJobId(null);
    },
  });

  const isWorkerDown = queue ? !queue.worker_alive : false;
  const isQueueOverloaded = queue ? queue.queued > 100 : false;

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.Cpu size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-fg tracking-tight">
              Arq Navbat va Ishchi (Worker) Holati
            </h2>
            <p className="text-[12px] text-fg-subtle">
              Asinxron fonda bajariluvchi jarayonlar statistikasi
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            refetchQueue();
            refetchFailed();
          }}
          className="p-1.5 text-xs"
          title="Yangilash"
        >
          <Icons.Refresh size={12} />
        </Button>
      </div>

      {/* Critical Warnings */}
      {isWorkerDown && (
        <div className="p-3.5 rounded-xs border border-status-fail/40 bg-status-fail-bg/20 text-status-fail text-xs flex items-start gap-2.5">
          <Icons.AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              DIQQAT: Asinxron Ishchi (Worker) faol emas!
            </span>
            {/*  The liveness window is the server's (heartbeat TTL), not the
                panel's - so the banner reports the last signal rather than
                naming a number that would drift out of sync with it. */}
            <span className="text-[12px] block">
              {queue?.worker_seen_at ? (
                <>
                  Oxirgi signal: <DateTime value={queue.worker_seen_at} mode="relative" />.
                </>
              ) : (
                <>Worker hech qanday signal yubormagan.</>
              )}{" "}
              Buyurtmalarni yetkazib berish va ommaviy xabarnomalar to'xtab qolgan bo'lishi mumkin.
            </span>
          </div>
        </div>
      )}

      {isQueueOverloaded && (
        <div className="p-3 rounded-xs border border-status-warn/40 bg-status-warn-bg/20 text-status-warn text-xs flex items-center gap-2">
          <Icons.AlertCircle size={14} className="shrink-0" />
          <span>Navbatdagi vazifalar soni kritik darajada yuqori (&gt;100 ta).</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      {isQueueLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : queueError ? (
        <div className="p-3 rounded-xs border border-status-fail/30 text-status-fail text-xs">
          Navbat ma'lumotlarini olib bo'lmadi.
        </div>
      ) : queue ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Worker Alive */}
          <div className="p-3 rounded-xs border border-hairline bg-surface-2/40 space-y-1">
            <span className="text-[12px] text-fg-subtle block">Worker Holati:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full ${
                  queue.worker_alive ? "bg-status-ok" : "bg-status-fail"
                }`}
              />
              <span className="text-xs font-bold text-fg">
                {queue.worker_alive ? "Faol (Alive)" : "To'xtagan (Down)"}
              </span>
            </div>
            {queue.worker_seen_at && (
              <span className="text-[12px] text-fg-subtle block">
                Oxirgi signal: <DateTime value={queue.worker_seen_at} mode="relative" />
              </span>
            )}
          </div>

          {/* In Progress */}
          <div className="p-3 rounded-xs border border-hairline bg-surface-2/40 space-y-1">
            <span className="text-[12px] text-fg-subtle block">Bajarilmoqda:</span>
            <span className="text-lg font-bold font-mono text-brand block">
              {queue.in_progress}
            </span>
            <span className="text-[12px] text-fg-subtle block">Hozir ishlayotgan jarayonlar</span>
          </div>

          {/* Ready */}
          <div className="p-3 rounded-xs border border-hairline bg-surface-2/40 space-y-1">
            <span className="text-[12px] text-fg-subtle block">Tayyor vazifalar:</span>
            <span className="text-lg font-bold font-mono text-fg block">
              {queue.ready}
            </span>
            <span className="text-[12px] text-fg-subtle block">Ijro etilishini kutmoqda</span>
          </div>

          {/* Queued Total */}
          <div className="p-3 rounded-xs border border-hairline bg-surface-2/40 space-y-1">
            <span className="text-[12px] text-fg-subtle block">Jami navbatda:</span>
            <span className="text-lg font-bold font-mono text-fg block">
              {queue.queued}
            </span>
            <span className="text-[12px] text-fg-subtle block">
              {queue.deferred} ta kechiktirilgan
            </span>
          </div>
        </div>
      ) : null}

      {/* Failed Jobs List */}
      <div className="space-y-2 pt-2 border-t border-hairline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-fg">
            <Icons.XCircle size={13} className="text-status-fail" />
            <span>So'nggi 1 soatdagi xatoliklar (Failed Jobs):</span>
            <Badge
              variant={failedJobs.length > 0 ? "fail" : "ok"}
              styleType="subtle"
              className="text-[12px] font-mono ml-1"
            >
              {failedJobs.length} ta
            </Badge>
          </div>
        </div>

        {isFailedLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : failedJobs.length === 0 ? (
          <div className="p-3 rounded-xs border border-hairline bg-surface-2/30 text-xs text-fg-subtle flex items-center gap-2">
            <Icons.CheckCircle size={13} className="text-status-ok" />
            <span>Hech qanday xato vazifa qayd etilmagan (Barcha vazifalar muvaffaqiyatli).</span>
          </div>
        ) : (
          <div className="space-y-2 overflow-x-auto">
            {failedJobs.map((job: FailedJobOut) => (
              <div
                key={job.job_id}
                className="p-3 rounded-xs border border-status-fail/30 bg-surface-2/40 space-y-1.5 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-fg">
                        {job.function}
                      </span>
                      <span className="text-[12px] text-fg-subtle font-mono">
                        #{job.job_id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-[12px] text-status-fail font-mono break-all">
                      {job.error}
                    </p>
                  </div>

                  {canManageSettings && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => retryMutation.mutate(job.job_id)}
                      disabled={retryingJobId === job.job_id || retryMutation.isPending}
                      className="gap-1 text-xs shrink-0"
                    >
                      {retryingJobId === job.job_id ? (
                        <Icons.Spinner size={11} className="animate-spin" />
                      ) : (
                        <Icons.Refresh size={11} />
                      )}
                      <span>Qayta urinish</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[12px] text-fg-subtle pt-1 border-t border-hairline/60">
                  <span>Urinishlar: {job.attempts}</span>
                  {job.finished_at && (
                    <span>
                      Tugagan vaqti: <DateTime value={job.finished_at} mode="relative" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
