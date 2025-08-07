import { Suspense } from "react";
import { getAllTrails } from "@/actions/trailActions";

import FilterTrailsLayout from "./_components/FilterTrailsLayout";

const page = async ({ searchParams }: SearchParamsProps | any) => {
  const { page = 1 } = searchParams;

  const trails: TrailsFeedProps = await getAllTrails(Number(page), "/trails");

  return (
    <Suspense>
      <FilterTrailsLayout {...trails} />
    </Suspense>
  );
};

export default page;
