import { type HTMLAttributes } from "react";

export interface DateTimeProps extends HTMLAttributes<HTMLTimeElement> {
  value: string | Date | null | undefined;
  mode?: "relative" | "absolute" | "both";
  includeSeconds?: boolean;
}

/**
 * Format ISO date string into Tashkent timezone date/time and relative Uzbek string.
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  options: { mode?: "relative" | "absolute" | "both"; includeSeconds?: boolean } = {}
): { absolute: string; relative: string; full: string; iso: string } {
  if (!value) {
    return { absolute: "—", relative: "—", full: "—", iso: "" };
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) {
    return { absolute: "Noto'g'ri sana", relative: "—", full: "—", iso: "" };
  }

  const iso = date.toISOString();

  // Format absolute in Asia/Tashkent
  const formatter = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: options.includeSeconds ? "2-digit" : undefined,
    hour12: false,
  });

  const fullFormatter = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const absolute = formatter.format(date);
  const full = `${fullFormatter.format(date)} (Toshkent vaqti)`;

  // Relative calculation
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  let relative = "";
  if (diffSec < 45) {
    relative = "hozirgina";
  } else if (diffMin < 60) {
    relative = `${diffMin} daqiqa oldin`;
  } else if (diffHour < 24) {
    relative = `${diffHour} soat oldin`;
  } else if (diffDay === 1) {
    relative = "kecha";
  } else if (diffDay < 7) {
    relative = `${diffDay} kun oldin`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    relative = `${weeks} hafta oldin`;
  } else {
    relative = absolute;
  }

  return { absolute, relative, full, iso };
}

export function DateTime({
  value,
  mode = "relative",
  includeSeconds = false,
  className = "",
  ...props
}: DateTimeProps) {
  const { absolute, relative, full, iso } = formatDateTime(value, { mode, includeSeconds });

  let display = relative;
  if (mode === "absolute") {
    display = absolute;
  } else if (mode === "both") {
    display = `${relative} (${absolute})`;
  }

  return (
    <time
      dateTime={iso}
      title={full}
      className={`font-mono text-xs tabular-nums text-fg-muted hover:text-fg transition-colors cursor-help inline-block ${className}`}
      {...props}
    >
      {display}
    </time>
  );
}
