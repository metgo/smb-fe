import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface FilterByStatusProps {
  filters: any;
  setFilters: (filters: any) => void;
}

const FilterByStatus = ({ filters, setFilters }: FilterByStatusProps) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  return (
    <div className="flex flex-col min-w-45">
      <label
        className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        {t("status")}
      </label>
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className={`w-full px-3 py-2 rounded-lg border ${
          isDark
            ? "bg-gray-800 border-gray-700 text-gray-200"
            : "bg-white border-gray-300 text-gray-900"
        } focus:outline-none focus:ring-2 focus:ring-teal-500`}
      >
        <option value="all">{t("all")}</option>
        <option value="DRAFT">{t("draft")}</option>
        <option value="PENDING">{t("pending")}</option>
        <option value="ARCHIVED">{t("archived")}</option>
        <option value="APPROVED">{t("approved")}</option>
        <option value="REJECTED">{t("rejected")}</option>
        <option value="CLOSED">{t("closed")}</option>
      </select>
    </div>
  );
};

export default FilterByStatus;
