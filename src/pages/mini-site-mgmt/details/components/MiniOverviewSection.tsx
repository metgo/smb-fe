interface SectionProps {
  miniSite: any;
  t: any;
  textPrimary?: string;
  textSecondary?: string;
  borderColor: string;
}

export default function OverviewSection({
  miniSite,
  t,
  textPrimary = "text-gray-800",
  textSecondary = "text-gray-500",
}: SectionProps) {
  return (
    <div className="space-y-6">
      {/* Campaign Basics */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
        <h3
          className={`text-sm mb-4 font-semibold uppercase tracking-wide ${textSecondary}`}
        >
          {t("campaign_basics")}
        </h3>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("name")}</dt>
            <dd className={`font-medium ${textPrimary}`}>
              {miniSite?.name || "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("code")}</dt>
            <dd className={`font-medium ${textPrimary}`}>
              {miniSite?.code || "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("voucher_amount")}</dt>
            <dd className={`font-medium ${textPrimary}`}>
              {miniSite?.amount ? `₪${miniSite?.amount}` : "—"}
            </dd>
          </div>

          <div className="flex flex-col gap-4">
            <dt className={textSecondary}>{t("validity")}</dt>
            <dd className={`font-medium ${textPrimary}`}>
              {miniSite?.startDate && miniSite?.endDate
                ? `${new Date(miniSite.startDate).toLocaleDateString()} — ${new Date(
                    miniSite.endDate,
                  ).toLocaleDateString()}`
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Mini site Content */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
        <h3
          className={`text-sm mb-4 font-semibold uppercase tracking-wide ${textSecondary}`}
        >
          {t("mini_site")}
        </h3>

        <div className="space-y-5">
          <div>
            <p className={`text-sm mb-1 ${textSecondary}`}>{t("title")}</p>
            <div
              className={`prose dark:prose-invert max-w-none ${textPrimary}`}
              dangerouslySetInnerHTML={{
                __html: miniSite?.miniSite?.title || "—",
              }}
            />
          </div>

          <div>
            <p className={`text-sm mb-1 ${textSecondary}`}>{t("subtitle")}</p>
            <div
              className={`prose dark:prose-invert max-w-none ${textPrimary}`}
              dangerouslySetInnerHTML={{
                __html: miniSite?.miniSite?.subTitle || "—",
              }}
            />
          </div>

          <div>
            <p className={`text-sm mb-1 ${textSecondary}`}>{t("greeting")}</p>
            <div
              className={`prose dark:prose-invert max-w-none ${textPrimary}`}
              dangerouslySetInnerHTML={{
                __html: miniSite?.miniSite?.greeting || "—",
              }}
            />
          </div>
        </div>
      </div>

      {/* Company info */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
        <h3
          className={`text-sm mb-4 font-semibold uppercase tracking-wide ${textSecondary}`}
        >
          {t("company_info")}
        </h3>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <p className={`text-sm mb-1 ${textSecondary}`}>{t("name")}</p>
            <div
              className={`prose dark:prose-invert max-w-none ${textPrimary}`}
              dangerouslySetInnerHTML={{
                __html: miniSite?.companyInfo?.name || "—",
              }}
            />
          </div>

          {/* Contact Person */}
          <div>
            <p className={`text-sm mb-1 ${textSecondary}`}>
              {t("contact_person")}
            </p>
            <div
              className={`prose dark:prose-invert max-w-none ${textPrimary}`}
              dangerouslySetInnerHTML={{
                __html: miniSite?.companyInfo?.contactPerson || "—",
              }}
            />
          </div>

          {/* Email */}
          <div>
            <p className={`text-sm mb-1 ${textSecondary}`}>{t("email")}</p>
            <div
              className={`prose dark:prose-invert max-w-none ${textPrimary}`}
              dangerouslySetInnerHTML={{
                __html: miniSite?.companyInfo?.email || "—",
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <p className={`text-sm mb-1 ${textSecondary}`}>{t("phone")}</p>
            <div
              className={`prose dark:prose-invert max-w-none ${textPrimary}`}
            >
              {miniSite?.companyInfo?.countryCode &&
              miniSite?.companyInfo?.phoneNumber
                ? `+${miniSite.companyInfo.countryCode} ${miniSite.companyInfo.phoneNumber}`
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
