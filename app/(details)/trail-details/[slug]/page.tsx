import { misc } from "@/constant/hebrew";
import { IconImage } from "@/components/ui";
import { NoDetailsFound, ReturnToPrevPageBtn } from "../../_components";
import AttributePills from "@/components/AttributePills";
import { getTrailDetailsBySlug } from "@/actions/trailActions";
import TrailDetailsRouteMap from "../_components/TrailDetailsRouteMap";
import TrailStations from "../_components/TrailStations";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (slug === "undefined" || !slug) return <NoDetailsFound />;

  const trailsDetails = await getTrailDetailsBySlug(slug);

  return (
    <>
      <ReturnToPrevPageBtn label={misc.toAllTracks} />
      <div className="w-full h-[87vh] relative">
        <TrailDetailsRouteMap {...trailsDetails} />

        {/* Trail's Details */}
        <section className="p-5 space-y-7 absolute right-2 top-2 bottom-2 w-[31.5rem] rounded-xl shadow-md bg-white h-[86vh] overflow-auto hide-scrollbar">
          <div>
            <div className="w-full flex items-center justify-end gap-6 mb-4.5">
              <IconImage icon="share" />
              <IconImage icon="navigation" />
            </div>

            <div className="text-dark">
              <h1 className="text-2xl font-bold">{trailsDetails?.name}</h1>
              <div className="font-bold my-1.5">{trailsDetails?.distance}</div>
              <p className="font-normal">{trailsDetails?.description}</p>
            </div>
            <div className="my-7">
              <AttributePills
                items={[...trailsDetails?.groupTypesAndAccessibilities]}
              />
            </div>
            <div className="w-full flex justify-end">
              <button
                type="button"
                className=" cursor-pointer bg-dark rounded-xl ps-2.5 pe-4 py-2 flex items-center gap-1.25"
              >
                <IconImage icon="basket-white" />
                <span className="text-white font-bold">
                  {misc.addAllStationOnCart}
                </span>
              </button>
            </div>
          </div>
          <TrailStations {...trailsDetails} />
        </section>
      </div>
    </>
  );
};

export default page;
