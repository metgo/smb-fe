import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";

const pageCache = new Map<number, BusinessProps[]>();
const metaCache = new Map<number, BusinessesProps['meta']>();

// export const getAllBusinesses = async (
//   pageCount: number,
//   categoryId: string): Promise<BusinessesProps> => {
//   const combinedData: BusinessProps[] = [];
//   // pageCache.clear();
//   // metaCache.clear();

//   // Fetch or get from cache all data from page 1 to current
//   for (let i = 1; i <= pageCount; i++) {
//     if (pageCache.has(i)) {
//       combinedData.push(...pageCache.get(i)!);
//     } else {
//       try {
//         const res = await fetch(`${urls.tourismBusinesses}?page=${i}&limit=16&bussCategoriesId=${categoryId}&campCode=${CODE}`);
//         if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
//         const json: BusinessesProps = await res.json();

//         // Cache only `data` and `meta`
//         pageCache.set(i, json.data);
//         metaCache.set(i, json.meta);

//         combinedData.push(...json.data);
//       } catch (err) {
//         console.error(`Error fetching page ${i}:`, err);
//         // Optional: return early or continue
//       }
//     }
//   }

//   // Use meta and totalData from current pageCount (latest one)
//   const latestMeta = metaCache.get(pageCount) || {
//     page: pageCount,
//     limit: '16',
//     data: combinedData.length,
//     pageCount: pageCount,
//     hasPreviousPage: pageCount > 1,
//     hasNextPage: true,
//   };

//   return {
//     data: combinedData,
//     totalData: combinedData.length, // or get from backend if available
//     meta: latestMeta,
//   };
// };

export const getAllBusinesses = async (
  pageCount: number,
  categoryId: string,
  subCategoryId: string,
): Promise<BusinessesProps> => {
  const combinedData: BusinessProps[] = [];

  const skipCache = pageCount === 1 && !!categoryId;

  for (let i = 1; i <= pageCount; i++) {
    const isCached = pageCache.has(i);

    if (isCached && !skipCache) {
      combinedData.push(...pageCache.get(i)!);
    } else {
      try {
        const res = await fetch(`${urls.tourismBusinesses}?page=${i}&limit=16&bussCategoriesId=${categoryId}&bussSubCategoriesId=${subCategoryId}&campCode=${CODE}`);
        if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
        const json: BusinessesProps = await res.json();

        // Only cache if not skipping
        if (!skipCache) {
          pageCache.set(i, json.data);
          metaCache.set(i, json.meta);
        }

        combinedData.push(...json.data);
      } catch (err) {
        console.error(`Error fetching page ${i}:`, err);
      }
    }
  }

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
    totalData: combinedData.length,
    meta: latestMeta,
  };
};


export const getAllCategory = async () => {
  try {
    const res = await fetch(urls.categories);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

export const getAllSubCategory = async (categoryId: string) => {
  try {
    const res = await fetch(`${urls.subcategory}?bussCategoryId=${categoryId}&campCode=${CODE}`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

export const getAllBusinessLocation = async () => {
  try {
    const res = await fetch(urls.locations)
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

export async function getBusinessById(businessId: string) {
  try {
    const res = await fetch(`${urls.locationData}/${businessId}?campCode=${CODE}`)
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}