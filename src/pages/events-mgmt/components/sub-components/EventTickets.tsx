import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Activity, useState } from "react";
import { Plus, Ticket, FileText, Trash2, AlertCircle } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useDeleteTicketMutation } from "@/store/api/eventMutationApi";
import CreateTicketWizard from "./CreateTicketWizard";
import { TicketCardSkeleton } from "@/components/skeletons";
import { ConfirmDialog } from "@/components/shared";


interface EventTicketsProps {
  showTicketModal: boolean;
  setShowTicketModal: React.Dispatch<React.SetStateAction<boolean>>;
  errors: {
    tickets?: string;
  };
  eventId: string;
  refetch: ()=>void;
  setEventId: (v: string) => void;
  initEventCreate: () => any;
  setCurrentStep: (v: number) => void;
  tickets: any;
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
  setEventId,
  setShowTicketModal,
  showTicketModal,
  errors,
  tickets,
  refetch,
  setCurrentStep,
  initEventCreate,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textTertiary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);

  

  const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();
  const [editingTicket, setEditingTicket] = useState<ITicketPayload | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);


  const formatPrice = (ticket: TicketData) => {
    if (ticket.type === "free") return t("free");
    if (ticket.type === "donation") return t("donation");
    return `₪${ticket.sellingPrice ?? 0}`;
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket({ ticketId }).unwrap();
      refetch();
      toast.success(t("ticket_deleted_successfully"));
    } catch {
      toast.error(t("ticket_delete_failed"));
    }
  };

  const addTicket = async () => {
    setEditingTicket({
      _id: "",
      name: "",
      description: "",
      eventId,
      type: "free",
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
      status: "public",
    });
    if (!eventId) {
      const res = await initEventCreate().unwrap();
      setEventId(res?.id);
    }
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
          className="px-5 py-3 cursor-pointer rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-2 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-5 h-5" />
          {t("create_ticket")}
        </button>
      </div>

      {/* Loading Skeleton */}
      {( isDeleting) && (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <TicketCardSkeleton key={i} theme={theme} />
          ))}
        </div>
      )}
      {/* Global Error */}
      {errors.tickets && !tickets && (
        <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span className="font-medium">{errors.tickets}</span>
        </div>
      )}

      {/* Empty State */}
      {(tickets?.length === 0 || !tickets) && (
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
          <p className={`mb-8 ${textTertiary}`}>
            {t("no_tickets_yet_desc")}
          </p>
          <button
            onClick={addTicket}
            className="px-8 py-4 cursor-pointer rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-lg shadow-lg"
          >
            {t("create_first_ticket")}
          </button>
        </div>
      )}

      {/* Tickets List */}
      { tickets?.length > 0 && (
        <div className="space-y-5">
          {tickets?.map((ticket: any) => (
            <div
              key={ticket._id}
              className={`p-6 rounded-xl border hover:shadow-md transition ${theme === "dark"
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-200 bg-gray-50"
                }`}
            >
              <div className="flex justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h4 className={`text-xl font-semibold ${textPrimary}`}>
                      {ticket.name}
                    </h4>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${getTicketTypeColor(
                        ticket.type
                      )}`}
                    >
                      {t(ticket.type)}
                    </span>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm ${textTertiary}`}>
                    <div>
                      <span className="font-medium">{t("price")}:</span>{" "}
                      {formatPrice(ticket.price)}
                    </div>
                    <div>
                      <span className="font-medium">{t("quantity")}:</span>{" "}
                      {ticket.quantity.initial || t("unlimited")}
                    </div>
                    <div>
                      <span className="font-medium">{t("per_user_limit")}:</span>{" "}
                      {ticket.quantity.perUserLimit || t("no_limit")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingTicket({
                        ...ticket,
                        imageUrl: ticket?.images?.[0]?.image || "",
                      });
                      setShowTicketModal(true);
                    }}
                    className="p-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <FileText className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      setTicketToDelete(ticket._id);
                      setIsConfirmOpen(true);
                    }}
                    className="p-3 rounded-xl text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Wizard */}
      <Activity mode={showTicketModal && editingTicket ? "visible" : "hidden"}>
        <CreateTicketWizard
          theme={theme}
          eventId={eventId}
          tickets={tickets}
          refetch={refetch}
          setCurrentStep={setCurrentStep}
          setShowTicketModal={setShowTicketModal}
          editingTicket={editingTicket!}
          setEditingTicket={setEditingTicket}
        />
      </Activity>

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

    </div>
  );
};


export default EventTickets;