"use client";

import clsx from "clsx";
import Image from "next/image";

import Map from "./Map.details";
import { useImageCrop } from "@/hooks";
import { daysMapping } from "@/lib/utils";
import { IconImage } from "@/components/ui";
import { CardSkeleton } from "@/components/skeletons";
import { menuItems, misc } from "@/constant/hebrew";

const ConstatUsInfo = ({ icon, text }: { icon: string; text: string }) => {
  if (!text) return;
  return (
    <div className=" flex items-center gap-2.5">
      <IconImage icon={icon} />
      <span>{text}</span>
    </div>
  );
};

const OpeningDayHours = ({ days, open, close }: OpeningHrs) => (
  <div className="flex justify-between gap-24 font-normal  text-theme">
    <span className="text-sm">
      {daysMapping[days as keyof typeof daysMapping]}
    </span>
    <span className="">{open + "-" + close}</span>
  </div>
);

// Main component
const OurStoryTabContent = ({
  images,
  primaryCategoryId,
  contactDetails,
  geoLocation,
  description,
  shortDescription,
  name,
  openingHrs,
}: BusinessDetailsProps) => {
  const aspectRatio = 438 / 360;

  const {
    loading,
    isImageTransitionComplete,
    handleImageError,
    handleImageLoad,
    finalImageSrc,
  } = useImageCrop(images?.[0], aspectRatio);

  return (
    <div className="space-y-12.5">
      <div className="grid grid-cols-12 gap-10.5">
        <div className=" col-span-5 ">
          {loading ? (
            <CardSkeleton
              className={"w-[638px] h-[360px] rounded-xl"}
              primaryCategoryId={primaryCategoryId}
            />
          ) : (
            <div
              className={clsx(
                "relative w-full h-full transition-opacity duration-300",
                isImageTransitionComplete ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                width={838}
                height={360}
                className="rounded-xl  h-[360px] w-[838px] object-cover ultra-sharp"
                alt={images[0]?.alt || "Main image"}
                src={finalImageSrc}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          )}
        </div>

        <div className="col-span-7">
          <h2 className=" text-2xl font-bold text-dark">{name}</h2>
          <div className="text-dark font-normal space-y-4 mt-3 mb-10">
            <div dangerouslySetInnerHTML={{ __html: description }} />
            <div
              dangerouslySetInnerHTML={{
                __html: shortDescription,
              }}
            />
          </div>
          <div className="flex items-center gap-7.5 text-charcoal">
            <span>{menuItems.contactUs}</span>
            <ConstatUsInfo icon="phone" text={contactDetails?.phone} />
            <ConstatUsInfo icon="mail" text={contactDetails?.email} />
            <ConstatUsInfo
              icon="whatsapp-outlined"
              text={contactDetails?.whatsAppNumber}
            />
          </div>
        </div>
      </div>

      {/* Map & Opening ours */}
      <section className="flex items-center gap-7.5">
        <Map
          className="w-[70%] flex-initial h-[35vh]"
          primaryCategoryId={primaryCategoryId}
          geoLocation={geoLocation}
        />
        {openingHrs?.some((item) => item?.open && item?.close) && (
          <div className="border-2 border-primary rounded-xl px-14.5 py-7.5 w-[30%] flex-initial">
            <div className="flex justify-between gap-24 text-sm font-normal mb-2.5">
              <span className="text-charcoal">{misc.hours}</span>
              <span className="text-[#28C268]">{misc.openNow}</span>
            </div>
            <div className="space-y-1.5">
              {openingHrs.map((item, index) => (
                <OpeningDayHours key={index} {...item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default OurStoryTabContent;
