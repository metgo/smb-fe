import clsx from "clsx";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useRef, useState, useCallback } from "react";

import { fmtDate, fmtTime } from "../data";
import { Spinner } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useEventSessionRegListQuery } from "@/store/api/eventSessionApi";

const LIMIT = 10;

interface RegistrationsTabProps {
  wrapperId: string;
}

export function RegistrationsTab({ wrapperId }: RegistrationsTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, textTertiary, cardClasses, borderColor } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [registrations, setRegistrations] = useState<IRegistration[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPage(1);
    setRegistrations([]);
  }, [wrapperId]);

  const { data, isLoading, isFetching } = useEventSessionRegListQuery(
    wrapperId ? { wrapperId, limit: LIMIT, page } : skipToken,
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

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isFetching,
    onLoadMore: fetchNextPage,
  });

  const TH = clsx(
    "text-start py-2.25 px-3 text-[11.5px] uppercase tracking-[0.04em] border-b",
    textTertiary,
    borderColor,
  );

  const TD = clsx("py-2.75 px-3 border-b align-top", borderColor);

  return (
    <div>
      <Spinner isLoading={page === 1 && (isFetching || isLoading)} />
      <div className="flex flex-col gap-4.5">
        <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
              {t("registrations_title")}
            </h3>

            {data && (
              <div className={clsx("text-sm", textTertiary)}>
                {data?.data?.totalData} {t("registrations")}
              </div>
            )}
          </div>

          {registrations?.length === 0 ? (
            <p className={clsx("text-sm leading-relaxed", textTertiary)}>
              {t("no_bookings_yet")}
            </p>
          ) : (
            <div
              ref={scrollRef}
              className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]"
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
                  </tr>
                </thead>

                <tbody>
                  {registrations.map((registration) => (
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
                        <span dir="ltr">{registration.customerEmail}</span>

                        <span dir="ltr">{registration.customerPhone}</span>
                      </td>

                      <td className={TD}>
                        {registration.sessionName}
                        {registration.room && (
                          <span className={textTertiary}>
                            {" "}
                            · {registration.room}
                          </span>
                        )}
                      </td>

                      <td className={TD}>
                        {fmtDate(registration.slotDate, undefined, "he-IL")} ·{" "}
                        {fmtTime(registration.slotTime)}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
