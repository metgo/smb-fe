"use client";

import useGeneralStore from "@/stores/generalStore";
import { useEffect, useRef, useState } from "react";

import NoBusinessLayout from "./NoBusinessLayout";
import { useLoadMore } from "@/hooks/useLoadMore";
import OnlyBusinessMapLayout from "./OnlyBusinessMapLayout";
import OnlyBusinessCardsLayout from "./OnlyBusinessCardsLayout";
import { CategoryPanel, SubcategoryFilterPanel } from "../cards";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import MapBusinessIntegratedLayout from "./MapBusinessIntegratedLayout";

const BusinessFeedLayout = ({
  businesses,
}: {
  businesses: BusinessesProps;
}) => {
  const { activeFilterTab, isOnSection2 } = useGeneralStore();
  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    businesses?.meta?.hasNextPage,
  );
  const totalBusiness = businesses?.totalData;

  const triggerRef = useRef(null);
  const [showStickyPanel, setShowStickyPanel] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = window.innerHeight;
      if (isOnSection2) {
        setShowStickyPanel(true);
      } else {
        setShowStickyPanel(scrollPosition >= scrollThreshold);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOnSection2]);

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyBusinessCardsLayout data={businesses.data} />;
      case "integrated":
        return <MapBusinessIntegratedLayout data={businesses.data} />;
      case "map":
        return <OnlyBusinessMapLayout />;
      default:
        return <NoBusinessLayout />;
    }
  };

  return (
    <div>
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
        <NoBusinessLayout />
      )}

      {showStickyPanel && (
        <>
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-2 w-max">
            <SubcategoryFilterPanel />
            <CategoryPanel />
          </div>
        </>
      )}

      <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
    </div>
  );
};

export default BusinessFeedLayout;
