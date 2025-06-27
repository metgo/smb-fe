import Image from "next/image";

import Navbar from "@/components/navbar";
import ScrollIndicator from "@/components/ScrollIndicator";
import { getAllBusinesses, getAllCategory } from "@/actions/businessActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";
import { CategoryPanel, SubcategoryFilterPanel } from "@/components/cards";

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
  const { data } = await getAllCategory();

  return (
    <div>
      {/* Hero Section */}
      <section className="width-screen h-[834px] relative">
        <Image
          fill
          src={"/images/video-thumbnail.png"}
          alt="thumbnail image"
          className="object-cover"
        />
        <ScrollIndicator />
      </section>

      {/* Second Section */}
      <section className="relative z-10 bg-white">
        <Navbar />

        <div className="bg-primary">
          <FilterBusinessLayout {...businesses} />

          <div className="flex flex-col items-center justify-center gap-2 w-max mx-auto mt-10 fixed">
            <SubcategoryFilterPanel />
            <CategoryPanel categories={data} />
          </div>
        </div>
      </section>
    </div>
  )
};

export default page;
