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

  // Fisher-Yates shuffle algorithm to randomize array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random layout16 configuration
  const getRandomLayout16Config = () => {
    const layout16Keys = Object.keys(onlyCardsLayouts).filter(
      (key) => key.startsWith("layout16") || key === "layout16",
    );

    // If there are multiple layout16 variants, pick randomly
    // Otherwise, just use layout16
    const randomKey =
      layout16Keys.length > 1
        ? layout16Keys[Math.floor(Math.random() * layout16Keys.length)]
        : "layout16";

    return {
      layout: onlyCardsLayouts[randomKey],
      columnLayout: onlyCardsColumns[randomKey] || onlyCardsColumns["layout16"],
    };
  };

  const renderCards = (
    indexes: number[],
    layout: LayoutItem[],
    dataSlice: any[],
  ) => (
    <div className="space-y-5">
      {indexes.map((i) => {
        const business = dataSlice[i];
        const cardLayout = layout[i];
        if (!business) return null;

        return (
          <BusinessCard
            key={business._id}
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
    dataSlice: any[],
  ) => (
    <div className="flex gap-5 pt-5">
      {indexes.map((i) => {
        const business = dataSlice[i];
        const cardLayout = layout[i];
        if (!business) return null;

        return (
          <BusinessCard
            key={business._id}
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
    dataSlice: any[],
    index: number,
  ) => {
    if (!columnLayoutData) {
      return (
        <div className="space-y-5" key={index}>
          {layoutData.map((item, i) => {
            const business = dataSlice[i];
            if (!business) return null;

            return (
              <BusinessCard
                key={business._id}
                width={item.width}
                height={item.height}
                business={business}
              />
            );
          })}
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
                {renderCards(mainIndexes, layoutData, dataSlice)}
                {subIndexes &&
                  renderHorizontalCards(subIndexes, layoutData, dataSlice)}
              </div>
            );
          })}
      </div>
    );
  };

  const renderSequentialLayouts = () => {
    const layouts = [];
    let currentIndex = 0;

    // Render layouts 1 through current data length (up to 16)
    for (let i = 1; i <= Math.min(businessCount, 16); i++) {
      if (currentIndex >= businessCount) break;

      const layoutKey = `layout${i}`;
      const layout = scaleLayout(onlyCardsLayouts[layoutKey], scale);
      const columnLayout = onlyCardsColumns[layoutKey] ?? null;

      // Take only the items needed for this layout
      const itemsNeeded = Math.min(i, businessCount - currentIndex);
      const dataSlice = data.slice(currentIndex, currentIndex + itemsNeeded);

      layouts.push(renderLayoutSection(layout, columnLayout, dataSlice, i));

      currentIndex += itemsNeeded;
    }

    return layouts;
  };

  const renderRandomBatches = (startIndex: number) => {
    const remainingData = data.slice(startIndex);
    const batches = [];

    // Split remaining data into batches of 16
    for (let i = 0; i < remainingData.length; i += 16) {
      const batchData = remainingData.slice(i, i + 16);
      const shuffledBatchData = shuffleArray(batchData);

      // Get random layout16 configuration
      const { layout: randomLayout, columnLayout } = getRandomLayout16Config();
      const layout = scaleLayout(randomLayout, scale);

      batches.push(
        <div key={`random-batch-${Math.floor(i / 16)}`}>
          {renderLayoutSection(
            layout,
            columnLayout,
            shuffledBatchData,
            Math.floor(i / 16) + 100,
          )}
        </div>,
      );
    }

    return batches;
  };

  const renderFullLayout = () => {
    if (businessCount <= 16) {
      // For 16 or fewer items, render sequential layouts
      return (
        <div className="flex flex-col gap-5">{renderSequentialLayouts()}</div>
      );
    }

    // For more than 16 items:
    // 1. First render layouts 1-16 with first 16 items
    // 2. Then render remaining items in random batches using random layout16 configs
    const sequentialLayouts = renderSequentialLayouts();
    const randomBatches = renderRandomBatches(16);

    return (
      <div className="flex flex-col gap-5">
        {sequentialLayouts}
        {randomBatches}
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
