"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, useInView, useAnimation } from "framer-motion";

import { IconImage, NextImage } from "@/components/ui";
import { navigationPaths } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { CardSkeleton } from "@/components/skeletons";
import { useImagePresent } from "@/hooks/useImagePresent";

const BusinessCard = ({ height, width, business }: BusinessCardProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const aspectRatio = width / height;

  const { categoryId = "", subCategoryId = "" } = Object.fromEntries(
    searchParams.entries(),
  );

  const { activeCategoryKey, setActiveFilterTab, setClickedBusinessId } =
    useGeneralStore();
  const { isLoading, updatedImage, isImageLoaded } = useImagePresent(
    aspectRatio,
    business?.images,
    [categoryId, subCategoryId],
  );

  // const existingFaviourtBusiness =
  //   LocalStorageService.get<FaviouriteBusinessProps[]>("favorite-business") ||
  //   [];

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

  // function addWishlistHandler(e: any) {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   LocalStorageService.remove("favorite-business");
  //   const item: FaviouriteBusinessProps = {
  //     height,
  //     width,
  //     _id: business._id,
  //     name: business.name,
  //     imageUrl: updatedImage.imageUrl,
  //     location: tempCardInfo.location,
  //   };

  //   // Check if it's already in favorites
  //   const isAlreadyAdded = existingFaviourtBusiness.some(
  //     (b) => b._id === item._id,
  //   );
  //   if (isAlreadyAdded) {
  //     console.log("Item already in wishlist");
  //     return;
  //   }

  //   // Add the new item
  //   const updated = [...existingFaviourtBusiness, item];

  //   // Save updated list
  //   LocalStorageService.set<FaviouriteBusinessProps[]>(
  //     "favorite-business",
  //     updated,
  //   );
  // }

  const primaryCategoryId = activeCategoryKey
    ? activeCategoryKey
    : business?.primaryCategoryId
      ? business?.primaryCategoryId
      : "6566e36ba77d2a477266d2f4";

  function handleMapIconClick(id: string) {
    setClickedBusinessId(id);
    setActiveFilterTab("map");
  }

  // if(!hasMounted) return null;
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
          href={`${navigationPaths[pathname]}/${business.slug}`}
          className="w-full h-full relative group rounded-xl overflow-hidden"
        >
          <NextImage
            isFill
            quality={100}
            width={width}
            height={height}
            alt={updatedImage.alt}
            imgSrc={updatedImage.imageUrl}
            className=" h-full w-full rounded-xl"
          />
          <div className="relative w-full h-full">
            {/* Overlay (only bottom 50%) */}
            <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/40 to-transparent rounded-b-xl" />

            {/* Text Content */}
            <div className="absolute bottom-0 right-0 ps-4 pb-4 text-white font-bold w-full">
              <h3 className="lg:text-[1rem] 3xl:text-[1.5rem] line-clamp-1">
                {business?.name}
              </h3>
              <div className="flex items-center gap-2">
                <IconImage icon="location" width={20} height={20} />
                <span className="md:text-sm">
                  {business?.address?.city
                    ? business?.address?.city
                    : "Tel Aviv"}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden absolute top-4 right-4 group-hover:flex items-center gap-2.5">
            <IconImage
              width={30}
              height={30}
              icon="circular-heart"
              // onClick={() => addWishlistHandler(business._id)}
            />
            {pathname !== "/events" && (
              <IconImage
                width={30}
                height={30}
                icon="circular-map-fold"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleMapIconClick(business._id);
                }}
              />
            )}
          </div>
        </Link>
      )}
    </motion.div>
  );
};

export default BusinessCard;
