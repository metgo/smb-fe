import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";

import { formatDate } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useDeleteTicketMutation } from "@/store/api/eventMutationApi";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import {
  Edit,
  Copy,
  Trash2,
  Ticket,
  Calendar,
  DollarSign,
  Users,
  Tag,
  TrendingDown,
  Package,
  LayoutList,
  ExternalLink,
  Plus,
  Link as LinkIcon,
} from "lucide-react";
import TicketSummaryCard from "./TicketSummaryCard";
import { ActionIconButtons } from "@/components/btns";
import { routes } from "@/lib/routes";
import CreateTicketWizard from "../../components/CreateTicketWizard";

interface EventTicketDetailsProps {
  eventId: string;
  refetch: () => void;
  tickets: ITicketPayload[];
  eventDays: IEventDay[];
  hasExternalTicket: boolean;
  ticketBuyLink: string;
  eventSlug?: string;
  associatedWebsites?: {
    _id: string;
    name: string | null;
    url: string;
    logo: string;
  }[];
  associatedWebsiteIds?: string[];
}
const safe = (n: any) => (Number.isFinite(n) ? n : 0);

const sum = (arr: any[], fn: (t: any) => number) =>
  arr?.reduce((s, x) => s + safe(fn(x)), 0) ?? 0;

// Blank template used when opening the wizard in CREATE mode
const emptyTicketTemplate: any = {
  name: "",
  description: "",
  type: "PAID",
  status: "active",
  price: {
    markedPrice: 0,
    sellingPrice: 0,
  },
  quantity: {
    initial: 0,
    sold: 0,
    remaining: 0,
    isUnlimited: false,
    perUserLimit: 1,
  },
  dayDescription: [],
  images: [],
  imageUrl: "",
};

