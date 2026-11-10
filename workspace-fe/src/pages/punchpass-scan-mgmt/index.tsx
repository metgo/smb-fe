import clsx from "clsx";
import { ScanLine } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { PunchPassScannerContent } from "../punchpass-mgmt/components";

export default function PunchPassScanMgmtPage() {
  const { t } = useTranslation("punch_pass");
  const { isDark } = useThemeClasses();

  return (
    <div className="relative flex flex-col pt-4 md:pt-0 gap-3 isolate overflow-hidden rounded-3xl">
      {/* Decorative background */}
      <div
        className={clsx(
          "absolute inset-0 -z-10 rounded-3xl",
          isDark
            ? "bg-linear-to-br from-teal-950 via-gray-950 to-cyan-950"
            : "bg-linear-to-br from-teal-50 via-white to-cyan-50",
        )}
      />
      <div className="absolute -top-24 -right-24 -z-10 w-72 h-72 rounded-full bg-teal-400/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 -z-10 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -z-10 w-56 h-56 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      <div
        className={clsx(
          "sticky top-14 md:top-20 z-30 py-3 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex items-center gap-3",
          isDark
            ? "bg-gray-950/80 border-gray-800/90 shadow-black/40 text-gray-100"
            : "bg-white/80 border-gray-200/90 shadow-gray-200/40 text-gray-900",
        )}
      >
        <ScanLine className="w-5 h-5 text-teal-500" />
        <h1 className="text-lg font-semibold">{t("scan_punch_pass")}</h1>
      </div>

      <div className="flex-1 flex items-start justify-center px-3 pb-6">
        <div
          className={clsx(
            "py-4 px-3 md:px-4 rounded-2xl border shadow-xl backdrop-blur-md max-w-md w-full",
            isDark
              ? "bg-gray-900/80 border-gray-800/90"
              : "bg-white/90 border-gray-200",
          )}
        >
          <PunchPassScannerContent />
        </div>
      </div>
    </div>
  );
}
