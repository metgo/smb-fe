import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { fmtDate, fmtTime } from "../data";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface RegistrationsTabProps {
  records: IBookingRecord[];
  onResetData: () => void;
}

export function RegistrationsTab({
  records,
  onResetData,
}: RegistrationsTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, textTertiary, cardClasses, borderColor } = useThemeClasses();

  const TH = clsx(
    "text-start py-2.25 px-3 text-[11.5px] uppercase tracking-[0.04em] border-b",
    textTertiary,
    borderColor,
  );
  const TD = clsx("py-2.75 px-3 border-b align-top", borderColor);

  return (
    <div className="flex flex-col gap-4.5 max-w-220 mx-auto">
      <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
            {t("registrations_title")}
          </h3>
          <button
            className={clsx(
              "px-2.75 py-1.5 text-[12.5px] rounded-[9px] font-bold transition-[transform,filter] active:translate-y-px",
              isDark
                ? "bg-red-950/40 text-red-400 hover:bg-red-900/40"
                : "bg-red-50 text-red-600 hover:bg-red-100",
            )}
            onClick={onResetData}
          >
            {t("reset_bookings_btn")}
          </button>
        </div>
        {records.length === 0 ? (
          <p className={clsx("text-sm leading-relaxed", textTertiary)}>
            {t("no_bookings_yet")}
          </p>
        ) : (
          <div className="overflow-x-auto">
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
                {records.map((r, i) => (
                  <tr key={i}>
                    <td
                      className={clsx(
                        TD,
                        "font-[Space_Grotesk,monospace] font-semibold",
                      )}
                    >
                      {r.ref}
                    </td>
                    <td className={TD}>
                      <span
                        className={clsx(
                          "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold",
                          r.status === "ATTENDED"
                            ? isDark
                              ? "bg-green-900/60 text-green-300"
                              : "bg-green-100 text-green-700"
                            : isDark
                              ? "bg-blue-900/60 text-blue-300"
                              : "bg-blue-100 text-blue-700",
                        )}
                      >
                        {r.status === "ATTENDED"
                          ? t("status_attended")
                          : t("status_registered")}
                      </span>
                    </td>
                    <td className={TD}>{r.name}</td>
                    <td
                      className={clsx(
                        TD,
                        "flex flex-col gap-px text-[12.5px]",
                        textTertiary,
                      )}
                    >
                      <span dir="ltr">{r.email}</span>
                      <span dir="ltr">{r.phone}</span>
                    </td>
                    <td className={TD}>
                      {r.eventName}
                      {r.room ? (
                        <span className={textTertiary}> · {r.room}</span>
                      ) : null}
                    </td>
                    <td className={TD}>
                      {fmtDate(r.date, undefined, "he-IL")} · {fmtTime(r.time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
