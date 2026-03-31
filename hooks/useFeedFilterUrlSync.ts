"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useGeneralStore from "@/stores/generalStore";

const DEFAULT_SERVICE_TYPES = ["event", "business", "funday", "trip"];

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/**
 * Syncs the feed filter state (Zustand store) ↔ URL search params.
 *
 * - On mount: reads URL params and initialises the store.
 * - After init: syncs every filter change back to the URL (router.replace, no scroll / history entry).
 * - On URL load: restores selectedSiteCategories once presetFeedFilters is available.
 *
 * Uses `syncReady` (useState) – not a ref – so React StrictMode's double-invocation
 * resets the flag correctly and prevents the sync from running with a stale closure
 * before the init effect has populated the store.
 */
export function useFeedFilterUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // useState so StrictMode double-mount resets this to false on the second mount,
  // preventing the sync effect from running with stale DEFAULT state.
  const [syncReady, setSyncReady] = useState(false);

  // Ensures we only restore categories from the URL once per mount
  const categoriesRestored = useRef(false);

  const {
    feedFilterState,
    feedSearchKeyword,
    selectedSiteCategories,
    presetFeedFilters,
    setFeedSearchKeyword,
    setFeedFilterState,
    setSelectedSiteCategories,
    resetFeedFilters,
  } = useGeneralStore();

  // ── 1. Initialise store from URL on mount ─────────────────────────────────
  useEffect(() => {
    const urlServiceTypes = searchParams
      .get("serviceTypes")
      ?.split(",")
      .filter(Boolean);
    const urlAccessibilityIds =
      searchParams.get("accessibilityIds")?.split(",").filter(Boolean) ?? [];
    const urlGroupTypeIds =
      searchParams.get("groupTypeIds")?.split(",").filter(Boolean) ?? [];
    const urlSearch = searchParams.get("search") ?? "";

    const hasUrlFilters =
      searchParams.has("serviceTypes") ||
      urlAccessibilityIds.length > 0 ||
      urlGroupTypeIds.length > 0 ||
      urlSearch.length > 0 ||
      searchParams.has("categories");

    if (hasUrlFilters) {
      setFeedFilterState({
        serviceTypes: urlServiceTypes ?? DEFAULT_SERVICE_TYPES,
        accessibilityIds: urlAccessibilityIds,
        groupTypeIds: urlGroupTypeIds,
        categoryIds: [],
        subCategoryIds: [],
      });
      if (urlSearch) setFeedSearchKeyword(urlSearch);
    } else {
      resetFeedFilters();
    }

    // Signal that init is done — batched with the store update in React 18.
    // Because this is useState (not useRef), StrictMode resets it to false
    // on the second double-mount invocation, keeping the sync effect paused
    // until init finishes again.
    setSyncReady(true);
  }, []);

  // ── 2. Restore selectedSiteCategories once presetFeedFilters is available ─
  useEffect(() => {
    if (categoriesRestored.current) return;

    // initialSiteConfig has _id: "" — skip until real data arrives.
    if (!presetFeedFilters?._id) return;

    const urlCategories =
      searchParams.get("categories")?.split(",").filter(Boolean) ?? [];

    // Mark restoration as attempted regardless of matches so effect #3
    // can eventually clean up a stale ?categories param when no match exists.
    categoriesRestored.current = true;

    if (urlCategories.length === 0) return;

    const allCategories =
      presetFeedFilters?.siteTopics?.flatMap((t: any) => t.siteCategories) ??
      [];

    const matched = urlCategories
      .map((title) => allCategories.find((c: any) => c.title === title))
      .filter(Boolean) as ISiteCategory[];

    if (matched.length > 0) {
      setSelectedSiteCategories(matched);
    }
  }, [presetFeedFilters]);

  // ── 3. Sync store → URL whenever filters change ───────────────────────────
  useEffect(() => {
    // Do not sync until after the init effect has applied URL state to the store.
    // syncReady is useState so StrictMode correctly resets it between double-mounts.
    if (!syncReady) return;

    const params = new URLSearchParams(searchParams.toString());

    // serviceTypes: omit from URL when equal to the default set (clean URLs)
    if (!arraysEqual(feedFilterState.serviceTypes, DEFAULT_SERVICE_TYPES)) {
      if (feedFilterState.serviceTypes.length > 0) {
        params.set("serviceTypes", feedFilterState.serviceTypes.join(","));
      } else {
        params.delete("serviceTypes");
      }
    } else {
      params.delete("serviceTypes");
    }

    if (feedFilterState.accessibilityIds.length > 0) {
      params.set(
        "accessibilityIds",
        feedFilterState.accessibilityIds.join(","),
      );
    } else {
      params.delete("accessibilityIds");
    }

    if (feedFilterState.groupTypeIds.length > 0) {
      params.set("groupTypeIds", feedFilterState.groupTypeIds.join(","));
    } else {
      params.delete("groupTypeIds");
    }

    if (feedSearchKeyword.trim()) {
      params.set("search", feedSearchKeyword.trim());
    } else {
      params.delete("search");
    }

    if (selectedSiteCategories.length > 0) {
      params.set(
        "categories",
        selectedSiteCategories.map((c) => c.title).join(","),
      );
    } else if (categoriesRestored.current) {
      // Only remove categories from the URL after we've confirmed the restore
      // was attempted with real presetFeedFilters data. Without this guard,
      // effect #3 would prematurely delete the param (because selectedSiteCategories
      // is still [] on first run), causing effect #2 to miss it when filters load.
      params.delete("categories");
    }
    // else: presetFeedFilters not yet loaded — leave categories param in URL as-is

    const newSearch = params.toString();
    if (newSearch !== searchParams.toString()) {
      router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, {
        scroll: false,
      });
    }
  }, [syncReady, feedFilterState, feedSearchKeyword, selectedSiteCategories]);
}
