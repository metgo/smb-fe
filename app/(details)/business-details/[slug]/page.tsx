import Link from "next/link";
import { IconImage, NextImage } from "@/components/ui";
import {
  BusinessDetailsFilterTab,
  ImageGallery,
  NoDetailsFound,
  RatingReviewLocation,
  ReturnToPrevPageBtn,
  Title,
} from "../../_components";
import AttributePills from "@/components/AttributePills";
import { getBusinessDetailsBySlug } from "@/actions/businessActions";
import { misc } from "@/constant/hebrew";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoDetailsFound />;

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
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${businessDetails?.location?.coordinates?.reverse()}`}
                  className="flex items-center gap-1.25 ps-2.5 pe-4 py-1 cursor-pointer"
                >
                  <IconImage icon={"navigation"} />
                  <span className="font-bold text-theme text-sm">
                    {misc.navigation}
                  </span>
                </Link>
                <div className="flex items-center gap-1.25 ps-2.5 pe-4 py-1 cursor-pointer">
                  <IconImage icon={"share"} />
                  <span className="font-bold text-theme text-sm">
                    {misc.sharing}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ImageGallery
          images={businessDetails?.images?.slice(0, 5)}
          primaryCategoryId={businessDetails.primaryCategoryId}
        />

        <div className=" mt-4.5">
          <AttributePills
            items={[
              ...businessDetails?.accessibilitiesId,
              ...businessDetails?.groupTypesId,
            ]}
          />
        </div>

        <BusinessDetailsFilterTab businessDetails={businessDetails} />
      </div>
    </div>
  );
};

export default page;
