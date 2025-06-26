import Image from "next/image";
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
  return (
    <div>
      <section className="h-screen w-[834px] ">
        <Image
          fill
          src={"/images/video-thumbnail.png"}
          alt="thumbnail image"
          className=" object-cover"
        />
        <div>
          
        </div>
      </section>
      <FilterBusinessLayout {...businesses} />
    </div>
  )
};

export default page;
