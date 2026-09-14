import {
  FileText,
  Image as ImageIcon,
  Building2,
  Landmark,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllDmosQuery } from "@/store/api/websiteConfigApi";

interface CampaignReviewProps {
  formData: {
    name: string;
    code: string;
    description: string;
    slogan: string;
    status: "ACTIVE" | "INACTIVE" | "DRAFT";
    type: "CASH_IN" | "CASH_BACK";
    startDate: string;
    endDate: string;
    imagePath: string;
    dmoIds: string[];
    authorityIds: string[];
    rewardAmount: string;
    rewardVoucherLimit: string;
  };
  onGoToStep: (step: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-red-100 text-red-700",
  DRAFT: "bg-amber-100 text-amber-700",
};

const TYPE_COLORS: Record<string, string> = {
  CASH_IN: "bg-blue-100 text-blue-700",
  CASH_BACK: "bg-purple-100 text-purple-700",
};

export default function CampaignReview({
  formData,
  onGoToStep,
}: CampaignReviewProps) {
  const { t } = useTranslation("campaign");
  const { textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();
  const { data: dmos } = useGetAllDmosQuery();
  const { dmosAuthorities } = useCommon();

  const selectedDmoNames = (dmos ?? [])
    .filter((d) => formData.dmoIds.includes(d._id))
    .map((d) => d.name);

  const selectedAuthorityNames = (dmosAuthorities ?? [])
    .flatMap((dmo) => dmo.authorities ?? [])
    .filter((a: any) => formData.authorityIds.includes(a._id))
    .map((a: any) => a.name);

  const Row = ({
    label,
    value,
    empty,
  }: {
    label: string;
    value?: string;
    empty?: boolean;
  }) => (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className={clsx("text-xs shrink-0", textTertiary)}>{label}</span>
      <span
        className={clsx(
          "text-xs text-right",
          empty
            ? isDark
              ? "text-gray-600 italic"
              : "text-gray-400 italic"
            : isDark
              ? "text-gray-200 font-medium"
              : "text-gray-800 font-medium",
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  );

  const Section = ({
    title,
    icon: Icon,
    step,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    step: number;
    children: React.ReactNode;
  }) => (
    <div className={clsx("rounded-xl border overflow-hidden", borderColor)}>
      <div
        className={clsx(
          "flex items-center justify-between px-4 py-3 border-b",
          borderColor,
          isDark ? "bg-gray-800/50" : "bg-gray-50",
        )}
      >
        <div className="flex items-center gap-2">
          <Icon
            className={clsx(
              "w-4 h-4",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          />
          <span className={clsx("text-sm font-medium", textSecondary)}>
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onGoToStep(step)}
          className="text-xs text-teal-500 hover:text-teal-400 cursor-pointer"
        >
          {t("review_edit")}
        </button>
      </div>
      <div className="px-4 divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );

  const hasImage = !!formData.imagePath;
  const hasRewards = !!formData.rewardAmount || !!formData.rewardVoucherLimit;

  return (
    <div className="space-y-4">
      <div
        className={clsx(
          "flex items-center gap-2 rounded-xl p-3",
          isDark
            ? "bg-teal-900/20 border border-teal-800"
            : "bg-teal-50 border border-teal-200",
        )}
      >
        <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
        <p className="text-xs text-teal-600 dark:text-teal-400">
          {t("review_hint")}
        </p>
      </div>

      {/* Basic Info */}
      <Section title={t("basic_information")} icon={FileText} step={1}>
        <Row
          label={t("field_name")}
          value={formData.name || undefined}
          empty={!formData.name}
        />
        <Row
          label={t("field_code")}
          value={formData.code || undefined}
          empty={!formData.code}
        />
        <Row
          label={t("field_description")}
          value={formData.description || undefined}
          empty={!formData.description}
        />
        <Row
          label={t("field_slogan")}
          value={formData.slogan || undefined}
          empty={!formData.slogan}
        />
        <div className="flex items-start justify-between gap-3 py-2">
          <span className={clsx("text-xs shrink-0", textTertiary)}>
            {t("field_type")}
          </span>
          <span
            className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              TYPE_COLORS[formData.type] ?? "bg-gray-100 text-gray-600",
            )}
          >
            {formData.type === "CASH_IN" ? t("cash_in") : t("cash_back")}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3 py-2">
          <span className={clsx("text-xs shrink-0", textTertiary)}>
            {t("field_status")}
          </span>
          <span
            className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              STATUS_COLORS[formData.status] ?? "bg-gray-100 text-gray-600",
            )}
          >
            {formData.status === "ACTIVE"
              ? t("status_active")
              : formData.status === "INACTIVE"
                ? t("status_inactive")
                : t("status_draft")}
          </span>
        </div>
        <Row
          label={t("field_start_date")}
          value={formData.startDate || undefined}
          empty={!formData.startDate}
        />
        <Row
          label={t("field_end_date")}
          value={formData.endDate || undefined}
          empty={!formData.endDate}
        />
      </Section>

      {/* Media */}
      <Section title={t("campaign_image")} icon={ImageIcon} step={2}>
        {hasImage ? (
          <div className="py-3">
            <img
              src={formData.imagePath}
              alt={t("campaign_image")}
              className="w-full max-h-32 object-contain rounded-lg"
            />
          </div>
        ) : (
          <Row label={t("field_image")} value={t("no_image_uploaded")} empty />
        )}
      </Section>

      {/* DMOs */}
      <Section title={t("step_dmo_selection")} icon={Building2} step={3}>
        {selectedDmoNames.length > 0 ? (
          <div className="py-2 flex flex-wrap gap-1.5">
            {selectedDmoNames.map((name) => (
              <span
                key={name}
                className={clsx(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  isDark
                    ? "bg-teal-900/40 text-teal-400"
                    : "bg-teal-50 text-teal-700 border border-teal-200",
                )}
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <Row label={t("field_dmos")} value={t("none_selected")} empty />
        )}
      </Section>

      {/* Authorities */}
      <Section title={t("step_authority_selection")} icon={Landmark} step={4}>
        {selectedAuthorityNames.length > 0 ? (
          <div className="py-2 flex flex-wrap gap-1.5">
            {selectedAuthorityNames.map((name) => (
              <span
                key={name}
                className={clsx(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  isDark
                    ? "bg-teal-900/40 text-teal-400"
                    : "bg-teal-50 text-teal-700 border border-teal-200",
                )}
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <Row
            label={t("field_authorities")}
            value={t("none_selected")}
            empty
          />
        )}
      </Section>

      {/* Reward */}
      <Section title={t("step_rewards")} icon={DollarSign} step={5}>
        {hasRewards ? (
          <>
            {formData.rewardAmount && (
              <Row
                label={t("field_reward_amount")}
                value={`₪${formData.rewardAmount}`}
              />
            )}
            {formData.rewardVoucherLimit && (
              <Row
                label={t("field_voucher_limit")}
                value={formData.rewardVoucherLimit}
              />
            )}
          </>
        ) : (
          <Row label={t("field_rewards")} value={t("not_configured")} empty />
        )}
      </Section>
    </div>
  );
}
