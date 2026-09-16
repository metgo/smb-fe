import { formatDateTime } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

interface SectionProps {
  miniSite: IMinisiteDetailsRes | undefined;
}

export default function OverviewSection({ miniSite }: SectionProps) {
  const { t } = useTranslation("minisites");

  const { language, textPrimary, textSecondary, borderColor, isDark } =
    useThemeClasses();

  const cardClass = clsx(
    "p-5 rounded-xl border",
    borderColor,
    isDark ? "bg-gray-900/50" : "bg-white",
  );

  return (
    <div className="space-y-6">
      {/* Campaign Basics */}
      <div className={cardClass}>
        <h3
          className={clsx(
            "text-sm mb-4 font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("campaign_basics")}
        </h3>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("name")}</dt>
            <dd className={clsx("font-medium", textPrimary)}>
              {miniSite?.name || "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("code")}</dt>
            <dd className={clsx("font-medium", textPrimary)}>
              {miniSite?.code || "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("voucher_amount")}</dt>
            <dd className={clsx("font-medium", textPrimary)}>
              {miniSite?.miniSite.amount
                ? `₪${miniSite?.miniSite.amount}`
                : "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("total_vouchers")}</dt>
            <dd className={clsx("font-medium", textPrimary)}>
              {miniSite?.miniSite.quantity ? miniSite?.miniSite.quantity : "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("validity")}</dt>
            <dd className={clsx("font-medium", textPrimary)}>
              {miniSite?.startDate && miniSite?.endDate
                ? `${formatDateTime(miniSite.startDate, language)} — ${formatDateTime(miniSite.endDate, language)}`
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Mini site Content */}
      <div className={cardClass}>
        <h3
          className={clsx(
            "text-sm mb-4 font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("mini_site")}
        </h3>

        <div className="space-y-5">
          <div>
            <p className={clsx("text-sm mb-1", textSecondary)}>{t("title")}</p>
            <div
              className={clsx(
                "prose dark:prose-invert max-w-none",
                textPrimary,
              )}
              dangerouslySetInnerHTML={{
                __html: miniSite?.miniSite?.title || "—",
              }}
            />
          </div>

          <div>
            <p className={clsx("text-sm mb-1", textSecondary)}>
              {t("subtitle")}
            </p>
            <div
              className={clsx(
                "prose dark:prose-invert max-w-none",
                textPrimary,
              )}
              dangerouslySetInnerHTML={{
                __html: miniSite?.miniSite?.subTitle || "—",
              }}
            />
          </div>

          <div>
            <p className={clsx("text-sm mb-1", textSecondary)}>
              {t("greeting")}
            </p>
            <div
              className={clsx(
                "prose dark:prose-invert max-w-none",
                textPrimary,
              )}
              dangerouslySetInnerHTML={{
                __html: miniSite?.miniSite?.greeting || "—",
              }}
            />
          </div>
        </div>
      </div>

      {/* Company info */}
      <div className={cardClass}>
        <h3
          className={clsx(
            "text-sm mb-4 font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("company_info")}
        </h3>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <p className={clsx("text-sm mb-1", textSecondary)}>{t("name")}</p>
            <div
              className={clsx(
                "prose dark:prose-invert max-w-none",
                textPrimary,
              )}
              dangerouslySetInnerHTML={{
                __html: miniSite?.companyInfo?.name || "—",
              }}
            />
          </div>

          {/* Contact Person */}
          <div>
            <p className={clsx("text-sm mb-1", textSecondary)}>
              {t("contact_person")}
            </p>
            <div
              className={clsx(
                "prose dark:prose-invert max-w-none",
                textPrimary,
              )}
              dangerouslySetInnerHTML={{
                __html: miniSite?.companyInfo?.contactPerson || "—",
              }}
            />
          </div>

          {/* Email */}
          <div>
            <p className={clsx("text-sm mb-1", textSecondary)}>{t("email")}</p>
            <div
              className={clsx(
                "prose dark:prose-invert max-w-none",
                textPrimary,
              )}
              dangerouslySetInnerHTML={{
                __html: miniSite?.companyInfo?.email || "—",
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <p className={clsx("text-sm mb-1", textSecondary)}>{t("phone")}</p>
            <div
              className={clsx(
                "prose dark:prose-invert max-w-none",
                textPrimary,
              )}
            >
              {miniSite?.companyInfo?.phoneNumber
                ? `${miniSite.companyInfo.phoneNumber}`
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
