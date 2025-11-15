import { Suspense } from "react";
import { getAllTrails } from "@/actions/trailActions";

import FilterTrailsLayout from "./_components/FilterTrailsLayout";
import OnlyFeedCardsLayoutMobile from "@/components/layouts/OnlyFeedCardsLayout.mobile";

const page = async ({ searchParams }: SearchParamsProps | any) => {
  const { page = 1 } = await searchParams;
  const trails: TrailsFeedProps = await getAllTrails(
    Number(page),
    "/fun_days",
    false,
  );

  return (
    <Suspense>
      <FilterTrailsLayout {...trails} />
      <div className="md:hidden max-sm:block">
        <OnlyFeedCardsLayoutMobile data={trails.data} />
      </div>
    </Suspense>
  );
};

export default page;
