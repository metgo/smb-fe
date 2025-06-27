import { getAllBusinesses, getAllCategory, getAllSubCategory } from "@/actions/businessActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";

interface Props {
  searchParams: Promise<{
    page: string,
    categoryId: string;
    subCategoryId: string;
  }>;
}

const page = async ({ searchParams }: Props) => {
  const {
    page = 1,
    categoryId = "",
    subCategoryId = ""
  } = await searchParams;


  const businesses: BusinessesProps = await getAllBusinesses(Number(page), categoryId, subCategoryId);
  const categories = await getAllCategory();
  const subCategories = categoryId ? await getAllSubCategory(categoryId) : null;

  return <FilterBusinessLayout
    businesses={businesses}
    categories={categories}
    subCategories={subCategories}
  />
};

export default page;
