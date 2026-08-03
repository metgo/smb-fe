import { useState, useCallback, useEffect, useMemo } from "react";

const FILTER_STORAGE_KEY = "poi_mgmt_filters";
const SEARCH_STORAGE_KEY = "poi_mgmt_search";

export interface PoiFilters {
  status: string;
  dmoFilter: "all" | "unassigned";
  authorityFilter: "all" | "unassigned";
}

const defaultFilters: PoiFilters = {
  status: "all",
  dmoFilter: "all",
  authorityFilter: "all",
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function usePoiFilters() {
  const [filters, setFilters] = useState<PoiFilters>(() => ({
    ...defaultFilters,
    ...readStorage(FILTER_STORAGE_KEY, defaultFilters),
  }));

  const [searchTerm, setSearchTerm] = useState<string>(() =>
    readStorage(SEARCH_STORAGE_KEY, ""),
  );

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Failed to save filters:", error);
    }
  }, [filters]);

  useEffect(() => {
    try {
      if (searchTerm.trim()) {
        localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(searchTerm));
      } else {
        localStorage.removeItem(SEARCH_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save search term:", error);
    }
  }, [searchTerm]);

  const clearFilter = useCallback(() => {
    setFilters(defaultFilters);
    setSearchTerm("");
    try {
      localStorage.removeItem(FILTER_STORAGE_KEY);
      localStorage.removeItem(SEARCH_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }, []);

  const hasSavedFilters = useMemo(
    () =>
      filters.status !== "all" ||
      filters.dmoFilter !== "all" ||
      filters.authorityFilter !== "all" ||
      searchTerm.trim() !== "",
    [filters, searchTerm],
  );

  return {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilter,
    hasSavedFilters,
  };
}
