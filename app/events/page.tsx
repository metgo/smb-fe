import { getAllEvents } from "@/actions/eventActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";
import Navbar from "@/components/navbar";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    page: string;
    categoryId: string;
    subCategoryId: string;
  }>;
}

const page = async ({ searchParams }: Props | any) => {
  const { page = 1, categoryId = "", subCategoryId = "" } = await searchParams;

  const businesses: BusinessesProps = await getAllEvents(
    Number(page),
    categoryId,
    subCategoryId,
    "/events",
  );

  return (
    <Suspense>
      <Navbar />
      <FilterBusinessLayout businesses={businesses} />
    </Suspense>
  );
};

export default page;
