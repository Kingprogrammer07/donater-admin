import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import type { BroadcastStatus } from "@/api/types";

export interface BroadcastStatusBadgeProps {
  status: BroadcastStatus | string;
  className?: string;
}

//  One place, because the drawer header and the table both name the status and
//  the raw enum ("FINISHED") is not something an operator should ever read.
export const BROADCAST_STATUS_LABELS: Record<BroadcastStatus, string> = {
  draft: "Qoralama",
  scheduled: "Rejalashtirilgan",
  running: "Yuborilmoqda",
  finished: "Yakunlandi",
  cancelled: "Bekor qilindi",
};

export function broadcastStatusLabel(status: BroadcastStatus | string): string {
  return BROADCAST_STATUS_LABELS[status as BroadcastStatus] ?? status;
}

export function BroadcastStatusBadge({ status, className = "" }: BroadcastStatusBadgeProps) {
  switch (status) {
    case "draft":
      return (
        <Badge variant="neutral" styleType="subtle" className={`text-xs gap-1 font-medium ${className}`}>
          <span>⚪</span>
          <span>{BROADCAST_STATUS_LABELS.draft}</span>
        </Badge>
      );
    case "scheduled":
      return (
        <Badge variant="warn" styleType="subtle" className={`text-xs gap-1 font-medium ${className}`}>
          <Icons.Clock size={11} />
          <span>{BROADCAST_STATUS_LABELS.scheduled}</span>
        </Badge>
      );
    case "running":
      return (
        <Badge variant="brand" styleType="subtle" className={`text-xs gap-1.5 font-semibold ${className}`}>
          <span className="size-1.5 rounded-full bg-brand animate-pulse" />
          <span>{BROADCAST_STATUS_LABELS.running}...</span>
        </Badge>
      );
    case "finished":
      return (
        <Badge variant="ok" styleType="subtle" className={`text-xs gap-1 font-medium ${className}`}>
          <Icons.CheckCircle size={11} />
          <span>{BROADCAST_STATUS_LABELS.finished}</span>
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="fail" styleType="subtle" className={`text-xs gap-1 font-medium ${className}`}>
          <Icons.XCircle size={11} />
          <span>{BROADCAST_STATUS_LABELS.cancelled}</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" styleType="subtle" className={`text-xs font-mono ${className}`}>
          {status}
        </Badge>
      );
  }
}
