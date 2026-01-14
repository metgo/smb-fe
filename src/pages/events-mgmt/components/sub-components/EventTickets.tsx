import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Ticket, AlertCircle, FileText, Copy, Trash2 } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";


interface EventTicketsProps {
  currentStep: number;

  // Tickets state
  tickets: TicketData[];
  setTickets: React.Dispatch<React.SetStateAction<TicketData[]>>;

  // Modal control
  editingTicket: TicketData | null;
  setEditingTicket: React.Dispatch<React.SetStateAction<TicketData | null>>;
  showTicketModal: boolean;
  setShowTicketModal: React.Dispatch<React.SetStateAction<boolean>>;

  // Errors
  errors: {
    tickets?: string;
  };

  // Helpers
  addTicket: () => void;
  deleteTicket: (id: string) => void;
}

const EventTickets: React.FC<EventTicketsProps> = ({
  currentStep,
  tickets,
  setTickets,
  setEditingTicket,
  setShowTicketModal,
  errors,
  addTicket,
  deleteTicket,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textTertiary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);

  if (currentStep !== 4) return null;

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

  const formatPrice = (ticket: TicketData) => {
    if (ticket.type === "free") return t("free") || "Free";
    if (ticket.type === "donation") return t("donation") || "Donation";
    return `₪${ticket.sellingPrice ?? 0}`;
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
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium">{errors.tickets}</span>
        </div>
      )}

      {/* No Tickets State */}
      {tickets.length === 0 ? (
        <div
          className={`p-16 rounded-2xl border-2 border-dashed text-center ${
            theme === "dark"
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
            className="px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-lg transition-all shadow-lg shadow-teal-600/20"
          >
            {t("create_first_ticket")}
          </button>
        </div>
      ) : (
        /* Tickets List */
        <div className="space-y-5">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`p-6 rounded-xl border transition-all hover:shadow-md ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h4 className={`text-xl font-semibold ${textPrimary}`}>
                      {ticket.name}
                    </h4>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getTicketTypeColor(
                        ticket.type
                      )}`}
                    >
                      {ticket.type === "free"
                        ? t("free")
                        : ticket.type === "vip"
                        ? t("vip")
                        : ticket.type === "donation"
                        ? t("donation")
                        : t("paid") || "Paid"}
                    </span>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm ${textTertiary}`}>
                    <div>
                      <span className="font-medium">{t("price")}:</span>{" "}
                      {formatPrice(ticket)}
                    </div>
                    <div>
                      <span className="font-medium">{t("quantity")}:</span>{" "}
                      {ticket.quantity === 0 ? t("unlimited") : ticket.quantity}
                    </div>
                    <div>
                      <span className="font-medium">{t("per_user_limit")}:</span>{" "}
                      {ticket.perUserLimit === 0 ? t("no_limit") : ticket.perUserLimit}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingTicket(ticket);
                      setShowTicketModal(true);
                    }}
                    className={`p-3 rounded-xl transition-all ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-200"
                    }`}
                    title={t("edit_ticket") || "Edit ticket"}
                  >
                    <FileText className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      const duplicated: TicketData = {
                        ...ticket,
                        id: Date.now().toString(),
                        name: `${ticket.name} (${t("copy") || "Copy"})`,
                      };
                      setTickets((prev) => [...prev, duplicated]);
                    }}
                    className={`p-3 rounded-xl transition-all ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-200"
                    }`}
                    title={t("duplicate_ticket") || "Duplicate ticket"}
                  >
                    <Copy className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => deleteTicket(ticket.id)}
                    className="p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
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
    </div>
  );
};

export default EventTickets;