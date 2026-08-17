import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icons } from "@/components/icons";

export type ToastType = "success" | "error" | "warn" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  requestId?: string;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  requestId?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (type: ToastType, message: string, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warn: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions): string => {
      const id = "toast-" + Math.random().toString(36).slice(2, 9);
      const duration = options?.duration ?? 4000;

      const newToast: ToastItem = {
        id,
        type,
        title: options?.title,
        message,
        requestId: options?.requestId,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const success = useCallback((msg: string, opt?: ToastOptions) => addToast("success", msg, opt), [addToast]);
  const error = useCallback((msg: string, opt?: ToastOptions) => addToast("error", msg, opt), [addToast]);
  const warn = useCallback((msg: string, opt?: ToastOptions) => addToast("warn", msg, opt), [addToast]);
  const info = useCallback((msg: string, opt?: ToastOptions) => addToast("info", msg, opt), [addToast]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      toast: addToast,
      success,
      error,
      warn,
      info,
      dismiss,
    }),
    [toasts, addToast, success, error, warn, info, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      tabIndex={-1}
      className="fixed bottom-4 right-4 z-1000 flex flex-col gap-2 max-w-[400px] w-full px-4 pointer-events-none sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopyRequestId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!toast.requestId) return;
    navigator.clipboard.writeText(toast.requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeConfig: Record<
    ToastType,
    { icon: React.ReactNode; border: string; bg: string; text: string }
  > = {
    success: {
      icon: <Icons.CheckCircle size="sm" className="text-status-ok mt-0.5 shrink-0" />,
      border: "border-status-ok/30",
      bg: "bg-surface",
      text: "text-fg",
    },
    error: {
      icon: <Icons.AlertCircle size="sm" className="text-status-fail mt-0.5 shrink-0" />,
      border: "border-status-fail/30",
      bg: "bg-surface",
      text: "text-fg",
    },
    warn: {
      icon: <Icons.AlertTriangle size="sm" className="text-status-warn mt-0.5 shrink-0" />,
      border: "border-status-warn/30",
      bg: "bg-surface",
      text: "text-fg",
    },
    info: {
      icon: <Icons.HelpCircle size="sm" className="text-brand mt-0.5 shrink-0" />,
      border: "border-hairline",
      bg: "bg-surface",
      text: "text-fg",
    },
  };

  const config = typeConfig[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      tabIndex={-1}
      role="status"
      className={`pointer-events-auto rounded-md border ${config.border} ${config.bg} p-3.5 shadow-2 flex items-start gap-3 w-full`}
    >
      {config.icon}
      <div className="flex-1 min-w-0 space-y-1">
        {toast.title && <div className="text-xs font-semibold text-fg">{toast.title}</div>}
        <p className="text-xs leading-relaxed text-fg-muted break-words">{toast.message}</p>

        {toast.requestId && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-mono text-fg-subtle">
              Req ID: {toast.requestId.slice(0, 8)}...
            </span>
            <button
              onClick={handleCopyRequestId}
              className="text-xs font-medium text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Icons.Copy size="sm" className="size-3" />
              {copied ? "Nusxalandi" : "ID nusxalash"}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="text-fg-subtle hover:text-fg p-1 rounded-sm transition-colors cursor-pointer shrink-0"
        aria-label="Xabarni yopish"
      >
        <Icons.X size="sm" className="size-3.5" />
      </button>
    </motion.div>
  );
}
