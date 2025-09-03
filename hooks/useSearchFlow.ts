import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";

import useGeneralStore from "@/stores/generalStore";
import {
  getAllRecommendedBusiness,
  tourismSearch,
} from "@/actions/searchActions";

interface UseSearchFlowResult {
  isLoading: boolean;
  hasResults: boolean;
  hasMounted: boolean;
  handleClearInputText: () => void;
  handleKeywordSelect: (word: string) => void;
  recommendedBusinesses: GeneralProductCardProps[];
  searchItems: SearchResultProps;
  searchKeyword: string;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;
}

export const useSearchFlow = (): UseSearchFlowResult => {
  const { setZIndex, isSearchModalOpen } = useGeneralStore();
  const [isLoading, setIsLoading] = useState(false);

  const [hasMounted, setHasMounted] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchItems, setSearchItems] = useState<SearchResultProps>({});
  const [debounceSearchKeyword] = useDebounce(searchKeyword, 1000);

  const [recommendedBusinesses, setRecommendedBusinesses] = useState<
    GeneralProductCardProps[]
  >([]);

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (!isSearchModalOpen) {
      setZIndex("20");
      setSearchItems({});
      setSearchKeyword("");
      return;
    }

    const fetchRecommendedBusiness = async () => {
      const res = await getAllRecommendedBusiness();
      setRecommendedBusinesses(res?.data ?? []);
    };
    setZIndex("10");
    fetchRecommendedBusiness();
  }, [isSearchModalOpen]);

  useEffect(() => {
    if (!debounceSearchKeyword) return;

    const fetchSearchItem = async () => {
      setIsLoading(true);
      try {
        const res = await tourismSearch(debounceSearchKeyword);
        setSearchItems(res);
      } catch (error) {
        console.log("Error", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchItem();
  }, [debounceSearchKeyword]);

  function handleKeywordSelect(word: string) {
    if (word === searchKeyword) {
      setSearchItems({});
      setSearchKeyword("");
    } else {
      setSearchKeyword(word);
    }
  }

  function handleClearInputText() {
    setSearchKeyword("");
    setSearchItems({});
  }

  const hasResults =
    (searchItems?.businesses?.length ?? 0) > 0 ||
    (searchItems?.events?.length ?? 0) > 0;

  return {
    hasResults,
    isLoading,
    hasMounted,
    handleClearInputText,
    handleKeywordSelect,
    recommendedBusinesses,
    searchItems,
    searchKeyword,
    setSearchKeyword,
  };
};
