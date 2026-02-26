"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaMinus, FaPlus } from "react-icons/fa6";

import { Dialog } from "@/components/ui";
import { itemTypeEnum } from "@/lib/utils";
import PriceTag from "@/components/PriceTag";
import useCartStore from "@/stores/cartStore";
import { staticImages } from "@/constant/staticImages";
import { buttonLabels, events } from "@/constant/hebrew";
import { formatDateMonth, isDateUpcoming } from "@/lib/helpers";
import { BiCalendar } from "react-icons/bi";
import { GoClock } from "react-icons/go";

/* ===================== TYPES ===================== */

interface TicketListModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ticketIds: ITicketIds[];
  eventId: string;
}

interface ISelectedTickets {
  key: string;
  ticketId: string;
  eventDayIndex: number;
  quantity: number;
  price: number;
  name: string;
  description: string;
  image?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
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

  const [selectedTickets, setSelectedTickets] = useState<ISelectedTickets[]>(
    [],
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);

  /* ===================== KEY ===================== */

  /**
   * Build a unique key from ticketId + dayIndex (index within dayDescription array).
   * We use index because dayDescription items have no _id field.
   */
  const getSelectionKey = (ticketId: string, dayIndex: number) =>
    `${ticketId}_day${dayIndex}`;

  const getSelectedQuantity = (key: string) =>
    selectedTickets.find((t) => t.key === key)?.quantity ?? 0;

  function showError(key: string) {
    setErrorKey(key);
    setTimeout(() => setErrorKey(null), 2000);
  }

  /* ===================== ADD / REMOVE ===================== */

  function addTicket(
    prev: ISelectedTickets[],
    payload: {
      key: string;
      ticketId: string;
      eventDayIndex: number;
      price: number;
      stock: ITicketStockInfo;
      name: string;
      description: string;
      image?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
    },
  ): ISelectedTickets[] {
    const existing = prev.find((t) => t.key === payload.key);
    const currentQty = existing?.quantity ?? 0;

    const hasLimits =
      payload.stock.remaining !== null || payload.stock.perUserLimit !== null;

    if (hasLimits) {
      if (payload.stock.remaining !== null && payload.stock.remaining <= 0) {
        showError(payload.key);
        return prev;
      }
      if (
        payload.stock.perUserLimit !== null &&
        currentQty >= payload.stock.perUserLimit
      ) {
        showError(payload.key);
        return prev;
      }
      if (
        payload.stock.remaining !== null &&
        currentQty + 1 > payload.stock.remaining
      ) {
        showError(payload.key);
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
        eventDayIndex: payload.eventDayIndex,
        quantity: 1,
        price: payload.price,
        name: payload.name,
        description: payload.description,
        image: payload.image,
        date: formatDateMonth(payload?.date || ("" as string)),
        startTime: payload.startTime,
        endTime: payload.endTime,
      },
    ];
  }

  function removeTicket(prev: ISelectedTickets[], key: string) {
    const existing = prev.find((t) => t.key === key);
    if (!existing) return prev;
    if (existing.quantity === 1) return prev.filter((t) => t.key !== key);
    return prev.map((t) =>
      t.key === key ? { ...t, quantity: t.quantity - 1 } : t,
    );
  }

  /* ===================== ADD TO CART ===================== */

