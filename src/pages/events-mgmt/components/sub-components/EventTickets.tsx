import { toast } from "sonner";
import { Activity, useState } from "react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { Plus, Ticket, AlertCircle, FileText, Trash2 } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllTicketQuery } from "@/store/api/eventQueryApi";
import { useDeleteTicketMutation } from "@/store/api/eventMutationApi";
import CreateTicketWizard from "./CreateTicketWizard";


interface EventTicketsProps {
  showTicketModal: boolean;
  setShowTicketModal: React.Dispatch<React.SetStateAction<boolean>>;
  errors: {
    tickets?: string;
  };
  eventId: string | null;
}

const getTicketTypeColor = (type: string) => {
  switch (type) {
    case "free":
      return "bg-green-500/20 text-green-500 dark:bg-green-500/30";
    case "vip":
      return "bg-purple-500/20 text-purple-500 dark:bg-purple-500/30";
    case "donation":
      return "bg-orange-500/20 text-orange-500 dark:bg-orange-500/30";
    default:
      return "bg-blue-500/20 text-blue-500 dark:bg-blue-500/30";
  }
};


const EventTickets: React.FC<EventTicketsProps> = ({
  eventId,
  setShowTicketModal,
  showTicketModal,
  errors,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textTertiary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);
  const { data: tickets, refetch } = useGetAllTicketQuery(eventId ? { eventId } : skipToken)
  const [deleteTicket, { isLoading }] = useDeleteTicketMutation()

  const [editingTicket, setEditingTicket] = useState<ITicketPayload | null>(null);


  const formatPrice = (ticket: TicketData) => {
    if (ticket.type === "free") return t("free") || "Free";
    if (ticket.type === "donation") return t("donation") || "Donation";
    return `₪${ticket.sellingPrice ?? 0}`;
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket({ ticketId }).unwrap();
      refetch()
      toast.success(t("ticket_deleted_successfully") || "Ticket deleted");
    } catch (error) {
      toast.error(t("ticket_delete_failed") || "Failed to delete ticket");
    }
  };

  const addTicket = () => {
    setEditingTicket({
      _id: '',
      name: '',
      description: '',
      eventId: '',
      type: 'free',
      price: {
        markedPrice: 0,
        sellingPrice: 0,
        discountAmount: 0,
        discountPercent: 0,
      },
      quantity: {
        initial: 0,
        sold: 0,
        remaining: 0,
        isUnlimited: false,
        perUserLimit: 5,
      },
      status: 'public',
    });
    setShowTicketModal(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${textPrimary}`}>
          {t("event_tickets")}
        </h2>
        <button
          onClick={addTicket}
          className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-5 h-5" />
          {t("create_ticket")}
        </button>
      </div>

      {/* Global Error */}
      {errors.tickets && (
        <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span className="font-medium">{errors.tickets}</span>
        </div>
      )}

      {/* No Tickets State */}
      {tickets?.length === 0 ? (
        <div
          className={`p-16 rounded-2xl border-2 border-dashed text-center ${theme === "dark"
            ? "border-gray-700 bg-gray-800/30"
            : "border-gray-300 bg-gray-50"
            }`}
        >
          <Ticket className={`w-20 h-20 mx-auto mb-5 opacity-50 ${textTertiary}`} />
          <h3 className={`text-xl font-semibold mb-3 ${textPrimary}`}>
            {t("no_tickets_yet")}
          </h3>
          <p className={`text-base mb-8 max-w-md mx-auto ${textTertiary}`}>
            {t("no_tickets_yet_desc")}
          </p>
          <button
            onClick={addTicket}
            className="px-8 py-4  cursor-pointer rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-lg transition-all shadow-lg shadow-teal-600/20"
          >
            {t("create_first_ticket")}
          </button>
        </div>
      ) : (
        /* Tickets List */
        <div className="space-y-5">
          {tickets?.map((ticket: any) => (
            <div
              key={ticket?._id}
              className={`p-6 rounded-xl border transition-all hover:shadow-md ${theme === "dark"
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-200 bg-gray-50"
                }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h4 className={`text-xl font-semibold ${textPrimary}`}>
                      {ticket?.name}
                    </h4>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getTicketTypeColor(
                        ticket?.type
                      )}`}
                    >
                      {ticket?.type?.toLowerCase() === "free"
                        ? t("free")
                        : ticket.type?.toLowerCase() === "vip"
                          ? t("vip")
                          : ticket.type === "donation"
                            ? t("donation")
                            : t("paid") || "Paid"}
                    </span>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm ${textTertiary}`}>
                    <div>
                      <span className="font-medium">{t("price")}:</span>{" "}
                      {formatPrice(ticket?.price?.markedPrice)}
                    </div>
                    <div>
                      <span className="font-medium">{t("quantity")}:</span>{" "}
                      {ticket?.quantity?.initial === 0 ? t("unlimited") : ticket?.quantity?.initial}
                    </div>
                    <div>
                      <span className="font-medium">{t("per_user_limit")}:</span>{" "}
                      {ticket?.quantity?.perUserLimit === 0 ? t("no_limit") : ticket?.quantity.perUserLimit}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingTicket(ticket);
                      setShowTicketModal(true);
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer ${theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-200"
                      }`}
                    title={t("edit_ticket") || "Edit ticket"}
                  >
                    <FileText className="w-5 h-5" />
                  </button>

                  {/* <button
                    onClick={() => {
                      const duplicated: TicketData = {
                        ...ticket,
                        id: Date.now().toString(),
                        name: `${ticket.name} (${t("copy") || "Copy"})`,
                      };
                      // setTickets((prev) => [...prev, duplicated]);
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer ${theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-200"
                      }`}
                    title={t("duplicate_ticket") || "Duplicate ticket"}
                  >
                    <Copy className="w-5 h-5" />
                  </button> */}

                  <button
                    onClick={() => handleDeleteTicket(ticket._id)}
                    className="p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                    title={t("delete_ticket") || "Delete ticket"}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Activity mode={(showTicketModal && editingTicket ? "visible" : "hidden")}>
        <CreateTicketWizard
          theme={theme}
          eventId={eventId}
          editingTicket={editingTicket!}
          tickets={tickets}
          refetch={refetch}
          setShowTicketModal={setShowTicketModal}
          setEditingTicket={setEditingTicket}
        />
      </Activity>
    </div>
  );
};

export default EventTickets;