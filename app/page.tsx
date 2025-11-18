import Navbar from "@/components/navbar";
import { imagePlayTypeEnum } from "@/lib/utils";
import IntroVideo from "@/components/IntroVideo";
import MainLogo from "@/components/navbar/MainLogo";
import { getMarketing } from "@/actions/marketingAction";
import { ScrollSnapWrapper } from "@/components/wrappers";
import HamburgerMenu from "@/components/navbar/HamburgerMenu";
import { ArrowImage, CarouselImage } from "@/components/marketing";
import BusinessFeedLayout from "@/components/layouts/BusinessFeedLayout";
import CurrentTempOfYourCity from "@/components/navbar/CurrentTempOfYourCity";
import MobileBusinessFeedLayout from "@/components/mobile/BusinessFeedLayout.mobile";
import { getAllFeeds } from "@/actions/feedActions";

interface Props {
  searchParams: Promise<{
    page: string;
    categoryIds: string;
    subCategoryIds: string;
    accessibilitiesIds?: string;
    groupTypesIds?: string;
    serviceTypes: string;
  }>;
}

const page = async ({ searchParams }: Props) => {
  const {
    page = "1",
    categoryIds = "",
    subCategoryIds = "",
    accessibilitiesIds = "",
    groupTypesIds = "",
    serviceTypes = "",
  } = await searchParams;

  // Parse comma-separated values into arrays
  const accessibilitiesArray = accessibilitiesIds
    ? accessibilitiesIds.split(",")
    : [];

  const categoriesArray = categoryIds ? categoryIds.split(",") : [];
  const subCategoriesArray = subCategoryIds ? subCategoryIds.split(",") : [];
  const groupTypesArray = groupTypesIds ? groupTypesIds.split(",") : [];
  const serviceTypesArray = serviceTypes ? serviceTypes.split(",") : [];

  const businesses: BusinessesProps = await getAllFeeds(
    Number(page),
    categoriesArray,
    subCategoriesArray,
    groupTypesArray,
    accessibilitiesArray,
    serviceTypesArray,
    "/",
  );
  const marketing = await getMarketing();

  return (
    <div>
      <ScrollSnapWrapper hasMarketing={marketing?.items?.length > 0}>
        {/* Hero Section */}
        <section className="relative">
          <div className="z-20 fixed top-2.5 right-0 w-full flex items-center justify-between max-sm:px-4 md:ps-20 md:pe-16">
            <div className="flex items-center gap-5">
              <HamburgerMenu
                openIcon="white-threeline"
                closeIcon="close-white"
              />
              <MainLogo />
            </div>
            <CurrentTempOfYourCity />
          </div>
          <IntroVideo />
        </section>

        {marketing?.items?.length > 0 && (
          <>
            {marketing?.playType === imagePlayTypeEnum.manual ? (
              <ArrowImage images={marketing?.items} />
            ) : (
              <CarouselImage
                images={marketing?.items}
                timeInterval={marketing?.timeInterval}
              />
            )}
          </>
        )}

        {/* Feed Section */}
        <section className="relative z-50 bg-white">
          <Navbar showFilterTab />
          <MobileBusinessFeedLayout businesses={businesses} />
          <BusinessFeedLayout businesses={businesses} />
        </section>
      </ScrollSnapWrapper>
    </div>
  );
};

export default page;
