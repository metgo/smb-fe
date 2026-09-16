import clsx from "clsx";
import { toast } from "sonner";
import { Loader, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useRef, useState, useCallback } from "react";

import { fmtDate, fmtTime } from "../data";
import DatePicker from "@/components/shared/DatePicker";
import SearchInput from "@/components/shared/SearchInput";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  useEventSessionRegListQuery,
  useResendSessionBookNotifyMutation,
} from "@/store/api/eventSessionApi";

const LIMIT = 400;
const SKELETON_ROWS = 12;
const SKELETON_COLS = 7;

interface RegistrationsTabProps {
  wrapperId: string | null;
}

export function RegistrationsTab({ wrapperId }: RegistrationsTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, textTertiary, cardClasses, borderColor } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [registrations, setRegistrations] = useState<IRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [resendSessionBookNotify] = useResendSessionBookNotifyMutation();

  useEffect(() => {
    setPage(1);
    setRegistrations([]);
  }, [wrapperId]);

  useEffect(() => {
    setPage(1);
    setRegistrations([]);
  }, [searchTerm, selectedDate]);

  const { data, isLoading, isFetching } = useEventSessionRegListQuery(
    wrapperId
      ? {
          wrapperId,
          limit: LIMIT,
          page,
          search: searchTerm,
          date: selectedDate,
        }
      : skipToken,
  );

  useEffect(() => {
    if (!data?.data.registrations.length) {
      if (page === 1) setRegistrations([]);
      return;
    }
    setRegistrations((prev) => {
      if (page === 1) return data.data.registrations;
      const existingIds = new Set(prev.map((r) => r.bookingId));
      const newItems = data.data.registrations.filter(
        (r) => !existingIds.has(r.bookingId),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [data, page]);

  const hasMore = !!data?.data.meta.hasNextPage;

  const isFetchingRef = useRef(isFetching);
  isFetchingRef.current = isFetching;

  const fetchNextPage = useCallback(() => {
    if (isFetchingRef.current) return;
    setPage((prev) => prev + 1);
  }, []);

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isFetching,
    onLoadMore: fetchNextPage,
  });

  async function handleResendNotify(registration: IRegistration) {
    setResendingId(registration.bookingId);
    try {
      await resendSessionBookNotify(registration.bookingId).unwrap();
      toast.success(t("toast_notification_sent"));
    } catch {
      toast.error(t("toast_notification_send_error"));
    } finally {
      setResendingId(null);
    }
  }

  const TH = clsx(
    "text-start py-2.25 px-3 text-[11.5px] uppercase tracking-[0.04em] border-b",
    textTertiary,
    borderColor,
  );

  const TD = clsx("py-2.75 px-3 border-b align-top", borderColor);

  const isInitialLoading = page === 1 && (isFetching || isLoading);

  return (
    <div>
      <div className="flex flex-col gap-4.5">
        <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
          <div className=" mb-3.5">
            <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
              {t("registrations_title")}({data?.data.totalData})
            </h3>
          </div>

          <div className="flex items-center gap-3 mb-3.5">
            <div className="flex-1">
              <SearchInput
                placeholder={t("search_registrations")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <DatePicker value={selectedDate} onChange={setSelectedDate} />
          </div>

          {!isInitialLoading && registrations?.length === 0 ? (
            <p className={clsx("text-sm leading-relaxed", textTertiary)}>
              {t("no_bookings_yet")}
            </p>
          ) : (
            <div
              ref={scrollRef}
              className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-480px)]"
            >
              <table className="w-full border-collapse text-[13.5px] [&>tbody>tr:last-child>td]:border-b-0">
                <thead>
                  <tr>
                    <th className={TH}>{t("col_ref")}</th>
                    <th className={TH}>{t("col_status")}</th>
                    <th className={TH}>{t("col_name")}</th>
                    <th className={TH}>{t("col_contact")}</th>
                    <th className={TH}>{t("col_session")}</th>
                    <th className={TH}>{t("col_when")}</th>
                    <th className={TH}>{t("col_actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {isInitialLoading
                    ? Array.from({ length: SKELETON_ROWS }).map((_, row) => (
                        <tr key={row} className="animate-pulse">
                          {Array.from({ length: SKELETON_COLS + 1 }).map(
                            (_, col) => (
                              <td key={col} className={TD}>
                                <div
                                  className={clsx(
                                    "h-4 rounded",
                                    isDark ? "bg-gray-700" : "bg-gray-200",
                                  )}
                                  style={{
                                    width: `${55 + Math.random() * 35}%`,
                                  }}
                                />
                              </td>
                            ),
                          )}
                        </tr>
                      ))
                    : registrations.map((registration) => (
                        <tr key={registration.bookingId}>
                          <td
                            className={clsx(
                              TD,
                              "font-[Space_Grotesk,monospace] font-semibold",
                            )}
                          >
                            {registration.bookingReference}
                          </td>

                          <td className={TD}>
                            <span
                              className={clsx(
                                "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold",
                                registration.status === "ATTENDED"
                                  ? isDark
                                    ? "bg-green-900/60 text-green-300"
                                    : "bg-green-100 text-green-700"
                                  : isDark
                                    ? "bg-blue-900/60 text-blue-300"
                                    : "bg-blue-100 text-blue-700",
                              )}
                            >
                              {registration.status === "ATTENDED"
                                ? t("status_attended")
                                : t("status_registered")}
                            </span>
                          </td>

                          <td className={TD}>{registration.customerName}</td>

                          <td
                            className={clsx(
                              TD,
                              "flex flex-col gap-px text-[12.5px]",
                              textTertiary,
                            )}
                          >
                            <span>{registration.customerEmail}</span>
                            <span>{registration.customerPhone}</span>
                          </td>

                          <td className={TD}>
                            {registration.sessionName}
                            {registration?.room !== "N/A" && (
                              <span className={textTertiary}>
                                {" "}
                                · {registration.room}
                              </span>
                            )}
                          </td>

                          <td className={TD}>
                            {fmtDate(registration.slotDate, undefined, "he-IL")}{" "}
                            · {fmtTime(registration.slotTime)}
                          </td>

                          <td className={TD}>
                            <button
                              type="button"
                              title={t("resend_action")}
                              aria-label={t("resend_action")}
                              disabled={
                                resendingId === registration.bookingId ||
                                registration.status === "ATTENDED"
                              }
                              onClick={() => handleResendNotify(registration)}
                              className={clsx(
                                "p-1.5 rounded-lg bg-green-100 hover:bg-green-300  text-green-400 hover:text-white disabled:opacity-50",
                                resendingId === registration.bookingId ||
                                  registration.status === "ATTENDED"
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer",
                              )}
                            >
                              {resendingId === registration.bookingId ? (
                                <Loader
                                  className={clsx(
                                    "w-4 h-4 animate-spin text-green-600",
                                  )}
                                />
                              ) : (
                                <Mail className={clsx("w-4 h-4")} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>

              {page > 1 && isFetching && (
                <div className="flex items-center justify-center py-4">
                  <Loader
                    className={clsx("w-5 h-5 animate-spin", textTertiary)}
                  />
                </div>
              )}

              {!isInitialLoading &&
                !isFetching &&
                !hasMore &&
                registrations.length > 0 && (
                  <div
                    className={clsx(
                      "flex items-center justify-center py-4 text-xs",
                      textTertiary,
                    )}
                  >
                    {t("no_more_registrations")}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
