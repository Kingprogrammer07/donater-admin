import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/client";
import { Money } from "@/components/ui/money";
import { DateTime } from "@/components/ui/datetime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import type { LedgerEntryOut } from "@/api/types";

export interface UserLedgerTabProps {
  userId: number;
}

function getKindBadge(kind: string) {
  switch (kind) {
    case "topup":
      return (
        <Badge variant="ok" styleType="subtle" className="text-xs">
          To'ldirish
        </Badge>
      );
    case "order_hold":
      return (
        <Badge variant="warn" styleType="subtle" className="text-xs">
          Buyurtma ushlanishi
        </Badge>
      );
    case "order_refund":
      return (
        <Badge variant="neutral" styleType="subtle" className="text-xs">
          Qaytarilgan mablag'
        </Badge>
      );
    case "admin_adjust":
      return (
        <Badge variant="brand" styleType="subtle" className="text-xs">
          Admin tuzatishi
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" styleType="subtle" className="text-xs font-mono uppercase">
          {kind}
        </Badge>
      );
  }
}

export function UserLedgerTab({ userId }: UserLedgerTabProps) {
  const [cursor, setCursor] = useState<number | null>(null);

  const {
    data: ledgerPage,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-ledger", userId, cursor],
    queryFn: () => usersApi.getUserLedger(userId, { before_id: cursor, limit: 15 }),
    enabled: Boolean(userId),
  });

  const items = ledgerPage?.items || [];
  const hasMore = ledgerPage?.has_more || false;
  const nextCursor = ledgerPage?.next_cursor;

  if (isLoading && !cursor) {
    return (
      <div className="space-y-3 p-1">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center rounded-sm border border-hairline bg-surface space-y-3">
        <Icons.AlertTriangle size="md" className="text-status-fail mx-auto" />
        <p className="text-xs text-status-fail font-mono">
          {error instanceof Error ? error.message : "Ledger tarixini yuklab bo'lmadi"}
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Qayta urinish
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center rounded-sm border border-hairline bg-surface space-y-2">
        <Icons.Activity size="md" className="text-fg-subtle mx-auto" />
        <h4 className="text-xs font-semibold text-fg">Tranzaksiyalar mavjud emas</h4>
        <p className="text-xs text-fg-subtle">
          Ushbu foydalanuvchi hisobida hozircha hech qanday balans harakati qayd etilmagan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
          <Icons.Activity size="sm" className="text-fg-muted" />
          <span>Balans operatsiyalari (Ledger)</span>
        </span>
        <span className="text-xs text-fg-subtle">
          {items.length} ta yozuv ko'rsatilmoqda
        </span>
      </div>

      <div className="space-y-2">
        {items.map((entry: LedgerEntryOut) => {
          const amountNum = Number(entry.amount_uzs);
          const isPositive = amountNum > 0;

          return (
            <div
              key={entry.id}
              className="p-3 rounded-xs border border-hairline bg-surface hover:bg-surface-2/40 transition-colors space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {getKindBadge(entry.kind)}
                  <span className="font-mono text-fg-subtle text-xs">
                    #{entry.id}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span
                    className={`font-semibold ${
                      isPositive ? "text-status-ok" : "text-status-fail"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                  </span>
                  <Money
                    amount={entry.amount_uzs}
                    currency="UZS"
                    className={`font-bold ${
                      isPositive ? "text-status-ok" : "text-status-fail"
                    }`}
                  />
                </div>
              </div>

              {/* Detail row: Balance after, reference, comment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-hairline/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-fg-subtle">
                    <span>So'nggi balans:</span>
                    <Money
                      amount={entry.balance_after}
                      currency="UZS"
                      className="font-medium text-fg"
                    />
                  </div>
                  {entry.ref_type && entry.ref_id && (
                    <span className="text-fg-subtle block font-mono text-xs">
                      Manba: {entry.ref_type} #{entry.ref_id}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 sm:text-right">
                  {entry.comment && (
                    <p className="text-fg font-medium truncate" title={entry.comment}>
                      {entry.comment}
                    </p>
                  )}
                  <DateTime
                    value={entry.created_at}
                    mode="relative"
                    className="text-fg-subtle block text-xs"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="pt-2 text-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (nextCursor) setCursor(nextCursor);
            }}
            disabled={isLoading}
            className="w-full text-xs"
          >
            {isLoading ? (
              <Icons.Spinner size="sm" className="animate-spin" />
            ) : (
              "Ko'proq yuklash"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
