import { type HTMLAttributes } from "react";

export interface MoneyProps extends HTMLAttributes<HTMLSpanElement> {
  amount: string | number | null | undefined;
  currency?: "UZS" | "USD" | string;
  showSign?: boolean;
  colored?: boolean;
  align?: "left" | "right" | "center";
}

/**
 * Format monetary amount safely without parseFloat loss.
 * Supports string "125000.00", "125000", numbers, negative values.
 */
export function formatMoneyString(
  amount: string | number | null | undefined,
  currency: string = "UZS"
): { formatted: string; isNegative: boolean; isPositive: boolean; isZero: boolean } {
  if (amount === null || amount === undefined || amount === "") {
    return { formatted: "0 so'm", isNegative: false, isPositive: false, isZero: true };
  }

  const rawStr = String(amount).trim();
  const isNegative = rawStr.startsWith("-");
  const cleanStr = isNegative ? rawStr.slice(1) : rawStr.startsWith("+") ? rawStr.slice(1) : rawStr;

  // Split integer and fraction without converting to IEEE-754 float
  const [intPart = "0", fracPart] = cleanStr.split(".");
  const sanitizedInt = intPart.replace(/\D/g, "") || "0";

  // Group integer with spaces / commas
  const groupedInt = sanitizedInt.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Handle fraction (preserve up to 2 decimal places if present and non-zero)
  let fractionFormatted = "";
  if (fracPart !== undefined) {
    const cleanFrac = fracPart.replace(/\D/g, "").slice(0, 2);
    if (cleanFrac && cleanFrac !== "00" && cleanFrac !== "0") {
      fractionFormatted = `.${cleanFrac}`;
    }
  }

  const isZero = sanitizedInt === "0" && (!fractionFormatted || fractionFormatted === ".00");
  const isPositive = !isNegative && !isZero;

  const numWithSign = `${isNegative ? "-" : ""}${groupedInt}${fractionFormatted}`;

  let fullFormatted = numWithSign;
  if (currency === "UZS") {
    fullFormatted = `${numWithSign} so'm`;
  } else if (currency === "USD") {
    fullFormatted = `$${numWithSign}`;
  } else if (currency) {
    fullFormatted = `${numWithSign} ${currency}`;
  }

  return {
    formatted: fullFormatted,
    isNegative,
    isPositive,
    isZero,
  };
}

export function Money({
  amount,
  currency = "UZS",
  showSign = false,
  colored = false,
  align = "right",
  className = "",
  ...props
}: MoneyProps) {
  const { formatted, isNegative, isPositive, isZero } = formatMoneyString(amount, currency);

  let signPrefix = "";
  if (showSign && !isZero) {
    if (isPositive) signPrefix = "+";
  }

  let colorClass = "text-fg";
  if (colored && !isZero) {
    if (isPositive) colorClass = "text-status-ok";
    else if (isNegative) colorClass = "text-status-fail";
  }

  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <span
      className={`font-mono tabular-nums tracking-tight font-medium ${alignClass} ${colorClass} ${className}`}
      {...props}
    >
      {signPrefix}
      {formatted}
    </span>
  );
}
