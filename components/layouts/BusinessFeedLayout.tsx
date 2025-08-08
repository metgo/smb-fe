"use client";

import { useRef } from "react";
import useGeneralStore from "@/stores/generalStore";

import NoFeedItemLayout from "./NoFeedItemLayout";
import { useLoadMore } from "@/hooks/useLoadMore";

import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import { CategoryPanel, SubcategoryFilterPanel } from "../cards";

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

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyFeedCardsLayout data={businesses.data} />;
      case "integrated":
        return <MapFeedIntegratedLayout data={businesses.data} />;
      case "map":
        return <BusinessPinMap />;
      default:
        return <NoFeedItemLayout />;
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
        <NoFeedItemLayout />
      )}

      {isOnSection2 && (
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
