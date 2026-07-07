import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDate } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useDeleteTicketMutation } from "@/store/api/eventMutationApi";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import {
  Edit,
  Copy,
  Trash2,
  Ticket,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Tag,
  TrendingDown,
  Package,
  LayoutList,
  ExternalLink,
} from "lucide-react";
import TicketModal from "../../components/wizard/modals/TicketModal";
import TicketSummaryCard from "./TicketSummaryCard";
import { ActionIconButtons } from "@/components/btns";
import { useNavigate } from "react-router-dom";
import { routes } from "@/lib/routes";

interface EventTicketDetailsProps {
  eventId: string;
  refetch: () => void;
  tickets: ITicketPayload[];
  eventDays: EventDay[];
  hasExternalTicket: boolean;
  ticketBuyLink: string;
}
const safe = (n: any) => (Number.isFinite(n) ? n : 0);

const sum = (arr: any[], fn: (t: any) => number) =>
  arr?.reduce((s, x) => s + safe(fn(x)), 0) ?? 0;

const EventTicketDetails: React.FC<EventTicketDetailsProps> = ({
  tickets,
  eventId,
  refetch,
  eventDays,
  hasExternalTicket,
  ticketBuyLink,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("events");
  const { isDark, borderColor, language, textPrimary, textSecondary } =
    useThemeClasses();

  const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();

  const [opMode, setOpMode] = useState<TTicketOpMode>("CREATE");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [ticketDateTime, setTicketDateTime] = useState<ITicketDateTime[]>([]);
  const [editingTicket, setEditingTicket] = useState<ITicketPayload | null>(
    null,
  );

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket({ ticketId }).unwrap();
      refetch();
      toast.success(t("ticket_deleted_successfully"));
    } catch {
      toast.error(t("ticket_delete_failed"));
    }
  };

  const calculateTotalRevenue = (ticket: ITicketPayload) => {
    return ticket?.quantity?.sold * ticket.price.sellingPrice;
  };

  const calculateDiscountAmount = (ticket: ITicketPayload) => {
    return ticket.price.markedPrice - ticket.price.sellingPrice;
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      PAID: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-800/50"
        : "bg-blue-100 text-blue-700 border-blue-200",
      VIP: isDark
        ? "bg-purple-500/20 text-purple-400 border-purple-800/50"
        : "bg-purple-100 text-purple-700 border-purple-200",
      FREE: isDark
        ? "bg-green-500/20 text-green-400 border-green-800/50"
        : "bg-green-100 text-green-700 border-green-200",
      EARLY_BIRD: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-800/50"
        : "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return (
      typeColors[type] ||
      (isDark
        ? "bg-gray-700 text-gray-300 border-gray-600"
        : "bg-gray-100 text-gray-700 border-gray-200")
    );
  };

  if (hasExternalTicket) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center">
        <div className="">
          <div className={clsx(textSecondary, "font-bold text-2xl pb-2")}>
            {" "}
            {t("i_have_an_eternal_ticket_purchase_link")}
          </div>
          <a
            href={ticketBuyLink}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              textPrimary,
              "group inline-flex items-center gap-2 py-2.5",
            )}
            aria-label={`Buy tickets on external site: ${ticketBuyLink}`}
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            <span>{ticketBuyLink}</span>
            <ExternalLink
              className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center py-12 rounded-xl border",
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200",
        )}
      >
        <Ticket
          className={clsx(
            "w-12 h-12 mb-3",
            isDark ? "text-gray-600" : "text-gray-400",
          )}
        />
        <h3
          className={clsx(
            "text-base font-semibold mb-1",
            isDark ? "text-gray-300" : "text-gray-700",
          )}
        >
          No Tickets Available
        </h3>
        <p
          className={clsx(
            "text-sm",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          No tickets have been created for this event yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TicketSummaryCard
            isDark={isDark}
            icon={<Package />}
            iconColor={isDark ? "text-blue-400" : "text-blue-600"}
            label={t("total_available")}
            value={sum(tickets, (t) =>
              t?.quantity?.isUnlimited ? 0 : t?.quantity?.initial,
            )}
          />

          <TicketSummaryCard
            isDark={isDark}
            icon={<Tag />}
            iconColor={isDark ? "text-green-400" : "text-green-600"}
            label={t("sold")}
            value={sum(tickets, (t) => t?.quantity?.sold)}
          />

          <TicketSummaryCard
            isDark={isDark}
            icon={<Ticket />}
            iconColor={isDark ? "text-purple-400" : "text-purple-600"}
            label={t("remaining")}
            value={sum(tickets, (t) =>
              t?.quantity?.isUnlimited ? 0 : t?.quantity?.remaining,
            )}
          />

          <TicketSummaryCard
            isDark={isDark}
            icon={<DollarSign />}
            iconColor={isDark ? "text-yellow-400" : "text-yellow-600"}
            label={t("revenue")}
            value={
              "₪" +
              sum(tickets, (t) => calculateTotalRevenue(t)).toLocaleString()
            }
          />
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const image = ticket.images?.[0]?.image;
            const isFree =
              ticket.price?.sellingPrice === 0 ||
              ticket.type?.toLowerCase() === "free";
            const hasDiscount =
              ticket.price.markedPrice > ticket.price.sellingPrice;
            const soldPercentage = ticket?.quantity?.isUnlimited
              ? 0
              : (ticket?.quantity?.sold / ticket?.quantity?.initial || 0) * 100;

            return (
              <div
                key={ticket._id}
                className={clsx(
                  "rounded-xl border transition-all duration-200 overflow-hidden",
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300",
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image Section */}
                  <div className="relative lg:w-80 h-64 lg:h-auto overflow-hidden group">
                    <ImageWithFallback
                      src={image}
                      alt={ticket.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Free Badge */}
                    {isFree && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg">
                          FREE
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm capitalize",
                          ticket.status === "active"
                            ? "bg-green-500/90 text-white"
                            : "bg-gray-500/90 text-white",
                        )}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex gap-2 items-center">
                          <h3
                            className={clsx(
                              "text-xl font-bold mb-2",
                              isDark ? "text-white" : "text-gray-900",
                            )}
                          >
                            {ticket.name}
                          </h3>
                          {/* Type Badge */}
                          <span
                            className={clsx(
                              "px-2 rounded-lg text-sm font-semibold border whitespace-nowrap",
                              getTypeColor(ticket.type),
                            )}
                          >
                            {ticket.type}
                          </span>
                        </div>

                        <div
                          className={clsx(
                            "text-sm leading-relaxed line-clamp-2",
                            isDark ? "text-gray-400" : "text-gray-600",
                          )}
                          dangerouslySetInnerHTML={{
                            __html: ticket?.description || "",
                          }}
                        />
                      </div>

                      {/* Action Icons */}
                      <div
                        className={clsx(
                          " flex gap-2 rounded-lg p-1.5 backdrop-blur-sm",
                        )}
                      >
                        <ActionIconButtons
                          isDark={isDark}
                          actions={[
                            {
                              title: "Edit",
                              icon: Edit,
                              color: "blue",
                              onClick: () => {
                                setEditingTicket({
                                  ...ticket,
                                  imageUrl: ticket?.images?.[0]?.image || "",
                                });
                                setTicketDateTime(ticket?.dayDescription || []);
                                setOpMode("UPDATE");
                                setIsEditModalOpen(true);
                              },
                            },
                            {
                              title: "Copy",
                              icon: Copy,
                              color: "green",
                              onClick: () => {
                                setEditingTicket({
                                  ...ticket,
                                  name: `${ticket.name} (Copy)`,
                                  imageUrl: ticket?.images?.[0]?.image || "",
                                });
                                setOpMode("DUPLICATE");
                                setIsEditModalOpen(true);
                              },
                            },
                            {
                              title: "Delete",
                              icon: Trash2,
                              color: "red",
                              onClick: () => {
                                setIsConfirmOpen(true);
                                setTicketToDelete(ticket?._id || "");
                              },
                            },
                            {
                              title: "Create Landing Page",
                              icon: LayoutList,
                              color: "yellow",
                              onClick: () => {
                                navigate(
                                  `${routes.eventSessionMgmt}?eventId=${eventId}&ticketId=${ticket._id}`,
                                );
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Price Section */}

                    {/* Quantity Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div
                        className={clsx(
                          "rounded-lg p-4",
                          isDark ? "bg-gray-900/50" : "bg-gray-50",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <DollarSign
                              className={clsx(
                                "w-5 h-5",
                                isDark ? "text-gray-400" : "text-gray-500",
                              )}
                            />
                            <div>
                              <p
                                className={clsx(
                                  "text-xs font-medium uppercase tracking-wide mb-1",
                                  isDark ? "text-gray-400" : "text-gray-600",
                                )}
                              >
                                {t("price")}
                              </p>
                              <div className="flex items-center gap-2">
                                {hasDiscount && !isFree && (
                                  <span
                                    className={clsx(
                                      "line-through text-sm",
                                      isDark
                                        ? "text-gray-500"
                                        : "text-gray-400",
                                    )}
                                  >
                                    ₪{ticket.price.markedPrice}
                                  </span>
                                )}
                                <span
                                  className={clsx(
                                    "font-bold text-2xl",
                                    isFree
                                      ? "text-green-500"
                                      : isDark
                                        ? "text-white"
                                        : "text-gray-900",
                                  )}
                                >
                                  {isFree
                                    ? "FREE"
                                    : `₪${ticket.price.sellingPrice}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Discount Badge */}
                          {hasDiscount && !isFree && (
                            <div
                              className={clsx(
                                "px-3 py-1.5 rounded-lg flex items-center gap-1.5",
                                isDark
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-red-100 text-red-700",
                              )}
                            >
                              <TrendingDown className="w-4 h-4" />
                              <span className="text-sm font-semibold">
                                ₪{calculateDiscountAmount(ticket)} off
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Initial */}
                      <div
                        className={clsx(
                          "rounded-lg p-3",
                          isDark ? "bg-gray-900/50" : "bg-gray-50",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Package
                            className={clsx(
                              "w-4 h-4",
                              isDark ? "text-gray-400" : "text-gray-500",
                            )}
                          />
                          <span
                            className={clsx(
                              "text-xs font-medium uppercase tracking-wide",
                              isDark ? "text-gray-400" : "text-gray-600",
                            )}
                          >
                            {t("total")}
                          </span>
                        </div>
                        <p
                          className={clsx(
                            "text-lg font-bold",
                            isDark ? "text-white" : "text-gray-900",
                          )}
                        >
                          {ticket?.quantity?.isUnlimited
                            ? "∞"
                            : ticket?.quantity?.initial}
                        </p>
                      </div>

                      {/* Sold */}
                      <div
                        className={clsx(
                          "rounded-lg p-3",
                          isDark ? "bg-gray-900/50" : "bg-gray-50",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Tag
                            className={clsx(
                              "w-4 h-4",
                              isDark ? "text-gray-400" : "text-gray-500",
                            )}
                          />
                          <span
                            className={clsx(
                              "text-xs font-medium uppercase tracking-wide",
                              isDark ? "text-gray-400" : "text-gray-600",
                            )}
                          >
                            {t("sold")}
                          </span>
                        </div>
                        <p
                          className={clsx(
                            "text-lg font-bold",
                            isDark ? "text-white" : "text-gray-900",
                          )}
                        >
                          {ticket?.quantity?.sold}
                        </p>
                      </div>

                      {/* Remaining */}
                      <div
                        className={clsx(
                          "rounded-lg p-3",
                          isDark ? "bg-gray-900/50" : "bg-gray-50",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Ticket
                            className={clsx(
                              "w-4 h-4",
                              isDark ? "text-gray-400" : "text-gray-500",
                            )}
                          />
                          <span
                            className={clsx(
                              "text-xs font-medium uppercase tracking-wide",
                              isDark ? "text-gray-400" : "text-gray-600",
                            )}
                          >
                            {t("remaining")}
                          </span>
                        </div>
                        <p
                          className={clsx(
                            "text-lg font-bold",
                            isDark ? "text-white" : "text-gray-900",
                          )}
                        >
                          {ticket?.quantity?.isUnlimited
                            ? "∞"
                            : ticket?.quantity?.remaining}
                        </p>
                      </div>
                    </div>

                    {/* Sales Progress */}
                    {!ticket?.quantity?.isUnlimited && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={clsx(
                              "text-xs font-medium",
                              isDark ? "text-gray-400" : "text-gray-600",
                            )}
                          >
                            {t("sales_progress")}
                          </span>
                          <span
                            className={clsx(
                              "text-xs font-semibold",
                              isDark ? "text-gray-300" : "text-gray-700",
                            )}
                          >
                            {soldPercentage?.toFixed(1)}%
                          </span>
                        </div>
                        <div
                          className={clsx(
                            "h-2 rounded-full overflow-hidden",
                            isDark ? "bg-gray-700" : "bg-gray-200",
                          )}
                        >
                          <div
                            className={clsx(
                              "h-full rounded-full transition-all duration-300",
                              soldPercentage > 80
                                ? "bg-red-500"
                                : soldPercentage > 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500",
                            )}
                            style={{ width: `${soldPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      {/* Per User Limit */}
                      <div className="flex items-center gap-1.5">
                        <Users
                          className={clsx(
                            "w-4 h-4",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        />
                        <span
                          className={clsx(
                            isDark ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          Max {ticket?.quantity?.perUserLimit} per user
                        </span>
                      </div>

                      {/* Revenue */}
                      {ticket?.quantity?.sold > 0 && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign
                            className={clsx(
                              "w-4 h-4",
                              isDark ? "text-gray-400" : "text-gray-500",
                            )}
                          />
                          <span
                            className={clsx(
                              isDark ? "text-gray-400" : "text-gray-600",
                            )}
                          >
                            Revenue: ₪
                            {calculateTotalRevenue(ticket).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Dates */}
                    {ticket?.dayDescription?.length > 0 && (
                      <div
                        className={clsx(
                          "rounded-lg p-4 border-t",
                          isDark
                            ? "border-gray-700 bg-gray-900/30"
                            : "border-gray-200 bg-gray-50/50",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar
                            className={clsx(
                              "w-4 h-4",
                              isDark ? "text-gray-400" : "text-gray-500",
                            )}
                          />
                          <h4
                            className={clsx(
                              "text-xs font-semibold uppercase tracking-wide",
                              isDark ? "text-gray-400" : "text-gray-600",
                            )}
                          >
                            Valid for {ticket?.dayDescription?.length}{" "}
                            {ticket?.dayDescription?.length === 1
                              ? "date"
                              : "dates"}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {ticket?.dayDescription?.map((day, index) => (
                            <div
                              key={index}
                              className={clsx(
                                "flex items-center gap-2 text-sm border rounded-md px-2 py-1",
                                borderColor,
                              )}
                            >
                              <Clock
                                className={clsx(
                                  "w-3.5 h-3.5",
                                  isDark ? "text-gray-500" : "text-gray-400",
                                )}
                              />
                              <span
                                className={clsx(
                                  "font-medium",
                                  isDark ? "text-gray-300" : "text-gray-700",
                                )}
                              >
                                {formatDate(day.date, language)}
                              </span>
                              <span
                                className={clsx(
                                  isDark ? "text-gray-500" : "text-gray-400",
                                )}
                              >
                                •
                              </span>
                              <span
                                className={clsx(
                                  isDark ? "text-gray-400" : "text-gray-600",
                                )}
                              >
                                {day.startTime} – {day.endTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Wizard */}
      {isEditModalOpen && editingTicket && (
        <TicketModal
          eventId={eventId}
          refetch={refetch}
          opMode={opMode}
          eventDays={eventDays}
          setIsOpen={setIsEditModalOpen}
          editData={editingTicket!}
          setEditData={setEditingTicket}
          ticketDateTime={ticketDateTime}
          setTicketDateTime={setTicketDateTime}
        />
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title={"delete_ticket"}
        message="delete_ticket_confirm"
        confirmText="delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setTicketToDelete(null);
        }}
        onConfirm={async () => {
          if (!ticketToDelete) return;
          await handleDeleteTicket(ticketToDelete);
          setIsConfirmOpen(false);
          setTicketToDelete(null);
        }}
      />
    </>
  );
};

export default EventTicketDetails;
