import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { ReactSelect } from "@/components/form-fields";

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
      <ReactSelect
        isClearable
        placeholder={t("status")}
        value={filters.status !== "all" ? filters.status : ""}
        onChange={(v) => setFilters({ ...filters, status: v || "all" })}
        items={[
          { _id: "DRAFT", name: t("draft") },
          { _id: "PENDING", name: t("pending") },
          { _id: "ARCHIVED", name: t("archived") },
          { _id: "APPROVED", name: t("approved") },
          { _id: "REJECTED", name: t("rejected") },
          { _id: "CLOSED", name: t("closed") },
        ]}
        minWidth={160}
      />
    </div>
  );
};

export default FilterByStatus;
