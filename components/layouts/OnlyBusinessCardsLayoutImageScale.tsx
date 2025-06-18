import { useState, useEffect } from "react";
import { getBusinessList, scaleLayout } from "@/lib/helpers";

import { BusinessCard } from "../cards";
import { onlyCardsColumns, onlyCardsLayouts, REFERENCE_SCREEN_WIDTH } from "@/constant/collageLayouts";




const OnlyBusinessCardsLayout = ({ imageCount }: { imageCount: number }) => {
  // State to store the scaling factor
  const [scale, setScale] = useState(1);

  // Update scale based on window width
  useEffect(() => {
    const updateScale = () => {
      const currentWidth = window.innerWidth;
      const newScale = currentWidth / REFERENCE_SCREEN_WIDTH;
      setScale(newScale);
    };

    // Initial scale calculation
    updateScale();

    // Add event listener for window resize
    window.addEventListener("resize", updateScale);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const businesses = getBusinessList(imageCount);

  if (businesses.length < 1) {
    return <div>No businesses available</div>;
  }

  const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
  const column16 = onlyCardsColumns["layout16"];

  const sections: {
    layout: LayoutItem[];
    columnLayout: Record<string, number[]> | null;
    offset: number;
  }[] = [];

  let offset = 0;
  while (offset < businesses.length) {
    const remaining = businesses.length - offset;
    let layoutKey: string;
    let layout: LayoutItem[];
    let columnLayout: Record<string, number[]> | null;

    if (remaining >= 16) {
      layoutKey = "layout16";
      layout = layout16;
      columnLayout = column16 ?? null;
    } else {
      layoutKey = `layout${remaining}`;
      layout = scaleLayout(onlyCardsLayouts[layoutKey], scale);
      columnLayout = onlyCardsColumns[layoutKey] ?? null;
    }

    if (!layout) break;

    sections.push({
      layout,
      columnLayout,
      offset,
    });

    offset += layout.length;
  }

  const renderCards = (indexes: number[], layout: LayoutItem[], offset: number) => (
    <div className="space-y-5">
      {indexes.map((i) => {
        const business = businesses[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={business.id}
            width={cardLayout.width}
            height={cardLayout.height}
            imageUrl={business.image}
          />
        );
      })}
    </div>
  );

  const renderHorizontalCards = (indexes: number[], layout: LayoutItem[], offset: number) => (
    <div className="flex gap-5 pt-5">
      {indexes.map((i) => {
        const business = businesses[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={business.id}
            width={cardLayout.width}
            height={cardLayout.height}
            imageUrl={business.image}
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
              key={businesses[i + offset].id}
              width={item.width}
              height={item.height}
              imageUrl={businesses[i + offset].image}
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
                {subIndexes && renderHorizontalCards(subIndexes, layoutData, offset)}
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="px-20 py-10 flex flex-col gap-5 items-center justify-center w-full h-full">
      {sections.map((section, i) =>
        renderLayoutSection(section.layout, section.columnLayout, section.offset, i)
      )}
    </div>
  );
};

export default OnlyBusinessCardsLayout;