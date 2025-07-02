import { IconImage, NextImage } from "@/components/ui";
import { eventFeatures, shareKeepNavigate } from "@/lib/utils";
import { businessDetails } from "@/constant/placeholderData";
import {
  BusinessDetailsFilterTab,
  ImageGalleryDraft,
  RatingReviewLocation,
  ReturnToPrevPageBtn,
  Title,
} from "../../_components";

const page = () => {
  return (
    <div className="">
      <ReturnToPrevPageBtn />

      <div className="mx-20 py-12">
        <div className="flex items-center gap-7.5 w-full mb-4.5">
          <NextImage
            imgSrc={businessDetails.logo}
            alt="logo"
            width={80}
            height={80}
            className="rounded-lg border border-theme h-20 w-20 object-cover"
          />
          <div className="w-full">
            <Title title={businessDetails.businessName} />

            <div className=" flex items-center justify-between w-full">
              <RatingReviewLocation
                city="נווה מדבר 4"
                address="להבים"
                ratingCount={12}
                reviewCount={34}
              />
              <div className="flex items-center gap-2.5">
                {shareKeepNavigate.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-1.25 ps-2.5 pe-4 py-1 cursor-pointer"
                  >
                    <IconImage icon={item.icon} />
                    <span className="font-bold text-theme text-sm">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ImageGalleryDraft />

        <div className="flex items-center gap-2.5 mt-4.5">
          {eventFeatures.map((item) => (
            <div
              key={item.id}
              className="ps-4 pe-5 border border-theme rounded-4xl h-10 flex items-center justify-center"
            >
              <span className="font-bold text-sm text-theme">{item.label}</span>
            </div>
          ))}
        </div>

        <BusinessDetailsFilterTab />
      </div>
    </div>
  );
};

export default page;
