import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";

import { Dialog } from "@/components/ui";
import PriceTag from "@/components/PriceTag";
import { buttonLabels, events } from "@/constant/hebrew";
import useCartStore from "@/stores/cartStore";
import { itemTypeEnum } from "@/lib/utils";

interface TicketListModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  dayDescription: DayDescription[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const TicketListModal = ({
  isOpen,
  setIsOpen,
  dayDescription,
}: TicketListModalProps) => {
  const router = useRouter();
  const { setCartItem } = useCartStore();

  const [isTicketSelected, setIsTicketSelected] = useState(false);
  const [updatedTickets, setUpdatedTickets] = useState<
    UpdatedTicketsListProps[]
  >([]);

  useEffect(() => {
    if (dayDescription.length > 0) {
      const tickets = dayDescription.map((eventDays) => ({
        _id: eventDays._id,
        date: formatDate(eventDays.date),
        startTime: eventDays.startTime,
        endTime: eventDays.endTime,
        tickets: eventDays.ticketIds.map((ticket) => ({
          quantity: 0,
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

  useEffect(() => {
    const hasSelectedTickets = updatedTickets.some((eventDay) =>
      eventDay.tickets.some((ticket) => ticket.isSelected),
    );
    setIsTicketSelected(hasSelectedTickets);
  }, [updatedTickets]);

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
                    ? {
                        ...ticket,
                        quantity: ticket.quantity + 1,
                        isSelected: true,
                      }
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
                tickets: eventDay.tickets.map((ticket) => {
                  if (ticket._id === ticketId && ticket.quantity > 0) {
                    const newQty = ticket.quantity - 1;
                    return {
                      ...ticket,
                      quantity: newQty,
                      isSelected: newQty > 0,
                    };
                  }
                  return ticket;
                }),
              }
            : eventDay,
        ),
      );
    },
    [],
  );

  function handleTicketAddToCart() {
    const selectedTickets = updatedTickets.flatMap((eventDay) =>
      eventDay.tickets
        .filter((ticket) => ticket.isSelected)
        .map((ticket) => ({
          _id: ticket._id,
          name: ticket.name,
          desc: ticket.desc,
          image: ticket.image,
          price: ticket.price,
          itemType: itemTypeEnum.ticket,
          quantity: ticket.quantity,
          parentId: eventDay._id,
          eventDate: eventDay.date,
          startTime: eventDay.startTime,
          endTime: eventDay.endTime,
        })),
    );

    selectedTickets.forEach((ticket) => setCartItem(ticket));
    setIsOpen(false);
    router.push("/cart");
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="max-w-3xl w-full"
    >
      <div className="relative w-full rounded-md p-10">
        <h1 className="font-bold text-2xl w-full text-center">
          {events.eventTicketTitle}
        </h1>

        <div className="mt-4 p-10 shadow-md rounded-xl flex flex-col gap-8">
          {updatedTickets.map((eventDays) => {
            return (
              <div key={eventDays._id}>
                <div className="border-[2px] border-black/80 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="font-bold">{events.chooseCard}</span>
                  <span className="text-gray-600">{eventDays.date}</span>
                  <span>
                    {eventDays.startTime} - {eventDays.endTime}
                  </span>
                  <IoIosArrowDown />
                </div>
                <div className="">
                  {eventDays?.tickets?.map((ticket) => (
                    <div
                      key={`${eventDays._id}-${ticket._id}`}
                      className={clsx(
                        "flex items-center justify-between px-3 py-1 rounded-md transition-colors mt-2",
                        ticket.isSelected
                          ? "bg-primary border-2 border-secondary"
                          : "hover:bg-prmary border-2 border-transparent",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={ticket.image}
                          alt={ticket.name}
                          width={100}
                          height={100}
                          className="h-10 w-10 rounded-md"
                        />
                        <div>
                          <h2 className={"font-bold"}>{ticket.name}</h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
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
                            disabled={ticket.quantity === 0}
                            className={clsx(
                              "size-9 rounded-full border border-secondary flex items-center justify-center transition-colors",
                              ticket.quantity === 0
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
                        <PriceTag price={ticket.price} className="" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue */}
        <div className="flex items-center justify-center mt-8">
          <button
            type="button"
            disabled={!isTicketSelected}
            onClick={handleTicketAddToCart}
            className={clsx(
              isTicketSelected
                ? "bg-black cursor-pointer"
                : "bg-black/50 cursor-not-allowed",
              " px-8 py-2 rounded-md text-white font-bold hover:shadow-md",
            )}
          >
            {buttonLabels.continue}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default TicketListModal;
