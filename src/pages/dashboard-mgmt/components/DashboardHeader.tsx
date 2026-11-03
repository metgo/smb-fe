import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  scopeLabel?: string;
}

export default function DashboardHeader({
  title,
  subtitle,
  scopeLabel,
}: DashboardHeaderProps) {
  const { isDark } = useThemeClasses();

  return (
    <div className="mb-4">
      <h1
        className={clsx(
          "text-2xl font-bold",
          isDark ? "text-white" : "text-gray-900",
        )}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={clsx(
            "text-sm mt-1",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          {subtitle}
        </p>
      )}
      {scopeLabel && (
        <p
          className={clsx(
            "inline-flex items-center text-xs font-medium mt-2 px-2.5 py-1 rounded-full",
            isDark
              ? "bg-teal-900/40 text-teal-300"
              : "bg-teal-50 text-teal-700",
          )}
        >
          {scopeLabel}
        </p>
      )}
    </div>
  );
}
