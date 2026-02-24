"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

import { Dialog } from "@/components/ui";
import { itemTypeEnum } from "@/lib/utils";
import PriceTag from "@/components/PriceTag";
import useCartStore from "@/stores/cartStore";
import { groupTicketsByDateTime } from "@/lib/helpers";
import { staticImages } from "@/constant/staticImages";
import { buttonLabels, events } from "@/constant/hebrew";

interface TicketListModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ticketIds: ITicketIds[];
  eventId: string;
}

interface ISelectedTickets {
  key: string;
  ticketId: string;
  eventDayId: string;
  quantity: number;
  price: number;
}

interface ITicketStockInfo {
  remaining: number | null;
  perUserLimit: number | null;
}

/* ===================== COMPONENT ===================== */

const TicketListModal = ({
  isOpen,
  setIsOpen,
  ticketIds,
  eventId,
}: TicketListModalProps) => {
  const router = useRouter();
  const { setCartItem } = useCartStore();

  const grouped = useMemo(() => groupTicketsByDateTime(ticketIds), [ticketIds]);

  const [openEventDayIds, setOpenEventDayIds] = useState<string[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<ISelectedTickets[]>(
    [],
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ===================== HELPERS ===================== */

  const getSelectionKey = (eventDayId: string, ticketId: string) =>
    `${eventDayId}_${ticketId}`;

  const getSelectedQuantity = (key: string) =>
    selectedTickets.find((t) => t.key === key)?.quantity ?? 0;

  function addTicket(
    prev: ISelectedTickets[],
    payload: {
      key: string;
      ticketId: string;
      eventDayId: string;
      price: number;
      stock: ITicketStockInfo;
    },
  ): ISelectedTickets[] {
    const existing = prev.find((t) => t.key === payload.key);
    const currentQty = existing?.quantity ?? 0;

    // If both remaining and perUserLimit are null, allow infinite tickets
    const hasLimits =
      payload.stock.remaining !== null || payload.stock.perUserLimit !== null;

    if (hasLimits) {
      // Check remaining stock (if not null)
      if (payload.stock.remaining !== null && payload.stock.remaining <= 0) {
        setErrorKey(payload.key);
        setTimeout(() => setErrorKey(null), 2000);
        return prev;
      }

      // Check per-user limit (if not null)
      if (
        payload.stock.perUserLimit !== null &&
        currentQty >= payload.stock.perUserLimit
      ) {
        setErrorKey(payload.key);
        setTimeout(() => setErrorKey(null), 2000);
        return prev;
      }

      // Check if adding one more exceeds remaining stock (if not null)
      if (
        payload.stock.remaining !== null &&
        currentQty + 1 > payload.stock.remaining
      ) {
        setErrorKey(payload.key);
        setTimeout(() => setErrorKey(null), 2000);
        return prev;
      }
    }

    if (existing) {
      return prev.map((t) =>
        t.key === payload.key ? { ...t, quantity: t.quantity + 1 } : t,
      );
    }

    return [
      ...prev,
      {
        key: payload.key,
        ticketId: payload.ticketId,
        eventDayId: payload.eventDayId,
        quantity: 1,
        price: payload.price,
      },
    ];
  }

  function removeTicket(prev: ISelectedTickets[], key: string) {
    const existing = prev.find((t) => t.key === key);
    if (!existing) return prev;

    if (existing.quantity === 1) {
      return prev.filter((t) => t.key !== key);
    }

    return prev.map((t) =>
      t.key === key ? { ...t, quantity: t.quantity - 1 } : t,
    );
  }

  /* ===================== ADD TO CART ===================== */

  function handleTicketAddToCart() {
    selectedTickets.forEach((selected) => {
      const eventDay = grouped.find((d) => d._id === selected.eventDayId);
      const ticket = eventDay?.tickets.find((t) => t._id === selected.ticketId);

      if (!eventDay || !ticket) return;

      setCartItem({
        _id: ticket._id,
        name: ticket.name,
        desc: ticket.description,
        image: ticket.images[0]?.image,
        price: ticket.price.sellingPrice,
        quantity: selected.quantity,
        itemType: itemTypeEnum.ticket,
        parentId: eventId,
        eventDate: eventDay.date,
        startTime: eventDay.startTime,
        endTime: eventDay.endTime,
      });
    });

    setIsOpen(false);
    router.push("/cart");
  }

  /* ===================== UI ===================== */

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      className="max-w-3xl w-full"
    >
      <div className="p-10">
        <h1 className="font-bold text-2xl text-center">
          {events.eventTicketTitle}
        </h1>

        <div className="mt-6 pb-4 max-h-[60vh] overflow-y-auto space-y-6">
          {grouped.map((eventDay) => {
            const isOpen = openEventDayIds.includes(eventDay._id);

            return (
              <div
                key={eventDay._id}
                ref={(el) => {
                  sectionRefs.current[eventDay._id] = el;
                }}
              >
                <div
                  onClick={() => {
                    setOpenEventDayIds((prev) =>
                      prev.includes(eventDay._id)
                        ? prev.filter((id) => id !== eventDay._id)
                        : [...prev, eventDay._id],
                    );

                    setTimeout(() => {
                      sectionRefs.current[eventDay._id]?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 50);
                  }}
                  className="border rounded-lg px-4 py-3 flex justify-between cursor-pointer"
                >
                  <span className="font-bold">{events.chooseCard}</span>
                  <span className="text-gray-600">{eventDay.date}</span>
                  <span>
                    {eventDay.startTime} - {eventDay.endTime}
                  </span>
                  {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>

                {isOpen &&
                  eventDay.tickets.map((ticket) => {
                    const key = getSelectionKey(eventDay._id, ticket._id);
                    const qty = getSelectedQuantity(key);
                    const isSelected = qty > 0;

                    // Check if limits exist
                    const hasLimits =
                      ticket.quantity.remaining !== null ||
                      ticket.quantity.perUserLimit !== null;

                    return (
                      <div key={key}>
                        <div
                          className={clsx(
                            "mt-2 grid grid-cols-12 items-center border rounded-md p-3 transition-colors",
                            errorKey === key
                              ? "border-red-500"
                              : isSelected
                                ? "bg-primary border-secondary"
                                : "hover:bg-gray-50",
                          )}
                        >
                          <div className="col-span-7 max-sm:col-span-12 max-sm:mb-4 flex gap-3">
                            <div className="h-16 w-20">
                              <Image
                                src={
                                  ticket.images?.[0]?.image ||
                                  staticImages.placeholder
                                }
                                alt={ticket.name}
                                width={40}
                                height={40}
                                unoptimized
                                className="rounded-md h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <h2 className="font-bold">{ticket.name}</h2>
                              <div
                                className="text-sm line-clamp-1"
                                dangerouslySetInnerHTML={{
                                  __html: ticket.description,
                                }}
                              />
                              {/* Only show limits if they exist */}
                              {hasLimits && (
                                <p className="text-sm text-gray-500">
                                  {ticket.quantity.remaining !== null && (
                                    <>
                                      {events.remaining}:{" "}
                                      <strong>
                                        {ticket.quantity.remaining}
                                      </strong>
                                    </>
                                  )}
                                  {ticket.quantity.remaining !== null &&
                                    ticket.quantity.perUserLimit !== null &&
                                    " | "}
                                  {ticket.quantity.perUserLimit !== null && (
                                    <>
                                      {events.maxPerUser}:{" "}
                                      <strong>
                                        {ticket.quantity.perUserLimit}
                                      </strong>
                                    </>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="col-span-3 max-sm:col-span-8 flex items-center gap-2">
                            <button
                              onClick={() =>
                                setSelectedTickets((prev) =>
                                  addTicket(prev, {
                                    key,
                                    ticketId: ticket._id,
                                    eventDayId: eventDay._id,
                                    price: ticket.price.sellingPrice,
                                    stock: ticket.quantity,
                                  }),
                                )
                              }
                              className={clsx(
                                "size-8 rounded-full border flex items-center justify-center cursor-pointer",
                              )}
                            >
                              <FaPlus />
                            </button>

                            <span className="min-w-6 text-center">{qty}</span>

                            <button
                              disabled={qty === 0}
                              onClick={() =>
                                setSelectedTickets((prev) =>
                                  removeTicket(prev, key),
                                )
                              }
                              className={clsx(
                                "size-8 rounded-full border flex items-center justify-center",
                                qty === 0
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer",
                              )}
                            >
                              <FaMinus />
                            </button>
                          </div>

                          <PriceTag
                            price={ticket.price.sellingPrice}
                            className="col-span-2 text-end"
                          />
                        </div>
                        {errorKey === key && (
                          <p className="text-red-500">
                            {events.exceedInfoText}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            disabled={selectedTickets.length === 0}
            onClick={handleTicketAddToCart}
            className={clsx(
              "px-8 py-2 font-bold rounded-md",
              selectedTickets.length
                ? "bg-black text-white"
                : "bg-black/40 cursor-not-allowed",
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
