"use client";

import Link from "next/link";
import { useState } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { BiSolidNavigation } from "react-icons/bi";

import { categoryColors, daysMapping } from "@/lib/utils";
import { misc } from "@/constant/hebrew";
import { useCommonHook } from "@/hooks";
import { IconImage } from "../ui";
import AttributePills from "../AttributePills";
import { getCityOrCenter } from "@/lib/helpers";
import { Map } from "@/app/(details)/_components";
import useGeneralStore from "@/stores/generalStore";
import MobileImageGallery from "./ImageGallery.mobile";
import MobileProductList from "./ProductList.mobile";
import MobileDeliveriesContent from "./DeliveriesContent.mobile ";
import MobileLinkShareBottomDrawer from "./LinkShareBottomDrawer.mobile";

const OpeningDayHours = ({ days, open, close }: OpeningHrs) => (
  <div className="flex justify-between gap-24 font-normal  text-theme">
    <span className="text-sm">
      {daysMapping[days as keyof typeof daysMapping]}
    </span>
    <span className="">{open + "-" + close}</span>
  </div>
);

const MobileBusinessDetails = ({
  businessDetails,
  products,
}: {
  businessDetails: BusinessDetailsProps;
  products: Product[];
}) => {
  const { calculateDistanceTo } = useCommonHook();
  const { userLiveLocation } = useGeneralStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const apiLat = businessDetails?.geoLocation?.lat;
  const apiLng = businessDetails?.geoLocation?.long;

  return (
    <>
      <div className="md:hidden max-sm:block">
        <div className="flex items-start justify-end gap-1 mt-8 px-4">
          <IconImage
            width={30}
            height={30}
            icon="share"
            onClick={() => setIsDrawerOpen(true)}
          />
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${apiLat + "," + apiLng}`}
            className={
              "flex items-center flex-col gap-1.25 ps-2.5 pe-4 py-1 custom-cursor"
            }
          >
            <BiSolidNavigation
              size={34}
              color={categoryColors[businessDetails.primaryCategoryId]}
            />
            {userLiveLocation && (
              <span className="font-bold">
                ק״מ {calculateDistanceTo(Number(apiLat), Number(apiLng))}
              </span>
            )}
          </Link>
        </div>

        <section className="px-10 py-4 font-bold">
          <h1 className="text-6xl">{businessDetails.name}</h1>
          <div
            className=" text-2xl line-clamp-3 mt-4"
            dangerouslySetInnerHTML={{
              __html: businessDetails?.shortDescription || "",
            }}
          />
          <div className="flex items-center gap-2 mt-2">
            <IoLocationSharp
              size={34}
              color={categoryColors[businessDetails.primaryCategoryId]}
            />
            <span>{getCityOrCenter(businessDetails?.address)}</span>
          </div>
        </section>
        <section className="px-4 py-2 ">
          <MobileImageGallery images={businessDetails?.images} />
          <AttributePills
            items={[
              ...businessDetails?.accessibilitiesId,
              ...businessDetails?.groupTypesId,
            ]}
          />
        </section>

        {products?.length > 0 && (
          <MobileProductList
            products={products}
            primaryCategoryId={businessDetails?.primaryCategoryId}
          />
        )}

        <MobileDeliveriesContent {...businessDetails} />

        <section className="px-10 py-8">
          {businessDetails?.openingHrs?.some(
            (item) => item?.open && item?.close,
          ) && (
            <div className="border-2 border-primary rounded-xl px-4 py-7.5 w-full flex-initial mb-4">
              <div className="flex justify-between gap-4 text-sm font-normal mb-2.5">
                <span className="text-charcoal">{misc.hours}</span>
                <span className="text-[#28C268]">{misc.openNow}</span>
              </div>
              <div className="space-y-1.5">
                {businessDetails?.openingHrs.map((item, index) => (
                  <OpeningDayHours key={index} {...item} />
                ))}
              </div>
            </div>
          )}

          <Map
            className="w-full flex-initial h-[35vh]"
            primaryCategoryId={businessDetails?.primaryCategoryId}
            geoLocation={businessDetails?.geoLocation}
          />
        </section>
        <section></section>
      </div>

      {isDrawerOpen && (
        <MobileLinkShareBottomDrawer
          isOpen={isDrawerOpen}
          setIsOpen={setIsDrawerOpen}
        />
      )}
    </>
  );
};

export default MobileBusinessDetails;
