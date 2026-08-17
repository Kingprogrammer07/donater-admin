import { useEffect, useState } from "react";

/**
 * Value that settles `delayMs` after the last change.
 *
 * Used as a query key so a form that fires a request per keystroke fires one
 * per pause instead. The debounced value trails the live one, so render the
 * live value in inputs and the debounced value in the fetch.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
}
