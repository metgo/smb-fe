import { MapNavButton, NextImage } from "@/components/ui";

import {
  BusinessDetailsFilterTab,
  ImageGallery,
  RatingReviewLocation,
  Title,
} from "../../_components";
import AttributePills from "@/components/AttributePills";
import { getBusinessDetailsBySlug } from "@/actions/businessActions";
import { getProducts } from "@/actions/productActions";
import NoFeedItemLayout from "@/components/layouts/NoFeedItemLayout";
import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import MobileBusinessDetails from "@/components/mobile/BusinessDetails.mobile";
import { shuffleArray } from "@/lib/helpers";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoFeedItemLayout />;

  const businessDetails = await getBusinessDetailsBySlug(slug);

  if (businessDetails === undefined) return <NoFeedItemLayout />;
  const { groupTypesId = [], accessibilitiesId = [] } = businessDetails;
  const products: Product[] = await getProducts(businessDetails._id);

  return (
    <>
      <div className="mx-20 py-12 max-sm:hidden md:block">
        <div className="flex items-center gap-7.5 w-full mb-4.5">
          <NextImage
            width={80}
            height={80}
            alt={businessDetails?.logo?.alt}
            imgSrc={businessDetails?.logo?.image}
            className="rounded-lg border border-theme h-20 w-20 object-cover"
          />
          <div className="w-full">
            <Title title={businessDetails?.name} />

            <div className=" flex items-center justify-between w-full">
              <RatingReviewLocation
                address={businessDetails?.address}
                ratingCount={12}
                reviewCount={34}
              />
              <div className="flex items-center justify-end gap-2.5">
                <MapNavButton
                  lat={businessDetails?.geoLocation?.lat}
                  lng={businessDetails?.geoLocation?.long}
                />
                <ShareUrlBtnModal />
              </div>
            </div>
          </div>
        </div>

        <ImageGallery
          images={shuffleArray(businessDetails?.images)}
          primaryCategoryId={businessDetails?.primaryCategoryId}
        />

        <div className=" mt-4.5">
          <AttributePills items={[...accessibilitiesId, ...groupTypesId]} />
        </div>

        <BusinessDetailsFilterTab
          products={products}
          businessDetails={businessDetails}
        />
      </div>

      <MobileBusinessDetails
        products={products}
        businessDetails={businessDetails}
      />
    </>
  );
};

export default page;
