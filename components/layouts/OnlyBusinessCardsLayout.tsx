import { scaleLayout, shuffleArray } from "@/lib/helpers";
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

  const randomizedData = shuffleArray(data);

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

  if (randomizedData.length < 1) return <div>No businesses available</div>;

  const renderCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="space-y-5">
      {indexes.map((i) => {
        const business = randomizedData[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={business._id + i}
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
        const business = randomizedData[i + offset];
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
              key={randomizedData[i + offset]?._id + i}
              width={item.width}
              height={item.height}
              business={randomizedData[i + offset]}
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

  const renderExtraCards = (extraBusinesses: any[]) => {
    if (extraBusinesses.length === 0) return null;

    const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
    const columnCount = 5;

    // Shuffle layout16 to avoid repeating the same shape
    const shuffledLayouts = shuffleArray(layout16);

    // Distribute businesses into columns
    const columns: any[][] = Array.from({ length: columnCount }, () => []);
    extraBusinesses.forEach((biz, i) => {
      const columnIndex = i % columnCount;
      columns[columnIndex].push(biz);
    });

    return (
      <div className="flex w-full gap-5">
        {columns.map((column, colIdx) => (
          <div key={`column-${colIdx}`} className="flex flex-col gap-5">
            {column.map((biz, bizIdx) => {
              const layoutIndex =
                (colIdx + bizIdx * columnCount) % shuffledLayouts.length;
              const layout = shuffledLayouts[layoutIndex];

              return (
                <BusinessCard
                  key={biz._id + bizIdx}
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
    if (businessCount <= 16) {
      const layoutKey = `layout${businessCount}`;
      const layout = scaleLayout(onlyCardsLayouts[layoutKey], scale);
      const columnLayout = onlyCardsColumns[layoutKey] ?? null;

      return renderLayoutSection(layout, columnLayout, 0, 0);
    }

    // For imageCount > 16
    const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
    const column16 = onlyCardsColumns["layout16"];
    const extraBusinesses = randomizedData?.slice(16);

    return (
      <>
        {renderLayoutSection(layout16, column16 ?? null, 0, 0)}
        {renderExtraCards(extraBusinesses)}
      </>
    );
  };

  return (
    <div className="px-20 py-10 flex items-center justify-center w-full h-full relative">
      <div className="flex flex-col gap-5 items-start justify-start ">
        {renderFullLayout()}
      </div>
    </div>
  );
};

export default OnlyBusinessCardsLayout;
