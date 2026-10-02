import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { MEDIUM_OPTIONS, SOURCE_OPTIONS } from "../constants";
import { useUtmFormStyles } from "../hooks/useUtmFormStyles";
import type { IUtmForm } from "../types";
import FormField from "./FormField";
import SectionTitle from "./SectionTitle";

interface UtmParametersSectionProps {
  form: IUtmForm;
  onChange: (patch: Partial<IUtmForm>) => void;
  onCampaignIdChange: (value: string) => void;
}

const UtmParametersSection = ({
  form,
  onChange,
  onCampaignIdChange,
}: UtmParametersSectionProps) => {
  const { t } = useTranslation("utm_campaign");
  const { inputClass, comboClass } = useUtmFormStyles();

  return (
    <>
      <SectionTitle>{t("section_parameters")}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField label={t("source_label")} required help={t("source_help")}>
          <input
            list="utm-source-options"
            value={form.source}
            onChange={(e) => onChange({ source: e.target.value })}
            placeholder={t("source_placeholder")}
            className={comboClass}
          />
          <datalist id="utm-source-options">
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </FormField>

        <FormField label={t("medium_label")} required help={t("medium_help")}>
          <input
            list="utm-medium-options"
            value={form.medium}
            onChange={(e) => onChange({ medium: e.target.value })}
            placeholder={t("medium_placeholder")}
            className={comboClass}
          />
          <datalist id="utm-medium-options">
            {MEDIUM_OPTIONS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </FormField>

        <FormField
          label={t("campaign_name_label")}
          required
          help={t("campaign_name_help")}
        >
          <Input
            value={form.campaign}
            onChange={(e) => onChange({ campaign: e.target.value })}
            placeholder={t("campaign_name_placeholder")}
            className={inputClass}
          />
        </FormField>

        <FormField
          label={t("campaign_id_label")}
          required
          help={t("campaign_id_help")}
        >
          <Input
            value={form.campaignId}
            onChange={(e) => onCampaignIdChange(e.target.value)}
            placeholder={t("campaign_id_placeholder")}
            className={inputClass}
          />
        </FormField>

        <FormField
          label={t("term_label")}
          hint={t("optional")}
          help={t("term_help")}
        >
          <Input
            value={form.term}
            onChange={(e) => onChange({ term: e.target.value })}
            placeholder={t("term_placeholder")}
            className={inputClass}
          />
        </FormField>

        <FormField
          label={t("content_label")}
          hint={t("optional")}
          help={t("content_help")}
        >
          <Input
            value={form.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={t("content_placeholder")}
            className={inputClass}
          />
        </FormField>
      </div>
    </>
  );
};

export default UtmParametersSection;
