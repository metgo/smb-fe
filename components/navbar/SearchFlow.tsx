"use client";

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

const SearchFlow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchItems, setSearchItems] = useState<SearchResultProps>({});
  const [selectedSearchKeyword, setSelectedSearchKeyword] = useState("");
  const [debounceSearchKeyword] = useDebounce(searchKeyword, 1000);
  const [recommendedBusinesses, setRecommendedBusinesses] = useState<
    GeneralProductCardProps[]
  >([]);

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (!isOpen) {
      setSearchItems({});
      return;
    }

    const fetchRecommendedBusiness = async () => {
      const res = await getAllRecommendedBusiness();
      setRecommendedBusinesses(res?.data ?? []);
    };

    fetchRecommendedBusiness();
  }, [isOpen]);

  useEffect(() => {
    if (!selectedSearchKeyword) return;

    const fetchSearchItem = async () => {
      const res = await tourismSearch(selectedSearchKeyword);
      setSearchItems(res);
    };

    fetchSearchItem();
  }, [selectedSearchKeyword]);

  useEffect(() => {
    if (!debounceSearchKeyword) return;

    const fetchSearchItem = async () => {
      const res = await tourismSearch(debounceSearchKeyword);
      setSearchItems(res);
    };

    fetchSearchItem();
  }, [debounceSearchKeyword]);

  if (!hasMounted) return null;

  const hasResults =
    (searchItems?.businesses?.length ?? 0) > 0 ||
    (searchItems?.events?.length ?? 0) > 0;

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <IconImage icon="search" />
      </div>

      {isOpen && (
        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          modalClassName="w-full mx-20 backdrop-blur-2xl"
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
                    onClick={() => setSearchKeyword("")}
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
                  {recommendedSearchKeywords.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedSearchKeyword(item)}
                      className="ps-4 pe-5 border border-lightGray rounded-4xl h-10.5 flex items-center justify-center cursor-pointer"
                    >
                      <span className="font-bold text-sm text-theme">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Businesses (default view) */}
              {!searchKeyword && recommendedBusinesses.length > 0 && (
                <div>
                  <SectionTitle title={searchText.popularBusinesses} />
                  <div className="flex items-center gap-4 mt-4">
                    {recommendedBusinesses.map((item) => (
                      <PopularBusinessCard key={item._id} {...item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Search results */}
              {(searchKeyword || selectedSearchKeyword) && !hasResults ? (
                <SectionTitle title={searchText.noResultFound} />
              ) : (
                <>
                  {/* Businesses */}
                  {(searchItems.businesses?.length ?? 0) > 0 && (
                    <div>
                      <SectionTitle title={searchText.popularBusinesses} />
                      <div className="flex items-center gap-4 mt-4">
                        {searchItems.businesses!.map((item) => (
                          <PopularBusinessCard key={item._id} {...item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {(searchItems.events?.length ?? 0) > 0 && (
                    <div>
                      <SectionTitle title={searchText.popularBusinesses} />
                      <div className="flex items-center gap-4 mt-4">
                        {searchItems.events!.map((item) => (
                          <PopularBusinessCard key={item._id} {...item} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default SearchFlow;
