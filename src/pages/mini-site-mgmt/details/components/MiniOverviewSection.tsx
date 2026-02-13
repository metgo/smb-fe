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
          <div className="flex justify-between gap-4">
            <dt className={textSecondary}>{t("name")}</dt>
            <dd className={`font-medium ${textPrimary}`}>
              {miniSite?.name || "—"}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className={textSecondary}>{t("code")}</dt>
            <dd className={`font-medium ${textPrimary}`}>
              {miniSite?.code || "—"}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className={textSecondary}>{t("voucher_amount")}</dt>
            <dd className={`font-medium ${textPrimary}`}>
              {miniSite?.amount ? `₪${miniSite?.amount}` : "—"}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
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

      {/* Content */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50">
        <h3
          className={`text-sm mb-4 font-semibold uppercase tracking-wide ${textSecondary}`}
        >
          {t("content")}
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
    </div>
  );
}
