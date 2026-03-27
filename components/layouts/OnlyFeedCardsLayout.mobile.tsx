"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MOBILE_REFERENCE_WIDTH,
  getMobileCardLayouts,
  getMobileCardColumns,
} from "@/constant/collageLayouts.mobile";
import { scaleLayout, shuffleArray, sanitizeHtml } from "@/lib/helpers";
import FeedCardMobile from "../cards/FeedCard.mobile";
import NoFeedItemLayout from "./NoFeedItemLayout";
import { useCommonHook } from "@/hooks";
import FeedCategoryButtons from "./FeedCategoryButtons";
import useGeneralStore from "@/stores/generalStore";

const OnlyFeedCardsLayoutMobile = ({ data }: { data: FeedItemList }) => {
  const { isMobile } = useCommonHook();
  const searchParams = useSearchParams();
  const activeCategoryKey = searchParams.get("categoryId");
  const feedItemCount = data?.length ?? 0;
  const { presetFeedFilters } = useGeneralStore();

  // ── All hooks are called unconditionally (order never changes) ──
  const [scale, setScale] = useState(1);

  const layouts = useMemo(
    () => getMobileCardLayouts(feedItemCount),
    [feedItemCount],
  );
  const columns = useMemo(
    () => getMobileCardColumns(feedItemCount),
    [feedItemCount],
  );

  // Shuffle columns – only used when we have ≥2 items and we are on mobile
  const shuffledCols = useMemo(() => {
    if (feedItemCount < 2 || !columns.mobileLayout2) {
      return { col1: [], col2: [] };
    }
    const { col1, col2 } = columns.mobileLayout2;
    return {
      col1: shuffleArray(col1.filter((i) => i < feedItemCount)),
      col2: shuffleArray(col2.filter((i) => i < feedItemCount)),
    };
  }, [feedItemCount, columns.mobileLayout2]);

  // Scale handling
  useEffect(() => {
    const updateScale = () => {
      setScale(window.innerWidth / MOBILE_REFERENCE_WIDTH);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // ── Early returns AFTER all hooks ──
  if (!isMobile) return null;
  if (feedItemCount === 0) return <NoFeedItemLayout />;

  // Single-card layout
  if (feedItemCount === 1) {
    const layout = scaleLayout(layouts.mobileLayout1, scale);
    const card = layout[0];
    const feedItem = data[0];

    return (
      <div
        className={clsx(
          activeCategoryKey ? "pb-48" : "pb-30",
          "px-4 pt-24 flex items-center justify-center w-full min-h-screen",
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

  // Multi-card layout (2 columns)
  const layout = scaleLayout(layouts.mobileLayout2, scale);

  const renderCards = (indexes: number[]) =>
    indexes.map((i) => {
      const feedItem = data[i];
      const cardLayout = layout[i];
      if (!feedItem || !cardLayout) return null;

      return (
        <div>
          <FeedCardMobile
            key={`${feedItem._id}-${i}`}
            width={cardLayout.width}
            height={cardLayout.height}
            feedItem={feedItem}
          />
        </div>
      );
    });

  return (
    <div className="">
      <div className="flex flex-col justify-center items-center py-12 ">
        {presetFeedFilters?.header && (
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(presetFeedFilters?.header || ""),
            }}
          />
        )}

        <FeedCategoryButtons />
      </div>
      <div className="px-2  flex w-full min-h-screen">
        <div className="flex gap-3 w-full">
          <div className="flex flex-col gap-y-3 flex-1">
            {renderCards(shuffledCols.col1)}
          </div>
          <div className="flex flex-col gap-y-3 flex-1">
            {renderCards(shuffledCols.col2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlyFeedCardsLayoutMobile;
