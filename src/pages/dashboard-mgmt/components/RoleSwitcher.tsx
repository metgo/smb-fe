import clsx from "clsx";
import { FlaskConical } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { DashboardRole } from "../types/dashboard.types";

interface RoleSwitcherProps {
  role: DashboardRole;
  onChange: (role: DashboardRole) => void;
}

const ROLES: DashboardRole[] = ["superadmin", "dmo", "authority", "traveller"];

/**
 * Dev-only control to preview all four role dashboards locally. This never
 * reads from or writes to the real auth/role state — it only drives which
 * mock dashboard is rendered on this page.
 */
export default function RoleSwitcher({ role, onChange }: RoleSwitcherProps) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-2 rounded-lg border p-2 mb-4",
        isDark
          ? "bg-amber-950/20 border-amber-900/50"
          : "bg-amber-50 border-amber-200",
      )}
    >
      <span
        className={clsx(
          "flex items-center gap-1.5 text-xs font-semibold shrink-0",
          isDark ? "text-amber-400" : "text-amber-700",
        )}
      >
        <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
        {t("demo_role_switcher")}
      </span>

      <div
        className="flex gap-1.5"
        role="tablist"
        aria-label={t("demo_role_switcher")}
      >
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={role === r}
            onClick={() => onChange(r)}
            className={clsx(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
              role === r
                ? "bg-amber-600 text-white"
                : isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-amber-200",
            )}
          >
            {t(`role_${r}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
