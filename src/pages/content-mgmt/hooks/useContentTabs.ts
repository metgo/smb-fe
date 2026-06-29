import { useState, useCallback, useEffect } from "react";

export interface Filters {
  hasProductFilter: string;
  primaryCategory: string;
  businessId: string;
  registrationFilter: string;
  eventTypeFilter: string;
  dateRangeFilter: { start: string; end: string };
  isTrip: string;
  assignmentStatus: string;
  viewCategory: string;
  sortOrder: string;
}

export interface TabState {
  searchQuery: string;
  filters: Filters;
}

const ALL_TABS = ["Businesses", "Products", "Trips", "Events", "POI"] as const;

export const defaultTabState: TabState = {
  searchQuery: "",
  filters: {
    hasProductFilter: "all",
    primaryCategory: "all",
    businessId: "",
    registrationFilter: "",
    eventTypeFilter: "",
    dateRangeFilter: { start: "", end: "" },
    isTrip: "all",
    assignmentStatus: "all",
    viewCategory: "all",
    sortOrder: "recent",
  },
};

const makeInitialTabState = (): Record<string, TabState> =>
  Object.fromEntries(
    ALL_TABS.map((tab) => [
      tab,
      { ...defaultTabState, filters: { ...defaultTabState.filters } },
    ]),
  );

export function useContentTabs(externalApiId: string | null) {
  const [selected, setSelected] = useState<string>("Businesses");
  const [tabState, setTabState] =
    useState<Record<string, TabState>>(makeInitialTabState);

  useEffect(() => {
    if (!externalApiId) return;
    setTabState(makeInitialTabState());
  }, [externalApiId]);

  const currentTab = selected ?? "Businesses";
  const { searchQuery, filters } = tabState[currentTab];

  const setSearchQuery = useCallback(
    (value: string) =>
      setTabState((prev) => ({
        ...prev,
        [currentTab]: { ...prev[currentTab], searchQuery: value },
      })),
    [currentTab],
  );

  const setFilters = (value: Filters | ((prev: Filters) => Filters)) =>
    setTabState((prev) => {
      const next =
        typeof value === "function" ? value(prev[currentTab].filters) : value;
      return { ...prev, [currentTab]: { ...prev[currentTab], filters: next } };
    });

  const clearFilter = () =>
    setTabState((prev) => ({
      ...prev,
      [currentTab]: {
        ...defaultTabState,
        filters: { ...defaultTabState.filters },
      },
    }));

  return {
    selected,
    setSelected,
    tabState,
    currentTab,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    clearFilter,
  };
}
