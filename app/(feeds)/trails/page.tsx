import { Suspense } from "react";
import TrailMapIntegratedLayout from "@/components/layouts/TrailMapIntegratedLayout";
// import OnlyTrailCardLayout from "@/components/layouts/OnlyTrailCardLayout"

const page = () => {
  return (
    <Suspense>
      {/* <OnlyTrailCardLayout /> */}
      <TrailMapIntegratedLayout />
    </Suspense>
  );
};

export default page;
