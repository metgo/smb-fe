import { useTranslation } from "react-i18next";
import { Mail, Phone } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useUtmFormStyles } from "../hooks/useUtmFormStyles";
import type { IInfluencerContact } from "../types";
import FormField from "./FormField";
import SectionTitle from "./SectionTitle";

interface InfluencerSectionProps {
  contact: IInfluencerContact;
  onInfluencerChange: (value: string) => void;
  onContactChange: (patch: Partial<IInfluencerContact>) => void;
}

const InfluencerSection = ({
  contact,
  onInfluencerChange,
  onContactChange,
}: InfluencerSectionProps) => {
  const { t } = useTranslation("utm_campaign");
  const { inputClass, helpText } = useUtmFormStyles();

  return (
    <>
      <SectionTitle>{t("section_influencer")}</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label={t("influencer_name_label")} hint={t("optional")}>
          <Input
            value={contact.influencer}
            onChange={(e) => onInfluencerChange(e.target.value)}
            placeholder={t("influencer_name_placeholder")}
            className={inputClass}
          />
        </FormField>
        <FormField
          label={t("influencer_email_label")}
          icon={Mail}
          hint={t("optional")}
        >
          <Input
            type="email"
            value={contact.influencerEmail}
            onChange={(e) =>
              onContactChange({ influencerEmail: e.target.value })
            }
            placeholder={t("influencer_email_placeholder")}
            className={inputClass}
          />
        </FormField>
        <FormField
          label={t("influencer_phone_label")}
          icon={Phone}
          hint={t("optional")}
        >
          <Input
            type="tel"
            value={contact.influencerPhone}
            onChange={(e) =>
              onContactChange({ influencerPhone: e.target.value })
            }
            placeholder={t("influencer_phone_placeholder")}
            className={inputClass}
          />
        </FormField>
      </div>
      <p className={helpText}>{t("influencer_note")}</p>
    </>
  );
};

export default InfluencerSection;
