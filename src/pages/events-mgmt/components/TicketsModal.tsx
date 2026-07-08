import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Ticket, Trash2, Copy, PenBox, LayoutList } from "lucide-react";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useDeleteTicketMutation,
  useUpdateEventMutation,
} from "@/store/api/eventMutationApi";
import { TicketCardSkeleton } from "@/components/skeletons";
import { ConfirmDialog } from "@/components/shared";
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
}

const TicketsModal: React.FC<TicketsStepProps> = ({
  eventId,
  eventDays,
  setIsOpen,
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
  const isTicketDisabled = !eventDays?.length || !eventDays[0]?.date;

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

  // ─── Computed: derived values ─────────────────────────────────────────
  // const eventDaysForTickets = useMemo<EventDay[]>(() => {
  //   if (isMultiDay) return eventDays;
  //   return [
  //     {
  //       id: "1",
  //       date: startDate,
  //       startTime: eventDays[0]?.startTime ?? "09:00",
  //       endTime: eventDays[0]?.endTime ?? "17:00",
  //       description: "",
  //     },
  //   ];
  // }, [isMultiDay, eventDays, startDate]);

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
      onClose={() => setIsOpen(false)}
      height="h-max min-h-[60vh]"
      showSpinner={isFetching || isLoading}
    >
      <div className="p-8 space-y-4">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            {t("event_tickets")}
          </h2>

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
                    "px-5 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20",
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
                  className={clsx(
                    "bg-green-600 hover:bg-green-500 rounded-lg px-4 py-2 text-white",
                    isEventUpdating ? " cursor-not-allowed" : " cursor-pointer",
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
              <div className="space-y-4">
                {tickets.map((ticket: any) => (
                  <div
                    key={ticket._id}
                    className={clsx(
                      "p-6 rounded-xl border hover:shadow-md transition",
                      isDark
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-200 bg-gray-50",
                    )}
                  >
                    <div className="flex justify-between gap-6">
                      <div className="flex-1">
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
                            <span className="font-medium">{t("price")}:</span>{" "}
                            {formatPrice(ticket)}
                          </span>
                          <span>
                            <span className="font-medium">
                              {t("quantity")}:
                            </span>{" "}
                            {ticket.quantity?.initial ?? t("unlimited")}
                          </span>
                          <span>
                            <span className="font-medium">
                              {t("per_user_limit")}:
                            </span>{" "}
                            {ticket.quantity?.perUserLimit || t("no_limit")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
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
                                  imageUrl: ticket.images?.[0]?.image ?? "",
                                });
                                setTicketDateTime(ticket.dayDescription ?? []);
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
                                  imageUrl: ticket.images?.[0]?.image ?? "",
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
                                window.open(
                                  `${routes.eventSessionMgmt}?eventId=${eventId}&wrapperId=${ticket?.wrapperId}&ticketId=${ticket._id}`,
                                  "_blank",
                                );
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
