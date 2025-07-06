import Image from "next/image";

import Navbar from "@/components/navbar";
import ScrollIndicator from "@/components/ScrollIndicator";
import { getAllBusinesses } from "@/actions/businessActions";
import CurrentTempOfYourCity from "@/components/navbar/CurrentTempOfYourCity";
import BusinessFeedLayout from "@/components/layouts/BusinessFeedLayout";
import IntroVideo from "@/components/IntroVideo";
import HamburgerMenu from "@/components/navbar/HamburgerMenu";

interface Props {
  searchParams: Promise<{
    page: string;
    categoryId: string;
    subCategoryId: string;
  }>;
}

const page = async ({ searchParams }: Props) => {
  const { page = 1, categoryId = "", subCategoryId = "" } = await searchParams;

  const businesses: BusinessesProps = await getAllBusinesses(
    Number(page),
    categoryId,
    subCategoryId,
    "/",
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="width-screen h-screen relative overflow-hidden">
        <div className="z-50 absolute top-2.5 right-0 w-full flex items-center justify-between ps-20 pe-19">
          <div className="flex items-center gap-5">
            {/* <IconImage icon="white-threeline" /> */}
            <HamburgerMenu />
            <Image
              alt="Logo"
              src={"/images/logo/white-logo.svg"}
              width={88}
              height={60}
            />
          </div>
          <CurrentTempOfYourCity />
        </div>
        {/* <div className="w-full h-[40vh] bg-black z-40" /> */}
        {/* <div className="absolute inset-0 bg-black/20 bg-opacity-40 z-20" /> */}
        <IntroVideo />
        <ScrollIndicator />

        <Image
          unoptimized
          width={375}
          height={300}
          alt="Yellow image"
          src="/images/yellow.png"
          className="absolute -bottom-12 -left-2 rotate-[25deg] z-20"
        />
      </section>

      {/* Second Section */}
      <section className="relative z-10 bg-white">
        <Navbar showFilterTab />
        <BusinessFeedLayout businesses={businesses} />
      </section>
    </div>
  );
};

export default page;
