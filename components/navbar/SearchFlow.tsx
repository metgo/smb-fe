"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { pathNames } from "@/lib/endpoints";
import useGeneralStore from "@/stores/generalStore";
import { misc, searchText } from "@/constant/hebrew";
import { useSearchFlow } from "@/hooks/useSearchFlow";
import { startLoading } from "../wrappers/ProgressBar";
import { recommendedSearchKeywords } from "@/lib/utils";
import { PopularBusinessCard } from "@/components/cards";
import { Dialog, IconImage, NextImage } from "@/components/ui";

interface CardListProps {
  title?: string;
  navPath?: string;
  items: GeneralProductCardProps[];
}

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="font-bold text-[#2B2D2A]">{title}</h3>
);

const CardList = ({
  items,
  title = "",
  navPath = pathNames.businessDetails,
}: CardListProps) => {
  if (!items?.length) return null;

  return (
    <div className="space-y-4">
      <SectionTitle title={title} />
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 w-max pr-2">
          {items.map((item) => (
            <div key={item._id} className="flex-shrink-0">
              <PopularBusinessCard navPath={navPath} {...item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MobileCardList = ({
  items,
  navPath = pathNames.businessDetails,
}: CardListProps) => {
  const router = useRouter();
  const { setIsSerachModalOpen } = useGeneralStore();

  function handleNavigation(slug: string) {
    startLoading();
    router.push(`${navPath}/${slug}`);
    setIsSerachModalOpen(false);
  }
  return (
    <section className="px-4">
      <div className="space-y-2">
        {items?.map((item) => (
          <div
            key={item._id}
            onClick={() => handleNavigation(item.slug)}
            className="flex items-center gap-2"
          >
            <NextImage
              width={60}
              height={60}
              alt={item.images?.[0]?.alt}
              imgSrc={item.images?.[0]?.image}
              className="rounded-md object-cover h-[60px] w-[60px]"
            />
            <div>
              <h4 className="line-clamp-1 font-bold">{item.name}</h4>
              <div
                className=" line-clamp-1 font-normal text-theme"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const SearchFlow = ({ iconSize = 24 }: { iconSize?: number }) => {
  const {
    hasResults,
    isLoading,
    hasMounted,
    handleClearInputText,
    handleKeywordSelect,
    recommendedBusinesses,
    searchItems,
    searchKeyword,
    setSearchKeyword,
  } = useSearchFlow();
  const { isSearchModalOpen, setIsSerachModalOpen } = useGeneralStore();
  if (!hasMounted) return null;

  return (
    <>
      <div
        className=" custom-cursor"
        onClick={() => setIsSerachModalOpen(true)}
      >
        <IconImage icon="search" width={iconSize} height={iconSize} />
      </div>

      {isSearchModalOpen && (
        <Dialog
          isOpen={isSearchModalOpen}
          onClose={() => setIsSerachModalOpen(false)}
          className=" max-sm:w-[92%] max-sm:mx-4 md:w-[94%] h-[max-content] backdrop-blur-2xl"
        >
          <div>
            {/* Search box */}
            <div className="flex items-start justify-center py-7.5">
              <div className="max-sm:mx-4 max-sm:w-full md:w-[546px] h-10 rounded-3xl border border-lightGray flex items-center gap-2 px-4 py-2">
                <IconImage icon="search" />
                <input
                  type="text"
                  value={searchKeyword}
                  placeholder={searchText.search}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full outline-none border-none focus:ring-0"
                />
                {searchKeyword && (
                  <IconImage
                    height={18}
                    width={18}
                    icon="circular-close-white"
                    onClick={handleClearInputText}
                  />
                )}
              </div>
            </div>

            <hr className="text-lightGray max-sm:hidden md:block" />

            {/* Result section */}
            {/* Desktop view */}
            <div className="px-11 py-7.5 space-y-10 max-sm:hidden md:block">
              {/* Recommended searches */}
              <div>
                <SectionTitle title={searchText.recommendedSearches} />
                <div className="flex items-center gap-2.5 mt-4">
                  {recommendedSearchKeywords?.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleKeywordSelect(item)}
                      className={clsx(
                        item === searchKeyword
                          ? "bg-lightGray text-white"
                          : "text-theme",
                        "ps-4 pe-5 border border-lightGray rounded-4xl h-10.5 flex items-center justify-center custom-cursor",
                      )}
                    >
                      <span className="font-bold text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <SectionTitle title={misc.pleaseWaitLoading} />
              ) : (
                <div className="h-100 overflow-hidden overflow-y-auto space-y-4">
                  {/* Popular Businesses (default view) */}
                  {!searchKeyword && recommendedBusinesses?.length > 0 && (
                    <CardList
                      items={recommendedBusinesses}
                      title={searchText.popularBusinesses}
                    />
                  )}

                  {/* Search results */}
                  {searchKeyword && !hasResults ? (
                    <SectionTitle title={searchText.noResultFound} />
                  ) : (
                    <>
                      <CardList
                        items={searchItems.businesses!}
                        title={searchText.businesses}
                      />
                      <CardList
                        items={searchItems.events!}
                        title={searchText.events}
                        navPath={pathNames.eventDetails}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile view */}
            <div className=" space-y-10 max-sm:block md:hidden">
              {isLoading ? (
                <div className="h-[200px] px-4 py-7.5">
                  <SectionTitle title={misc.pleaseWaitLoading} />
                </div>
              ) : (
                <div className="overflow-hidden overflow-y-auto space-y-4">
                  {/* Popular Businesses (default view) */}
                  {!searchKeyword && recommendedBusinesses?.length > 0 && (
                    <div className="pt-4">
                      <MobileCardList items={recommendedBusinesses} />
                    </div>
                  )}

                  {/* Search results */}
                  {!isLoading && searchKeyword && !hasResults ? (
                    <div className="relative h-60 w-full flex items-center justify-center">
                      <div className="font-bold text-theme text-2xl w-60 text-center">
                        {misc.searchItemNotFoundText}
                      </div>
                      <Image
                        width={180}
                        height={184}
                        alt="Yellow Chrysanthemum"
                        src="/images/yellow-chrysanthemum.png"
                        className="absolute -left-14 -bottom-10"
                      />
                    </div>
                  ) : (
                    <div className="pb-7.5">
                      <MobileCardList items={searchItems.businesses!} />
                      <MobileCardList
                        items={searchItems.events!}
                        navPath={pathNames.eventDetails}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default SearchFlow;
