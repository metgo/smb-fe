import { useEffect, useRef, useState } from "react";

type UseRemoteSelectDataParams = {
  initialData?: ISearchBusiness[];
  lazySearch: (params: any) => Promise<{ data: ISearchBusiness[] }>;
  searchParams?: any;
  debounceMs?: number;
  getId?: (item: ISearchBusiness) => string;
};

export function useRemoteSelectData({
  initialData = [],
  lazySearch,
  searchParams = {},
  debounceMs = 400,
  getId = (item: ISearchBusiness) => item._id,
}: UseRemoteSelectDataParams) {
  const [items, setItems] = useState<ISearchBusiness[]>(initialData);
  const [isSearching, setIsSearching] = useState(false);

  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (initialData?.length) {
      setItems(initialData);
    }
  }, [initialData]);

  const mergeUnique = (
    prev: ISearchBusiness[],
    next: ISearchBusiness[],
  ): ISearchBusiness[] => {
    const map = new Map(prev.map((i) => [getId(i), i]));
    next.forEach((i) => map.set(getId(i), i));
    return Array.from(map.values());
  };

  const search = (keyword: string) => {
    if (!keyword?.trim()) return;

    const exists = items.some((i) =>
      (i.name || "").toLowerCase().includes(keyword.toLowerCase()),
    );

    if (exists) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);

        const res = await lazySearch({
          search: keyword,
          ...searchParams,
        });

        if (res?.data?.length) {
          setItems((prev) => mergeUnique(prev, res.data));
        }
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);
  };

  return {
    items,
    search,
    isSearching,
    setItems,
  };
}
