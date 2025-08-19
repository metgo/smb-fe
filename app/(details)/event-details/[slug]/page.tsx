import {
  EventDateRange,
  EventLocationMap,
  ImageGallery,
  Location,
  NoDetailsFound,
  ReturnToPrevPageBtn,
  Title,
} from "../../_components";
import { IconImage, MapNavButton } from "@/components/ui";
import { events, misc } from "@/constant/hebrew";
import AttributePills from "@/components/AttributePills";
import { getEventDetailsBySlug } from "@/actions/eventActions";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (slug === "undefined" || !slug) return <NoDetailsFound />;

  const eventDetails: EventDetailsProps | any =
    await getEventDetailsBySlug(slug);

  if (eventDetails?.statusCode === 404) return <NoDetailsFound />;

  return (
    <div className="">
      <ReturnToPrevPageBtn />
      <div className="mx-20 py-12">
        <Title title={eventDetails?.name} />

        <div className="mb-4.5 mt-2.5 flex items-center justify-between">
          <Location
            city={eventDetails?.address?.city}
            address={eventDetails?.address?.country}
          />
          <div className="flex items-center gap-2.5">
            <MapNavButton
              lat={eventDetails?.geoLocation?.lat}
              lng={eventDetails?.geoLocation?.long}
            />
            <div className="flex items-center gap-1.25 ps-2.5 pe-4 py-1 cursor-pointer">
              <IconImage icon={"share"} />
              <span className="font-bold text-theme text-sm">
                {misc.sharing}
              </span>
            </div>
          </div>
        </div>

        <ImageGallery images={eventDetails?.images?.slice(0, 5)} />

        <div className=" mt-4.5">
          <AttributePills
            items={[
              ...eventDetails?.accessibilitiesId,
              ...eventDetails?.groupTypesId,
            ]}
          />
        </div>

        <div className="grid grid-cols-12  mt-15 w-full">
          <div className="col-span-6 text-dark">
            <h2 className="font-bold  text-2xl mb-3">{events.eventDetails}</h2>
            <p className="font-normal">{eventDetails.description}</p>
          </div>
          <div className="col-span-2" />

          <EventDateRange {...eventDetails} />

          <div className="mt-22.5">
            <EventLocationMap geoLocation={eventDetails.geoLocation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
