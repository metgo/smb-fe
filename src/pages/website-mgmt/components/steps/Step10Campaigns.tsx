import clsx from "clsx";
import { Check, Megaphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Step10CampaignsProps {
  campaigns: ICampaignRes[];
  formData: ISiteSettingsFormData;
  onChange: (
    field: keyof ISiteSettingsFormData,
    value: string | string[],
  ) => void;
}

const Step10Campaigns = ({
  campaigns,
  formData,
  onChange,
}: Step10CampaignsProps) => {
  const { t } = useTranslation("website_settings");
  const { textPrimary, textSecondary, cardClasses, borderColor, isDark } =
    useThemeClasses();

  const toggleCampId = (id: string) => {
    const next = formData.campIds.includes(id)
      ? formData.campIds.filter((c) => c !== id)
      : [...formData.campIds, id];
    onChange("campIds", next);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Primary Campaign ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-teal-500" />
          <h3 className={clsx("text-sm font-semibold", textPrimary)}>
            {t("campaigns_primary_title")}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {campaigns.map((camp) => {
            const selected = formData.primaryCampId === camp._id;
            return (
              <button
                key={camp._id}
                type="button"
                onClick={() =>
                  onChange("primaryCampId", selected ? "" : camp._id)
                }
                className={clsx(
                  "relative rounded-xl overflow-hidden text-left transition-all duration-150 focus:outline-none",
                  cardClasses,
                  selected
                    ? "ring-2 ring-teal-500 shadow-lg shadow-teal-500/20"
                    : clsx(
                        "ring-1 hover:ring-2 hover:ring-teal-400/60",
                        borderColor,
                      ),
                )}
              >
                {/* Body */}
                <div className="p-3 space-y-1">
                  <p
                    className={clsx(
                      "text-xs font-semibold truncate",
                      textPrimary,
                    )}
                  >
                    {camp.name}
                  </p>
                  <span
                    className={clsx(
                      "inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                      isDark
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {camp.type}
                  </span>
                </div>

                {/* Selected badge */}
                {selected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* divider */}
      <div className={clsx("border-t", borderColor)} />

      {/* ── Campaigns (multi) ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-teal-500" />
          <h3 className={clsx("text-sm font-semibold", textPrimary)}>
            {t("campaigns_title")}
          </h3>
          <span className={clsx("text-xs", textSecondary)}>
            {formData.campIds.length > 0 &&
              `(${formData.campIds.length} ${t("selected")})`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {campaigns.map((camp) => {
            const selected = formData.campIds.includes(camp._id);
            return (
              <button
                key={camp._id}
                type="button"
                onClick={() => toggleCampId(camp._id)}
                className={clsx(
                  "relative rounded-xl overflow-hidden text-left transition-all duration-150 focus:outline-none",
                  cardClasses,
                  selected
                    ? "ring-2 ring-teal-500 shadow-lg shadow-teal-500/20"
                    : clsx(
                        "ring-1 hover:ring-2 hover:ring-teal-400/60",
                        borderColor,
                      ),
                )}
              >
                {/* Body */}
                <div className="p-3 space-y-1">
                  <p
                    className={clsx(
                      "text-xs font-semibold truncate",
                      textPrimary,
                    )}
                  >
                    {camp.name}
                  </p>
                  <span
                    className={clsx(
                      "inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                      isDark
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {camp.type}
                  </span>
                </div>

                {/* Selected badge */}
                {selected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Step10Campaigns;
