"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useInView, useAnimation } from "framer-motion";

import { navigationPaths } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { CardSkeleton } from "@/components/skeletons";
import { IconImage, NextImage } from "@/components/ui";
import { useImagePresent } from "@/hooks/useImagePresent";

const FeedCard = ({ height, width, feedItem }: FeedCardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const aspectRatio = width / height;

  const { categoryId = "", subCategoryId = "" } = Object.fromEntries(
    searchParams.entries(),
  );

  const {
    activeCategoryKey,
    activeFilterTab,
    setActiveFilterTab,
    setClickedBusinessId,
  } = useGeneralStore();
  const { isLoading, isImageLoaded, updatedImageList } = useImagePresent(
    aspectRatio,
    feedItem?.images,
    activeImageIndex,
    [categoryId, subCategoryId],
  );

  const [hasMounted, setHasMounted] = useState(false);
  // Framer Motion setup
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const controls = useAnimation();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start({ y: 0, opacity: 1 });
    }
  }, [isInView, controls]);

  const primaryCategoryId = activeCategoryKey
    ? activeCategoryKey
    : feedItem?.primaryCategoryId
      ? feedItem?.primaryCategoryId
      : "6566e36ba77d2a477266d2f4";

  function handleMapIconClick(id: string) {
    setClickedBusinessId(id);
    setActiveFilterTab("map");
  }

  const handleMouseEnter = () => {
    if (activeFilterTab === "integrated") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("slug", feedItem.slug);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleMouseLeave = () => {
    if (activeFilterTab === "integrated") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("slug");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ width: `${width}px`, height: `${height}px` }}
      initial={{ y: 50, opacity: 0 }}
      animate={controls}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {isLoading || !hasMounted || !isImageLoaded ? (
        <CardSkeleton primaryCategoryId={primaryCategoryId} />
      ) : (
        <Link
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          href={`${navigationPaths[pathname]}/${feedItem.slug}`}
          className="w-full h-full relative group rounded-xl overflow-hidden"
        >
          <NextImage
            isFill
            quality={100}
            width={width}
            height={height}
            alt={updatedImageList?.[activeImageIndex]?.alt}
            imgSrc={updatedImageList?.[activeImageIndex]?.imageUrl}
            objectFit="cover"
            className=" h-full w-full rounded-xl object-cover"
          />
          <div className="relative w-full h-full">
            {/* Overlay (only bottom 50%) */}
            <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/40 to-transparent rounded-b-xl" />

            {/* Text Content */}
            <div className="absolute bottom-0 right-0 p-4 text-white font-bold w-full">
              <h3 className="lg:text-[1rem] 3xl:text-[1.5rem] line-clamp-1">
                {feedItem?.name}
              </h3>
              <div className="flex items-center gap-2">
                <IconImage icon="location" width={20} height={20} />
                <span className="md:text-sm">
                  {feedItem?.address?.location
                    ? feedItem?.address?.location
                    : "Tel Aviv"}
                </span>
              </div>
              <div className="hidden group-hover:block">
                <div
                  dangerouslySetInnerHTML={{ __html: feedItem?.description }}
                  className=" line-clamp-2 font-bold text-[12px] text-white mt-1"
                />
                <div
                  className={`flex items-center justify-between w-full mt-2 `}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (activeImageIndex > 0) {
                        setActiveImageIndex((prev) => prev - 1);
                      }
                    }}
                    className=" cursor-pointer"
                    disabled={activeImageIndex === 0}
                  >
                    <IconImage icon="next" />
                  </button>
                  <div className="flex items-center gap-2">
                    {feedItem?.images?.map((_, index) => {
                      const isActive = index === activeImageIndex;
                      return (
                        <span
                          key={index}
                          className={`${
                            isActive
                              ? "w-2.5 h-2.5 bg-white"
                              : "w-2 h-2 bg-gray-400"
                          } rounded-full transition-all duration-300`}
                        />
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        activeImageIndex <
                        (feedItem?.images?.length ?? 0) - 1
                      ) {
                        setActiveImageIndex((prev) => prev + 1);
                      }
                    }}
                    disabled={activeImageIndex === feedItem?.images?.length - 1}
                    className=" cursor-pointer"
                  >
                    <IconImage icon="prev" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden absolute top-4 right-4 group-hover:flex items-center gap-2.5">
            <IconImage width={30} height={30} icon="circular-heart" />
            {pathname !== "/events" && pathname !== "/trails" && (
              <IconImage
                width={30}
                height={30}
                icon="circular-map-fold"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleMapIconClick(feedItem._id);
                }}
              />
            )}
          </div>
        </Link>
      )}
    </motion.div>
  );
};

export default FeedCard;
