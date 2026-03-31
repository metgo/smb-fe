"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { useSearchParams } from "next/navigation";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

import { pathNames } from "@/lib/endpoints";
import { ImageCarouselControls } from "@/components/ui";
import { useImagePresent } from "@/hooks/image/useImagePresent";
import {
  getPrimaryCategoryId,
  removeInlineStylesFromHTML,
  sanitizeHtml,
} from "@/lib/helpers";
import { CardSkeleton } from "../skeletons";
import { staticImages } from "@/constant/staticImages";
import { useCommonHook } from "@/hooks";
import { blogLabels } from "@/constant/hebrew";
import {
  ANIMATION_CONFIG,
  cardVariants,
  INTERSECTION_CONFIG,
  MOTION_CONFIG,
} from "@/lib/animationConfig";

interface BlogFeedCardProps {
  height: number;
  width: number;
  feedItem: BlogFeed; // Replace with proper type
}

const BlogFeedCard = ({ height, width, feedItem }: BlogFeedCardProps) => {
  const searchParams = useSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  const { isCurrentPage } = useCommonHook();

  const pageTypes = useMemo(
    () => ({
      isEventPage: isCurrentPage(pathNames.events),
      isBlogArticlePage: isCurrentPage(pathNames.blogArticles),
      isTrailPage: isCurrentPage(pathNames.trails),
    }),
    [isCurrentPage],
  );

  // Memoized search params
  const urlParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      categoryId: params.categoryId || "",
      subCategoryId: params.subCategoryId || "",
      activeCategoryKey: searchParams.get("categoryId"),
    };
  }, [searchParams]);

  // Optimized image and dependency arrays
  const { images, deps } = useMemo(
    () => ({
      images: feedItem?.images ?? [],
      deps: pageTypes.isEventPage
        ? [feedItem]
        : [urlParams.categoryId, urlParams.subCategoryId],
    }),
    [feedItem],
  );

  // Image loading hook
  const { isLoading, updatedImageList, inView, containerRef } = useImagePresent(
    width / height, // aspectRatio
    images,
    activeImageIndex,
    deps,
    INTERSECTION_CONFIG,
  );

  // Animation controls
  const animationControls = useAnimation();
  const isCardInView = useInView(containerRef, MOTION_CONFIG as any);

  // Mount effect
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Animation effect
  useEffect(() => {
    if (isCardInView) {
      animationControls.start("visible");
    }
  }, [isCardInView, animationControls]);

  // Memoized computed values
  const computedValues = useMemo(
    () => ({
      primaryCategoryId: getPrimaryCategoryId(
        window.location.pathname,
        urlParams.activeCategoryKey || "",
        "",
      ),
      currentImage: updatedImageList?.[activeImageIndex],
      shouldShowSkeleton: !hasMounted || !inView || isLoading,
    }),
    [
      urlParams.activeCategoryKey,
      updatedImageList,
      activeImageIndex,
      hasMounted,
      inView,
      isLoading,
    ],
  );

  // Render skeleton
  if (computedValues.shouldShowSkeleton) {
    return (
      <motion.div
        ref={containerRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={ANIMATION_CONFIG}
      >
        <CardSkeleton
          width={width}
          height={height}
          primaryCategoryId={computedValues.primaryCategoryId}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      initial="hidden"
      animate={animationControls}
      variants={cardVariants}
      transition={ANIMATION_CONFIG}
    >
      <div
        className={clsx(
          "w-full h-full relative group rounded-xl overflow-hidden",
        )}
      >
        {/* Main Image */}
        <Image
          fill
          unoptimized
          quality={100}
          sizes={`${width}px`}
          alt={computedValues.currentImage?.alt || ""}
          src={
            computedValues.currentImage?.imageUrl || staticImages.placeholder
          }
          className={clsx(
            "object-cover transition-transform duration-500 ease-in-out ultra-sharp",
            "group-hover:scale-140",
          )}
          priority={false}
        />

        {/* Content Overlay */}
        <BlogFeedCardContent
          feedItem={feedItem}
          images={images}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
        />
      </div>
    </motion.div>
  );
};

// Extracted sub-components for better organization
const BlogFeedCardContent = ({
  feedItem,
  images,
  activeImageIndex,
  setActiveImageIndex,
}: {
  feedItem: any;
  images: any[];
  activeImageIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
}) => (
  <div className="relative w-full h-full">
    {/* Gradient Overlay */}
    <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/40 to-transparent rounded-b-xl" />

    {/* Text Content */}
    <div className="absolute bottom-0 right-0 p-4 text-white font-bold w-full">
      <h3 className="lg:text-[1rem] 3xl:text-[1.5rem] line-clamp-1">
        {feedItem?.title}
      </h3>

      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(removeInlineStylesFromHTML(feedItem?.subTitle)),
        }}
        className="line-clamp-2 font-bold text-[12px] text-white mt-1"
      />
      <div className="hidden group-hover:block">
        {images.length > 1 && (
          <ImageCarouselControls
            totalImages={feedItem?.images?.length}
            activeIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
          />
        )}

        <Link
          href={`${pathNames.blogArticleDetails}/${feedItem._id}`}
          className="py-2.5 px-4 rounded-xl custom-cursor bg-black/40 mt-4 flex items-center gap-2 w-max"
        >
          <span>{blogLabels.toTheFullBlog}</span>
          <IoIosArrowBack size={20} />
        </Link>
      </div>
    </div>
  </div>
);

export default BlogFeedCard;
