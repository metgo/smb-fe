import clsx from "clsx";
import { Settings } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import SiteSettingsWizard from "./components/SiteSettingsWizard";

export default function WebsiteMgmtPage() {
  const { textPrimary, textSecondary } = useThemeClasses();

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 mx-auto w-full h-full">
      {/* Page Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
          <Settings className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className={clsx("text-xl font-bold", textPrimary)}>
            Website Settings
          </h1>
          <p className={clsx("text-sm", textSecondary)}>
            Manage branding, SEO, integrations, and all global site
            configuration
          </p>
        </div>
      </div>

      {/* Wizard — fills remaining height */}
      <div className="flex-1 min-h-0">
        <SiteSettingsWizard />
      </div>
    </div>
  );
}
