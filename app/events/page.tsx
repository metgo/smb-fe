import { getAllEvents } from "@/actions/eventActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";
import Navbar from "@/components/navbar";

interface Props {
  searchParams: Promise<{
    page: string;
    categoryId: string;
    subCategoryId: string;
  }>;
}

const page = async ({ searchParams }: Props) => {
  const { page = 1, categoryId = "", subCategoryId = "" } = await searchParams;

  const businesses: BusinessesProps = await getAllEvents(
    Number(page),
    categoryId,
    subCategoryId,
    "/events",
  );

  return (
    <>
      <Navbar />
      <FilterBusinessLayout businesses={businesses} />;
    </>
  );
};

export default page;
