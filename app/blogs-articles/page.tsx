import { Suspense } from "react";
import Navbar from "@/components/navbar";

import { getAllEvents } from "@/actions/eventActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";
import { blogLabels } from "@/constant/hebrew";

const page = async ({ searchParams }: SearchParamsProps | any) => {
  const { page = 1 } = await searchParams;

  const businesses: BusinessesProps = await getAllEvents(
    Number(page),
    "/events",
  );

  return (
    <Suspense>
      <Navbar />
      <div className="bg-primary">
        <div className="flex items-center justify-center flex-col pt-10">
          <h1 className="font-bold text-[2rem]">
            {blogLabels.theFlourishingBlog}
          </h1>
          <p className="font-normal">{blogLabels.desc}</p>
        </div>
        <FilterBusinessLayout businesses={businesses} />
      </div>
    </Suspense>
  );
};

export default page;
