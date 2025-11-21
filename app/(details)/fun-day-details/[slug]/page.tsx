import AttributePills from "@/components/AttributePills";
import { getAllLocations } from "@/actions/commonActions";
import { getTrailDetailsBySlug } from "@/actions/trailActions";

import { ImageGallery, NoDetailsFound } from "../../_components";
import { ensureListStyles, shuffleArray } from "@/lib/helpers";
import { funDaysLabels, menuItems } from "@/constant/hebrew";
import FunDayStations from "../_components/FunDayStations";
import FunDayDetailsRouteMap from "../_components/FunDayDetailsRouteMap";
import ContactUsInfo from "@/components/ContactUsInfo";
import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import MobileImageGallery from "@/components/mobile/ImageGallery.mobile";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (slug === "undefined" || !slug) return <NoDetailsFound />;

  const funDayDetails = await getTrailDetailsBySlug(slug, false, false);
  const locations = await getAllLocations();

  return (
    <>
      <div className="max-sm:mx-4 md:mx-20 py-12 relative space-y-12">
        <div className="flex items-center justify-between w-full max-sm:pt-30">
          <h1 className="text-3xl md:text-6xl font-bold overflow-ellipsis w-full">
            {funDayDetails?.name}
          </h1>
          <div className=" flex items-center justify-end gap-6 mb-4.5">
            <ShareUrlBtnModal />
          </div>
        </div>

        <div>
          {funDayDetails?.images && (
            <>
              <ImageGallery
                images={shuffleArray(funDayDetails?.images)}
                primaryCategoryId={funDayDetails?.primaryCategoryId}
              />
              <MobileImageGallery images={funDayDetails?.images} />
            </>
          )}
          <AttributePills items={funDayDetails?.groupTypesAndAccessibilities} />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className=" max-sm:col-span-12 md:col-span-8">
            <h2 className="font-bold max-sm:text-3xl md:text-[40px]">
              {funDaysLabels.whatsOnThePlan}
            </h2>
            {funDayDetails?.description && (
              <div
                className="font-normal prose block"
                dangerouslySetInnerHTML={{
                  __html: ensureListStyles(funDayDetails?.description),
                }}
              />
            )}
            <div className="flex flex-wrap items-center gap-7.5 text-charcoal mt-8">
              <span>{menuItems?.contactUs}</span>
              {/* Phone */}
              {funDayDetails?.contactDetails?.phoneNumber && (
                <ContactUsInfo
                  icon="phone"
                  text={funDayDetails?.contactDetails?.phoneNumber}
                  href={`tel:${funDayDetails?.contactDetails?.phoneNumber?.replace(/\s+/g, "")}`}
                />
              )}

              {/* Email */}
              {funDayDetails?.contactDetails?.email && (
                <ContactUsInfo
                  icon="mail"
                  text={funDayDetails?.contactDetails.email}
                  href={`mailto:${funDayDetails?.contactDetails.email}`}
                />
              )}
            </div>
          </div>

          <div className=" max-sm:col-span-12  md:col-span-4">
            <h2 className="font-bold  max-sm:text-3xl md:text-[40px]">
              {funDaysLabels.hazel}
            </h2>
            <div className="border border-lightGray rounded-md p-4 space-y-3 w-full">
              {funDayDetails?.itenary?.map((item: any, index: any) => (
                <div key={index} className="">
                  <div className="grid grid-cols-12 items-center gap-2">
                    <div className="text-xl text-theme font-normal col-span-4">
                      <span>{item?.startTime}</span>
                      <span>-</span>
                      <span>{item?.endTime}</span>
                    </div>
                    <div className="text-theme text-xl font-bold col-span-8">
                      {item?.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:grid grid-cols-12 gap-6 max-sm:flex max-sm:flex-col">
          <div className="max-sm:order-1 md:order-2 max-sm:col-span-12 md:col-span-7 max-sm:h-[50vh] md:h-[60vh] rounded-2xl shadow-md overflow-hidden">
            <FunDayDetailsRouteMap
              _id={funDayDetails?._id}
              locations={locations}
              routes={funDayDetails?.stations}
            />
          </div>

          <div className="max-sm:order-2 md:order-1 max-sm:col-span-12 md:col-span-5">
            <FunDayStations {...funDayDetails} />
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
