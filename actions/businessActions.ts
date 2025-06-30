import { urls } from "@/lib/endpoints";
import { CODE } from "@/constant/envConstants";

const pageCache = new Map<number, BusinessProps[]>();
const metaCache = new Map<number, BusinessesProps['meta']>();


let previousCategoryId: string | null = null;
let previousSubCategoryId: string | null = null;

export const getAllBusinesses = async (
  pageCount: number,
  categoryId: string,
  subCategoryId: string,
): Promise<BusinessesProps> => {
  const combinedData: BusinessProps[] = [];

  const isCategoryChanged = previousCategoryId !== categoryId;
  const isSubCategoryChanged = previousSubCategoryId !== subCategoryId;

  if (isCategoryChanged || isSubCategoryChanged || pageCount) {
    pageCache.clear();
    metaCache.clear();
    previousCategoryId = categoryId;
    previousSubCategoryId = subCategoryId;
  }

  for (let i = 1; i <= pageCount; i++) {
    const isCached = pageCache.has(i);

    if (isCached) {
      combinedData.push(...pageCache.get(i)!);
    } else {
      try {
        const res = await fetch(
          `${urls.tourismBusinesses}?page=${i}&limit=16&bussCategoriesId=${categoryId}&bussSubCategoriesId=${subCategoryId}&sortBy=createdAt&sortOrder=DESC&campCode=${CODE}`,
          {
            cache: 'no-store',
          }
        );

        if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
        const json: BusinessesProps = await res.json();

        pageCache.set(i, json.data);
        metaCache.set(i, json.meta);

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
    return data?.data;
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

export async function getBusinessById(businessId: string, setIsLoading: (isBoolean: boolean) => void) {
  setIsLoading(true)
  try {
    const res = await fetch(`${urls.locationData}/${businessId}?campCode=${CODE}`)
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    setIsLoading(false)
  }
}