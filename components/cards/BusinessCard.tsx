"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

import { IconImage } from "@/components/ui";
import { handleCropImage } from "@/lib/helpers";
import { tempCardInfo } from "@/constant/hebrew";
import useGeneralStore from "@/stores/generalStore";
import LocalStorageService from "@/lib/localStorage";
import { usePathname, useSearchParams } from "next/navigation";
import { navigationPaths } from "@/lib/utils";
import { CardSkeleton } from "../skeletons";

const placeholderImage = "/images/image-placeholder.jpg";

const BusinessCard = ({ height, width, business }: BusinessCardProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const aspectRatio = width / height;

  const { categoryId = "", subCategoryId = "" } = Object.fromEntries(
    searchParams.entries(),
  );
  const { activeCategoryKey, setActiveFilterTab, setClickedBusinessId } =
    useGeneralStore();

  const existingFaviourtBusiness =
    LocalStorageService.get<FaviouriteBusinessProps[]>("favorite-business") ||
    [];

  const [isLoading, setIsLoading] = useState(false);
  const [updatedImage, setUpdatedImage] = useState({
    imageUrl: placeholderImage,
    alt: "abc",
  });
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const primaryImageObj = business?.images?.find((item) => item?.isPrimary);

      if (primaryImageObj) {
        if (primaryImageObj?.subCoordinates) {
          handleCropImage(
            primaryImageObj,
            aspectRatio,
            setIsLoading,
            setUpdatedImage,
          );
        } else {
          setUpdatedImage({
            imageUrl: primaryImageObj?.image,
            alt: primaryImageObj?.alt,
          });
          setIsLoading(false);
        }
      } else {
        setUpdatedImage({
          imageUrl: business?.images[0]?.image,
          alt: business?.name,
        });
        setIsLoading(false);
      }
    }, 3000);
    setIsLoading(true);
    return () => clearTimeout(timer);
  }, [categoryId, subCategoryId]);

  function addWishlistHandler(e: any) {
    e.stopPropagation();
    e.preventDefault();
    LocalStorageService.remove("favorite-business");
    const item: FaviouriteBusinessProps = {
      height,
      width,
      _id: business._id,
      name: business.name,
      imageUrl: updatedImage.imageUrl,
      location: tempCardInfo.location,
    };

    // Check if it's already in favorites
    const isAlreadyAdded = existingFaviourtBusiness.some(
      (b) => b._id === item._id,
    );
    if (isAlreadyAdded) {
      console.log("Item already in wishlist");
      return;
    }

    // Add the new item
    const updated = [...existingFaviourtBusiness, item];

    // Save updated list
    LocalStorageService.set<FaviouriteBusinessProps[]>(
      "favorite-business",
      updated,
    );
  }

  const primaryCategoryId = activeCategoryKey
    ? activeCategoryKey
    : business?.primaryCategoryId
      ? business?.primaryCategoryId
      : "6566e36ba77d2a477266d2f4";

  function handleMapIconClick(id: string) {
    setClickedBusinessId(id);
    setActiveFilterTab("map");
  }

  return (
    <motion.div
      ref={ref}
      style={{ width, height }}
      initial={{ y: 50, opacity: 0 }}
      animate={controls}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {isLoading || !hasMounted ? (
        <CardSkeleton primaryCategoryId={primaryCategoryId} />
      ) : (
        <Link
          href={`${navigationPaths[pathname]}/${business.slug}`}
          className="w-full h-full relative group rounded-xl overflow-hidden"
        >
          <Image
            fill
            priority
            unoptimized
            quality={100}
            alt={updatedImage.alt || "Business"}
            src={updatedImage.imageUrl || placeholderImage}
            className="object-cover h-full w-full rounded-xl"
            onError={() =>
              setUpdatedImage({ imageUrl: placeholderImage, alt: "abc" })
            }
          />
          <div className="relative w-full h-full">
            {/* Overlay (only bottom 50%) */}
            <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/40 to-transparent rounded-b-xl" />

            {/* Text Content */}
            <div className="absolute bottom-0 right-0 ps-4 pb-4 text-white font-bold w-full">
              <h3 className="lg:text-[1rem] 3xl:text-[1.5rem]">
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
              onClick={() => addWishlistHandler}
            />
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
          </div>
        </Link>
      )}
    </motion.div>
  );
};

export default BusinessCard;
