import { getAllEvents } from "@/actions/eventActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";
import Navbar from "@/components/navbar";
import { Suspense } from "react";

const page = async ({ searchParams }: SearchParamsProps | any) => {
  const { page = 1 } = await searchParams;

  const businesses: BusinessesProps = await getAllEvents(
    Number(page),
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