const EventTicketDetails: React.FC<EventTicketDetailsProps> = ({
  tickets,
  eventId,
  refetch,
  eventDays,
  hasExternalTicket,
  ticketBuyLink,
  eventSlug,
  associatedWebsites,
  associatedWebsiteIds,
}) => {
  // Filter associated websites to only include selected ones
  const selectedWebsites =
    associatedWebsites?.filter((website) =>
      associatedWebsiteIds?.includes(website._id),
    ) || [];

  const [isHiddenLinksModalOpen, setIsHiddenLinksModalOpen] = useState(false);
  const [selectedWebsiteForQR, setSelectedWebsiteForQR] = useState<any | null>(
    null,
  );
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

  const handleCreateTicket = () => {
    setEditingTicket({ ...emptyTicketTemplate });
    setTicketDateTime([]);
    setOpMode("CREATE");
    setIsEditModalOpen(true);
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
      <>
        <div
          className={clsx(
            "flex flex-col items-center justify-center py-12 rounded-xl border",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200",
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
              "text-sm mb-4",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            No tickets have been created for this event yet
          </p>
          <button
            type="button"
            onClick={handleCreateTicket}
            className={clsx(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              isDark
                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                : "bg-blue-600 text-white hover:bg-blue-700",
            )}
          >
            <Plus className="w-4 h-4" />
            {t("create_ticket")}
          </button>
        </div>

        {isEditModalOpen && editingTicket && (
          <CreateTicketWizard
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
      </>
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

        {/* Tickets List Header + Create Button */}
        <div className="flex items-center justify-between gap-3">
          <h3
            className={clsx(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {t("tickets")}
          </h3>
          <div className="flex items-center gap-2">
            {tickets.some((ticket) => ticket?.isHidden) && (
              <button
                type="button"
                onClick={() => setIsHiddenLinksModalOpen(true)}
                className={clsx(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                  isDark
                    ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                    : "bg-purple-600 text-white hover:bg-purple-700",
                )}
              >
                <LinkIcon className="w-4 h-4" />
                {t("hidden_ticket_links")}
              </button>
            )}
            <button
              type="button"
              onClick={handleCreateTicket}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                isDark
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  : "bg-blue-600 text-white hover:bg-blue-700",
              )}
            >
              <Plus className="w-4 h-4" />
              {t("create_ticket")}
            </button>
          </div>
        </div>

        <div className="space-y-3">
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
            const isUnlimited = ticket?.quantity?.isUnlimited;

            const stats = [
              {
                icon: Package,
                label: t("total"),
                value: isUnlimited ? "∞" : ticket?.quantity?.initial,
              },
              {
                icon: Tag,
                label: t("sold"),
                value: ticket?.quantity?.sold,
              },
              {
                icon: Ticket,
                label: t("remaining"),
                value: isUnlimited ? "∞" : ticket?.quantity?.remaining,
              },
              {
                icon: Users,
                label: t("per_user"),
                value: `${ticket?.quantity?.perUserLimit}`,
              },
            ];

            return (
              <div
                key={ticket._id}
                className={clsx(
                  "rounded-xl border transition-colors duration-200 relative",
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300",
                )}
              >
                {/* Hidden Badge - Diagonal Top Left */}
                {ticket?.isHidden && (
                  <div className="absolute top-0 left-0 z-10 w-16 h-16 overflow-hidden">
                    <div
                      className={clsx(
                        "absolute -top-3 -left-3 w-20 h-20 -rotate-45 flex items-center justify-center",
                        isDark ? "bg-purple-500" : "bg-purple-500",
                      )}
                    >
                      <span
                        className={clsx(
                          "text-[9px] font-bold text-white uppercase tracking-wider",
                        )}
                      >
                        {t("hidden")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  <div className="relative w-full sm:w-40 h-32 sm:h-auto shrink-0 overflow-hidden">
                    <ImageWithFallback
                      src={image}
                      alt={ticket.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-1.5 left-1.5">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-sm capitalize",
                          ticket.status === "active"
                            ? "bg-green-500/90 text-white"
                            : "bg-gray-500/90 text-white",
                        )}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 p-4 space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={clsx(
                              "text-base font-bold truncate",
                              isDark ? "text-white" : "text-gray-900",
                            )}
                          >
                            {ticket.name}
                          </h3>
                          <span
                            className={clsx(
                              "px-1.5 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap uppercase",
                              getTypeColor(ticket.type),
                            )}
                          >
                            {ticket.type}
                          </span>
                        </div>
                        {ticket?.description && (
                          <div
                            className={clsx(
                              "text-xs leading-relaxed line-clamp-1 mt-0.5",
                              isDark ? "text-gray-400" : "text-gray-600",
                            )}
                            dangerouslySetInnerHTML={{
                              __html: ticket.description,
                            }}
                          />
                        )}
                      </div>

                      {/* Price + actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="flex items-baseline gap-1.5 justify-end">
                            {hasDiscount && !isFree && (
                              <span
                                className={clsx(
                                  "line-through text-xs",
                                  isDark ? "text-gray-500" : "text-gray-400",
                                )}
                              >
                                ₪{ticket.price.markedPrice}
                              </span>
                            )}
                            <span
                              className={clsx(
                                "font-bold text-lg leading-none",
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
                          {hasDiscount && !isFree && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-500 mt-0.5">
                              <TrendingDown className="w-3 h-3" />₪
                              {calculateDiscountAmount(ticket)} off
                            </span>
                          )}
                        </div>
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
                            ...(ticket?.isHidden
                              ? [
                                  {
                                    title: "Copy Hidden Link",
                                    icon: ExternalLink,
                                    color: "blue" as const,
                                    onClick: () => {
                                      const associatedUrl =
                                        selectedWebsites?.[0]?.url;
                                      const hiddenLink = associatedUrl
                                        ? `${associatedUrl}?showHidden=true`
                                        : `${import.meta.env.VITE_CUSTOMER_URL || "http://localhost:3000"}/event-details/${eventSlug || ""}?showHidden=true`;
                                      navigator.clipboard.writeText(hiddenLink);
                                      toast.success(
                                        "Hidden ticket link copied to clipboard!",
                                      );
                                    },
                                  },
                                ]
                              : []),
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
                                if (ticket?.wrapperId)
                                  navigate(
                                    `${routes.eventSessionMgmt}?eventId=${eventId}&wrapperId=${ticket?.wrapperId}&ticketId=${ticket._id}`,
                                  );
                                else
                                  navigate(
                                    `${routes.eventSessionMgmt}?eventId=${eventId}&&ticketId=${ticket._id}`,
                                  );
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Stats + progress */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {stats.map(({ icon: Icon, label, value }) => (
                        <div
                          key={label}
                          className={clsx(
                            "rounded-lg px-2.5 py-1.5",
                            isDark ? "bg-gray-900/50" : "bg-gray-50",
                          )}
                        >
                          <div
                            className={clsx(
                              "flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide",
                              isDark ? "text-gray-500" : "text-gray-500",
                            )}
                          >
                            <Icon className="w-3 h-3" />
                            {label}
                          </div>
                          <p
                            className={clsx(
                              "text-sm font-bold mt-0.5",
                              isDark ? "text-white" : "text-gray-900",
                            )}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Sales progress */}
                    {!isUnlimited && (
                      <div className="flex items-center gap-3">
                        <div
                          className={clsx(
                            "flex-1 h-1.5 rounded-full overflow-hidden",
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
                        <span
                          className={clsx(
                            "text-[11px] font-semibold whitespace-nowrap",
                            isDark ? "text-gray-300" : "text-gray-700",
                          )}
                        >
                          {soldPercentage?.toFixed(0)}% {t("sold")}
                        </span>
                        {ticket?.quantity?.sold > 0 && (
                          <span
                            className={clsx(
                              "text-[11px] whitespace-nowrap",
                              isDark ? "text-gray-400" : "text-gray-500",
                            )}
                          >
                            ₪{calculateTotalRevenue(ticket).toLocaleString()}{" "}
                            {t("revenue")}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Event dates */}
                    {ticket?.dayDescription?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                        <Calendar
                          className={clsx(
                            "w-3.5 h-3.5 shrink-0",
                            isDark ? "text-gray-500" : "text-gray-400",
                          )}
                        />
                        {ticket?.dayDescription?.map((day, index) => (
                          <span
                            key={index}
                            className={clsx(
                              "inline-flex items-center gap-1 text-[11px] border rounded px-1.5 py-0.5",
                              borderColor,
                              isDark ? "text-gray-300" : "text-gray-600",
                            )}
                          >
                            <span className="font-medium">
                              {formatDate(day.date, language)}
                            </span>
                            <span className="opacity-50">·</span>
                            <span>
                              {day.startTime}–{day.endTime}
                            </span>
                          </span>
                        ))}
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
        <CreateTicketWizard
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

      {/* Hidden Ticket Links Modal */}
      {isHiddenLinksModalOpen && (
        <ModalWrapper
          onClose={() => setIsHiddenLinksModalOpen(false)}
          maxWidth="max-w-4xl"
          height="h-auto max-h-[60dvh]"
        >
          <div className="p-6">
            <h3
              className={clsx(
                "text-xl font-semibold mb-4",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("hidden_ticket_links")}
            </h3>
            <p
              className={clsx(
                "text-sm mb-6",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              {t("hidden_ticket_links_description")}
            </p>

            {tickets.filter((ticket) => ticket?.isHidden).length === 0 ? (
              <p
                className={clsx(
                  "text-center text-sm py-8",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                {t("no_hidden_tickets")}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedWebsites.map((website: any) => {
                  const hiddenLink = website.url
                    ? `${website.url}?showHidden=true`
                    : `${import.meta.env.VITE_CUSTOMER_URL || "http://localhost:3000"}/event-details/${eventSlug || ""}?showHidden=true`;

                  return (
                    <div
                      key={website._id}
                      className={clsx(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                        isDark
                          ? "bg-gray-800 border-gray-700 hover:bg-gradient-to-br hover:from-purple-900/50 hover:to-blue-900/50 hover:border-purple-500"
                          : "bg-white border-gray-200 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:border-purple-300 hover:shadow-purple-100/60",
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={clsx(
                            "p-2 rounded-lg shrink-0",
                            isDark ? "bg-gray-700" : "bg-gray-100",
                          )}
                        >
                          <ImageWithFallback
                            src={website?.logo || website?.url}
                            alt={website?.name}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className={clsx(
                              "font-medium text-sm block",
                              isDark ? "text-gray-200" : "text-gray-800",
                            )}
                          >
                            {website.name}
                          </span>
                          <p
                            className={clsx(
                              "text-xs truncate mt-1",
                              isDark ? "text-gray-400" : "text-gray-500",
                            )}
                          >
                            {hiddenLink}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* QR Code Button - Commented out per frontend dev request */}
                        {/* <button
                          onClick={() => setSelectedWebsiteForQR({ ...website, url: hiddenLink })}
                          className={clsx(
                            "shrink-0 transition-colors duration-200 cursor-pointer p-2 rounded-lg",
                            isDark
                              ? "text-violet-400 hover:text-violet-300 bg-gray-700"
                              : "text-violet-600 hover:text-violet-700 bg-gray-100",
                          )}
                          title="View QR Code"
                        >
                          <QrCodeIcon className="w-4 h-4" />
                        </button> */}

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(hiddenLink);
                            toast.success(t("share_special_links"));
                          }}
                          className={clsx(
                            "shrink-0 transition-colors duration-200 cursor-pointer p-2 rounded-lg",
                            isDark
                              ? "text-blue-400 hover:text-blue-300 bg-gray-700"
                              : "text-blue-600 hover:text-blue-700 bg-gray-100",
                          )}
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(hiddenLink, "_blank")}
                          className={clsx(
                            "shrink-0 transition-colors duration-200 cursor-pointer p-2 rounded-lg",
                            isDark
                              ? "text-green-400 hover:text-green-300 bg-gray-700"
                              : "text-green-600 hover:text-green-700 bg-gray-100",
                          )}
                          title="Open Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ModalWrapper>
      )}

      {/* QR Code Modal */}
      {selectedWebsiteForQR && (
        <ModalWrapper
          onClose={() => setSelectedWebsiteForQR(null)}
          maxWidth="max-w-md"
        >
          <div className="p-6 text-center">
            <h3
              className={clsx(
                "text-xl font-semibold mb-4",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {selectedWebsiteForQR.name}
            </h3>
            <div className="flex justify-center mb-4">
              <div
                className={clsx(
                  "p-4 rounded-xl",
                  isDark ? "bg-white" : "bg-white",
                )}
              >
                <QRCodeCanvas
                  value={selectedWebsiteForQR.url}
                  size={200}
                  level="H"
                />
              </div>
            </div>
            <p
              className={clsx(
                "text-sm mb-4",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              Scan to visit {selectedWebsiteForQR.url}
            </p>
            <button
              onClick={() => {
                const canvas = document.querySelector(
                  "canvas",
                ) as HTMLCanvasElement;
                if (canvas) {
                  const link = document.createElement("a");
                  link.download = `${selectedWebsiteForQR.name.replace(/\s+/g, "_")}_QR.png`;
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                }
              }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                isDark
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  : "bg-blue-600 text-white hover:bg-blue-700",
              )}
            >
              <Copy className="w-4 h-4" />
              Download QR Code
            </button>
          </div>
        </ModalWrapper>
      )}
    </>
  );
};

export default EventTicketDetails;
