"use client";

import { IconImage, NextImage } from "@/components/ui";
import { menuItems, misc } from "@/constant/hebrew";
import { businessDetails } from "@/constant/placeholderData";
import { useImageScale } from "@/hooks/useImageScale";
import Map from "./Map.details";

const ConstatUsInfo = ({ icon, text }: { icon: string; text: string }) => (
  <div className=" flex items-center gap-2.5">
    <IconImage icon={icon} />
    <span>{text}</span>
  </div>
);

const OpeningDayHours = () => (
  <div className="flex justify-between gap-24 font-normal  text-theme">
    <span className="text-sm">{"ראשון"}</span>
    <span className="">{"08:00-18:00"}</span>
  </div>
);
const OurStoryTabContent = () => {
  const { scale } = useImageScale();

  return (
    <div className="space-y-12.5">
      <div className="flex gap-10.5">
        <NextImage
          alt={businessDetails.title}
          imgSrc={businessDetails.image}
          width={438}
          height={360}
          scale={scale}
          className=" rounded-3xl"
        />
        <div>
          <h2 className=" text-2xl font-bold text-dark">
            {businessDetails.title}
          </h2>
          <div className="text-dark font-normal space-y-4 mt-3 mb-10">
            <p>{businessDetails.para1}</p>
            <p>{businessDetails.para2}</p>
          </div>
          <div className="flex items-center gap-7.5 text-[#343434]">
            <span>{menuItems.contactUs}</span>
            <ConstatUsInfo icon="phone" text={businessDetails.phone} />
            <ConstatUsInfo icon="mail" text={businessDetails.mail} />
            <ConstatUsInfo
              icon="whatsapp-outlined"
              text={businessDetails.whatsapp}
            />
          </div>
        </div>
      </div>

      {/* Map & Opening ours */}
      <section className="flex items-center gap-7.5">
        <Map className="w-full h-[30vh]" />
        <div className="border-2 border-primary rounded-xl px-14.5 py-7.5 w-[480px]">
          <div className="flex justify-between gap-24 text-sm font-normal mb-2.5">
            <span className="text-[#343434]">{misc.hours}</span>
            <span className="text-[#28C268]">{misc.openNow}</span>
          </div>
          <div className="space-y-1.5">
            <OpeningDayHours />
            <OpeningDayHours />
            <OpeningDayHours />
            <OpeningDayHours />
            <OpeningDayHours />
            <OpeningDayHours />
            <OpeningDayHours />
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurStoryTabContent;
