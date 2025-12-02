"use client";

import Link from "next/link";
import { useState } from "react";
import { BiSolidNavigation } from "react-icons/bi";

import { IconImage } from "../ui";
import { menuItems, misc } from "@/constant/hebrew";
import AttributePills from "../AttributePills";
import { Map } from "@/app/(details)/_components";
import MobileProductList from "./ProductList.mobile";
import MobileImageGallery from "./ImageGallery.mobile";
import { categoryColors, daysMapping } from "@/lib/utils";
import MobileDeliveriesContent from "./DeliveriesContent.mobile ";
import MobileLinkShareBottomDrawer from "./LinkShareBottomDrawer.mobile";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import ContactUsInfo from "../ContactUsInfo";

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
  const contactDetails = businessDetails?.contactDetails;

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
            className=" font-normal text-theme mb-2"
            dangerouslySetInnerHTML={{
              __html: removeInlineStylesFromHTML(
                businessDetails?.shortDescription || "",
              ),
            }}
          />
        </section>

        <div className="flex flex-wrap items-center gap-3 text-charcoal px-8 mb-8">
          {/* Email */}
          {contactDetails?.email && (
            <ContactUsInfo
              icon="mail"
              text={contactDetails.email}
              href={`mailto:${contactDetails.email}`}
            />
          )}
          {/* Phone */}
          {contactDetails?.phone && (
            <ContactUsInfo
              icon="phone"
              text={contactDetails?.phone}
              href={`tel:${contactDetails?.phone?.replace(/\s+/g, "")}`}
            />
          )}

          {/* WhatsApp */}
          {contactDetails?.whatsAppNumber && (
            <ContactUsInfo
              icon="whatsapp-outlined"
              text={contactDetails.whatsAppNumber}
              href={`https://wa.me/${contactDetails?.whatsAppNumber?.replace(/\D/g, "")}`}
            />
          )}
        </div>

        <MobileImageGallery images={businessDetails?.images} />
        <section className="px-4">
          <AttributePills
            items={[
              ...businessDetails?.accessibilitiesId,
              ...businessDetails?.groupTypesId,
            ]}
          />
        </section>
        <div className=" mt-4 mb-8 px-8 py-4">
          <h2 className="text-3xl font-bold">{menuItems.ourStory}</h2>
          <div
            className="font-normal text-theme text-wrap"
            dangerouslySetInnerHTML={{
              __html: businessDetails?.description || "",
            }}
          />
        </div>

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
