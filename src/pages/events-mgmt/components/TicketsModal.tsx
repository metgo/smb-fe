import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Ticket,
  Trash2,
  Copy,
  PenBox,
  LayoutList,
  GripVertical,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useDeleteTicketMutation,
  useUpdateEventMutation,
  useUpdateTicketReorderMutation,
} from "@/store/api/eventMutationApi";
import { TicketCardSkeleton } from "@/components/skeletons";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { ModalWrapper, TooltipWrapper } from "@/components/wrapper";
import { ActionIconButtons } from "@/components/btns";
import { useGetAllTicketQuery } from "@/store/api/eventQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";
import CreateTicketWizard from "./CreateTicketWizard";
import { TICKET_TYPE_STYLES } from "@/lib/utils";

interface TicketsStepProps {
  eventId: string;
  eventDays: IEventDayDescription[];
  externalTicketLink: string;
  isTicketLinkExist: boolean;
  setIsOpen: (v: boolean) => void;
  eventsRefetch: () => void;
}

const TicketsModal: React.FC<TicketsStepProps> = ({
  eventId,
  eventDays,
  setIsOpen,
  eventsRefetch,
  isTicketLinkExist,
  externalTicketLink,
}) => {
  const { t } = useTranslation("events");
  const {
    textPrimary,
    textTertiary,
    isDark,
    borderColor,
    bgSecondary,
    textSecondary,
  } = useThemeClasses();

  const {
    data: tickets,
    refetch,
    isFetching,
    isLoading,
  } = useGetAllTicketQuery(eventId ? { eventId } : skipToken);
  const [updateEvent, { isLoading: isEventUpdating }] =
    useUpdateEventMutation();

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketBuyLink, setTicketBuyLink] = useState<null | string>(null);
  const [hasExternalTicket, setHasExternalTicket] = useState<boolean>(false);

  const [opMode, setOpMode] = useState<TTicketOpMode>("CREATE");
  const [editingTicket, setEditingTicket] = useState<ITicketPayload | null>(
    null,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [ticketDateTime, setTicketDateTime] = useState<ITicketDateTime[]>([
    {
      _id: 1,
      date: eventDays?.[0]?.date ?? "",
      startTime: eventDays?.[0]?.startTime ?? "09:00",
      endTime: eventDays?.[0]?.endTime ?? "17:00",
    },
  ]);

  const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();
  const [updateTicketReorder, { isLoading: isReordering }] =
    useUpdateTicketReorderMutation();
  const isTicketDisabled = !eventDays?.length || !eventDays[0]?.date;

  // ── Local ordered tickets ────────────────────────────────────────────────
  const [orderedTickets, setOrderedTickets] = useState<any[]>([]);

  useEffect(() => {
    if (tickets) setOrderedTickets(tickets);
  }, [tickets]);

  // True when the user has dragged tickets into a different order than the server
  const isOrderChanged =
    !!tickets &&
    orderedTickets.length === tickets.length &&
    orderedTickets.some((t: any, i: number) => t._id !== tickets[i]._id);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const reordered = Array.from(orderedTickets);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setOrderedTickets(reordered);
  };

  const handleSaveOrder = async () => {
    try {
      await updateTicketReorder({
        body: {
          eventId,
          ticketIds: orderedTickets.map((t: any) => t._id),
        },
      }).unwrap();
      toast.success(t("order_saved_successfully"));
      refetch();
    } catch {
      setOrderedTickets(tickets ?? []);
      toast.error(t("reorder_failed"));
    }
  };

  const formatPrice = (ticket: any) => {
    if (ticket?.type === "free") return t("free");
    if (ticket?.type === "donation") return t("donation");
    return `₪${ticket?.sellingPrice ?? ticket?.price?.sellingPrice ?? 0}`;
  };

  const openCreateModal = async () => {
    setEditingTicket({
      _id: "",
      name: "",
      description: "",
      greeting: "",
      eventId,
      type: "free",
      dayDescription: [{ date: "", startTime: "", endTime: "" }],
      price: {
        markedPrice: 0,
        sellingPrice: 0,
        discountAmount: 0,
        discountPercent: 0,
      },
      quantity: {
        initial: 1,
        sold: 0,
        remaining: 0,
        isUnlimited: false,
        perUserLimit: 5,
      },
      status: "active",
    });
    setTicketDateTime([
      {
        _id: 1,
        date: eventDays?.[0]?.date ?? "",
        startTime: eventDays?.[0]?.startTime ?? "09:00",
        endTime: eventDays?.[0]?.endTime ?? "17:00",
      },
    ]);
    setOpMode("CREATE");
    setShowTicketModal(true);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket({ ticketId }).unwrap();
      refetch();
      toast.success(t("ticket_deleted_successfully"));
    } catch {
      toast.error(t("ticket_delete_failed"));
    } finally {
      setIsConfirmOpen(false);
      setTicketToDelete(null);
    }
  };

  const hasTickets = tickets?.length > 0;

  useEffect(() => {
    setHasExternalTicket(isTicketLinkExist);
    setTicketBuyLink(externalTicketLink);
  }, [isTicketLinkExist, externalTicketLink]);

  async function updateTicketPurchaseLink() {
    await updateEvent({
      eventId,
      body: {
        ticketBuyLink,
        hasExternalTicket,
      },
    }).unwrap();
  }

  return (
    <ModalWrapper
      onClose={() => {
        eventsRefetch();
        setIsOpen(false);
      }}
      height="md:min-h-[60vh]"
      maxWidth="max-w-3xl"
      showSpinner={isFetching || isLoading}
    >
      <div className="p-8 space-y-4">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            {t("event_tickets")}
          </h2>

          <div className="flex items-center gap-3">
            {isOrderChanged && (
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={isReordering}
                className={clsx(
                  "px-5 py-3 rounded-xl font-medium flex items-center gap-2 border-2 bg-transparent transition-all",
                  isReordering
                    ? "border-blue-300 text-blue-300 cursor-not-allowed"
                    : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer",
                )}
              >
                {isReordering ? `${t("saving")}...` : t("save_order")}
              </button>
            )}

            {!hasExternalTicket && (
              <TooltipWrapper
                infoText={`🗓 ${t("select_event_day_first")}`}
                showToolTip={isTicketDisabled}
              >
                <span className="inline-block">
                  <button
                    type="button"
                    disabled={isTicketDisabled}
                    onClick={openCreateModal}
                    className={clsx(
                      "px-5 py-3 rounded-xl cursor-pointer font-medium flex items-center gap-2 shadow-lg transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20",
                      isTicketDisabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <Plus className="w-5 h-5" />
                    {t("create_ticket")}
                  </button>
                </span>
              </TooltipWrapper>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <input
              id="hasExternalTicket"
              type="checkbox"
              checked={hasExternalTicket}
              onChange={(e) => setHasExternalTicket(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 bg-amber-50 text-teal-600 focus:ring-2 focus:ring-teal-500"
            />

            <label
              htmlFor="hasExternalTicket"
              className={clsx(
                textPrimary,
                "cursor-pointer select-none text-sm font-medium",
              )}
            >
              {/* I have an external ticket purchase link. */}
              {t("i_have_an_eternal_ticket_purchase_link")}
            </label>
          </div>
          {hasExternalTicket && (
            <div className="mt-4">
              <label
                className={`block text-sm font-medium ${textSecondary} mb-2`}
              >
                {t("enter_your_ticket_purchase_link")}
              </label>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={ticketBuyLink || ""}
                  onChange={(e) => setTicketBuyLink(e.target.value)}
                  placeholder={"https://ticket-purchase.co.il"}
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
                />
                <button
                  type="button"
                  onClick={updateTicketPurchaseLink}
                  disabled={isEventUpdating || ticketBuyLink === ""}
                  className={clsx(
                    "rounded-lg px-4 py-2 text-white",
                    isEventUpdating || ticketBuyLink === ""
                      ? "cursor-not-allowed bg-green-300"
                      : "cursor-pointer bg-green-600 hover:bg-green-500",
                  )}
                >
                  {t("submit")}
                </button>
              </div>
            </div>
          )}
        </div>

        {!hasExternalTicket && (
          <>
            {/* ── Loading skeleton (while deleting) ────────────────────────── */}
            {isDeleting && (
              <div className="space-y-4">
                {Array.from({ length: Math.min(tickets?.length || 1, 3) }).map(
                  (_, i) => (
                    <TicketCardSkeleton isDark={isDark} key={i} />
                  ),
                )}
              </div>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {!hasTickets && !isDeleting && (
              <div
                className={clsx(
                  "p-16 rounded-2xl border-2 border-dashed text-center",
                  isDark
                    ? "border-gray-700 bg-gray-800/30"
                    : "border-gray-300 bg-gray-50",
                )}
              >
                <Ticket
                  className={`w-20 h-20 mx-auto mb-5 opacity-40 ${textTertiary}`}
                />
                <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>
                  {t("no_tickets_yet")}
                </h3>
                <p className={`mb-8 ${textTertiary}`}>
                  {t("no_tickets_yet_desc")}
                </p>
                <TooltipWrapper
                  infoText={`🗓 ${t("select_event_day_first")}`}
                  showToolTip={isTicketDisabled}
                >
                  <button
                    onClick={openCreateModal}
                    disabled={isTicketDisabled}
                    className={clsx(
                      "px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-lg shadow-lg",
                      isTicketDisabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {t("create_first_ticket")}
                  </button>
                </TooltipWrapper>
              </div>
            )}

            {/* ── Ticket list ───────────────────────────────────────────────── */}
            {hasTickets && !isDeleting && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tickets-list">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-4 max-h-[70vh] overflow-y-auto mb-10 md:mb-8"
                    >
                      {orderedTickets.map((ticket: any, index: number) => (
                        <Draggable
                          key={ticket._id}
                          draggableId={ticket._id}
                          index={index}
                        >
                          {(provided, snapshot) => {
                            const cardContent = (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={clsx(
                                "rounded-xl border transition-shadow duration-200 ease-out cursor-grab active:cursor-grabbing",
                                snapshot.isDragging
                                  ? "shadow-lg ring-2 ring-teal-500/40"
                                  : "hover:shadow-md",
                                isDark
                                  ? "border-gray-700 bg-gray-800/50"
                                  : "border-gray-200 bg-gray-50",
                              )}
                            >
                              {/* Inner wrapper handles the "lift" scale on drag; the
                                  outer div's transform is driven by the library's own
                                  inline style for position and must stay untouched. */}
                              <div
                                className={clsx(
                                  "p-3 rounded-xl transition-transform duration-200 ease-out",
                                  snapshot.isDragging && "scale-[1.02]",
                                )}
                              >
                                {/* Desktop Layout - hidden on mobile */}
                                <div className="hidden md:flex justify-between items-center gap-6">
                                  {/* Drag handle (visual only — the whole card is the drag target) */}
                                  <div
                                    className={clsx(
                                      "flex-shrink-0 p-1 rounded",
                                      isDark
                                        ? "text-gray-500"
                                        : "text-gray-400",
                                    )}
                                    title="Drag to reorder"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>

                                  <div className="flex-1 flex items-center gap-2 md:gap-4">
                                    <div>
                                      <ImageWithFallback
                                        src={ticket?.images?.[0]?.image}
                                        className="w-20 h-20 rounded object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-3 mb-3">
                                        <h4
                                          className={`text-xl font-semibold ${textPrimary}`}
                                        >
                                          {ticket.name}
                                        </h4>
                                        <span
                                          className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-semibold uppercase",
                                            TICKET_TYPE_STYLES[ticket.type] ??
                                              TICKET_TYPE_STYLES.paid,
                                          )}
                                        >
                                          {t(ticket.type)}
                                        </span>
                                      </div>
                                      <div
                                        className={`grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm ${textTertiary}`}
                                      >
                                        <span>
                                          <span className="font-medium">
                                            {t("price")}:
                                          </span>{" "}
                                          {formatPrice(ticket)}
                                        </span>
                                        <span>
                                          <span className="font-medium">
                                            {t("quantity")}:
                                          </span>{" "}
                                          {ticket.quantity?.initial ??
                                            t("unlimited")}
                                        </span>
                                        <span>
                                          <span className="font-medium">
                                            {t("per_user_limit")}:
                                          </span>{" "}
                                          {ticket.quantity?.perUserLimit ||
                                            t("no_limit")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <ActionIconButtons
                                      isDark={isDark}
                                      actions={[
                                        {
                                          title: t("edit_ticket"),
                                          icon: PenBox,
                                          color: "gray",
                                          onClick: () => {
                                            setEditingTicket({
                                              ...ticket,
                                              imageUrl:
                                                ticket.images?.[0]?.image ?? "",
                                            });
                                            setTicketDateTime(
                                              ticket.dayDescription ?? [],
                                            );
                                            setOpMode("UPDATE");
                                            setShowTicketModal(true);
                                          },
                                        },
                                        {
                                          title: t("duplicate_ticket"),
                                          icon: Copy,
                                          color: "blue",
                                          onClick: () => {
                                            setEditingTicket({
                                              ...ticket,
                                              name: `${ticket.name} (${t("copy")})`,
                                              imageUrl:
                                                ticket.images?.[0]?.image ?? "",
                                            });
                                            setOpMode("DUPLICATE");
                                            setShowTicketModal(true);
                                          },
                                        },
                                        {
                                          title: t("delete_ticket"),
                                          icon: Trash2,
                                          color: "red",
                                          onClick: () => {
                                            setTicketToDelete(ticket._id);
                                            setIsConfirmOpen(true);
                                          },
                                        },
                                        {
                                          title: "Create Landing Page",
                                          icon: LayoutList,
                                          color: "yellow",
                                          onClick: () => {
                                            if (ticket?.wrapperId)
                                              window.open(
                                                `${routes.eventSessionMgmt}?eventId=${eventId}&wrapperId=${ticket?.wrapperId}&ticketId=${ticket._id}`,
                                                "_blank",
                                              );
                                            else
                                              window.open(
                                                `${routes.eventSessionMgmt}?eventId=${eventId}&ticketId=${ticket._id}`,
                                                "_blank",
                                              );
                                          },
                                        },
                                      ]}
                                    />
                                  </div>
                                </div>

                                {/* Mobile Layout - shown only on mobile */}
                                <div className="md:hidden">
                                  {/* Header with drag handle, image and title */}
                                  <div className="flex items-start gap-3 mb-3">
                                    {/* Drag handle (visual only — the whole card is the drag target) */}
                                    <div
                                      className={clsx(
                                        "flex-shrink-0 mt-1 p-1 rounded",
                                        isDark
                                          ? "text-gray-500"
                                          : "text-gray-400",
                                      )}
                                      title="Drag to reorder"
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>

                                    <ImageWithFallback
                                      src={ticket?.images?.[0]?.image}
                                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4
                                          className={`text-base font-semibold ${textPrimary} truncate`}
                                        >
                                          {ticket.name}
                                        </h4>
                                        <span
                                          className={clsx(
                                            "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase whitespace-nowrap",
                                            TICKET_TYPE_STYLES[ticket.type] ??
                                              TICKET_TYPE_STYLES.paid,
                                          )}
                                        >
                                          {t(ticket.type)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Ticket details in a grid */}
                                  <div
                                    className={`grid grid-cols-2 gap-2 mb-3 text-sm ${textTertiary}`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">
                                        {t("price")}:
                                      </span>
                                      <span className="font-semibold">
                                        {formatPrice(ticket)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">
                                        {t("quantity")}:
                                      </span>
                                      <span>
                                        {ticket.quantity?.initial ??
                                          t("unlimited")}
                                      </span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-1">
                                      <span className="font-medium">
                                        {t("per_user_limit")}:
                                      </span>
                                      <span>
                                        {ticket.quantity?.perUserLimit ||
                                          t("no_limit")}
                                      </span>
                                    </div>
                                  </div>

                                  <ActionIconButtons
                                    isDark={isDark}
                                    actions={[
                                      {
                                        title: t("edit_ticket"),
                                        icon: PenBox,
                                        color: "gray",
                                        onClick: () => {
                                          setEditingTicket({
                                            ...ticket,
                                            imageUrl:
                                              ticket.images?.[0]?.image ?? "",
                                          });
                                          setTicketDateTime(
                                            ticket.dayDescription ?? [],
                                          );
                                          setOpMode("UPDATE");
                                          setShowTicketModal(true);
                                        },
                                      },
                                      {
                                        title: t("duplicate_ticket"),
                                        icon: Copy,
                                        color: "blue",
                                        onClick: () => {
                                          setEditingTicket({
                                            ...ticket,
                                            name: `${ticket.name} (${t("copy")})`,
                                            imageUrl:
                                              ticket.images?.[0]?.image ?? "",
                                          });
                                          setOpMode("DUPLICATE");
                                          setShowTicketModal(true);
                                        },
                                      },
                                      {
                                        title: t("delete_ticket"),
                                        icon: Trash2,
                                        color: "red",
                                        onClick: () => {
                                          setTicketToDelete(ticket._id);
                                          setIsConfirmOpen(true);
                                        },
                                      },
                                      {
                                        title: "Create Landing Page",
                                        icon: LayoutList,
                                        color: "yellow",
                                        onClick: () => {
                                          if (ticket?.wrapperId)
                                            window.open(
                                              `${routes.eventSessionMgmt}?eventId=${eventId}&wrapperId=${ticket?.wrapperId}&ticketId=${ticket._id}`,
                                              "_blank",
                                            );
                                          else
                                            window.open(
                                              `${routes.eventSessionMgmt}?eventId=${eventId}&ticketId=${ticket._id}`,
                                              "_blank",
                                            );
                                        },
                                      },
                                    ]}
                                  />
                                </div>
                              </div>
                            </div>
                            );
                            return snapshot.isDragging
                              ? createPortal(cardContent, document.body)
                              : cardContent;
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* ── Ticket wizard modal ───────────────────────────────────────── */}
            {showTicketModal && editingTicket && (
              <CreateTicketWizard
                eventId={eventId}
                refetch={refetch}
                opMode={opMode}
                eventDays={eventDays}
                setIsOpen={setShowTicketModal}
                editData={editingTicket}
                setEditData={setEditingTicket}
                ticketDateTime={ticketDateTime}
                setTicketDateTime={setTicketDateTime}
                hasExternalTicket={isTicketLinkExist}
              />
            )}

            {/* ── Delete confirmation ───────────────────────────────────────── */}
            <ConfirmDialog
              open={isConfirmOpen}
              title={t("delete_ticket")}
              message={t("delete_ticket_confirm")}
              confirmText={t("delete")}
              loading={isDeleting}
              variant="danger"
              onCancel={() => {
                setIsConfirmOpen(false);
                setTicketToDelete(null);
              }}
              onConfirm={async () => {
                if (ticketToDelete) await handleDeleteTicket(ticketToDelete);
              }}
            />
          </>
        )}
      </div>
    </ModalWrapper>
  );
};

export default TicketsModal;
