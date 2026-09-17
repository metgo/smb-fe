import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, Users, ChevronDown, AlertCircle } from "lucide-react";

import { ExportBtns } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback, ReordableDataTable } from "@/components/shared";
import {
  useUpdateEventTicketStatusMutation,
  useSetEventTicketAttendanceMutation,
} from "@/store/api/eventMutationApi";
import {
  useLazyGetEventTicketsQuery,
  useLazyGetEventTicketsExportXlsxQuery,
} from "@/store/api/eventQueryApi";
import TicketRegDetailModal from "./TicketRegDetailModal";
import { formatDateTime } from "@/helpers/formatter";

const STATUS_OPTIONS = [
  { value: "attended", label: "attended" },
  { value: "completed", label: "completed" },
  { value: "canceled", label: "cancelled" },
];

const REGISTRATION_FILTER_OPTIONS = [
  { value: "all", label: "all" },
  { value: "attended", label: "attended" },
  { value: "completed", label: "completed" },
  { value: "canceled", label: "cancelled" },
  { value: "failure", label: "failure" },
];

// mirrors the effective status shown in the status column: "attended" is a
// check-in marker on top of "completed", and a missing status falls back to
// payment status (pending/failure) like StatusCell does.
const getEffectiveStatus = (ticket: IEventTicket) => {
  if (ticket.attended) return "attended";
  if (ticket.status) return ticket.status.toLowerCase();
  return ticket.paymentStatus === "pending" ||
    ticket.paymentStatus === "failure"
    ? ticket.paymentStatus
    : "failure";
};

const getStatusColor = (status: string, isDark: boolean) => {
  switch (status?.toLowerCase()) {
    case "paid":
    case "success":
    case "completed":
      return clsx(
        "bg-green-500/20",
        isDark
          ? "text-green-400 border-green-700"
          : "text-green-600 border-green-300",
      );
    case "failure":
      return clsx(
        "bg-red-500/20",
        isDark ? "text-red-400 border-red-700" : "text-red-600 border-red-300",
      );
    case "refunded":
    case "canceled":
      return clsx(
        "bg-red-500/20",
        isDark ? "text-red-400 border-red-700" : "text-red-600 border-red-300",
      );
    default:
      return clsx(
        "bg-blue-500/20",
        isDark ? "text-white border-gray-700" : "text-gray-600 border-gray-300",
      );
  }
};

