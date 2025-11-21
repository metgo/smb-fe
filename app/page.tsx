import Navbar from "@/components/navbar";
import { imagePlayTypeEnum } from "@/lib/utils";
import IntroVideo from "@/components/IntroVideo";
import MainLogo from "@/components/navbar/MainLogo";
import { getMarketing } from "@/actions/marketingAction";
import { ScrollSnapWrapper } from "@/components/wrappers";
import HamburgerMenu from "@/components/navbar/HamburgerMenu";
import { ArrowImage, CarouselImage } from "@/components/marketing";
import FeedLayout from "@/components/layouts/FeedLayout";
import CurrentTempOfYourCity from "@/components/navbar/CurrentTempOfYourCity";
import { getAllFeeds, getAllFilters } from "@/actions/feedActions";
import { initialSelectedFiltersIds } from "@/providers/SiteInfoClientProvider";
import MobileFeedLayout from "@/components/mobile/FeedLayout.mobile";

interface Props {
  searchParams: Promise<{
    page?: string;
    categoryIds?: string;
    subCategoryIds?: string;
    accessibilityIds?: string;
    groupTypeIds?: string;
    serviceTypes?: string;
    isAllClear?: string;
  }>;
}

const page = async ({ searchParams }: Props) => {
  const params = await searchParams;

  const {
    categoryIds,
    subCategoryIds,
    accessibilityIds,
    groupTypeIds,
    serviceTypes,
    isAllClear,
  } = params;

  // const initialSelectedFiltersIds:PresetFilterItems = await getPresetFilters()
  //  Convert comma values → arrays only if URL values exist
  const categoriesArray = categoryIds?.length
    ? categoryIds.split(",")
    : initialSelectedFiltersIds?.categoryIds;

  const subCategoriesArray = subCategoryIds?.length
    ? subCategoryIds.split(",")
    : initialSelectedFiltersIds?.subCategoryIds;

  const accessibilitiesArray = accessibilityIds?.length
    ? accessibilityIds.split(",")
    : initialSelectedFiltersIds?.accessibilityIds;

  const groupTypesArray = groupTypeIds?.length
    ? groupTypeIds.split(",")
    : initialSelectedFiltersIds?.groupTypeIds;

  const serviceTypesArray = serviceTypes?.length
    ? serviceTypes.split(",")
    : initialSelectedFiltersIds?.serviceTypes;

  // 🔥 Unified object (now includes default fallback)
  const selectedFiltersIds = {
    categoryIds: categoriesArray || [],
    subCategoryIds: subCategoriesArray || [],
    groupTypesIds: groupTypesArray || [],
    accessibilitiesIds: accessibilitiesArray || [],
    serviceTypes: serviceTypesArray || [],
  };

  // First API call includes all filters
  const filters = await getAllFilters(selectedFiltersIds);

  const businesses: BusinessesProps = await getAllFeeds(
    1,
    selectedFiltersIds,
    isAllClear === "true",
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

        {/* Marketing Section */}
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

          <MobileFeedLayout businesses={businesses} filters={filters} />
          <FeedLayout businesses={businesses} filters={filters} />
        </section>
      </ScrollSnapWrapper>
    </div>
  );
};

export default page;
