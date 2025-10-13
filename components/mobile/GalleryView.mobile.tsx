import Image from "next/image";
import Link from "next/link";
import { BiNavigation } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IconImage } from "../ui";
import { CardSkeleton } from "../skeletons";
import { useImageCrop } from "@/hooks";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import clsx from "clsx";

interface GalleryViewProps {
  currentImage: any;
  activeFeedItem: BusinessProps | null;
  geoLocation: { lat: number; lng: number };
  userLiveLocation: any;
  isFackLoading: boolean;
  calculateDistanceTo: (lat: number, lng: number) => number | null;
  onNavigate: (e: React.MouseEvent) => void;
}

const GalleryViewMobile = ({
  currentImage,
  activeFeedItem,
  geoLocation,
  userLiveLocation,
  calculateDistanceTo,
  onNavigate,
  isFackLoading,
}: GalleryViewProps) => {
  const {
    finalImageSrc,
    handleImageLoad,
    handleImageError,
    isImageTransitionComplete,
    shouldShowSkeleton,
  } = useImageCrop(currentImage, 390 / 840);

  return (
    <>
      {shouldShowSkeleton || isFackLoading ? (
        <CardSkeleton
          className="w-full h-full absolute inset-0"
          primaryCategoryId={
            activeFeedItem?.primaryCategoryId || "6566e31ca77d2a477266d2d6"
          }
        />
      ) : (
        <div
          onClick={onNavigate}
          className={clsx(
            "custom-cursor block relative w-full h-full transition-opacity duration-300",
            isImageTransitionComplete ? "opacity-100" : "opacity-80",
          )}
        >
          <Image
            unoptimized
            fill
            src={finalImageSrc}
            alt={currentImage?.alt || "Feed active image"}
            className="object-cover ultra-sharp"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority
          />

          {/* Top Right Controls */}
          <div className="w-[94%] absolute top-30 right-4 flex justify-between text-white z-20">
            <BsThreeDotsVertical size={30} />
            <div className="flex items-center flex-col">
              <Link
                target="_blank"
                data-no-swipe
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${geoLocation.lat},${geoLocation.lng}`}
                className="flex flex-col items-center gap-1.25 ps-2.5 pe-4 py-1 custom-cursor"
                onClick={(e) => e.stopPropagation()}
              >
                <BiNavigation size={36} />
                {userLiveLocation && (
                  <span className="font-bold">
                    ק״מ{" "}
                    {calculateDistanceTo(
                      Number(geoLocation.lat),
                      Number(geoLocation.lng),
                    )}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/30 to-black/10 z-10" />

          {/* Content */}
          <div className="absolute top-60 right-10 left-10 z-20 text-white">
            <h1 className="text-6xl font-bold line-clamp-2">
              {activeFeedItem?.name}
            </h1>
            <div
              dangerouslySetInnerHTML={{
                __html: removeInlineStylesFromHTML(
                  activeFeedItem?.description || "",
                ),
              }}
              className="line-clamp-3 font-bold text-2xl mt-1"
            />
            {activeFeedItem?.serviceType !== "point_of_interest" &&
              activeFeedItem?.address?.city && (
                <div className="flex items-center gap-2 mt-4">
                  <IconImage icon="location" width={30} height={30} />
                  <span className="text-xl font-bold">
                    {activeFeedItem?.address?.city}
                  </span>
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryViewMobile;
