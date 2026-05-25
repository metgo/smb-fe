import { useAppSelector } from "@/hooks/hooks";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FilterButtonProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

const FilterButton = ({ value, onChange }: FilterButtonProps) => {
  const { t } = useTranslation("common");
  const { theme } = useAppSelector((state) => state.settings);

  return (
    <button
      onClick={() => onChange(!value)}
      className={`px-4 py-2 rounded md:rounded-lg border transition-colors flex items-center justify-center gap-2 ${
        theme === "dark"
          ? "border-gray-700 hover:bg-gray-800 text-gray-300"
          : "border-gray-300 hover:bg-gray-100 text-gray-700"
      }`}
    >
      <Filter className="w-4 h-4" />
      <span>{t("filters")}</span>
      {value ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );
};

export default FilterButton;