  function handleTicketAddToCart() {
    selectedTickets.forEach((t) => {
      setCartItem({
        _id: t.ticketId,
        name: t.name,
        desc: t.description,
        image: t.image || "",
        price: t.price,
        quantity: t.quantity,
        itemType: itemTypeEnum.ticket,
        parentId: eventId,
        eventDate: t.date,
        startTime: t.startTime,
        endTime: t.endTime,
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
      <div className="p-10 max-sm:px-4 max-sm:py-6">
        <h1 className="font-bold text-2xl text-center">
          {events.eventTicketTitle}
        </h1>

        <div className="mt-6 pb-4 max-h-[60vh] overflow-y-auto space-y-3">
          {ticketIds?.map((ticket) => {
            const stock = ticket?.quantity;
            const hasLimits =
              stock?.remaining !== null || stock?.perUserLimit !== null;

            // Flatten each day into its own card, filtered to upcoming dates only
            const upcomingDays = ticket?.dayDescription
              ?.map((day, index) => ({ day, index }))
              .filter(({ day }) => isDateUpcoming(day?.date));

            if (!upcomingDays || upcomingDays.length === 0) return null;

            return upcomingDays?.map(({ day, index }) => {
              // Unique key combining ticketId + day index — guarantees isolation
              const key = getSelectionKey(ticket._id, index);
              const qty = getSelectedQuantity(key);
              const isSelected = qty > 0;

              return (
                <div key={key}>
                  <div
                    className={clsx(
                      "mt-2 grid grid-cols-12 items-center border rounded-md p-3 transition-colors",
                      errorKey === key
                        ? "bg-white border-red-500"
                        : isSelected
                          ? "bg-primary border-secondary"
                          : "hover:bg-gray-50",
                    )}
                  >
                    {/* LEFT */}
                    <div className="col-span-9 max-sm:col-span-12 max-sm:mb-4 flex gap-3">
                      <div className="h-20 w-20 shrink-0">
                        <Image
                          src={
                            ticket.images?.[0]?.image ||
                            staticImages.placeholder
                          }
                          alt={ticket.name}
                          width={80}
                          height={80}
                          unoptimized
                          className="rounded-md h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <h2 className="font-bold">{ticket.name}</h2>
                        <div
                          className="text-sm line-clamp-1 mt-0.5"
                          dangerouslySetInnerHTML={{
                            __html: ticket?.description || "",
                          }}
                        />

                        {hasLimits && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {stock?.remaining !== null && (
                              <>
                                {events.remaining}:{" "}
                                <strong>{stock.remaining}</strong>
                              </>
                            )}
                            {stock?.remaining !== null &&
                              stock?.perUserLimit !== null &&
                              " | "}
                            {stock?.perUserLimit !== null && (
                              <>
                                {events.maxPerUser}:{" "}
                                <strong>{stock.perUserLimit}</strong>
                              </>
                            )}
                          </p>
                        )}

                        {/* Date + time badge */}
                        {day?.date && day?.startTime && day?.endTime && (
                          <div className=" max-sm:text-sm text-gray-800 mt-1 font-normal flex items-center gap-3">
                            <div className="flex gap-1 items-center">
                              <BiCalendar />
                              <span className="mt-0.5">
                                {formatDateMonth(day?.date)}
                              </span>
                            </div>
                            <div className="flex gap-1 items-center">
                              <GoClock className="text-sm font-bold border rounded-full" />
                              <span className="mt-0.5">
                                {day?.startTime} – {day?.endTime}
                              </span>{" "}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QTY */}
                    <div className="col-span-2 max-sm:col-span-8 flex items-center gap-2">
                      <button
                        onClick={() =>
                          setSelectedTickets((prev) =>
                            addTicket(prev, {
                              key,
                              ticketId: ticket._id,
                              eventDayIndex: index,
                              price: ticket.price.sellingPrice,
                              stock,
                              name: ticket.name,
                              description: ticket.description,
                              image: ticket.images?.[0]?.image,
                              date: day.date,
                              startTime: day.startTime,
                              endTime: day.endTime,
                            }),
                          )
                        }
                        className="size-8 rounded-full border flex items-center justify-center cursor-pointer"
                      >
                        <FaPlus />
                      </button>

                      <span className="min-w-6 text-center">{qty}</span>

                      <button
                        disabled={qty === 0}
                        onClick={() =>
                          setSelectedTickets((prev) => removeTicket(prev, key))
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

                    {/* PRICE */}
                    <PriceTag
                      price={ticket.price.sellingPrice}
                      className="col-span-1 text-end"
                    />
                  </div>

                  {errorKey === key && (
                    <p className="text-red-500 mt-1">{events.exceedInfoText}</p>
                  )}
                </div>
              );
            });
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
