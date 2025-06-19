import { getAllBusinesses } from "@/actions/businessActions";
import FilterBusinessLayout from "@/components/layouts/FilterBusinessLayout";

interface Props {
  searchParams: Promise<{ page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { page = 1 } = await searchParams;
  const businesses: BusinessesProps = await getAllBusinesses(Number(page));
  return <FilterBusinessLayout {...businesses} />
};

export default page;
