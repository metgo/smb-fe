import { Suspense } from "react";
import Navbar from "@/components/navbar";

import { getAllEvents } from "@/actions/eventActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";
import MobileEventFeedLayout from "./_mobile/EventFeedLayout.mobile";

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
      <MobileEventFeedLayout data={businesses?.data} />
    </Suspense>
  );
};

export default page;
