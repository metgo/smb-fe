import { Suspense } from "react";
import Navbar from "@/components/navbar";

import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";
import { blogLabels } from "@/constant/hebrew";
import { getAllBlogs } from "@/actions/blogActions";

const page = async () => {
  const businesses: BusinessesProps = await getAllBlogs();

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
