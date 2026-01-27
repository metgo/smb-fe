"use client";

import { getCityOrCenter } from "@/lib/helpers";
import AttributePills from "@/components/AttributePills";
import { EventDateRange, EventLocationMap } from "@/app/(details)/_components";
import MobileImageGallery from "@/components/mobile/ImageGallery.mobile";
import MobileFeedScreenActionIcons from "@/components/mobile/FeedScreenActionIcons.mobile";
import { LocationIcon } from "@/components/ui/svgIcons";

const MobileEventDetails = ({
  eventDetails,
}: {
  eventDetails: EventDetailsProps;
}) => {
  return (
    <>
      <div className="md:hidden max-sm:block pb-12 relative mt-8">
        <MobileFeedScreenActionIcons
          posTop="top-0"
          strokColor="#111"
          geoLocation={eventDetails?.geoLocation}
        />

        <section className="px-10 py-4">
          <h1 className="text-6xl font-bold mt-10">{eventDetails.name}</h1>
          <div
            className="font-normal text-theme line-clamp-3 mt-4 mb-8"
            dangerouslySetInnerHTML={{
              __html: eventDetails?.description || "",
            }}
          />
          <div className="flex items-center gap-2 mt-2">
            <LocationIcon strokColor="black" />
            <span className="font-bold text-xl">
              {getCityOrCenter(eventDetails?.address)}
            </span>
          </div>
        </section>

        <section className="px-6 py-2 space-y-4 ">
          <MobileImageGallery images={eventDetails?.images} />
          <AttributePills
            items={[
              ...eventDetails?.accessibilitiesId,
              ...eventDetails?.groupTypesId,
            ]}
          />
        </section>

        <EventDateRange {...eventDetails} />

        <section className="px-6 py-4">
          <EventLocationMap geoLocation={eventDetails.geoLocation} />
        </section>
      </div>
    </>
  );
};

export default MobileEventDetails;
