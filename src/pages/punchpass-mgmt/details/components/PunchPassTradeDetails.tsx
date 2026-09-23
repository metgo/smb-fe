import clsx from "clsx";
import { ArrowLeftRight } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PunchPassTradeDetailsProps {
  t: (key: string) => string;
  punchPassId: string;
}

// TODO: fetch and list trades for `punchPassId` once the trades API is available.
const PunchPassTradeDetails: React.FC<PunchPassTradeDetailsProps> = ({ t }) => {
  const { isDark, textTertiary } = useThemeClasses();

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 md:p-6",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      <h3
        className={clsx(
          "text-xs md:text-sm font-semibold uppercase tracking-wide mb-2 md:mb-4",
          isDark ? "text-gray-400" : "text-gray-600",
        )}
      >
        {t("trades")}
      </h3>

      <div className="text-center py-10">
        <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className={clsx("text-sm", textTertiary)}>
          {t("trades_coming_soon")}
        </p>
      </div>
    </div>
  );
};

export default PunchPassTradeDetails;
