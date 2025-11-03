"use client";

import Link from "next/link";
import { useState } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { BiSolidNavigation } from "react-icons/bi";

import { IconImage } from "../ui";
import { misc } from "@/constant/hebrew";
import AttributePills from "../AttributePills";
import { getCityOrCenter } from "@/lib/helpers";
import { Map } from "@/app/(details)/_components";
import MobileProductList from "./ProductList.mobile";
import MobileImageGallery from "./ImageGallery.mobile";
import { categoryColors, daysMapping } from "@/lib/utils";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const apiLat = businessDetails?.geoLocation?.lat;
  const apiLng = businessDetails?.geoLocation?.long;

  return (
    <>
      <div className="md:hidden max-sm:block pt-30 pb-12">
        <div className="flex items-center justify-end gap-1 mt-8 px-4">
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
            {/* {userLiveLocation && (
              <span className="font-bold">
                ק״מ {calculateDistanceTo(Number(apiLat), Number(apiLng))}
              </span>
            )} */}
          </Link>
        </div>

        <section className="px-10 py-4">
          <h1 className="text-6xl font-bold">{businessDetails.name}</h1>
          <div
            className="font-normal text-theme line-clamp-3 mt-4 mb-8"
            dangerouslySetInnerHTML={{
              __html: businessDetails?.shortDescription || "",
            }}
          />
          <div className="flex items-center gap-2 mt-2">
            <IoLocationSharp
              size={34}
              color={categoryColors[businessDetails.primaryCategoryId]}
            />
            <span className="font-bold text-xl">
              {getCityOrCenter(businessDetails?.address)}
            </span>
          </div>
        </section>

        <MobileImageGallery images={businessDetails?.images} />
        <section className="px-6 py-2 ">
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

        <section className="px-6 py-4">
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
