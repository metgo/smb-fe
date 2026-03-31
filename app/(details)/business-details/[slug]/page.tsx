import { MapNavButton, NextImage } from "@/components/ui";
import {
  BusinessDetailsFilterTab,
  ImageGallery,
  Title,
} from "../../_components";
import AttributePills from "@/components/AttributePills";
import { getBusinessDetailsBySlug } from "@/actions/feedActions";
import { getProducts } from "@/actions/productActions";
import NoFeedItemLayout from "@/components/layouts/NoFeedItemLayout";
import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import MobileBusinessDetails from "@/components/mobile/BusinessDetails.mobile";
import { removeInlineStylesFromHTML, shuffleArray } from "@/lib/helpers";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const queryClient = getQueryClient();

  if (!slug || slug === "undefined") {
    return <NoFeedItemLayout />;
  }

  // 1. Fetch business details synchronously (server component)
  const businessDetails = await getBusinessDetailsBySlug(slug);

  if (!businessDetails) {
    return <NoFeedItemLayout />;
  }

  // 2. Manually cache it so client can use it via useQuery
  queryClient.setQueryData(["business-details", slug], businessDetails);

  // 3. Prefetch products (now safe because we have _id)
  await queryClient.prefetchQuery({
    queryKey: ["products", businessDetails._id],
    queryFn: () => getProducts(businessDetails._id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-20 py-12 max-sm:hidden md:block">
        <div className="flex items-center gap-7.5 w-full mb-4.5">
          <NextImage
            width={80}
            height={80}
            alt={businessDetails.logo?.alt ?? "Business logo"}
            imgSrc={businessDetails.logo?.image}
            className="rounded-lg border border-theme h-20 w-20 object-cover"
          />
          <div className="w-full">
            <Title title={businessDetails.name} />

            <div className="flex items-center justify-between w-full">
              <div
                className="line-clamp-1 text-theme text-[22px] font-bold"
                dangerouslySetInnerHTML={{
                  __html: removeInlineStylesFromHTML(
                    businessDetails.shortDescription ?? "",
                  ),
                }}
              />
              <div className="flex items-center justify-end gap-2.5">
                <MapNavButton
                  lat={businessDetails.geoLocation?.lat}
                  lng={businessDetails.geoLocation?.long}
                />
                <ShareUrlBtnModal />
              </div>
            </div>
          </div>
        </div>

        <ImageGallery
          images={shuffleArray(businessDetails.images ?? [])}
          primaryCategoryId={businessDetails.primaryCategoryId}
        />

        <div className="mt-4.5">
          <AttributePills
            items={[
              ...(businessDetails.accessibilitiesId ?? []),
              ...(businessDetails.groupTypesId ?? []),
            ]}
          />
        </div>

        <BusinessDetailsFilterTab businessDetails={businessDetails} />
      </div>

      <MobileBusinessDetails businessDetails={businessDetails} />
    </HydrationBoundary>
  );
};

export default page;
