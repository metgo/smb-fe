"use client";

import { useEffect, useRef, useState } from "react";

import { useIsHydrated } from "@/hooks";
import { useLoadMore } from "@/hooks/useLoadMore";
import useGeneralStore from "@/stores/generalStore";

import { AiIcon } from "../ui/svgIcons";
import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import FeedFilterDrawer from "../drawer/FeedFilterDrawer";
import { useRouter, useSearchParams } from "next/navigation";
import { initialSelectedFiltersIds } from "@/providers/SiteInfoClientProvider";

const FeedLayout = ({
  businesses,
  filters,
}: {
  businesses: BusinessesProps;
  filters: FiltersResponse;
}) => {
  const router = useRouter();

  const isHydrated = useIsHydrated();
  const searchParams = useSearchParams();

  const isAllClear = searchParams.get("isAllClear") === "true";

  const { activeFilterTab, hideFirstTwoSection, setAppliedFilterItemCount } =
    useGeneralStore();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    businesses?.meta?.hasNextPage,
  );

  const triggerRef = useRef(null);
  const totalBusiness = businesses?.totalData;

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [appliedFilterCount, setAppliedFilterCount] = useState(0);

  const getCurrentParams = () => {
    if (typeof window === "undefined") {
      return new URLSearchParams(searchParams.toString());
    }
    return new URLSearchParams(window.location.search);
  };

  const [paramsState, setParamsState] = useState<URLSearchParams>(() =>
    getCurrentParams(),
  );

  useEffect(() => {
    if (businesses?.data?.length > 0) {
      setAppliedFilterItemCount(businesses?.data?.length);
    }
  }, [businesses, setAppliedFilterItemCount]);

  // ---- APPLY DEFAULT FILTERS ON FIRST LOAD ----
  useEffect(() => {
    try {
      if (typeof window === "undefined" || isAllClear) return;

      if (!initialSelectedFiltersIds) return;

      const params = getCurrentParams();
      let shouldUpdate = false;

      Object.entries(initialSelectedFiltersIds).forEach(([key, values]) => {
        if (!Array.isArray(values) || values.length === 0) return;

        const existing = params.get(key);
        if (!existing || existing.trim() === "") {
          params.set(key, values.join(","));
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        const nextParams = new URLSearchParams(params);
        setParamsState(nextParams);
        router.replace(`?${nextParams.toString()}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error applying default filters:", error);
    }
  }, [isAllClear, initialSelectedFiltersIds]);

  if (!isHydrated) return null;

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyFeedCardsLayout data={businesses.data} />;
      case "integrated":
        return <MapFeedIntegratedLayout data={businesses.data} />;
      case "map":
        return <BusinessPinMap mapHeight="120vh" />;
      default:
        return <NoFeedItemLayout isFilterDrawerOpen={isFilterDrawerOpen} />;
    }
  };

  return (
    <div className="md:block max-sm:hidden">
      {totalBusiness ? (
        <div className="bg-primary">
          {renderLayout()}
          <div style={{ height: "10px", position: "relative" }}>
            <div
              ref={triggerRef}
              style={{ position: "absolute", top: 0, height: 1 }}
            />
          </div>
          {initialLoadDone && canLoadMore && businesses?.meta?.hasNextPage && (
            <div ref={sentryRef} className="h-4">
              {loading && <span>Loading...</span>}
            </div>
          )}
        </div>
      ) : (
        <NoFeedItemLayout isFilterDrawerOpen={isFilterDrawerOpen} />
      )}

      {hideFirstTwoSection && (
        <div
          onClick={() => setIsFilterDrawerOpen(true)}
          className="fixed top-2/3 right-1 custom-cursor max-sm:hidden md:block"
        >
          {appliedFilterCount > 0 && (
            <div className="bg-green-500 absolute left-1 top-1 rounded-full h-[18px] w-[18px] text-[10px] flex items-center justify-center text-white aspect-square border border-white">
              {appliedFilterCount}
            </div>
          )}
          <AiIcon size={68} />
        </div>
      )}

      <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />

      {isFilterDrawerOpen && (
        <FeedFilterDrawer
          itemCount={businesses?.data?.length}
          isOpen={isFilterDrawerOpen}
          setIsOpen={setIsFilterDrawerOpen}
          paramsState={paramsState}
          setParamsState={setParamsState}
          filters={filters}
          appliedFilterCount={appliedFilterCount}
          setAppliedFilterCount={setAppliedFilterCount}
        />
      )}
    </div>
  );
};

export default FeedLayout;
