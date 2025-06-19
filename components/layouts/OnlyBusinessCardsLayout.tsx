import Image from "next/image";
import { scaleLayout } from "@/lib/helpers";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { BusinessCard } from "@/components/cards";
import {
  onlyCardsColumns,
  onlyCardsLayouts,
  REFERENCE_SCREEN_WIDTH,
} from "@/constant/collageLayouts";

interface DebounceFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
}

const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): DebounceFunction<T> => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const OnlyBusinessCardsLayout = ({ data, meta, totalData }: BusinessesProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const businessCount = data.length;
  const [scale, setScale] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageCount.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [pageCount, searchParams, router]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrolled = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      const buffer = 100; // Pixels before reaching the bottom to trigger next page

      if (scrolled >= totalHeight - buffer && pageCount < 100 && meta.hasNextPage) { // Optional: cap max pages
        setPageCount((prev) => prev + 1);
      }
    }, 200); // Debounce delay in ms

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pageCount, setPageCount]);


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
            key={i}
            width={cardLayout.width}
            height={cardLayout.height}
            business={business}
          />
        );
      })}
    </div>
  );

  const renderHorizontalCards = (indexes: number[], layout: LayoutItem[], offset: number) => (
    <div className="flex gap-5 pt-5">
      {indexes.map((i) => {
        const business = data[i + offset];
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
    index: number
  ) => {
    if (!columnLayoutData) {
      return (
        <div className="space-y-5" key={index}>
          {layoutData.map((item, i) => (
            <BusinessCard
              key={data[i + offset]?._id}
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
                {subIndexes && renderHorizontalCards(subIndexes, layoutData, offset)}
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
              const layoutIndex = (colIdx + bizIdx * columnCount) % shuffledLayouts.length;
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
    if (businessCount <= 16) {
      const layoutKey = `layout${businessCount}`;
      const layout = scaleLayout(onlyCardsLayouts[layoutKey], scale);
      const columnLayout = onlyCardsColumns[layoutKey] ?? null;

      return renderLayoutSection(layout, columnLayout, 0, 0);
    }

    // For imageCount > 16
    const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
    const column16 = onlyCardsColumns["layout16"];
    const extraBusinesses = data.slice(16);

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

      <Image
        width={300}
        height={300}
        alt="Yellow image"
        src={"/images/yellow.png"}
        className="fixed -bottom-12 -left-24 rotate-30"
      />
    </div>
  );
};

export default OnlyBusinessCardsLayout;
