import { misc } from "@/constant/hebrew";
import { IconImage } from "@/components/ui";
import { eventFeatures, shareKeepNavigate } from "@/lib/utils";
import { eventDetils } from "@/constant/placeholderData";
import {
  BusinessDetailsFilterTab,
  ImageGallery,
  Location,
  Title,
} from "../../_components";

const page = () => {
  return (
    <div className="">
      <div className="flex items-center gap-1.25 px-20 my-2.5 cursor-pointer">
        <IconImage icon="return-arrow" />
        <span className="text-dark ">{misc.return}</span>
      </div>
      <hr className="h-[1px] text-primary" />

      <div className="mx-20 py-12">
        <Title title={eventDetils.title} />

        <div className="mb-4.5 mt-2.5 flex items-center justify-between">
          <Location city="באר-שבע" address="פארק לורם אימפסום" />
          <div className="flex items-center gap-2.5">
            {shareKeepNavigate.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.25 ps-2.5 pe-4 py-1 cursor-pointer"
              >
                <IconImage icon={item.icon} />
                <span className="font-bold text-theme text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ImageGallery />

        <div className="flex items-center gap-2.5 mt-4.5">
          {eventFeatures.map((item) => (
            <div
              key={item.id}
              className="ps-4 pe-5 border border-theme rounded-4xl h-10 flex items-center justify-center"
            >
              <span className="font-bold text-sm text-theme">{item.label}</span>
            </div>
          ))}
        </div>

        <BusinessDetailsFilterTab />
      </div>
    </div>
  );
};

export default page;
