import { scaleLayout } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { BusinessCard, FavoriteItemCard } from "@/components/cards";
import {
  onlyCardsColumns,
  onlyCardsLayouts,
  REFERENCE_SCREEN_WIDTH,
} from "@/constant/collageLayouts";

export const useCollageLayout = (
  items: BusinessProps[],
  isFav: boolean = false,
) => {
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

  if (items.length < 1) return <div>No businesses available</div>;

  const renderCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="space-y-5">
      {indexes.map((i) => {
        const business = items[i + offset];
        const cardLayout = layout[i];

        if (isFav)
          return (
            <FavoriteItemCard
              key={i}
              width={cardLayout.width}
              height={cardLayout.height}
              business={business}
            />
          );
        return (
          <BusinessCard
            key={i}
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
        const business = items[i + offset];
        const cardLayout = layout[i];
        return (
          <BusinessCard
            key={business?._id}
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
              key={items[i + offset]?._id}
              width={item.width}
              height={item.height}
              business={items[i + offset]}
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
    const shuffledLayouts = [...layout16].sort(() => Math.random() - 0.5);

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
                  key={biz.id}
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
    if (items.length <= 16) {
      const layoutKey = `layout${items.length}`;
      const layout = scaleLayout(onlyCardsLayouts[layoutKey], scale);
      const columnLayout = onlyCardsColumns[layoutKey] ?? null;

      return renderLayoutSection(layout, columnLayout, 0, 0);
    }

    // For imageCount > 16
    const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
    const column16 = onlyCardsColumns["layout16"];
    const extraBusinesses = items.slice(16);

    return (
      <>
        {renderLayoutSection(layout16, column16 ?? null, 0, 0)}
        {renderExtraCards(extraBusinesses)}
      </>
    );
  };

  return {
    renderFullLayout,
  };
};
