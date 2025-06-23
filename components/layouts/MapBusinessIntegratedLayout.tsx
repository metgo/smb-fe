import { useEffect, useState } from "react";

import { scaleLayout } from "@/lib/helpers";
import { BusinessCard } from "@/components/cards";
import BusinessPinMap from "@/components/maps/BusinessPinMap";
import {
  mapIntegratedCardsColumns,
  mapIntegratedCardsLayouts,
  REFERENCE_SCREEN_WIDTH,
} from "@/constant/collageLayouts";

const MapBusinessIntegratedLayout = ({ data, meta }: BusinessesProps) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const currentWidth = window.innerWidth;
      const newScale = currentWidth / REFERENCE_SCREEN_WIDTH;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // 1. Build layout chunks using predefined layouts
  const layoutOptions = Object.entries(mapIntegratedCardsLayouts)
    .map(([key, value]) => ({ key, length: value.length }))
    .sort((a, b) => b.length - a.length);

  const layoutChunks: { key: string; offset: number; scaledLayout: LayoutItem[] }[] = [];
  let remaining = data.length;
  let offset = 0;

  while (remaining > 0) {
    const layout = layoutOptions.find((l) => l.length <= remaining);
    if (!layout) break;

    layoutChunks.push({
      key: layout.key,
      offset,
      scaledLayout: scaleLayout(mapIntegratedCardsLayouts[layout.key], scale),
    });

    offset += layout.length;
    remaining -= layout.length;
  }

  // 2. Handle any extra items using layout9
  const remainingData = data.slice(offset);
  const layout9 = mapIntegratedCardsLayouts.layout9;
  const scaledLayout9 = scaleLayout(layout9, scale);
  const extraChunks = [[], [], []] as { business: any; layout: LayoutItem }[][];

  remainingData.forEach((business, index) => {
    const colIndex = index % 3;
    const randomLayout = scaledLayout9[Math.floor(Math.random() * scaledLayout9.length)];
    extraChunks[colIndex].push({ business, layout: randomLayout });
  });

  // 3. Render helpers
  const renderCards = (
    layoutKey: string,
    layoutOffset: number,
    indexes: number[],
    scaledLayout: LayoutItem[]
  ) => {
    return (
      <div key={layoutKey} className="space-y-5">
        {indexes.map((i) => {
          const business = data[layoutOffset + i];
          const layoutItem = scaledLayout[i];
          return (
            <BusinessCard
              key={business._id}
              width={layoutItem.width}
              height={layoutItem.height}
              business={business}
            />
          );
        })}
      </div>
    );
  };

  const renderLayout = (
    layoutKey: string,
    layoutOffset: number,
    scaledLayout: LayoutItem[]
  ) => {
    const columnLayout = mapIntegratedCardsColumns[layoutKey];

    if (!columnLayout) {
      return (
        <div className="space-y-5">
          {scaledLayout.map((item, i) => (
            <BusinessCard
              key={data[layoutOffset + i]._id}
              width={item.width}
              height={item.height}
              business={data[layoutOffset + i]}
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
    <div className="w-full h-full flex items-center ps-20 gap-2">
      <div className="flex flex-col col-span-8 gap-10 max-h-[95vh] overflow-y-auto hide-scrollbar py-10">
        {/* Predefined layout chunks */}
        {layoutChunks.map(({ key, offset, scaledLayout }, idx) => (
          <div key={`${key}-${offset}-${idx}`}>{renderLayout(key, offset, scaledLayout)}</div>
        ))}

        {/* Extra cards rendered using layout9 randomly */}
        {remainingData.length > 0 && (
          <div className="flex gap-5">
            {extraChunks.map((column, colIdx) => (
              <div key={`extra-col-${colIdx}`} className="space-y-5">
                {column.map(({ business, layout }) => (
                  <BusinessCard
                    key={business._id}
                    width={layout.width}
                    height={layout.height}
                    business={business}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <BusinessPinMap className="w-[43%]" />
    </div>
  );
};

export default MapBusinessIntegratedLayout;
