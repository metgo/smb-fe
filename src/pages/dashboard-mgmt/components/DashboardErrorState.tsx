import clsx from "clsx";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Button } from "@/components/ui/button";

interface DashboardErrorStateProps {
  onRetry?: () => void;
}

export default function DashboardErrorState({
  onRetry,
}: DashboardErrorStateProps) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();

  return (
    <div
      className="flex flex-col items-center justify-center text-center py-10 px-4"
      role="alert"
    >
      <AlertTriangle
        className={clsx(
          "w-8 h-8 mb-3",
          isDark ? "text-red-400" : "text-red-500",
        )}
        aria-hidden="true"
      />
      <p
        className={clsx(
          "text-sm font-medium",
          isDark ? "text-white" : "text-gray-900",
        )}
      >
        {t("section_error_title")}
      </p>
      <p
        className={clsx(
          "text-sm mt-1",
          isDark ? "text-gray-400" : "text-gray-500",
        )}
      >
        {t("section_error_desc")}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
