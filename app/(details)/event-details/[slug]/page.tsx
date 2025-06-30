import { eventDates, eventDetils } from "@/constant/placeholderData"
import { ImageGallery, Location, Title } from "../../_components"
import { eventFeatures, shareKeepNavigate } from "@/lib/utils"
import { IconImage } from "@/components/ui"
import { misc } from "@/constant/hebrew"

const page = () => {
  return (
    <div className="px-20 py-20">

      <Title title={eventDetils.title} />

      <div className="mb-4.5 mt-2.5 flex items-center justify-between">
        <Location city="באר-שבע" address="פארק לורם אימפסום" />
        <div className="flex items-center gap-2.5">
          {shareKeepNavigate.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-1.25 ps-2.5 pe-4 py-1 cursor-pointer"
            >
              <IconImage icon={item.icon} />
              <span className="font-bold text-theme text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ImageGallery />

      <div className="flex items-center gap-2.5 mt-4.5">
        {eventFeatures.map(item => (
          <div
            key={item.id}
            className="ps-4 pe-5 border border-theme rounded-4xl h-10 flex items-center justify-center"
          >
            <span className="font-bold text-sm text-theme">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12  mt-15 w-full">
        <div className="col-span-6 text-dark">
          <h2 className="font-bold  text-2xl mb-3">{eventDetils.header}</h2>
          <p className="font-normal">{eventDetils.desc}</p>
        </div>
        <div className="col-span-2" />
        <section className="col-span-4 flex flex-col items-center  gap-6">
          <div className=" flex items-center gap-2.5">
            {eventDates.map(item => (
              <div
                key={item.id}
                className={` w-23.5 h-27 border rounded-[5px] flex flex-col items-center justify-center ${item.isActive ? " border-[#E89900] bg-[#FDF5E6] text-[#E89900]" : "border-[#D3D3D3] text-theme"}`}
              >
                <span>{item.title}</span>
                <div className={`font-bold text-[2.5rem] leading-none ${item.isActive ? "text-[#E89900]" : "text-[#343434]"}`}>{item.day}</div>
                <span>{item.month}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              className="bg-drak rounded-2xl ps-15 pe-16.5 py-2 text-white flex items-center gap-1.25 cursor-pointer"
            >
              <IconImage icon="external-link" />
              <span>{misc.enrollment}</span>
            </button>
            <p className="text-theme font-normal text-[12px] text-center">{eventDetils.dateline}</p>
          </div>
        </section>
      </div>

    </div >
  )
}

export default page