import { scaleLayout } from "@/lib/helpers";
import { useState, useEffect } from "react";

import {
  mapIntegratedCardsLayouts,
  mapIntegratedCardsColumns,
  REFERENCE_SCREEN_WIDTH,
} from "@/constant/collageLayouts";
import FeedCard from "../cards/FeedCard";
import TrailRouteMap from "../maps/TrailRouteMap";

const MapFeedIntegratedLayout = ({ data }: { data: FeedItemList }) => {
  const feedItemCount = data.length;
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
        const feedItem = data[i + offset];
        const cardLayout = layout[i];
        return (
          <FeedCard
            key={feedItem?._id + i}
            width={cardLayout.width}
            height={cardLayout.height}
            feedItem={feedItem}
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
            <FeedCard
              key={data[i + offset]?._id + i}
              width={item.width}
              height={item.height}
              feedItem={data[i + offset]}
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
              <FeedCard
                key={data[i + offset]?._id + i}
                width={item.width}
                height={item.height}
                feedItem={data[i + offset]}
              />
            ))}
          </div>
          <FeedCard
            key={data[offset]?._id}
            width={layoutData[2].width}
            height={layoutData[2].height}
            feedItem={data[2]}
          />
        </div>
      );
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

    const columns = columnKeys.map(() => [] as any[]);
    extraBusinesses.forEach((biz, i) => {
      const columnIndex = i % columns.length;
      columns[columnIndex].push(biz);
    });

    return (
      <div className="flex w-full gap-5">
        {columns.map((column, colIdx) => (
          <div key={`column-${colIdx}`} className="flex flex-col gap-5">
            {column.map((biz, bizIdx) => {
              const layoutIndex =
                (colIdx + bizIdx * columns.length) % layout9.length;
              const layout = layout9[layoutIndex];
              return (
                <FeedCard
                  key={biz._id + bizIdx}
                  width={layout.width}
                  height={layout.height}
                  feedItem={biz}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderFullLayout = () => {
    if (feedItemCount <= 9) {
      const layoutKey = `layout${feedItemCount}`;
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
      <div className="flex flex-col w-[70%] max-h-[95vh] overflow-y-auto hide-scrollbar py-10">
        {renderFullLayout()}
      </div>

      <TrailRouteMap className="w-[calc(51%-0.5rem)]" />
    </div>
  );
};

export default MapFeedIntegratedLayout;
