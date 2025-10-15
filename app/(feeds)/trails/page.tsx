import { Suspense } from "react";
import { getAllTrails } from "@/actions/trailActions";

import FilterTrailsLayout from "./_components/FilterTrailsLayout";
import MobileTrailFeedLayout from "./_mobile/TrailFeedLayout.mobile";

const page = async ({ searchParams }: SearchParamsProps | any) => {
  const { page = 1 } = await searchParams;
  const trails: TrailsFeedProps = await getAllTrails(Number(page), "/trails");

  return (
    <Suspense>
      <FilterTrailsLayout {...trails} />
      <MobileTrailFeedLayout {...trails} />
    </Suspense>
  );
};

export default page;
