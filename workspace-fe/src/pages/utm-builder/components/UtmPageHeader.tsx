import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChartLine } from "lucide-react";

import { PageHeader } from "@/components/shared";
import { useAppDispatch } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { setWebsite } from "@/features/authSlice";
import { routes } from "@/lib/routes";
import { ANALYTICS_DASHBOARD_WEBSITE_ID } from "../constants";

const UtmPageHeader = () => {
  const { t } = useTranslation("utm_campaign");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDark, textSecondary } = useThemeClasses();

  const handleNavigateToAnalyticsDashboard = () => {
    dispatch(setWebsite(ANALYTICS_DASHBOARD_WEBSITE_ID));
    navigate(routes.analyticsDashboard);
  };

  return (
    <div className={clsx("shrink-0 z-10 relative")}>
      <PageHeader
        title={t("page_title")}
        h1Gradient="text-transparent bg-gradient-to-r from-violet-500 to-purple-500"
        description={t("page_description")}
      />
      <button
        type="button"
        onClick={handleNavigateToAnalyticsDashboard}
        className={clsx(
          "absolute top-0 md:top-6 inset-e-0 inline-flex items-center gap-1.5 text-sm px-3 h-9 rounded-md border transition-colors cursor-pointer ",
          textSecondary,
          isDark
            ? "hover:bg-gray-800 text-green-500 border-green-500"
            : "hover:bg-gray-50 text-green-700 border-green-700",
        )}
      >
        <ChartLine className="w-4 h-4" />
        <span className="hidden md:block">{t("view_analytics_dashboard")}</span>
      </button>
    </div>
  );
};

export default UtmPageHeader;
