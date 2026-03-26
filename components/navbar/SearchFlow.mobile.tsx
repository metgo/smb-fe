"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { pathNames } from "@/lib/endpoints";
import useGeneralStore from "@/stores/generalStore";
import { misc, searchText } from "@/constant/hebrew";
import { SearchIcon } from "@/components/ui/svgIcons";
import { useSearchFlow } from "@/hooks/useSearchFlow";
import { startLoading } from "../wrappers/ProgressBar";
import { sanitizeHtml } from "@/lib/helpers";
import { Dialog, IconImage, NextImage } from "@/components/ui";

interface CardListProps {
  title?: string;
  navPath?: string;
  items: GeneralProductCardProps[];
}

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="font-bold text-[#2B2D2A]">{title}</h3>
);

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
              className="rounded-md object-cover h-15 w-15"
            />
            <div>
              <h4 className="line-clamp-1 font-bold">{item.name}</h4>
              <div
                className="line-clamp-1 font-normal text-theme overflow-hidden"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(item.description || ""),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const SearchFlowMobile = ({
  iconSize = 24,
  isMobile,
}: {
  iconSize?: number;
  isMobile?: boolean;
}) => {
  const {
    hasResults,
    isLoading,
    hasMounted,
    handleClearInputText,
    recommendedBusinesses,
    searchItems,
    searchKeyword,
    setSearchKeyword,
  } = useSearchFlow();
  const { isSearchModalOpen, setIsSerachModalOpen } = useGeneralStore();
  if (!hasMounted) return null;

  return (
    <>
      <div className="custom-cursor" onClick={() => setIsSerachModalOpen(true)}>
        {isMobile ? (
          <SearchIcon />
        ) : (
          <IconImage icon="search" width={iconSize} height={iconSize} />
        )}
      </div>

      {isSearchModalOpen && (
        <Dialog
          hideCloseBtn
          isOpen={isSearchModalOpen}
          onClose={() => setIsSerachModalOpen(false)}
          className=" max-sm:mx-4 h-max backdrop-blur-2xl overflow-hidden"
        >
          <div>
            {/* Search box */}
            <div className="flex items-start justify-center py-7.5">
              <div className="max-sm:mx-4 w-full h-10 rounded-3xl border border-lightGray flex items-center gap-2 px-4 py-2">
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
            <div className="space-y-10 max-h-75 overflow-hidden overflow-y-auto  ">
              {isLoading ? (
                <div className="h-50 px-4 py-7.5">
                  <SectionTitle title={misc.pleaseWaitLoading} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Popular Businesses (default view) */}
                  {!searchKeyword && recommendedBusinesses?.length > 0 && (
                    <MobileCardList items={recommendedBusinesses} />
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
                    <div className="pb-7.5 space-y-4">
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

export default SearchFlowMobile;
