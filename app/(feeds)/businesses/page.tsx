import { getAllBusinesses } from "@/actions/businessActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";

interface PageProps {
  searchParams: {
    page?: string;
    categoryId?: string;
    subCategoryId?: string;
  };
}

const Page = async ({ searchParams }: PageProps | any) => {
  const {
    page = "1",
    categoryId = "",
    subCategoryId = "",
  } = await searchParams;

  const businesses: BusinessesProps = await getAllBusinesses(
    Number(page),
    categoryId,
    subCategoryId,
    "/businesses",
  );

  return <FilterBusinessLayout businesses={businesses} />;
};

export default Page;
