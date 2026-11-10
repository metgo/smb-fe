import { useEffect, useRef, useState } from "react";

/**
 * A useState that mirrors its value into localStorage under `key`, restoring it
 * on mount. Used to keep a page's applied filters + search keyword persistent
 * across reloads and navigation.
 *
 * An empty string / empty object isn't special-cased — whatever the current
 * value is, that's what's stored — so a cleared filter also persists as cleared.
 */
export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return defaultValue;
      const parsed = JSON.parse(raw) as T;
      // Merge onto defaults so a stored object from an older shape still gets
      // any newly-added keys.
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        defaultValue &&
        typeof defaultValue === "object" &&
        !Array.isArray(defaultValue)
      ) {
        return { ...(defaultValue as object), ...(parsed as object) } as T;
      }
      return parsed;
    } catch {
      return defaultValue;
    }
  });

  // Skip the very first write so mounting doesn't churn storage needlessly.
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to persist "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
