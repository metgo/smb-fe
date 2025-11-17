"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { scaleLayout, shuffleArray } from "@/lib/helpers";
import {
  MOBILE_REFERENCE_WIDTH,
  getMobileCardLayouts,
  getMobileCardColumns,
} from "@/constant/collageLayouts.mobile";
import FeedCardMobile from "../cards/FeedCard.mobile";

const OnlyFeedCardsLayoutMobile = ({ data }: { data: FeedItemList }) => {
  const feedItemCount = data.length;
  const searchParams = useSearchParams();
  const activeCategoryKey = searchParams.get("categoryId");

  const [scale, setScale] = useState(1);
  const [shuffledCols, setShuffledCols] = useState<{
    col1: number[];
    col2: number[];
  }>({ col1: [], col2: [] });

  useEffect(() => {
    const updateScale = () => {
      const currentWidth = window.innerWidth;
      const newScale = currentWidth / MOBILE_REFERENCE_WIDTH;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  if (feedItemCount < 1) return <div>No businesses available</div>;

  //  Get dynamic layout and columns
  const layouts = getMobileCardLayouts(feedItemCount);
  const columns = getMobileCardColumns(feedItemCount);

  //  Single card layout (full width)
  if (feedItemCount === 1) {
    const layout = scaleLayout(layouts.mobileLayout1, scale);
    const card = layout[0];
    const feedItem = data[0];
    return (
      <div
        className={clsx(
          activeCategoryKey ? "pb-48" : "pb-30",
          "px-4 pt-24 flex items-center justify-center w-full h-full relative ",
        )}
      >
        <FeedCardMobile
          key={feedItem._id}
          width={card.width}
          height={card.height}
          feedItem={feedItem}
        />
      </div>
    );
  }

  //  Multi-card layout (2 columns)
  const layout = scaleLayout(layouts.mobileLayout2, scale);
  const columnLayout = columns.mobileLayout2;
  const totalCards = data.length;

  //  Shuffle indexes only when `data` changes
  useEffect(() => {
    const col1Indexes = columnLayout.col1.filter((i) => i < totalCards);
    const col2Indexes = columnLayout.col2.filter((i) => i < totalCards);

    setShuffledCols({
      col1: shuffleArray(col1Indexes),
      col2: shuffleArray(col2Indexes),
    });
  }, [data, totalCards]);

  const renderCards = (indexes: number[]) =>
    indexes.map((i) => {
      const feedItem = data[i];
      const cardLayout = layout[i];
      if (!feedItem || !cardLayout) return null;
      return (
        <FeedCardMobile
          key={feedItem._id + i}
          width={cardLayout.width}
          height={cardLayout.height}
          feedItem={feedItem}
        />
      );
    });

  return (
    <div
      className={clsx(
        "px-2 py-20 flex items-start w-full h-full min-h-[100vh] relative",
      )}
    >
      <div className="flex gap-3 items-start px-0">
        <div className="flex flex-col gap-3">
          {renderCards(shuffledCols.col1)}
        </div>
        <div className="flex flex-col gap-3">
          {renderCards(shuffledCols.col2)}
        </div>
      </div>
    </div>
  );
};

export default OnlyFeedCardsLayoutMobile;
