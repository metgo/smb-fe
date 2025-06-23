import { getAllBusinesses } from "@/actions/businessActions";
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
  return <FilterBusinessLayout {...businesses} />
};

export default page;
