import { IconImage, NextImage } from "@/components/ui";
import { shareKeepNavigate } from "@/lib/utils";
import {
  BusinessDetailsFilterTab,
  ImageGalleryDraft,
  RatingReviewLocation,
  ReturnToPrevPageBtn,
  Title,
} from "../../_components";
import { getBusinessDetailsBySlug } from "@/actions/businessActions";

const page = async ({ params }: { params: { slug: string } }) => {
  const { slug } = await params;

  const businessDetails: BusinessDetailsProps =
    await getBusinessDetailsBySlug(slug);

  return (
    <div className="">
      <ReturnToPrevPageBtn />

      <div className="mx-20 py-12">
        <div className="flex items-center gap-7.5 w-full mb-4.5">
          <NextImage
            imgSrc={businessDetails.logo.image}
            alt="logo"
            width={80}
            height={80}
            className="rounded-lg border border-theme h-20 w-20 object-cover"
          />
          <div className="w-full">
            <Title title={businessDetails.name} />

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

        <ImageGalleryDraft
          images={businessDetails.images}
          primaryCategoryId={businessDetails.primaryCategoryId}
        />

        <div className="flex items-center gap-2.5 mt-4.5">
          {businessDetails.accessibilitiesId.map((item) => (
            <div
              key={item._id}
              className="ps-4 pe-5 border border-theme rounded-4xl h-10 flex items-center justify-center"
            >
              <span className="font-bold text-sm text-theme">
                {item.hebrewName}
              </span>
            </div>
          ))}
          {businessDetails.groupTypesId.map((item) => (
            <div
              key={item._id}
              className="ps-4 pe-5 border border-theme rounded-4xl h-10 flex items-center justify-center"
            >
              <span className="font-bold text-sm text-theme">
                {item.hebrewName}
              </span>
            </div>
          ))}
        </div>

        <BusinessDetailsFilterTab businessDetails={businessDetails} />
      </div>
    </div>
  );
};

export default page;
