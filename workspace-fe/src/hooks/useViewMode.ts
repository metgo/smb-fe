import { useState } from "react";

const MOBILE_BREAKPOINT = 768;

function readStoredViewMode<T extends TViewMode>(tableName?: string): T | null {
  if (!tableName || typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(tableName);
    return stored as T | null;
  } catch {
    return null;
  }
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Shared initializer for pages using `ViewModeToggle`. Respects a
 * previously persisted choice (saved by `ViewModeToggle` under
 * `tableName` in localStorage); otherwise defaults to "grid" on mobile
 * viewports and "list" everywhere else.
 */
export function useViewMode<T extends TViewMode = TViewMode>(
  tableName?: string,
  defaultMode: NoInfer<T> = "list" as T,
) {
  return useState<T>(
    () =>
      readStoredViewMode<T>(tableName) ??
      (isMobileViewport() ? ("grid" as T) : defaultMode),
  );
}
