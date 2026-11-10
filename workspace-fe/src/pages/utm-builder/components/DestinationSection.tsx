import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

import { WebsiteSelect } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { useUtmFormStyles } from "../hooks/useUtmFormStyles";
import FormField from "./FormField";
import SectionTitle from "./SectionTitle";

interface DestinationSectionProps {
  websites: TAllWebsites | undefined;
  selectedWebsiteId: string;
  onWebsiteSelect: (websiteId: string) => void;
  baseUrl: string;
  onBaseUrlChange: (value: string) => void;
}

const DestinationSection = ({
  websites,
  selectedWebsiteId,
  onWebsiteSelect,
  baseUrl,
  onBaseUrlChange,
}: DestinationSectionProps) => {
  const { t } = useTranslation("utm_campaign");
  const { inputClass } = useUtmFormStyles();

  return (
    <>
      <SectionTitle>{t("section_destination")}</SectionTitle>

      <div className="mb-2 space-y-4 grid grid-cols-2 gap-4">
        {!!(websites ?? []).length && (
          <FormField
            label={t("website_label")}
            icon={Globe}
            hint={t("website_hint")}
          >
            <WebsiteSelect
              websites={websites}
              value={selectedWebsiteId}
              onChange={onWebsiteSelect}
              isClearable
              placeholder={t("website_placeholder")}
            />
          </FormField>
        )}

        <FormField label={t("destination_url_label")} required>
          <Input
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder={t("destination_url_placeholder")}
            className={inputClass}
          />
        </FormField>
      </div>
    </>
  );
};

export default DestinationSection;
