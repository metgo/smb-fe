import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PromoEmptyStateProps {
  setShowWizard: (show: boolean) => void;
  setEditingPromotion: (value: undefined | IPromotionsRes) => void;
}

const PromoEmptyState = ({
  setShowWizard,
  setEditingPromotion,
}: PromoEmptyStateProps) => {
  const { t } = useTranslation("promotions");
  const { isDark, textPrimary, textSecondary } = useThemeClasses();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 opacity-60"
      >
        {/* Megaphone body */}
        <rect
          x="20"
          y="58"
          width="36"
          height="44"
          rx="6"
          fill={isDark ? "#374151" : "#e5e7eb"}
        />
        <path
          d="M56 62 L108 34 L108 126 L56 98 Z"
          fill={isDark ? "#4b5563" : "#d1d5db"}
        />
        {/* Bell mouth */}
        <ellipse
          cx="108"
          cy="80"
          rx="16"
          ry="46"
          fill={isDark ? "#6b7280" : "#9ca3af"}
        />
        {/* Sound waves */}
        <path
          d="M128 56 Q142 68 142 80 Q142 92 128 104"
          stroke={isDark ? "#22c55e" : "#16a34a"}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M134 46 Q152 62 152 80 Q152 98 134 114"
          stroke={isDark ? "#22c55e" : "#16a34a"}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        {/* Handle / cord */}
        <path
          d="M38 102 Q38 120 52 120 Q66 120 66 102"
          stroke={isDark ? "#4b5563" : "#9ca3af"}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Star sparkle top-right */}
        <path
          d="M130 24 L132 30 L138 32 L132 34 L130 40 L128 34 L122 32 L128 30 Z"
          fill={isDark ? "#22c55e" : "#16a34a"}
          opacity="0.7"
        />
        {/* Dot sparkles */}
        <circle
          cx="26"
          cy="44"
          r="3"
          fill={isDark ? "#22c55e" : "#16a34a"}
          opacity="0.5"
        />
        <circle
          cx="148"
          cy="44"
          r="2.5"
          fill={isDark ? "#22c55e" : "#16a34a"}
          opacity="0.4"
        />
        <circle
          cx="14"
          cy="90"
          r="2"
          fill={isDark ? "#4b5563" : "#9ca3af"}
          opacity="0.5"
        />
      </svg>

      <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>
        {t("no_promotions_title")}
      </h3>

      <p className={`text-sm ${textSecondary} mb-6`}>
        {t("no_promotions_description")}
      </p>

      <button
        onClick={() => {
          setEditingPromotion(undefined);
          setShowWizard(true);
        }}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        <Plus className="w-5 h-5" />
        {t("add_first_promotion")}
      </button>
    </div>
  );
};

export default PromoEmptyState;
