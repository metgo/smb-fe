"use client";

import clsx from "clsx";
import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { sanitizeHtml, scaleLayout, shuffleArray } from "@/lib/helpers";

import {
  onlyCardsColumns,
  onlyCardsLayouts,
  REFERENCE_SCREEN_WIDTH,
} from "@/constant/collageLayouts";
import FeedCard from "../cards/FeedCard";
import NoFeedItemLayout from "./NoFeedItemLayout";
import FeedCategoryButtons from "./FeedCategoryButtons";

import useGeneralStore from "@/stores/generalStore";
import { FeedFilterDrawer } from "../drawer";

interface OnlyFeedCardsLayoutProps {
  data: FeedItemList;
  filters: any;
  isFilterOpen: boolean;
}

const OnlyFeedCardsLayout = ({
  data,
  filters,
  isFilterOpen,
}: OnlyFeedCardsLayoutProps) => {
  const feedItemCount = data?.length;
  const { presetFeedFilters, setIsCategoryHeaderInView } = useGeneralStore();
  const categoryHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = categoryHeaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsCategoryHeaderInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const DRAWER_WIDTH = 524; // 500px drawer + 24px gap

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const availableWidth = isFilterOpen
        ? window.innerWidth - DRAWER_WIDTH
        : window.innerWidth;
      setScale(availableWidth / REFERENCE_SCREEN_WIDTH);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isFilterOpen]);

  // Memoize shuffled layouts so they only shuffle once
  const shuffledLayouts = useMemo(() => {
    const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
    return shuffleArray(layout16);
  }, [scale]);

  const renderCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => {
    return (
      <div className="space-y-5">
        {indexes.map((i) => {
          const feedItem = data[i + offset];
          const cardLayout = layout[i];

          if (!feedItem || !cardLayout) return null;

          return (
            <FeedCard
              key={`feedcard-${feedItem?._id ?? "no-id"}-${i + offset}`}
              width={cardLayout.width}
              height={cardLayout.height}
              feedItem={feedItem}
            />
          );
        })}
      </div>
    );
  };

  const renderHorizontalCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="flex gap-5 pt-5">
      {indexes.map((i) => {
        const feedItem = data[i + offset];
        const cardLayout = layout[i];

        if (!feedItem || !cardLayout) return null;

        return (
          <FeedCard
            key={`feedcard-${feedItem?._id ?? "no-id"}-${i + offset}`}
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
          {layoutData.map((item, i) => {
            const feedItem = data[i + offset];

            if (!feedItem) return null;

            return (
              <FeedCard
                key={`feedcard-${feedItem?._id ?? "no-id"}-${i + offset}`}
                width={item.width}
                height={item.height}
                feedItem={feedItem}
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
                {renderCards(mainIndexes, layoutData, offset)}
                {subIndexes &&
                  renderHorizontalCards(subIndexes, layoutData, offset)}
              </div>
            );
          })}
      </div>
    );
  };

  const renderExtraCards = (extraBusinesses: any[], columnCount = 5) => {
    if (extraBusinesses.length === 0) return null;

    const columns: {
      businesses: any[];
      layouts: LayoutItem[];
      height: number;
    }[] = Array.from({ length: columnCount }, () => ({
      businesses: [],
      layouts: [],
      height: 0,
    }));

    extraBusinesses.forEach((biz, i) => {
      if (!biz) return;

      const layoutIndex = i % shuffledLayouts.length;
      const layout = shuffledLayouts[layoutIndex];
      const colIdx = i % columnCount;

      columns[colIdx].businesses.push(biz);
      columns[colIdx].layouts.push(layout);
      columns[colIdx].height += layout.height;
    });

    return (
      <div className="flex w-full gap-5 items-start mt-4">
        {columns.map((column, colIdx) => (
          <div key={`column-${colIdx}`} className="flex flex-col gap-5">
            {column.businesses.map((biz, bizIdx) => {
              const layout = column.layouts[bizIdx];

              if (!biz || !layout) return null;

              return (
                <FeedCard
                  key={`${biz._id}-extra-${colIdx}-${bizIdx}`}
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
    const safeLayoutKey = `layout${Math.min(feedItemCount, 16)}`;
    const layout = scaleLayout(onlyCardsLayouts[safeLayoutKey], scale);
    const columnLayout = onlyCardsColumns[safeLayoutKey] ?? null;

    const extraBusinesses = feedItemCount > 16 ? data.slice(16) : [];
    const extraColumnCount = isFilterOpen ? 3 : 5;

    return (
      <div key="layout-root">
        {renderLayoutSection(layout, columnLayout, 0, 0)}
        {feedItemCount > 16 && renderExtraCards(extraBusinesses, extraColumnCount)}
      </div>
    );
  };

  return (
    <>
      <div
        ref={categoryHeaderRef}
        className="flex flex-col justify-center items-center py-6"
      >
        {presetFeedFilters?.header && (
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(presetFeedFilters?.header || ""),
            }}
          />
        )}
        <FeedCategoryButtons />
      </div>

      {data?.length ? (
        <div
          className={clsx(
            "px-20 py-10 flex w-full h-full relative",
            isFilterOpen ? "items-start justify-start gap-6" : "items-center justify-center",
          )}
          >
          <AnimatePresence>
            {isFilterOpen && (
              <FeedFilterDrawer
                key="feed-filter-drawer"
                isInline
                visibleFeedItems={data}
                filters={filters}
              />
            )}
          </AnimatePresence>
          <div className="flex flex-col gap-5 items-start justify-start">
            {renderFullLayout()}
          </div>
        </div>
      ) : (
        <NoFeedItemLayout />
      )}
    </>
  );
};

export default OnlyFeedCardsLayout;
