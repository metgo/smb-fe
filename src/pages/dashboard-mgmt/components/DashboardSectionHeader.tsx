import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DashboardSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function DashboardSectionHeader({
  title,
  subtitle,
  action,
}: DashboardSectionHeaderProps) {
  const { isDark } = useThemeClasses();

  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="flex-1 min-w-0">
        <h2
          className={clsx(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={clsx(
              "text-sm mt-0.5",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
