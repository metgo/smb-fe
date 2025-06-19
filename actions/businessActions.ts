const base_url = process.env.NEXT_PUBLIC_BASE_URL;
const pageCache = new Map<number, BusinessProps[]>(); // Cache only the data array
const metaCache = new Map<number, BusinessesProps['meta']>(); // Cache meta per page

export const getAllBusinesses = async (pageCount: number): Promise<BusinessesProps> => {
  const combinedData: BusinessProps[] = [];
  // pageCache.clear();
  // metaCache.clear();

  // Fetch or get from cache all data from page 1 to current
  for (let i = 1; i <= pageCount; i++) {
    if (pageCache.has(i)) {
      combinedData.push(...pageCache.get(i)!);
    } else {
      try {
        const res = await fetch(`${base_url}/businesses?page=${i}&limit=16&campCode=TAV8DL`);
        if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
        const json: BusinessesProps = await res.json();

        // Cache only `data` and `meta`
        pageCache.set(i, json.data);
        metaCache.set(i, json.meta);

        combinedData.push(...json.data);
      } catch (err) {
        console.error(`Error fetching page ${i}:`, err);
        // Optional: return early or continue
      }
    }
  }

  // Use meta and totalData from current pageCount (latest one)
  const latestMeta = metaCache.get(pageCount) || {
    page: pageCount,
    limit: '16',
    data: combinedData.length,
    pageCount: pageCount,
    hasPreviousPage: pageCount > 1,
    hasNextPage: true,
  };

  return {
    data: combinedData,
    totalData: combinedData.length, // or get from backend if available
    meta: latestMeta,
  };
};


export const getAllCategory = async () => {
  try {
    const res = await fetch(`${base_url}/categories?campCode=TAV8DL`,);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}