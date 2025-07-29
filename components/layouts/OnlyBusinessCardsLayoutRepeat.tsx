import { scaleLayout } from "@/lib/helpers";
import { useState, useEffect } from "react";

import { BusinessCard } from "@/components/cards";
import {
  onlyCardsColumns,
  onlyCardsLayouts,
  REFERENCE_SCREEN_WIDTH,
} from "@/constant/collageLayouts";

const OnlyBusinessCardsLayout = ({ data }: BusinessesProps) => {
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

  const renderCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="space-y-5">
      {indexes.map((i) => {
        const business = data[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={i + business._id}
            width={cardLayout.width}
            height={cardLayout.height}
            business={business}
          />
        );
      })}
    </div>
  );

  const renderHorizontalCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="flex gap-5 pt-5">
      {indexes.map((i) => {
        const business = data[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={business?._id + i}
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
    index: number,
  ) => {
    if (!columnLayoutData) {
      return (
        <div className="space-y-5" key={index}>
          {layoutData.map((item, i) => (
            <BusinessCard
              key={data[i + offset]?._id + i}
              width={item.width}
              height={item.height}
              business={data[i + offset]}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-5" key={index}>
        {Object.keys(columnLayoutData)
          .filter((key) => !key.startsWith("sub"))
          .map((colKey, idx) => {
            const subKey = `sub${colKey[0].toUpperCase()}${colKey.slice(1)}`;
            const mainIndexes = columnLayoutData[colKey];
            const subIndexes = columnLayoutData[subKey];

            return (
              <div key={`${colKey}-${idx}`} className="flex flex-col">
                {renderCards(mainIndexes, layoutData, offset)}
                {subIndexes &&
                  renderHorizontalCards(subIndexes, layoutData, offset)}
              </div>
            );
          })}
      </div>
    );
  };

  const renderBatch = (
    batchData: any[],
    batchIndex: number,
    batchOffset: number,
  ) => {
    // Cycle through layout16 to layout20 (16, 17, 18, 19, 20)
    const layoutIndex = 16 + (batchIndex % 5); // Cycle through 16 to 20
    const layoutKey = `layout${layoutIndex}`;
    const layout = scaleLayout(onlyCardsLayouts[layoutKey], scale);
    // Always use layout16's column layout for batches
    const columnLayout = onlyCardsColumns["layout16"] ?? null;

    return renderLayoutSection(layout, columnLayout, batchOffset, batchIndex);
  };

  const renderFullLayout = () => {
    if (businessCount <= 20) {
      const layoutKey = `layout${businessCount}`;
      const layout = scaleLayout(onlyCardsLayouts[layoutKey], scale);
      const columnLayout = onlyCardsColumns[layoutKey] ?? null;

      return renderLayoutSection(layout, columnLayout, 0, 0);
    }

    // Split businesses into batches of up to 16
    const batches: any[][] = [];
    for (let i = 0; i < businessCount; i += 16) {
      batches.push(data.slice(i, i + 16));
    }

    return (
      <div>
        <div className="flex flex-col gap-5">
          {batches.map((batch, index) => (
            <div key={`batch-${index}`}>
              {renderBatch(batch, index, index * 16)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="px-20 py-10 flex items-center justify-center w-full h-full relative">
      <div className="flex flex-col gap-5 items-start justify-start">
        {renderFullLayout()}
      </div>
    </div>
  );
};

export default OnlyBusinessCardsLayout;
