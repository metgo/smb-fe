import { getAllBusinesses } from "@/actions/businessActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";
import MobileBusinessFeedLayout from "@/components/mobile/BusinessFeedLayout.mobile";

interface PageProps {
  searchParams: {
    page?: string;
    categoryId?: string;
    subCategoryId?: string;
    accessibilitiesIds?: string;
    groupTypesIds?: string;
  };
}

const Page = async ({ searchParams }: PageProps | any) => {
  const {
    page = "1",
    categoryId = "",
    subCategoryId = "",
    accessibilitiesIds = "",
    groupTypesIds = "",
  } = await searchParams;

  // Parse comma-separated values into arrays
  const accessibilitiesArray = accessibilitiesIds
    ? accessibilitiesIds.split(",")
    : [];

  const groupTypesArray = groupTypesIds ? groupTypesIds.split(",") : [];

  const businesses: BusinessesProps = await getAllBusinesses(
    Number(page),
    categoryId,
    subCategoryId,
    groupTypesArray,
    accessibilitiesArray,
  );

  return (
    <>
      <FilterBusinessLayout businesses={businesses} />
      <MobileBusinessFeedLayout businesses={businesses} />
    </>
  );
};

export default Page;
