import { scaleLayout } from "@/lib/helpers";
import { useState, useEffect } from "react";

import { BusinessCard } from "@/components/cards";
import {
  mapIntegratedCardsLayouts,
  mapIntegratedCardsColumns,
  REFERENCE_SCREEN_WIDTH,
} from "@/constant/collageLayouts";
import BusinessPinMap from "../maps/BusinessPinMap";

const MapBusinessIntegratedLayout = ({ data }: BusinessesProps) => {
  const businessCount = data.length;
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

  if (data.length < 1) return <div>No businesses available</div>;

  const renderCards = (indexes: number[], layout: LayoutItem[], offset: number) => (
    <div className="space-y-5">
      {indexes.map((i) => {
        const business = data[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={business?._id || i}
            width={cardLayout.width}
            height={cardLayout.height}
            business={business}
          />
        );
      })}
    </div>
  );

  const renderLayoutSection = (
    layoutData: LayoutItem[],
    columnLayoutData: Record<string, number[]> | null,
    offset: number,
    index: number
  ) => {
    if (!columnLayoutData) {
      return (
        <div className="space-y-5" key={index}>
          {layoutData.map((item, i) => (
            <BusinessCard
              key={data[i + offset]?._id || i}
              width={item.width}
              height={item.height}
              business={data[i + offset]}
            />
          ))}
        </div>
      );
    }

    if (layoutData.length === 3) {
      return (
        <div className="space-y-5">
          <div className="flex gap-5">
            {layoutData.slice(0, 2).map((item, i) => (
              <BusinessCard
                key={data[i + offset]?._id || i}
                width={item.width}
                height={item.height}
                business={data[i + offset]}
              />
            ))}
          </div>
          <BusinessCard
            width={layoutData[2].width}
            height={layoutData[2].height}
            business={data[2]}
          />
        </div>
      )
    }

    return (
      <div className="flex gap-5" key={index}>
        {Object.keys(columnLayoutData).map((colKey, idx) => {
          const indexes = columnLayoutData[colKey];
          return (
            <div key={`${colKey}-${idx}`} className="flex flex-col">
              {renderCards(indexes, layoutData, offset)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderExtraCards = (extraBusinesses: any[]) => {
    if (extraBusinesses.length === 0) return null;

    const layout9 = scaleLayout(mapIntegratedCardsLayouts["layout9"], scale);
    const columnKeys = Object.keys(mapIntegratedCardsColumns["layout9"]);

    const columns = columnKeys.map((key) => [] as any[]);
    extraBusinesses.forEach((biz, i) => {
      const columnIndex = i % columns.length;
      columns[columnIndex].push(biz);
    });

    return (
      <div className="flex w-full gap-5">
        {columns.map((column, colIdx) => (
          <div key={`column-${colIdx}`} className="flex flex-col gap-5">
            {column.map((biz, bizIdx) => {
              const layoutIndex = (colIdx + bizIdx * columns.length) % layout9.length;
              const layout = layout9[layoutIndex];
              return (
                <BusinessCard
                  key={biz._id}
                  width={layout.width}
                  height={layout.height}
                  business={biz}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderFullLayout = () => {
    if (businessCount <= 9) {
      const layoutKey = `layout${businessCount}`;
      const layout = scaleLayout(mapIntegratedCardsLayouts[layoutKey], scale);
      const columnLayout = mapIntegratedCardsColumns[layoutKey] ?? null;
      return renderLayoutSection(layout, columnLayout, 0, 0);
    }

    const layout9 = scaleLayout(mapIntegratedCardsLayouts["layout9"], scale);
    const column9 = mapIntegratedCardsColumns["layout9"];
    const extraBusinesses = data.slice(9);

    return (
      <div className="space-y-5">
        {renderLayoutSection(layout9, column9 ?? null, 0, 0)}
        {renderExtraCards(extraBusinesses)}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-start ps-20 gap-2">
      {/* Business Cards Section */}
      <div className="flex flex-col flex-[6] max-h-[95vh] overflow-y-auto hide-scrollbar py-10">
        {renderFullLayout()}
      </div>

      <BusinessPinMap className="w-full flex-[4.3]" />
    </div>
  );
};

export default MapBusinessIntegratedLayout;
