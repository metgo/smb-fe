import { useRef } from "react";
import clsx from "clsx";
import { Handshake, Plus, X, ExternalLink } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import CircularProgress from "@/components/shared/CircularProgress";
import { ImageWithFallback } from "@/components/shared";

interface Props {
  partners: PartnerItem[];
  onPartnerAdd: () => void;
  onPartnerRemove: (id: string) => void;
  onPartnerChange: (
    id: string,
    field: keyof PartnerItem,
    value: string,
  ) => void;
  onLogoUpload: (id: string, file: File) => void;
  uploadProgress: Record<string, number>;
}

function PartnerCard({
  partner,
  onRemove,
  onChange,
  onLogoUpload,
  logoUploadProgress,
  inputClasses,
  borderColor,
  textPrimary,
  textSecondary,
  isDark,
  labels,
}: {
  partner: PartnerItem;
  onRemove: () => void;
  onChange: (field: keyof PartnerItem, value: string) => void;
  onLogoUpload: (file: File) => void;
  logoUploadProgress: number | undefined;
  inputClasses: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
  labels: {
    partner: string;
    name: string;
    namePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    websiteUrl: string;
    logo: string;
  };
}) {
  const logoRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 p-5 rounded-2xl border",
        borderColor,
        isDark ? "bg-gray-800/40" : "bg-gray-50",
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className={clsx("text-sm font-semibold", textPrimary)}>
          {labels.partner}
        </span>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Logo + Name row */}
      <div className="flex items-start gap-4">
        {/* Logo upload */}
        <button
          onClick={() => logoRef.current?.click()}
          disabled={logoUploadProgress !== undefined}
          className={clsx(
            "relative w-20 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center shrink-0 transition-colors overflow-hidden",
            isDark
              ? "border-gray-600 hover:border-teal-500"
              : "border-gray-300 hover:border-teal-500",
          )}
        >
          {partner.logo ? (
            <ImageWithFallback
              alt="logo"
              src={partner.logo}
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <ExternalLink className="w-5 h-5 text-gray-400" />
              <span className={clsx("text-xs mt-1", textSecondary)}>
                {labels.logo}
              </span>
            </>
          )}
          {logoUploadProgress !== undefined && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-xl">
              <CircularProgress
                progress={logoUploadProgress}
                size={44}
                strokeWidth={3}
              />
            </div>
          )}
        </button>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLogoUpload(file);
            e.target.value = "";
          }}
        />

        {/* Name */}
        <div className="flex flex-col gap-1 flex-1">
          <label className={clsx("text-xs font-medium", textSecondary)}>
            {labels.name}
          </label>
          <input
            type="text"
            value={partner.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder={labels.namePlaceholder}
            dir="auto"
            className={clsx(
              "px-3 py-2 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-teal-500/20",
              inputClasses,
            )}
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className={clsx("text-xs font-medium", textSecondary)}>
          {labels.description}
        </label>
        <textarea
          value={partner.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder={labels.descriptionPlaceholder}
          dir="auto"
          rows={3}
          className={clsx(
            "px-3 py-2 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-teal-500/20 resize-none",
            inputClasses,
          )}
        />
      </div>

      {/* Website */}
      <div className="flex flex-col gap-1">
        <label className={clsx("text-xs font-medium", textSecondary)}>
          {labels.websiteUrl}
        </label>
        <input
          type="url"
          value={partner.website}
          onChange={(e) => onChange("website", e.target.value)}
          placeholder="https://example.com"
          className={clsx(
            "px-3 py-2 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-teal-500/20",
            inputClasses,
          )}
        />
      </div>
    </div>
  );
}

export default function Step08Partners({
  partners,
  onPartnerAdd,
  onPartnerRemove,
  onPartnerChange,
  onLogoUpload,
  uploadProgress,
}: Props) {
  const { t } = useTranslation("website_settings");
  const { textPrimary, textSecondary, inputClasses, borderColor, isDark } =
    useThemeClasses();

  const partnerLabels = {
    partner: t("partner"),
    name: t("partner_name"),
    namePlaceholder: t("partner_name_placeholder"),
    description: t("partner_description"),
    descriptionPlaceholder: t("partner_description_placeholder"),
    websiteUrl: t("partner_website"),
    logo: t("partner_logo"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Handshake className="w-5 h-5 text-teal-500" />
          <h2 className={clsx("text-lg font-semibold", textPrimary)}>
            {t("partners_title")}
          </h2>
        </div>
        <button
          onClick={onPartnerAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("add_partner")}
        </button>
      </div>

      {partners.length === 0 ? (
        <button
          onClick={onPartnerAdd}
          className={clsx(
            "flex flex-col items-center justify-center gap-2 h-36 rounded-2xl border-2 border-dashed transition-colors w-full",
            isDark
              ? "border-gray-700 hover:border-teal-600"
              : "border-gray-300 hover:border-teal-500",
          )}
        >
          <Handshake className="w-6 h-6 text-gray-400" />
          <span className={clsx("text-sm", textSecondary)}>
            {t("no_partners")}
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {partners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onRemove={() => onPartnerRemove(partner.id)}
              onChange={(field, value) =>
                onPartnerChange(partner.id, field, value)
              }
              onLogoUpload={(file) => onLogoUpload(partner.id, file)}
              logoUploadProgress={uploadProgress[partner.id]}
              inputClasses={inputClasses}
              borderColor={borderColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              isDark={isDark}
              labels={partnerLabels}
            />
          ))}
        </div>
      )}
    </div>
  );
}
