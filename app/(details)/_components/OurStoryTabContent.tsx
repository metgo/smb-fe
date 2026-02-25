"use client";

import clsx from "clsx";
import Image from "next/image";

import Map from "./Map.details";
import { useImageCrop } from "@/hooks";
import { daysMapping } from "@/lib/utils";
import { CardSkeleton } from "@/components/skeletons";
import { menuItems, misc } from "@/constant/hebrew";
import ContactUsInfo from "@/components/ContactUsInfo";
import { isPlaceOpenNow } from "@/lib/helpers";

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
                alt={images?.[0]?.alt || "Main image"}
                src={finalImageSrc}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          )}
        </div>

        <div className="col-span-7">
          <div className="text-dark font-normal space-y-4 mt-3 mb-10 w-2/3">
            <div dangerouslySetInnerHTML={{ __html: description || "" }} />
            <div
              dangerouslySetInnerHTML={{
                __html: shortDescription || "",
              }}
            />
          </div>
          <div className="flex items-center gap-7.5 text-charcoal">
            <span>{menuItems?.contactUs}</span>
            {/* Phone */}
            {contactDetails?.phone && (
              <ContactUsInfo
                icon="phone"
                text={contactDetails?.phone}
                href={`tel:${"+972" + contactDetails?.phone?.replace(/\s+/g, "")}`}
              />
            )}

            {/* Email */}
            {contactDetails?.email && (
              <ContactUsInfo
                isEmail
                icon="mail"
                text={contactDetails.email}
                href={`mailto:${contactDetails.email}`}
              />
            )}

            {/* WhatsApp */}
            {contactDetails?.whatsAppNumber && (
              <ContactUsInfo
                icon="whatsapp-outlined"
                text={contactDetails.whatsAppNumber}
                href={`https://wa.me/${"+972" + contactDetails?.whatsAppNumber?.replace(/\D/g, "")}/?text=${misc.whatsappText}&type=phone_number&app_absent=0`}
              />
            )}
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
              {isPlaceOpenNow(openingHrs) ? (
                <span className="text-[#28C268]"> {misc.openNow}</span>
              ) : (
                <span className="text-red-600"> {misc.closeNow}</span>
              )}
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
