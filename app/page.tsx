import React, { Suspense } from "react";

import Navbar from "@/components/navbar";
import IntroVideo from "@/components/IntroVideo";
import MainLogo from "@/components/navbar/MainLogo";
import { ScrollSnapWrapper } from "@/components/wrappers";
import HamburgerMenu from "@/components/navbar/HamburgerMenu";
import CurrentTempOfYourCity from "@/components/navbar/CurrentTempOfYourCity";

import FeedSection from "@/components/layouts/FeedSection";
import MarketingSection from "@/components/marketing/MarketingSection";
import { getMarketing } from "@/actions/marketingAction";

interface Props {
  searchParams: {
    page?: string;
    categoryIds?: string;
    subCategoryIds?: string;
    accessibilityIds?: string;
    groupTypeIds?: string;
    serviceTypes?: string;
    isAllClear?: string;
  };
}

export default async function Page({ searchParams = {} }: Props) {
  const marketing = await getMarketing();

  return (
    <div>
      <ScrollSnapWrapper hasMarketing={marketing?.items?.length > 0}>
        <section className="relative">
          <div className="z-20 fixed top-2.5 right-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-20 ">
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

        <MarketingSection marketing={marketing} />

        <Suspense
          fallback={
            <section className="relative z-50 bg-white">
              <Navbar showFilterTab />
            </section>
          }
        >
          <FeedSection searchParams={searchParams} />
        </Suspense>
      </ScrollSnapWrapper>
    </div>
  );
}
