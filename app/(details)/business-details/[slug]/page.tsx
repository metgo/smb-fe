import { shareKeepNavigate } from "@/lib/utils";
import { IconImage, NextImage } from "@/components/ui";
import {
  BusinessDetailsFilterTab,
  ImageGallery,
  NoDetailsFound,
  RatingReviewLocation,
  ReturnToPrevPageBtn,
  Title,
} from "../../_components";
import { getBusinessDetailsBySlug } from "@/actions/businessActions";
import AttributePills from "@/components/AttributePills";

const page = async ({ params }: { params: { slug: string } }) => {
  const { slug } = await params;

  if (slug === "undefined") return <NoDetailsFound />;

  const businessDetails: BusinessDetailsProps =
    await getBusinessDetailsBySlug(slug);

  return (
    <div>
      <ReturnToPrevPageBtn />

      <div className="mx-20 py-12">
        <div className="flex items-center gap-7.5 w-full mb-4.5">
          <NextImage
            width={80}
            height={80}
            alt={businessDetails?.logo?.alt}
            imgSrc={businessDetails?.logo?.image}
            className="rounded-lg border border-theme h-20 w-20 object-cover"
          />
          <div className="w-full">
            <Title title={businessDetails.name} />

            <div className=" flex items-center justify-between w-full">
              <RatingReviewLocation
                address={businessDetails?.address}
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

        <ImageGallery
          images={businessDetails.images}
          primaryCategoryId={businessDetails.primaryCategoryId}
        />

        <div className="flex items-center gap-2.5 mt-4.5">
          <AttributePills items={businessDetails?.accessibilitiesId} />
          <AttributePills items={businessDetails?.groupTypesId} />
        </div>

        <BusinessDetailsFilterTab businessDetails={businessDetails} />
      </div>
    </div>
  );
};

export default page;
