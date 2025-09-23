import Navbar from "@/components/navbar";
import { imagePlayTypeEnum } from "@/lib/utils";
import IntroVideo from "@/components/IntroVideo";
import MainLogo from "@/components/navbar/MainLogo";
import { getSiteInfo } from "@/actions/commonActions";
import { getMarketing } from "@/actions/marketingAction";
import { ScrollSnapWrapper } from "@/components/wrappers";
import { getAllBusinesses } from "@/actions/businessActions";
import HamburgerMenu from "@/components/navbar/HamburgerMenu";
import { ArrowImage, CarouselImage } from "@/components/marketing";
import BusinessFeedLayout from "@/components/layouts/BusinessFeedLayout";
import CurrentTempOfYourCity from "@/components/navbar/CurrentTempOfYourCity";
import MobileNavbar from "@/components/mobile/Navbar.mobile";

interface Props {
  searchParams: Promise<{
    page: string;
    categoryId: string;
    subCategoryId: string;
    accessibilitiesIds?: string;
    groupTypesIds?: string;
  }>;
}

const page = async ({ searchParams }: Props) => {
  const {
    page = "1",
    categoryId = "",
    subCategoryId = "",
    accessibilitiesIds = "",
    groupTypesIds = "",
  } = await searchParams;

  // Parse comma-separated values into arrays
  const accessibilitiesArray = accessibilitiesIds
    ? accessibilitiesIds.split(",")
    : [];

  const groupTypesArray = groupTypesIds ? groupTypesIds.split(",") : [];

  const businesses: BusinessesProps = await getAllBusinesses(
    Number(page),
    categoryId,
    subCategoryId,
    groupTypesArray,
    accessibilitiesArray,
    "/",
  );
  const marketing = await getMarketing();
  const siteInfo = await getSiteInfo();

  return (
    <div>
      <ScrollSnapWrapper hasMarketing={marketing?.items?.length > 0}>
        {/* Hero Section */}
        <section className="relative">
          <div className="z-20 fixed top-2.5 right-0 w-full flex items-center justify-between ps-20 pe-16">
            <div className="flex items-center gap-5">
              <HamburgerMenu
                openIcon="white-threeline"
                closeIcon="close-white"
              />
              <MainLogo />
            </div>
            <CurrentTempOfYourCity />
          </div>
          <IntroVideo siteInfo={siteInfo} />
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
          <MobileNavbar showFilterTab />
          <BusinessFeedLayout businesses={businesses} />
        </section>
      </ScrollSnapWrapper>
    </div>
  );
};

export default page;
