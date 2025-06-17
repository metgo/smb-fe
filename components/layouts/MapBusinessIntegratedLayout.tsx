import { useEffect, useState } from "react";

import { BusinessCard } from "../cards";
import BusinessPinMap from "../maps/BusinessPinMap";
import { getBusinessList, scaleLayout } from "@/lib/helpers";
import { mapIntegratedCardsColumns, mapIntegratedCardsLayouts, REFERENCE_SCREEN_WIDTH } from "@/constant/collageLayouts";


const MapBusinessIntegratedLayout = ({ imageCount }: { imageCount: number }) => {
  const [scale, setScale] = useState(1);

  // Update scale based on window width
  useEffect(() => {
    const updateScale = () => {
      const currentWidth = window.innerWidth;
      const newScale = currentWidth / REFERENCE_SCREEN_WIDTH;
      setScale(newScale);
    };

    updateScale(); // Initial scale calculation
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const businesses = getBusinessList(imageCount);
  const layoutOptions = Object.entries(mapIntegratedCardsLayouts)
    .map(([key, value]) => ({ key, length: value.length }))
    .sort((a, b) => b.length - a.length); // Start from the biggest layout

  const layoutChunks: { key: string; offset: number; scaledLayout: LayoutItem[] }[] = [];
  let remaining = imageCount;
  let offset = 0;

  while (remaining > 0) {
    const layout = layoutOptions.find(l => l.length <= remaining);
    if (!layout) break;

    layoutChunks.push({
      key: layout.key,
      offset,
      scaledLayout: scaleLayout(mapIntegratedCardsLayouts[layout.key], scale),
    });
    offset += layout.length;
    remaining -= layout.length;
  }

  const renderCards = (layoutKey: string, layoutOffset: number, indexes: number[], scaledLayout: LayoutItem[]) => {
    return (
      <div
        key={layoutKey}
        className="space-y-5"
      >
        {indexes.map(i => {
          const business = businesses[layoutOffset + i];
          const layoutItem = scaledLayout[i];
          return (
            <BusinessCard
              key={business.id}
              width={layoutItem.width}
              height={layoutItem.height}
              imageUrl={business.image}
            />
          );
        })}
      </div>
    );
  };

  const renderLayout = (layoutKey: string, layoutOffset: number, scaledLayout: LayoutItem[]) => {
    const columnLayout = mapIntegratedCardsColumns[layoutKey];

    if (!columnLayout) {
      return (
        <div className="space-y-5">
          {scaledLayout.map((item, i) => (
            <BusinessCard
              key={businesses[layoutOffset + i].id}
              width={item.width}
              height={item.height}
              imageUrl={businesses[layoutOffset + i].image}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-5">
        {Object.values(columnLayout).map((indexes, idx) => (
          <div className="space-y-5" key={`${layoutKey}-col-${idx}`}>
            {renderCards(layoutKey, layoutOffset, indexes, scaledLayout)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center ps-20">
      <div className="flex flex-col col-span-8 gap-10 max-h-[95vh] overflow-y-auto hide-scrollbar py-10">
        {layoutChunks.map(({ key, offset, scaledLayout }, idx) => (
          <div key={`${key}-${offset}-${idx}`}>{renderLayout(key, offset, scaledLayout)}</div>
        ))}
      </div>
      <BusinessPinMap className="w-[45%]" />
    </div>
  );
};

export default MapBusinessIntegratedLayout;