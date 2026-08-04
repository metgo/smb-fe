import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReactSelect } from "@/components/form-fields";

const UNASSIGNED_VALUE = "unassigned";

interface FilterByUnassignedProps {
  label: string;
  unassignedLabel: string;
  value: "all" | "unassigned";
  onChange: (value: "all" | "unassigned") => void;
}

const FilterByUnassigned = ({
  label,
  unassignedLabel,
  value,
  onChange,
}: FilterByUnassignedProps) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="flex flex-col min-w-45">
      <label
        className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        {label}
      </label>
      <ReactSelect
        isClearable
        placeholder={label}
        value={value === UNASSIGNED_VALUE ? UNASSIGNED_VALUE : ""}
        onChange={(v) =>
          onChange(v === UNASSIGNED_VALUE ? "unassigned" : "all")
        }
        items={[{ _id: UNASSIGNED_VALUE, name: unassignedLabel }]}
        minWidth={160}
      />
    </div>
  );
};

export default FilterByUnassigned;
