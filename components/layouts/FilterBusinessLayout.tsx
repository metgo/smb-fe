"use client";

import Image from "next/image";
import useGeneralStore from "@/stores/generalStore";

import NoBusinessLayout from "./NoBusinessLayout";
import OnlyBusinessMapLayout from "./OnlyBusinessMapLayout";
import OnlyBusinessCardsLayout from "./OnlyBusinessCardsLayout";
import MapBusinessIntegratedLayout from "./MapBusinessIntegratedLayout";
import { useLoadMore } from "@/hooks/useLoadMore";

interface Props {
  businesses: BusinessesProps;
}

const FilterBusinessLayout = ({ businesses }: Props) => {
  const { activeFilterTab } = useGeneralStore();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    businesses?.meta?.hasNextPage,
  );
  const totalBusiness = businesses?.totalData;

  if (!totalBusiness) return <NoBusinessLayout />;

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
      <div className="bg-primary">
        {renderLayout()}
        {initialLoadDone && canLoadMore && businesses?.meta?.hasNextPage && (
          <div ref={sentryRef} className="h-4">
            {loading && <span>Loading...</span>}
          </div>
        )}
      </div>

      {activeFilterTab === "gallery" && (
        <Image
          width={300}
          height={300}
          alt="Yellow image"
          src="/images/yellow.png"
          className="fixed -bottom-12 -left-30 rotate-[40deg] z-50"
        />
      )}
    </div>
  );
};

export default FilterBusinessLayout;
