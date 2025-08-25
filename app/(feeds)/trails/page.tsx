import { Suspense } from "react";

import FilterTrailsLayout from "./_components/FilterTrailsLayout";

const page = async () => {
  return (
    <Suspense>
      <FilterTrailsLayout />
    </Suspense>
  );
};

export default page;
