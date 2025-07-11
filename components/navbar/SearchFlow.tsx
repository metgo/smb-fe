"use client";

import clsx from "clsx";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";

import { searchText } from "@/constant/hebrew";
import { Dialog, IconImage } from "@/components/ui";
import { recommendedSearchKeywords } from "@/lib/utils";
import { PopularBusinessCard } from "@/components/cards";
import {
  tourismSearch,
  getAllRecommendedBusiness,
} from "@/actions/searchActions";

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="font-bold text-[#2B2D2A]">{title}</h3>
);

const CardList = ({
  items,
  title,
  navPath = "business-details",
}: {
  title: string;
  navPath?: string;
  items: GeneralProductCardProps[];
}) => {
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

const SearchFlow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchItems, setSearchItems] = useState<SearchResultProps>({});
  const [debounceSearchKeyword] = useDebounce(searchKeyword, 1000);
  const [recommendedBusinesses, setRecommendedBusinesses] = useState<
    GeneralProductCardProps[]
  >([]);

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (!isOpen) {
      setSearchItems({});
      setSearchKeyword("");
      return;
    }

    const fetchRecommendedBusiness = async () => {
      const res = await getAllRecommendedBusiness();
      setRecommendedBusinesses(res?.data ?? []);
    };

    fetchRecommendedBusiness();
  }, [isOpen]);

  useEffect(() => {
    if (!debounceSearchKeyword) return;

    const fetchSearchItem = async () => {
      const res = await tourismSearch(debounceSearchKeyword);
      setSearchItems(res);
    };

    fetchSearchItem();
  }, [debounceSearchKeyword]);

  function handleKeywordSelect(word: string) {
    if (word === searchKeyword) {
      setSearchKeyword("");
      setSearchItems({});
    } else {
      setSearchKeyword(word);
    }
  }

  function handleClearInputText() {
    setSearchKeyword("");
    setSearchItems({});
  }

  if (!hasMounted) return null;

  const hasResults =
    (searchItems?.businesses?.length ?? 0) > 0 ||
    (searchItems?.events?.length ?? 0) > 0;

  return (
    <>
      <div className=" cursor-pointer" onClick={() => setIsOpen(true)}>
        <IconImage icon="search" />
      </div>

      {isOpen && (
        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          modalClassName="w-[94%] h-[max-content] backdrop-blur-2xl"
        >
          <div>
            {/* Search box */}
            <div className="flex items-start justify-center py-7.5">
              <div className="w-[546px] h-10 rounded-3xl border border-lightGray flex items-center gap-2 px-4 py-2">
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

            <hr className="text-lightGray" />

            {/* Result section */}
            <div className="px-11 py-7.5 space-y-10">
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
                        "ps-4 pe-5 border border-lightGray rounded-4xl h-10.5 flex items-center justify-center cursor-pointer",
                      )}
                    >
                      <span className="font-bold text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {/* Popular Businesses (default view) */}
                {!searchKeyword && recommendedBusinesses.length > 0 && (
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
                      navPath="event-details"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default SearchFlow;
