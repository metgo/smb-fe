import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Ticket, Trash2, AlertCircle, Copy, PenBox } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useDeleteTicketMutation } from "@/store/api/eventMutationApi";
import { TicketCardSkeleton } from "@/components/skeletons";
import { ConfirmDialog } from "@/components/shared";
import { TooltipWrapper } from "@/components/wrapper";
import TicketModal from "../modals/TicketModal";

interface TicketsStepProps {
  showTicketModal: boolean;
  setShowTicketModal: React.Dispatch<React.SetStateAction<boolean>>;
  errors: { tickets?: string };
  eventId: string;
  refetch: () => void;
  setEventId: (v: string) => void;
  initEventCreate: () => any;
  tickets: any[];
  eventDays: EventDay[];
}

const TICKET_TYPE_STYLES: Record<string, string> = {
  free: "bg-green-500/20 text-green-600 dark:text-green-400",
  vip: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  donation: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  paid: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

const TicketsStep: React.FC<TicketsStepProps> = ({
  eventId,
  setEventId,
  setShowTicketModal,
  showTicketModal,
  errors,
  tickets,
  refetch,
  initEventCreate,
  eventDays,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textTertiary, isDark } = useThemeClasses();

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

    if (!eventId) {
      const res = await initEventCreate().unwrap();
      setEventId(res?.id);
    }
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${textPrimary}`}>
          {t("event_tickets")}
        </h2>

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
      </div>

      {/* ── Validation error ──────────────────────────────────────────── */}
      {errors.tickets && !hasTickets && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errors.tickets}</span>
        </div>
      )}

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
          <p className={`mb-8 ${textTertiary}`}>{t("no_tickets_yet_desc")}</p>
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
                    <h4 className={`text-xl font-semibold ${textPrimary}`}>
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
                      <span className="font-medium">{t("quantity")}:</span>{" "}
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
                  <button
                    onClick={() => {
                      setEditingTicket({
                        ...ticket,
                        imageUrl: ticket.images?.[0]?.image ?? "",
                      });
                      setTicketDateTime(ticket.dayDescription ?? []);
                      setOpMode("UPDATE");
                      setShowTicketModal(true);
                    }}
                    className={clsx(
                      "p-2.5 rounded-lg transition-colors",
                      isDark
                        ? "text-white/70 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-200",
                    )}
                    title={t("edit_ticket")}
                  >
                    <PenBox className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingTicket({
                        ...ticket,
                        name: `${ticket.name} (${t("copy")})`,
                        imageUrl: ticket.images?.[0]?.image ?? "",
                      });
                      setOpMode("DUPLICATE");
                      setShowTicketModal(true);
                    }}
                    className="p-2.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                    title={t("duplicate_ticket")}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTicketToDelete(ticket._id);
                      setIsConfirmOpen(true);
                    }}
                    className="p-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    title={t("delete_ticket")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Ticket wizard modal ───────────────────────────────────────── */}
      {showTicketModal && editingTicket && (
        <TicketModal
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
    </div>
  );
};

export default TicketsStep;
