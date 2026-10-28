import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { DashboardRole } from "./types/dashboard.types";
import { RoleSwitcher, DashboardLoadingState } from "./components";
import SuperadminDashboard from "./pages/SuperadminDashboard";
import DmoDashboard from "./pages/DmoDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import VendorDashboard from "./pages/VendorDashboard";

const DEMO_ROLE_STORAGE_KEY = "demo_dashboard_role";

function readStoredRole(): DashboardRole {
  try {
    const stored = sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY);
    if (
      stored === "superadmin" ||
      stored === "dmo" ||
      stored === "authority" ||
      stored === "traveller"
    ) {
      return stored;
    }
  } catch {
    // sessionStorage unavailable (e.g. privacy mode) — fall back to default.
  }
  return "superadmin";
}

export default function DashboardMgmtPage() {
  const { t } = useTranslation("dashboard_mock");
  const [role, setRole] = useState<DashboardRole>(readStoredRole);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timeout);
  }, []);

  const handleRoleChange = (nextRole: DashboardRole) => {
    setRole(nextRole);
    try {
      sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, nextRole);
    } catch {
      // ignore storage failures in the demo switcher
    }
  };

  return (
    <div className="max-w-400 mx-auto">
      <RoleSwitcher role={role} onChange={handleRoleChange} />

      {isLoading ? (
        <div className="space-y-6">
          <DashboardLoadingState count={1} variant="rows" />
          <DashboardLoadingState count={4} />
        </div>
      ) : (
        <>
          {role === "superadmin" && <SuperadminDashboard />}
          {role === "dmo" && <DmoDashboard />}
          {role === "authority" && <AuthorityDashboard />}
          {role === "traveller" && <VendorDashboard />}
        </>
      )}

      <p className="sr-only">{t("demo_dashboard_hint")}</p>
    </div>
  );
}
