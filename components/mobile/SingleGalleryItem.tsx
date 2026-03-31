import Image from "next/image";
import { motion } from "framer-motion";

import { staticImages } from "@/constant/staticImages";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import MobileFeedScreenActionIcons from "./FeedScreenActionIcons.mobile";

interface SingleGalleryItemProps {
  scale: number;
  activeFeedItem: BusinessProps | null;
  geoLocation: { lat: number; long: number };
  onNavigate: (e: React.MouseEvent) => void;
  updatedImage: any;
  containerRef: any;
}

const SingleGalleryItem = ({
  scale,
  activeFeedItem,
  geoLocation,
  onNavigate,
  updatedImage,
  containerRef,
}: SingleGalleryItemProps) => {
  const currentImage = updatedImage?.imageUrl || staticImages.placeholder;

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full flex-shrink-0"
    >
      <div
        onClick={onNavigate}
        className="custom-cursor block relative w-full h-full"
      >
        <Image
          fill
          priority
          unoptimized
          src={currentImage}
          alt={activeFeedItem?.name || "Business image"}
          className="object-cover"
        />

        <MobileFeedScreenActionIcons
          trailInfo={`?businessId=${activeFeedItem?._id}&slug=${activeFeedItem?.slug}`}
          geoLocation={geoLocation}
          posTop={scale * 140}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-10" />

        <div className="absolute top-50 right-10 left-10 z-20 text-white">
          <h1
            style={{ fontSize: 60 * scale }}
            className="font-bold line-clamp-2 leading-14"
          >
            {activeFeedItem?.name}
          </h1>
          <div
            dangerouslySetInnerHTML={{
              __html: removeInlineStylesFromHTML(
                activeFeedItem?.description || "",
              ),
            }}
            style={{ fontSize: 24 * scale }}
            className="line-clamp-3 font-bold mt-1"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SingleGalleryItem;
