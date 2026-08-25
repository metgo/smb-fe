import { useState, useRef, useEffect, useCallback } from "react";
import { useLazyGetBusinessForProductQuery } from "@/store/api/businessQueryApi";

export function useBusinessSearch() {
  const businessSearchDebounceRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [businessSearch, setBusinessSearch] = useState("");
  const [businesses, setBusinesses] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [isSearchingBusinesses, setIsSearchingBusinesses] = useState(false);
  const [selectedBusinessName, setSelectedBusinessName] = useState("");
  const [searchBusinessesTrigger] = useLazyGetBusinessForProductQuery();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchDefaultBusinesses = useCallback(async () => {
    try {
      setIsSearchingBusinesses(true);
      const result = await searchBusinessesTrigger({
        search: "",
        locale: "en" as any,
        limit: 10,
      });
      if (result.data?.data) {
        setBusinesses(result.data.data);
      }
    } catch (error) {
      console.error("Error fetching default businesses:", error);
      setBusinesses([]);
    } finally {
      setIsSearchingBusinesses(false);
    }
  }, []);

  const searchBusinesses = (search: string) => {
    setBusinessSearch(search);

    if (businessSearchDebounceRef.current) {
      clearTimeout(businessSearchDebounceRef.current);
    }

    if (!search.trim()) {
      // Back to empty input -> show default list again
      fetchDefaultBusinesses();
      return;
    }

    businessSearchDebounceRef.current = setTimeout(async () => {
      try {
        setIsSearchingBusinesses(true);
        const result = await searchBusinessesTrigger({
          search,
          locale: "en" as any,
          limit: 10,
        });
        if (result.data?.data) {
          setBusinesses(result.data.data);
        }
      } catch (error) {
        console.error("Error searching businesses:", error);
        setBusinesses([]);
      } finally {
        setIsSearchingBusinesses(false);
      }
    }, 400);
  };

  useEffect(() => {
    fetchDefaultBusinesses();
  }, [fetchDefaultBusinesses]);

  useEffect(() => {
    return () => {
      if (businessSearchDebounceRef.current) {
        clearTimeout(businessSearchDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".business-search-container")) {
        setShowBusinessDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetBusinessSearch = () => {
    setSelectedBusinessName("");
    setBusinessSearch("");
    fetchDefaultBusinesses();
  };

  const selectBusiness = (business: { _id: string; name: string }) => {
    setSelectedBusinessName(business.name);
    setShowBusinessDropdown(false);
    setBusinessSearch("");
    setBusinesses([]);
  };

  return {
    businessSearch,
    businesses,
    showBusinessDropdown,
    setShowBusinessDropdown,
    isSearchingBusinesses,
    selectedBusinessName,
    setSelectedBusinessName,
    searchBusinesses,
    fetchDefaultBusinesses,
    resetBusinessSearch,
    selectBusiness,
  };
}
