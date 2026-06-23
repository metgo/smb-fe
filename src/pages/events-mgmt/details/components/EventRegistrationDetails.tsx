import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Search, Users, ChevronDown, AlertCircle } from "lucide-react";
import { ReordableDataTable } from "@/components/shared";
import { ExportBtns } from "@/components/btns";
import { useAppSelector } from "@/hooks/hooks";
import { useUpdateEventTicketStatusMutation } from "@/store/api/eventMutationApi";
import { useLazyGetEventTicketsQuery } from "@/store/api/eventQueryApi";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Cancelled" },
];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
      return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700";
    case "pending":
      return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
    case "refunded":
    case "canceled":
      return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700";
    default:
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700";
  }
};

interface IEventTicket {
  _id: string;
  createdAt: string;
  vendorId: string;
  status: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string | null;
  paymentMode: string[];
  paymentDate: string | null;
  ticketName: string;
  ticketImage: { image: string }[];
  orderProductId?: string;
  amount?: number;
  quantity?: number;
}

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
  isUpdating: boolean;
  updatingId: string | null;
}

const StatusCell: React.FC<StatusCellProps> = ({
  ticket,
  isDark,
  onUpdate,
  isUpdating,
  updatingId,
}) => {
  const { t } = useTranslation("events");
  const [open, setOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ticketOrderId = ticket.orderProductId ?? ticket._id;
  const isThisUpdating = isUpdating && updatingId === ticketOrderId;

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

  const handleSelect = async (value: string) => {
    setOpen(false);
    if (value === ticket.status) return;
    if (value === "canceled") {
      setShowCancelDialog(true);
      return;
    }
    await onUpdate(ticket.orderProductId ?? ticket._id, value);
  };

  const handleCancelConfirm = async (reason: string) => {
    await onUpdate(ticket.orderProductId ?? ticket._id, "canceled", reason);
    setShowCancelDialog(false);
  };

  return (
    <>
      <div ref={dropdownRef} className="relative inline-block">
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isThisUpdating}
          className={clsx(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-opacity capitalize",
            getStatusColor(ticket.status),
            isThisUpdating && "opacity-60 cursor-not-allowed",
          )}
        >
          {isThisUpdating
            ? t("updating")
            : t(ticket.status, { defaultValue: ticket.status })}
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
                onClick={() => handleSelect(opt.value)}
                className={clsx(
                  "w-full text-left px-3 py-2 text-xs transition-colors capitalize",
                  ticket.status === opt.value
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
        <CancelDialog
          isDark={isDark}
          isLoading={isThisUpdating}
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancelDialog(false)}
        />
      )}
    </>
  );
};

interface EventRegistrationDetailsProps {
  eventDetails: any;
}

