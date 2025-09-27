import { Map } from "@/app/(details)/_components";
import AttributePills from "../AttributePills";
import { ProductCard } from "../cards";
import { IconImage, NextImage } from "../ui";
import { daysMapping } from "@/lib/utils";
import { misc } from "@/constant/hebrew";
import DeliveriesContent from "./DeliveriesContent.mobile ";
import Link from "next/link";
import { BiSolidNavigation } from "react-icons/bi";
import { IoLocationSharp } from "react-icons/io5";
import { getCityOrCenter } from "@/lib/helpers";

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
  return (
    <div className="md:hidden max-sm:block">
      <div className="flex items-center justify-end gap-4 mt-8 px-4">
        <IconImage width={30} height={30} icon="share" />
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${businessDetails?.geoLocation?.lat + "," + businessDetails?.geoLocation?.long}`}
          className={
            "flex items-center gap-1.25 ps-2.5 pe-4 py-1 custom-cursor"
          }
        >
          <BiSolidNavigation size={34} color="#4C94D9" />
          {/* <span className="font-bold">31 ק״מ</span> */}
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
          <IoLocationSharp size={34} color="#4C94D9" />
          <span>{getCityOrCenter(businessDetails?.address)}</span>
        </div>
      </section>
      <section className="px-4 py-2 ">
        <div>
          <NextImage
            width={380}
            height={380}
            imgSrc={businessDetails?.images?.[0]?.image}
            alt={businessDetails?.images?.[0]?.alt}
            className="object-cover w-full h-[380px] rounded-2xl"
          />
          {businessDetails?.images?.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-hidden">
              {businessDetails?.images?.slice(1, 5)?.map((item, index) => (
                <div key={index} className="col-span-4">
                  <NextImage
                    width={90}
                    height={90}
                    imgSrc={item?.image}
                    alt={item?.alt}
                    className="object-cover w-[90] h-[90] rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <AttributePills
          items={[
            ...businessDetails?.accessibilitiesId,
            ...businessDetails?.groupTypesId,
          ]}
        />
      </section>

      {products?.length > 0 && (
        <section className="flex gap-4 mt-4 overflow-x-auto max-sm:px-4 max-sm:scroll-smooth max-sm:snap-x max-sm:snap-mandatory scrollbar-hide">
          {products?.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 snap-start max-sm:w-[80%] sm:w-auto relative"
            >
              <ProductCard
                product={product}
                primaryCategoryId={businessDetails?.primaryCategoryId}
              />
            </div>
          ))}
        </section>
      )}

      <section className="relative mt-4">
        <DeliveriesContent {...businessDetails} />
      </section>

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
  );
};

export default MobileBusinessDetails;
