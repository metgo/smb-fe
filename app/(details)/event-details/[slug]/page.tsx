import {
  EventDateRange,
  EventLocationMap,
  ImageGallery,
  Location,
  NoDetailsFound,
  Title,
} from "../../_components";
import { events } from "@/constant/hebrew";
import { MapNavButton } from "@/components/ui";
import AttributePills from "@/components/AttributePills";
import { getEventDetailsBySlug } from "@/actions/eventActions";
import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import MobileEventDetails from "../_mobile/EventDetails.mobile";
import { shuffleArray } from "@/lib/helpers";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (slug === "undefined" || !slug) return <NoDetailsFound />;

  const eventDetails: EventDetailsProps | any =
    await getEventDetailsBySlug(slug);

  if (eventDetails?.statusCode === 404) return <NoDetailsFound />;

  return (
    <>
      <div className="mx-20 py-12 max-sm:hidden md:block">
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
            <ShareUrlBtnModal />
          </div>
        </div>

        <ImageGallery images={shuffleArray(eventDetails?.images)} />

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

      <MobileEventDetails eventDetails={eventDetails} />
    </>
  );
};

export default page;