const EventRegistrationDetails: React.FC<EventRegistrationDetailsProps> = ({
  eventDetails,
}) => {
  const { t } = useTranslation("events");
  const { isRTL } = useAppSelector((state) => state.settings);
  const { textPrimary, textTertiary, isDark } = useThemeClasses();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const LIMIT = 10;
  const [page, setPage] = useState(1);
  const [allTickets, setAllTickets] = useState<IEventTicket[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const eventId = eventDetails?._id ?? eventDetails?.vendorId ?? "";

  const [fetchTickets, { isFetching: isLoadingTickets }] =
    useLazyGetEventTicketsQuery();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPage = useCallback(
    async (pageNum: number, reset = false, search = "") => {
      if (!eventId) return;
      const result = await fetchTickets(
        { eventId, page: pageNum, limit: LIMIT, ...(search ? { search } : {}) },
        false,
      ).unwrap();
      setHasNextPage(result.meta.hasNextPage);
      setTotalData(result.totalData);
      setAllTickets((prev) =>
        reset ? result.data : [...prev, ...result.data],
      );
      setPage(pageNum);
    },
    [eventId, fetchTickets],
  );

  useEffect(() => {
    loadPage(1, true, debouncedSearch);
  }, [loadPage, debouncedSearch]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingTickets) {
          loadPage(page + 1, false, debouncedSearch);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isLoadingTickets, page, loadPage, debouncedSearch]);

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateEventTicketStatusMutation();

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
      await loadPage(1, true, debouncedSearch);
    } catch {
      toast.error(t("failed_to_update_order_status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = allTickets;

  const exportToCSV = () => {
    if (!eventDetails) return;
    const headers = [
      t("full_name"),
      t("phone"),
      t("email"),
      t("ticket_name"),
      t("payment_mode"),
      t("amount"),
      t("status"),
      t("purchased_date"),
    ];
    const rows = filteredTickets.map((ticket) => [
      `${ticket.firstName} ${ticket.lastName || ""}`.trim(),
      ticket.phone,
      ticket.email,
      ticket.ticketName,
      ticket.paymentMode?.join(", "),
      ticket.amount != null ? `₪${ticket.amount}` : "-",
      ticket.status,
      ticket.paymentDate
        ? new Date(ticket.paymentDate).toLocaleDateString()
        : "-",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventDetails?.name?.replace(/\s+/g, "_") ?? "event"}_registrants.csv`;
    a.click();
  };

  const exportToPDF = () => {
    if (!eventDetails) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${eventDetails?.name} - ${t("registrants")}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #14b8a6; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>${eventDetails?.name}</h1>
          <p><strong>${t("total_registrations")}:</strong> ${filteredTickets.length}</p>
          <table>
            <thead>
              <tr>
                <th>${t("full_name")}</th>
                <th>${t("phone")}</th>
                <th>${t("email")}</th>
                <th>${t("ticket_name")}</th>
                <th>${t("payment_mode")}</th>
                <th>${t("amount")}</th>
                <th>${t("status")}</th>
                <th>${t("purchased_date")}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTickets
                .map(
                  (ticket) => `
                <tr>
                  <td>${`${ticket.firstName} ${ticket.lastName || ""}`.trim()}</td>
                  <td>${ticket.phone || "-"}</td>
                  <td>${ticket.email || "-"}</td>
                  <td>${ticket.ticketName || "-"}</td>
                  <td>${ticket.paymentMode?.join(", ") || "-"}</td>
                  <td>${ticket.amount != null ? `₪${ticket.amount}` : "-"}</td>
                  <td>${ticket.status || "-"}</td>
                  <td>${ticket.paymentDate ? new Date(ticket.paymentDate).toLocaleDateString() : "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-4 max-h-[75vh] overflow-y-auto">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-2xl font-semibold ${textPrimary}`}>
            {t("registrants")} ({totalData})
          </h3>
          <ExportBtns exportToCSV={exportToCSV} exportToPDF={exportToPDF} />
        </div>

        <div className="relative mb-6">
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

        {filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <Users
              className={`w-20 h-20 mx-auto mb-5 opacity-50 ${textTertiary}`}
            />
            <p className={`text-lg ${textTertiary}`}>
              {searchQuery
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
              columns={[
                {
                  key: "full_name",
                  label: t("full_name"),
                  sortable: true,
                  render: (ticket: IEventTicket) => (
                    <span className="text-sm font-medium">
                      {`${ticket.firstName} ${ticket.lastName || ""}`.trim()}
                    </span>
                  ),
                },
                {
                  key: "phone",
                  label: t("phone"),
                  render: (ticket: IEventTicket) => (
                    <span className="text-sm text-gray-500">
                      {ticket.phone || "-"}
                    </span>
                  ),
                },
                {
                  key: "email",
                  label: t("email"),
                  render: (ticket: IEventTicket) => (
                    <span className="text-sm text-gray-500">
                      {ticket.email || "-"}
                    </span>
                  ),
                },
                {
                  key: "ticket_name",
                  label: t("ticket_name"),
                  render: (ticket: IEventTicket) => (
                    <div className="flex items-center gap-2">
                      {ticket.ticketImage?.[0]?.image && (
                        <img
                          src={ticket.ticketImage[0].image}
                          alt={ticket.ticketName}
                          className="w-8 h-8 rounded object-cover shrink-0"
                        />
                      )}
                      <span className="text-sm text-gray-500">
                        {ticket.ticketName || "-"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "payment_mode",
                  label: t("payment_mode"),
                  render: (ticket: IEventTicket) => (
                    <span className="text-sm text-gray-500 capitalize">
                      {ticket.paymentMode?.join(", ") || "-"}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  label: t("amount"),
                  sortable: true,
                  render: (ticket: IEventTicket) => (
                    <span className="text-sm font-medium">
                      {ticket.amount != null ? `₪${ticket.amount}` : "-"}
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
                      isUpdating={isUpdating}
                      updatingId={updatingId}
                    />
                  ),
                },
                {
                  key: "purchased_date",
                  label: t("purchased_date"),
                  sortable: true,
                  render: (ticket: IEventTicket) =>
                    ticket.paymentDate
                      ? new Date(ticket.paymentDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "-",
                },
              ]}
            />
          </div>
        )}

        <div ref={sentinelRef} className="h-1" />

        {isLoadingTickets && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </section>
    </div>
  );
};

export default EventRegistrationDetails;
