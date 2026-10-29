import { useEffect, useState } from "react";

export interface SectionDescriptor {
  id: string;
  label: string;
}

const ORDER_STORAGE_PREFIX = "dashboard_mock_section_order_";
const HIDDEN_STORAGE_PREFIX = "dashboard_mock_section_hidden_";

function readStoredOrder(role: string, defaultIds: string[]): string[] {
  try {
    const stored = localStorage.getItem(`${ORDER_STORAGE_PREFIX}${role}`);
    if (!stored) return defaultIds;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return defaultIds;

    // Keep only ids that still exist in the current defaults (drops stale
    // ids from a previous version of this page), then append any new ids
    // that weren't in the stored order yet, in their default position.
    const known = new Set(defaultIds);
    const kept = parsed.filter(
      (id): id is string => typeof id === "string" && known.has(id),
    );
    const missing = defaultIds.filter((id) => !kept.includes(id));
    return [...kept, ...missing];
  } catch {
    // localStorage unavailable (e.g. privacy mode) — fall back to default.
    return defaultIds;
  }
}

function readStoredHidden(role: string, defaultIds: string[]): Set<string> {
  try {
    const stored = localStorage.getItem(`${HIDDEN_STORAGE_PREFIX}${role}`);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return new Set();

    // Drop ids that no longer exist in the current defaults.
    const known = new Set(defaultIds);
    return new Set(
      parsed.filter(
        (id): id is string => typeof id === "string" && known.has(id),
      ),
    );
  } catch {
    return new Set();
  }
}

/**
 * Drives a user-customizable section order and per-section visibility for
 * one role dashboard, persisted to localStorage per role so switching roles
 * in the demo RoleSwitcher keeps each role's own saved layout.
 */
export function useSectionOrder(role: string, sections: SectionDescriptor[]) {
  const defaultIds = sections.map((s) => s.id);
  const orderStorageKey = `${ORDER_STORAGE_PREFIX}${role}`;
  const hiddenStorageKey = `${HIDDEN_STORAGE_PREFIX}${role}`;

  const [order, setOrder] = useState<string[]>(() =>
    readStoredOrder(role, defaultIds),
  );
  const [hidden, setHidden] = useState<Set<string>>(() =>
    readStoredHidden(role, defaultIds),
  );

  // Re-sync when switching to a different role's dashboard.
  useEffect(() => {
    setOrder(readStoredOrder(role, defaultIds));
    setHidden(readStoredHidden(role, defaultIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    try {
      localStorage.setItem(orderStorageKey, JSON.stringify(order));
    } catch {
      // ignore storage failures in the demo customizer
    }
  }, [order, orderStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(hiddenStorageKey, JSON.stringify([...hidden]));
    } catch {
      // ignore storage failures in the demo customizer
    }
  }, [hidden, hiddenStorageKey]);

  const moveSection = (dragIndex: number, hoverIndex: number) => {
    setOrder((prev) => {
      if (
        dragIndex < 0 ||
        hoverIndex < 0 ||
        dragIndex >= prev.length ||
        hoverIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, moved);
      return next;
    });
  };

  const toggleSectionVisibility = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetOrder = () => {
    setOrder(defaultIds);
    setHidden(new Set());
  };

  const orderedSections = order
    .map((id) => sections.find((s) => s.id === id))
    .filter((s): s is SectionDescriptor => Boolean(s));

  const visibleSections = orderedSections.filter((s) => !hidden.has(s.id));

  return {
    order,
    orderedSections,
    visibleSections,
    hidden,
    moveSection,
    toggleSectionVisibility,
    resetOrder,
  };
}
