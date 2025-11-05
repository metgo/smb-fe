import { IconImage } from "@/components/ui";
import TrailStations from "../_components/TrailStations";
import AttributePills from "@/components/AttributePills";
import { getAllLocations } from "@/actions/commonActions";
import { getTrailDetailsBySlug } from "@/actions/trailActions";

import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import TrailDetailsRouteMap from "../_components/TrailDetailsRouteMap";
import MobileTrailFeedDetails from "../_mobile/TrailFeedDetails.mobile";
import { NoDetailsFound } from "../../_components";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (slug === "undefined" || !slug) return <NoDetailsFound />;

  const trailsDetails = await getTrailDetailsBySlug(slug);
  const locations = await getAllLocations();

  return (
    <>
      <div className="w-full h-[87vh] relative max-sm:hidden md:block">
        <TrailDetailsRouteMap _id={trailsDetails?._id} locations={locations} />

        {/* Trail's Details */}
        <section className="p-5 space-y-7 absolute right-2 top-2 bottom-2 w-[31.5rem] rounded-xl shadow-md bg-white h-[86vh] overflow-auto hide-scrollbar">
          <div>
            <div className="w-full flex items-center justify-end gap-6 mb-4.5">
              <ShareUrlBtnModal hideShareText />
              <IconImage icon="navigation" />
            </div>

            <div className="text-dark">
              <h1 className="text-2xl font-bold">{trailsDetails?.name}</h1>
              <div className="font-bold my-1.5">{trailsDetails?.distance}</div>
              <div
                className="font-normal"
                dangerouslySetInnerHTML={{ __html: trailsDetails?.description }}
              />
            </div>
            <div className="my-7">
              <AttributePills
                items={trailsDetails?.groupTypesAndAccessibilities}
              />
            </div>
          </div>
          <TrailStations {...trailsDetails} />
        </section>
      </div>
      <MobileTrailFeedDetails
        _id={trailsDetails?._id}
        name={trailsDetails?.name}
        description={trailsDetails?.description}
        locations={locations}
        stations={trailsDetails?.stations}
      />
    </>
  );
};

export default page;
