import { Badge } from "@/components/ui/badge";

export interface AuditDiffViewerProps {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

const SECRET_KEY_PATTERN = /(token|secret|key|password|hash|api_key|auth)/i;

function maskSecret(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (SECRET_KEY_PATTERN.test(key) && typeof value === "string" && value.length > 0) {
    return "••••••••";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 1);
  }
  return String(value);
}

export function AuditDiffViewer({ before, after }: AuditDiffViewerProps) {
  if (!before && !after) {
    return (
      <div className="p-2 text-[12px] text-fg-subtle italic">
        Qo'shimcha ma'lumotlar mavjud emas.
      </div>
    );
  }

  const allKeys = Array.from(
    new Set([...Object.keys(before || {}), ...Object.keys(after || {})])
  );

  return (
    <div className="p-3 rounded-xs border border-hairline bg-surface space-y-2 text-xs">
      <div className="flex items-center justify-between pb-1 border-b border-hairline/60">
        <span className="font-semibold text-fg text-[12px]">
          O'zgarishlar Tafsiloti (Before / After Diff):
        </span>
        <Badge variant="neutral" styleType="subtle" className="text-[12px]">
          {allKeys.length} ta parametr
        </Badge>
      </div>

      <div className="divide-y divide-hairline/40">
        {allKeys.map((key) => {
          const beforeVal = before ? before[key] : undefined;
          const afterVal = after ? after[key] : undefined;

          const isChanged = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);
          const isAdded = beforeVal === undefined && afterVal !== undefined;
          const isRemoved = beforeVal !== undefined && afterVal === undefined;

          const formattedBefore = maskSecret(key, beforeVal);
          const formattedAfter = maskSecret(key, afterVal);

          return (
            <div
              key={key}
              className={`py-2 px-1 grid grid-cols-1 sm:grid-cols-3 gap-2 items-start font-mono text-[12px] ${
                isChanged ? "bg-brand-muted/10 rounded-xs" : ""
              }`}
            >
              <div className="font-bold text-fg break-all flex items-center gap-1">
                <span>{key}</span>
                {isAdded && (
                  <Badge variant="ok" styleType="subtle" className="text-[12px]">
                    + yangi
                  </Badge>
                )}
                {isRemoved && (
                  <Badge variant="fail" styleType="subtle" className="text-[12px]">
                    - o'chirildi
                  </Badge>
                )}
              </div>

              {/* Before Value */}
              <div className="text-fg-subtle break-all">
                <span className="text-[12px] text-fg-subtle uppercase block font-sans">
                  Oldingi:
                </span>
                <span className={isChanged ? "line-through text-status-fail" : ""}>
                  {formattedBefore}
                </span>
              </div>

              {/* After Value */}
              <div className="text-fg break-all">
                <span className="text-[12px] text-fg-subtle uppercase block font-sans">
                  Yangi:
                </span>
                <span className={isChanged ? "font-bold text-status-ok" : ""}>
                  {formattedAfter}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
