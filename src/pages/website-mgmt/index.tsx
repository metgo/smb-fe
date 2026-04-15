import clsx from "clsx";
import { useState } from "react";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/hooks/hooks";
import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import SiteSettingsWizard from "./components/SiteSettingsWizard";

export default function WebsiteMgmtPage() {
  const { t } = useTranslation("website_settings");
  const { textPrimary, textSecondary } = useThemeClasses();
  const { associatedWebsite } = useAppSelector((state) => state.auth);

  const [externalApiId, setExternalApiId] = useState<string>("");

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 mx-auto w-full h-full">
      {/* Page Header */}
      <section className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
            <Settings className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className={clsx("text-xl font-bold", textPrimary)}>
              {t("page_title")}
            </h1>
            <p className={clsx("text-sm", textSecondary)}>
              {t("page_subtitle")}
            </p>
          </div>
        </div>
        <ReactSelect
          minWidth={180}
          value={externalApiId}
          items={associatedWebsite}
          onChange={(value) => setExternalApiId(value)}
          placeholder={t("select_website")}
        />
      </section>

      {/* Wizard — fills remaining height */}
      <div className="flex-1 min-h-0">
        <SiteSettingsWizard externalApiId={externalApiId} />
      </div>
    </div>
  );
}
