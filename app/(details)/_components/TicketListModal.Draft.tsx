"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useState } from "react";

import { Dialog } from "@/components/ui";
import { itemTypeEnum } from "@/lib/utils";
import PriceTag from "@/components/PriceTag";
import useCartStore from "@/stores/cartStore";
import { staticImages } from "@/constant/staticImages";
import { buttonLabels, events } from "@/constant/hebrew";

interface TicketListModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  ticketIds: ITicketIds[];
  eventId: string;
}

interface ISelectedTickets {
  ticketId: string;
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

  const [selectedTickets, setSelectedTickets] = useState<ISelectedTickets[]>(
    [],
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);

  /* ===================== HELPERS ===================== */

  const getSelectedQuantity = (ticketId: string) =>
    selectedTickets.find((t) => t.ticketId === ticketId)?.quantity ?? 0;

  function addTicket(
    prev: ISelectedTickets[],
    payload: {
      ticketId: string;
      price: number;
      stock: ITicketStockInfo;
    },
  ): ISelectedTickets[] {
    const existing = prev.find((t) => t.ticketId === payload.ticketId);
    const currentQty = existing?.quantity ?? 0;

    const hasLimits =
      payload.stock.remaining !== null || payload.stock.perUserLimit !== null;

    if (hasLimits) {
      if (payload.stock.remaining !== null && payload.stock.remaining <= 0) {
        setErrorKey(payload.ticketId);
        setTimeout(() => setErrorKey(null), 2000);
        return prev;
      }

      if (
        payload.stock.perUserLimit !== null &&
        currentQty >= payload.stock.perUserLimit
      ) {
        setErrorKey(payload.ticketId);
        setTimeout(() => setErrorKey(null), 2000);
        return prev;
      }

      if (
        payload.stock.remaining !== null &&
        currentQty + 1 > payload.stock.remaining
      ) {
        setErrorKey(payload.ticketId);
        setTimeout(() => setErrorKey(null), 2000);
        return prev;
      }
    }

    if (existing) {
      return prev.map((t) =>
        t.ticketId === payload.ticketId
          ? { ...t, quantity: t.quantity + 1 }
          : t,
      );
    }

    return [
      ...prev,
      {
        ticketId: payload.ticketId,
        quantity: 1,
        price: payload.price,
      },
    ];
  }

  function removeTicket(prev: ISelectedTickets[], ticketId: string) {
    const existing = prev.find((t) => t.ticketId === ticketId);
    if (!existing) return prev;

    if (existing.quantity === 1) {
      return prev.filter((t) => t.ticketId !== ticketId);
    }

    return prev.map((t) =>
      t.ticketId === ticketId ? { ...t, quantity: t.quantity - 1 } : t,
    );
  }

  /* ===================== ADD TO CART ===================== */

  function handleTicketAddToCart() {
    selectedTickets.forEach((selected) => {
      const ticket = ticketIds.find((t) => t._id === selected.ticketId);
      if (!ticket) return;

      // Use the first dayDescription entry as the primary date/time
      const primaryDay = ticket.dayDescription?.[0];

      setCartItem({
        _id: ticket._id,
        name: ticket.name,
        desc: ticket.description,
        image: ticket.images?.[0]?.image,
        price: ticket.price.sellingPrice,
        quantity: selected.quantity,
        itemType: itemTypeEnum.ticket,
        parentId: eventId,
        eventDate: primaryDay?.date,
        startTime: primaryDay?.startTime,
        endTime: primaryDay?.endTime,
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

        <div className="mt-6 pb-4 max-h-[60vh] overflow-y-auto space-y-3">
          {ticketIds.map((ticket) => {
            const qty = getSelectedQuantity(ticket._id);
            const isSelected = qty > 0;
            const hasLimits =
              ticket.quantity.remaining !== null ||
              ticket.quantity.perUserLimit !== null;

            // Format all day descriptions for display
            const dayLines = ticket.dayDescription?.map((d) => {
              const date = new Date(d.date).toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              return `${date} | ${d.startTime} - ${d.endTime}`;
            });

            return (
              <div key={ticket._id}>
                <div
                  className={clsx(
                    "grid grid-cols-12 items-center border rounded-md p-3 transition-colors",
                    errorKey === ticket._id
                      ? "border-red-500"
                      : isSelected
                        ? "bg-primary border-secondary"
                        : "hover:bg-gray-50",
                  )}
                >
                  {/* Left: image + info */}
                  <div className="col-span-7 max-sm:col-span-12 max-sm:mb-4 flex gap-3">
                    <div className="h-16 w-20 shrink-0">
                      <Image
                        src={
                          ticket.images?.[0]?.image || staticImages.placeholder
                        }
                        alt={ticket.name}
                        width={80}
                        height={64}
                        unoptimized
                        className="rounded-md h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold leading-tight">{ticket.name}</h2>
                      <div
                        className="text-sm line-clamp-1 text-gray-600"
                        dangerouslySetInnerHTML={{ __html: ticket.description }}
                      />

                      {/* Day/time lines */}
                      {dayLines?.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayLines.map((line, i) => (
                            <p key={i} className="text-xs text-gray-500">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Stock info */}
                      {hasLimits && (
                        <p className="text-xs text-gray-400 mt-1">
                          {ticket.quantity.remaining !== null && (
                            <>
                              {events.remaining}:{" "}
                              <strong>{ticket.quantity.remaining}</strong>
                            </>
                          )}
                          {ticket.quantity.remaining !== null &&
                            ticket.quantity.perUserLimit !== null &&
                            " | "}
                          {ticket.quantity.perUserLimit !== null && (
                            <>
                              {events.maxPerUser}:{" "}
                              <strong>{ticket.quantity.perUserLimit}</strong>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: quantity controls */}
                  <div className="col-span-3 max-sm:col-span-8 flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedTickets((prev) =>
                          addTicket(prev, {
                            ticketId: ticket._id,
                            price: ticket.price.sellingPrice,
                            stock: ticket.quantity,
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
                        setSelectedTickets((prev) =>
                          removeTicket(prev, ticket._id),
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

                  {/* Right: price */}
                  <PriceTag
                    price={ticket.price.sellingPrice}
                    className="col-span-2 max-sm:col-span-4 text-end"
                  />
                </div>

                {/* Error message */}
                {errorKey === ticket._id && (
                  <p className="text-red-500 text-sm mt-1">
                    {events.exceedInfoText}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
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
