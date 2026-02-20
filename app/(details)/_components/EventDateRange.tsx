"use client";

import Link from "next/link";
import { useState } from "react";

import { misc } from "@/constant/hebrew";
import { IconImage } from "@/components/ui";
import { paymentMethodType } from "@/lib/utils";
import TicketListModal from "./TicketListModal";
import { getHebrewDateInfo } from "@/lib/helpers";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";

const EventDateRange = ({
  _id,
  name,
  dayDescription,
  payment,
}: EventDetailsProps) => {
  const [openTicketModal, setOpenTicketModal] = useState(false);

  function handleOpenTicketModal() {
    setOpenTicketModal(true);
    sendGAEvent(triggerName.clickToViewTicket, {
      eventId: _id,
      eventName: name,
    });
  }

  return (
    <>
      <section className="col-span-4 flex flex-col items-center gap-6 w-full">
        <div className="w-full overflow-x-auto scroll-smooth pb-2">
          <div className="flex items-center justify-start gap-2.5 w-max px-4">
            {dayDescription?.map((item, index) => {
              const eventInfo = getHebrewDateInfo(item.date);
              const isActive = false;

              return (
                <div
                  key={index}
                  className={`w-[94px] h-[108px] border rounded-[5px] flex flex-col shrink-0 items-center justify-center font-normal
                    ${
                      isActive
                        ? "border-[#E89900] bg-[#FDF5E6] text-[#E89900]"
                        : "border-[#D3D3D3] text-theme"
                    }`}
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
        </div>

        <div className="space-y-2.5">
          {payment?.method === paymentMethodType?.externalLink ? (
            <Link
              href={payment?.externalLink}
              target="_blank"
              className="bg-dark rounded-2xl ps-15 pe-16.5 py-2 text-white flex items-center gap-1.25 font-bold custom-cursor"
            >
              <IconImage icon="external-link" />
              <span>{misc.enrollment}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleOpenTicketModal}
              className="bg-dark rounded-2xl ps-15 pe-16.5 py-2 text-white flex items-center gap-1.25 font-bold custom-cursor"
            >
              <span>{misc.enrollment}</span>
            </button>
          )}
        </div>
      </section>

      {openTicketModal && (
        <TicketListModal
          isOpen={openTicketModal}
          setIsOpen={setOpenTicketModal}
          ticketIds={payment?.ticketIds}
          eventId={_id}
        />
      )}
    </>
  );
};

export default EventDateRange;
