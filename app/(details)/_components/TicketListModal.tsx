import clsx from "clsx";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";

import { Dialog } from "@/components/ui";
import { buttonLabels, events } from "@/constant/hebrew";
import PriceTag from "@/components/PriceTag";

interface TicketListModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  dayDescription: DayDescription[];
}

const TicketListModal = ({
  isOpen,
  setIsOpen,
  dayDescription,
}: TicketListModalProps) => {
  const [updatedTickets, setUpdatedTickets] = useState<
    UpdatedTicketsListProps[]
  >([]);

  useEffect(() => {
    if (dayDescription.length > 0) {
      const tickets = dayDescription.map((eventDays) => ({
        _id: eventDays._id,
        date: eventDays.date,
        startTime: eventDays.startTime,
        endTime: eventDays.endTime,
        tickets: eventDays.ticketIds.map((ticket) => ({
          quantity: 1,
          _id: ticket._id,
          name: ticket.name,
          desc: "",
          isSelected: false,
          image: ticket.images[0].image,
          price: ticket.price.markedPrice,
        })),
      }));
      setUpdatedTickets(tickets);
    }
  }, [dayDescription]);

  // const updateTicketInfo = useCallback((eventDayId: string, ticketId: string, updates: Partial<UpdatedTicketItem>) => {
  //   setUpdatedTickets(prev =>
  //     prev.map(eventDay =>
  //       eventDay._id === eventDayId
  //         ? {
  //           ...eventDay,
  //           tickets: eventDay.tickets.map(ticket =>
  //             ticket._id === ticketId ? { ...ticket, ...updates } : ticket
  //           ),
  //         }
  //         : eventDay
  //     )
  //   );
  // }, [])

  const toggleTicketSelection = useCallback(
    (eventDayId: string, ticketId: string) => {
      setUpdatedTickets((prev) =>
        prev.map((eventDay) =>
          eventDay._id === eventDayId
            ? {
                ...eventDay,
                tickets: eventDay.tickets.map((ticket) =>
                  ticket._id === ticketId
                    ? { ...ticket, isSelected: !ticket.isSelected }
                    : ticket,
                ),
              }
            : eventDay,
        ),
      );
    },
    [],
  );

  const incrementQuantity = useCallback(
    (e: React.MouseEvent, eventDayId: string, ticketId: string) => {
      e.stopPropagation();
      setUpdatedTickets((prev) =>
        prev.map((eventDay) =>
          eventDay._id === eventDayId
            ? {
                ...eventDay,
                tickets: eventDay.tickets.map((ticket) =>
                  ticket._id === ticketId
                    ? { ...ticket, quantity: ticket.quantity + 1 }
                    : ticket,
                ),
              }
            : eventDay,
        ),
      );
    },
    [],
  );

  const decrementQuantity = useCallback(
    (e: React.MouseEvent, eventDayId: string, ticketId: string) => {
      e.stopPropagation();
      setUpdatedTickets((prev) =>
        prev.map((eventDay) =>
          eventDay._id === eventDayId
            ? {
                ...eventDay,
                tickets: eventDay.tickets.map((ticket) =>
                  ticket._id === ticketId && ticket.quantity > 1
                    ? { ...ticket, quantity: ticket.quantity - 1 }
                    : ticket,
                ),
              }
            : eventDay,
        ),
      );
    },
    [],
  );

  function handleTicketAddToCart() {}

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="max-w-3xl w-full"
    >
      <div className="relative w-full rounded-md p-4">
        <h1 className="font-bold text-2xl w-full text-center">
          {events.eventTicketTitle}
        </h1>

        <div className="mt-4">
          {updatedTickets.map((eventDays) => {
            return (
              <div key={eventDays._id}>
                <div className="">
                  {eventDays?.tickets?.map((ticket) => (
                    <div
                      key={`${eventDays._id}-${ticket._id}`}
                      onClick={() =>
                        toggleTicketSelection(eventDays._id, ticket._id)
                      }
                      className={clsx(
                        "flex items-center justify-between cursor-pointer px-3 py-1 rounded-md transition-colors mt-2",
                        ticket.isSelected
                          ? "bg-blue-100 border-2 border-blue-200"
                          : "hover:bg-gray-100 border-2 border-transparent",
                      )}
                    >
                      <Image
                        src={ticket.image}
                        alt={ticket.name}
                        width={100}
                        height={100}
                        className="h-10 w-10 rounded-md"
                      />
                      <div>
                        <h2
                          className={clsx(ticket.isSelected ? "font-bold" : "")}
                        >
                          {ticket.name}
                        </h2>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <button
                            type="button"
                            className="size-9 rounded-full border border-secondary flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={(e) =>
                              incrementQuantity(e, eventDays._id, ticket._id)
                            }
                          >
                            <FaPlus />
                          </button>
                          <span className="min-w-[2rem] text-center font-medium">
                            {ticket.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={ticket.quantity === 1}
                            className={clsx(
                              "size-9 rounded-full border border-secondary flex items-center justify-center transition-colors",
                              ticket.quantity === 1
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer hover:bg-gray-50",
                            )}
                            onClick={(e) =>
                              decrementQuantity(e, eventDays._id, ticket._id)
                            }
                          >
                            <FaMinus />
                          </button>
                        </div>
                      </div>
                      <PriceTag price={ticket.price} className="" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center mt-8">
          <button
            type="button"
            onClick={handleTicketAddToCart}
            className="bg-black px-8 py-2 rounded-md text-white font-bold cursor-pointer hover:shadow-md"
          >
            {buttonLabels.continue}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default TicketListModal;
