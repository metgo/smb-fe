"use client";

import { misc } from "@/constant/hebrew";
import { IconImage } from "@/components/ui";
import { eventDetils } from "@/constant/placeholderData";
import { getHebrewDateInfo } from "@/lib/helpers";
import { useState } from "react";

const EventDateRange = ({
  dayDescription,
}: {
  dayDescription: DayDescription[];
}) => {
  const [clickedDay, setClickedDay] = useState({
    day: "",
    days: "",
    month: "",
  });

  return (
    <section className="col-span-4 flex flex-col items-center  gap-6">
      <div className=" flex items-center gap-2.5">
        {dayDescription?.map((item) => {
          const eventInfo = getHebrewDateInfo(item.date);
          const isActive = clickedDay.day === eventInfo.day;

          return (
            <div
              key={item._id}
              onClick={() => setClickedDay(eventInfo)}
              className={` w-23.5 h-27 border rounded-[5px] flex flex-col items-center justify-center cursor-pointer ${isActive ? " border-[#E89900] bg-[#FDF5E6] text-[#E89900]" : "border-[#D3D3D3] text-theme"}`}
            >
              <span>{eventInfo.days}</span>
              <div
                className={`font-bold text-[2.5rem] leading-none ${isActive ? "text-[#E89900]" : "text-charcoal"}`}
              >
                {eventInfo.day}
              </div>
              <span>{eventInfo.month}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          className="bg-dark rounded-2xl ps-15 pe-16.5 py-2 text-white flex items-center gap-1.25 cursor-pointer"
        >
          <IconImage icon="external-link" />
          <span>{misc.enrollment}</span>
        </button>
        <p className="text-theme font-normal text-[12px] text-center">
          {eventDetils.dateline}
        </p>
      </div>
    </section>
  );
};

export default EventDateRange;