interface CancelDialogProps {
  isDark: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CancelDialog: React.FC<CancelDialogProps> = ({
  isDark,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation("events");
  const [reason, setReason] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={clsx(
          "w-full max-w-md mx-4 rounded-xl border shadow-xl p-6",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h3
              className={clsx(
                "font-semibold text-base",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("cancel_order")}
            </h3>
            <p
              className={clsx(
                "text-sm mt-1",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {t("cancel_order_reason_prompt")}
            </p>
            <p
              className={clsx(
                "text-xs mt-2 text-amber-600 dark:text-amber-400 font-medium",
              )}
            >
              ⚠️ {t("cancel_session_booking_warning")}
            </p>
          </div>
        </div>

        <textarea
          ref={inputRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("cancel_reason_placeholder")}
          rows={3}
          className={clsx(
            "w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30",
            isDark
              ? "bg-gray-900 border-gray-600 text-white placeholder-gray-500"
              : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400",
          )}
        />

        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700",
            )}
          >
            {t("cancel")}
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("updating") : t("confirm_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatusCellProps {
  ticket: IEventTicket;
  isDark: boolean;
  onUpdate: (
    orderId: string,
    status: string,
    cancelReason?: string,
  ) => Promise<void>;
  onAttendance: (orderId: string, attended: boolean) => Promise<void>;
  isUpdating: boolean;
  updatingId: string | null;
}

const StatusCell: React.FC<StatusCellProps> = ({
  ticket,
  onUpdate,
  onAttendance,
  isUpdating,
  updatingId,
  isDark,
}) => {
  const { t } = useTranslation("events");

  const [open, setOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ticketOrderId = ticket.orderProductId ?? ticket._id;
  const isThisUpdating = isUpdating && updatingId === ticketOrderId;

  // "attended" is a check-in marker, not an order status - show it ahead of
  // the underlying status ("completed"), which stays untouched underneath.
  // (canceled rows return early below, so this only applies to live ones.)
  const currentValue = ticket.attended ? "attended" : ticket.status;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    setOpen(false);
    if (value === currentValue) return;
    if (value === "canceled") {
      setShowCancelDialog(true);
      return;
    }
    if (value === "attended") {
      await onAttendance(ticketOrderId, true);
      return;
    }
    if (value === "completed") {
      // leaving the "attended" marker -> just clear check-in; status is
      // already "completed" underneath
      if (ticket.attended) {
        await onAttendance(ticketOrderId, false);
      } else {
        await onUpdate(ticketOrderId, value);
      }
      return;
    }
    await onUpdate(ticketOrderId, value);
  };

  const handleCancelConfirm = async (reason: string) => {
    await onUpdate(ticket.orderProductId ?? ticket._id, "canceled", reason);
    setShowCancelDialog(false);
  };

  if (!ticket.status) {
    const fallback =
      ticket.paymentStatus === "pending" || ticket.paymentStatus === "failure"
        ? ticket.paymentStatus
        : "failure";
    return (
      <span
        className={clsx(
          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
          getStatusColor(fallback, isDark),
        )}
      >
        {t(fallback, { defaultValue: fallback })}
      </span>
    );
  }

  // canceled is terminal - no status change possible from here
  if (ticket.status?.toLowerCase() === "canceled") {
    return (
      <span
        className={clsx(
          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
          getStatusColor("canceled", isDark),
        )}
      >
        {t("canceled", { defaultValue: "canceled" })}
      </span>
    );
  }

  // once checked in, "attended" is terminal too - show a static pill, no dropdown
  if (ticket.attended) {
    return (
      <span
        className={clsx(
          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
          getStatusColor("attended", isDark),
        )}
      >
        {t("attended")}
      </span>
    );
  }

  return (
    <>
      <div
        ref={dropdownRef}
        className="relative inline-block"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          disabled={isThisUpdating}
          className={clsx(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-opacity capitalize",
            getStatusColor(currentValue, isDark),
            isThisUpdating && "opacity-60 cursor-not-allowed",
          )}
        >
          {isThisUpdating
            ? t("updating")
            : t(currentValue, { defaultValue: currentValue })}
          {!isThisUpdating && <ChevronDown className="w-3 h-3" />}
        </button>

        {open && (
          <div
            className={clsx(
              "absolute z-20 top-full mt-1 left-0 min-w-32.5 rounded-lg border shadow-lg overflow-hidden",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => handleSelect(e, opt.value)}
                className={clsx(
                  "w-full text-left px-3 py-2 text-xs transition-colors capitalize",
                  currentValue === opt.value
                    ? isDark
                      ? "bg-gray-700 font-semibold text-white"
                      : "bg-gray-100 font-semibold text-gray-900"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-50",
                  opt.value === "cancelled" &&
                    "text-red-500 hover:text-red-500",
                )}
              >
                {t(opt.value)}
              </button>
            ))}
          </div>
        )}
      </div>

      {showCancelDialog && (
        <div onClick={(e) => e.stopPropagation()}>
          <CancelDialog
            isDark={isDark}
            isLoading={isThisUpdating}
            onConfirm={handleCancelConfirm}
            onCancel={() => setShowCancelDialog(false)}
          />
        </div>
      )}
    </>
  );
};

interface StatusFilterDropdownProps {
  isDark: boolean;
  value: string;
  onChange: (value: string) => void;
  counts: Record<string, number>;
  total: number;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({
  isDark,
  value,
  onChange,
  counts,
  total,
  t,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption =
    REGISTRATION_FILTER_OPTIONS.find((opt) => opt.value === value) ??
    REGISTRATION_FILTER_OPTIONS[0];
  const selectedCount = value === "all" ? total : (counts[value] ?? 0);

  return (
    <div ref={dropdownRef} className="relative w-full sm:w-56 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center justify-between gap-2 py-3 px-4 rounded-xl border text-base capitalize transition-all",
          isDark
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-300 text-gray-900",
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {t(selectedOption.label, { defaultValue: selectedOption.label })}
          <span
            className={clsx(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              isDark
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600",
            )}
          >
            {selectedCount}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute z-20 top-full mt-1 left-0 right-0 rounded-lg border shadow-lg overflow-hidden",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          {REGISTRATION_FILTER_OPTIONS.map((opt) => {
            const count =
              opt.value === "all" ? total : (counts[opt.value] ?? 0);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-sm transition-colors capitalize",
                  value === opt.value
                    ? isDark
                      ? "bg-gray-700 font-semibold text-white"
                      : "bg-gray-100 font-semibold text-gray-900"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <span>{t(opt.label, { defaultValue: opt.label })}</span>
                <span
                  className={clsx(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    isDark
                      ? "bg-gray-900 text-gray-300"
                      : "bg-gray-200 text-gray-600",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface EventRegistrationDetailsProps {
  eventDetails: any;
}

const EventRegistrationDetails: React.FC<EventRegistrationDetailsProps> = ({
  eventDetails,
}) => {
  const { t } = useTranslation("events");
  const { textTertiary, isDark, isRTL, language } = useThemeClasses();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isTicktDetailsModalOpen, setIsTicketDetailModalOpen] = useState(false);

  const [allTickets, setAllTickets] = useState<IEventTicket[]>([]);
  const [ticketDetails, setTicketDetails] = useState<IEventTicket | null>(null);

  const eventId = eventDetails?._id ?? eventDetails?.vendorId ?? "";

  const [fetchTickets, { isFetching: isLoadingTickets }] =
    useLazyGetEventTicketsQuery();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const load = useCallback(
    async (search = "") => {
      if (!eventId) return;
      const result = await fetchTickets(
        { eventId, ...(search ? { search } : {}) },
        false,
      ).unwrap();
      setAllTickets(result.data);
    },
    [eventId, fetchTickets],
  );

  useEffect(() => {
    load(debouncedSearch);
  }, [load, debouncedSearch]);

  const [updateStatus, { isLoading: isStatusUpdating }] =
    useUpdateEventTicketStatusMutation();
  const [setAttendance, { isLoading: isAttendanceUpdating }] =
    useSetEventTicketAttendanceMutation();
  const isUpdating = isStatusUpdating || isAttendanceUpdating;

  const handleStatusUpdate = async (
    orderId: string,
    status: string,
    cancelReason?: string,
  ) => {
    setUpdatingId(orderId);
    try {
      await updateStatus({ orderId, status, cancelReason }).unwrap();
      toast.success(
        t("order_status_updated", {
          status: t(status, { defaultValue: status }),
        }),
      );
      await load(debouncedSearch);
    } catch {
      toast.error(t("failed_to_update_order_status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAttendanceUpdate = async (orderId: string, attended: boolean) => {
    setUpdatingId(orderId);
    try {
      await setAttendance({ orderId, attended }).unwrap();
      toast.success(
        t("order_status_updated", {
          status: t(attended ? "attended" : "completed"),
        }),
      );
      await load(debouncedSearch);
    } catch {
      toast.error(t("failed_to_update_order_status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets =
    statusFilter === "all"
      ? allTickets
      : allTickets.filter(
          (ticket) => getEffectiveStatus(ticket) === statusFilter,
        );

  const statusCounts = allTickets.reduce<Record<string, number>>(
    (acc, ticket) => {
      const status = getEffectiveStatus(ticket);
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const [fetchExportCsv, { isFetching, isLoading }] =
    useLazyGetEventTicketsExportXlsxQuery();
  // const [fetchExportPdf] = useLazyGetEventTicketsExportPdfQuery();

  const downloadBlob = (blob: Blob, fileName: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const exportToCSV = async () => {
    if (!eventId) return;
    try {
      const blob = await fetchExportCsv({ eventId }).unwrap();
      downloadBlob(
        blob,
        `${eventDetails?.name?.replace(/\s+/g, "_") ?? "event"}_registrants.xlsx`,
      );
    } catch {
      toast.error(t("failed_to_export"));
    }
  };

  function handleTicketRegRowClick(ticket: IEventTicket) {
    setTicketDetails(ticket);
    setIsTicketDetailModalOpen(true);
  }

  return (
    <div className="max-h-[75vh] overflow-y-auto">
      <section>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 ${textTertiary}`}
            />
            <input
              type="text"
              placeholder={t("search_registrants_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 rounded-xl border text-base ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:ring-2 focus:ring-teal-500/20 transition-all`}
            />
          </div>

          <StatusFilterDropdown
            isDark={isDark}
            value={statusFilter}
            onChange={setStatusFilter}
            counts={statusCounts}
            total={allTickets.length}
            t={t}
          />
          <ExportBtns
            exportToCSV={exportToCSV}
            isCsvExporting={isFetching || isLoading}
          />
        </div>

        {filteredTickets.length === 0 && isLoadingTickets ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <Users
              className={`w-20 h-20 mx-auto mb-5 opacity-50 ${textTertiary}`}
            />
            <p className={`text-lg ${textTertiary}`}>
              {searchQuery || statusFilter !== "all"
                ? t("no_registrants_match")
                : t("no_registrants_yet")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <ReordableDataTable
              rowKey="_id"
              data={filteredTickets}
              storageKey="eventTicketsTableColumnOrder"
              onRowClick={handleTicketRegRowClick}
              columns={[
                {
                  key: "full_name",
                  label: t("purchecher"),
                  sortable: true,
                  render: (ticket: IEventTicket) => (
                    <div className="flex flex-col">
                      <span
                        className={clsx(
                          "text-sm font-medium",
                          isDark ? "text-gray-100" : "text-gray-900",
                        )}
                      >
                        {`${ticket.firstName} ${ticket.lastName || ""}`.trim()}
                      </span>
                      {ticket.email && (
                        <span
                          className={clsx(
                            "text-xs",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          {ticket.email}
                        </span>
                      )}
                      {ticket.phone && (
                        <span
                          className={clsx(
                            "text-xs",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          {ticket.phone}
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: "ticket_name",
                  label: t("ticket_name"),
                  render: (ticket: IEventTicket) => (
                    <div className="flex items-center gap-1">
                      <ImageWithFallback
                        src={ticket.ticketImage[0].image}
                        alt={ticket.ticketName}
                        className="w-20 object-contain shrink-0 rounded"
                      />
                      <span
                        className={clsx(
                          "text-xs line-clamp-3",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      >
                        {ticket.ticketName || "-"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "payment_mode",
                  label: t("payment_mode"),
                  render: (ticket: IEventTicket) => (
                    <span
                      className={clsx(
                        "text-sm capitalize",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      {ticket.paymentMode?.join(", ") || "-"}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  label: t("amount"),
                  sortable: true,
                  render: (ticket: IEventTicket) => (
                    <span
                      className={clsx(
                        "text-sm font-medium",
                        isDark ? "text-gray-100" : "text-gray-900",
                      )}
                    >
                      {ticket.amount != null
                        ? isRTL
                          ? `${ticket.quantity + "x "}${ticket.amount}₪`
                          : `₪ ${ticket.amount} x${ticket.quantity}`
                        : "-"}
                    </span>
                  ),
                },
                {
                  key: "status",
                  label: t("status"),
                  render: (ticket: IEventTicket) => (
                    <StatusCell
                      ticket={ticket}
                      isDark={isDark}
                      onUpdate={handleStatusUpdate}
                      onAttendance={handleAttendanceUpdate}
                      isUpdating={isUpdating}
                      updatingId={updatingId}
                    />
                  ),
                },
                {
                  key: "payment_status",
                  label: t("payment_status"),
                  render: (ticket: IEventTicket) =>
                    ticket.paymentStatus ? (
                      <span
                        className={clsx(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
                          isDark ? "text-white" : "text-gray-500",
                          getStatusColor(ticket.paymentStatus ?? "", isDark),
                        )}
                      >
                        {t(ticket.paymentStatus, {
                          defaultValue: ticket.paymentStatus,
                        })}
                      </span>
                    ) : (
                      <span
                        className={clsx(
                          "text-sm",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      >
                        -
                      </span>
                    ),
                },
                {
                  key: "purchased_date",
                  label: t("purchased_date"),
                  sortable: true,
                  render: (ticket: IEventTicket) => (
                    <span
                      className={clsx(
                        "text-sm",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      {ticket.paymentDate
                        ? formatDateTime(ticket?.paymentDate, language)
                        : "-"}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        )}
      </section>

      {isTicktDetailsModalOpen && (
        <TicketRegDetailModal
          setIsOpen={setIsTicketDetailModalOpen}
          ticketDetails={ticketDetails}
          onStatusUpdated={() => load(debouncedSearch)}
        />
      )}
    </div>
  );
};

export default EventRegistrationDetails;
