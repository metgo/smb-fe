"use client";

import { useEffect, useState } from "react";

import { searchText } from "@/constant/hebrew";
import { Dialog, IconImage } from "@/components/ui";
import { recommendedSearchKeywords } from "@/lib/utils";
import { PopularBusinessCard } from "@/components/cards";
import {
  getAllRecommendedBusiness,
  tourismSearch,
} from "@/actions/searchActions";

const SearchFlow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [searchItems, setSearchItems] = useState([]);
  console.log("--------searchKeyword", searchKeyword, searchItems);

  const [recommendedBusinesses, setRecommendedBusinesses] = useState<
    GeneralProductCardProps[]
  >([]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      async function fetchRecommendedBusiness() {
        const res = await getAllRecommendedBusiness();
        setRecommendedBusinesses(res?.data);
      }
      fetchRecommendedBusiness();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchKeyword) {
      async function fetchSearchItem() {
        const res = await tourismSearch(searchKeyword);
        setSearchItems(res.data);
      }
      fetchSearchItem();
    }
  }, [searchKeyword]);

  if (!hasMounted) return;

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <IconImage icon="search" />
      </div>

      {isOpen && (
        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          modalClassName="w-full mx-20 h-[623px] backdrop-blur-2xl"
        >
          <div>
            <div className="flex items-start justify-center py-7.5">
              <div className="w-[546px] h-10 rounded-3xl border border-lightGray flex items-center gap-2 px-4 py-2">
                <IconImage icon="search" />
                <input
                  type="text"
                  placeholder={searchText.search}
                  className="w-full outline-none border-none focus:ring-0"
                />
              </div>
            </div>
            <hr className="text-lightGray" />

            <div className="px-11 py-7.5 space-y-10">
              <div>
                <h3 className="font-bold text-[#2B2D2A]">
                  {searchText.recommendedSearches}
                </h3>
                <div className="flex items-center gap-2.5 mt-4">
                  {recommendedSearchKeywords?.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setSearchKeyword(item)}
                      className="ps-4 pe-5 border border-lightGray rounded-4xl h-10.5 flex items-center justify-center cursor-pointer"
                    >
                      <span className="font-bold text-sm text-theme">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-[#2B2D2A] mb-4">
                  {searchText.popularBusinesses}
                </h3>

                <div className="flex items-center gap-4">
                  {recommendedBusinesses?.map((item) => (
                    <PopularBusinessCard key={item._id} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default SearchFlow;
