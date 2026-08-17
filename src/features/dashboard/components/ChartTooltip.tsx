export interface ChartTooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
  unit?: string;
  isCurrency?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
  isCurrency = false,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xs border border-hairline bg-surface p-2.5 shadow-2 text-xs min-w-[140px] space-y-1.5 pointer-events-none">
      {label && (
        <div className="text-xs font-medium text-fg-subtle border-b border-hairline pb-1">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const val = Number(item.value) || 0;
          const formatted = isCurrency
            ? `${val.toLocaleString("uz-UZ")} so'm`
            : `${val.toLocaleString("uz-UZ")}${unit ? ` ${unit}` : ""}`;

          return (
            <div
              key={`${item.dataKey || item.name || index}`}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-1.5 text-fg-muted truncate">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </div>
              <span className="font-mono font-semibold text-fg tabular-nums shrink-0">
                {formatted}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
