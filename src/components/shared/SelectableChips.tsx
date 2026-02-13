import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";

type SelectableChipsProps = {
  label: string;
  items?: { _id: string; name: string }[];
  selectedIds: string[];
  onSelect: (id: string) => void;
};

const SelectableChips = ({
  label,
  items = [],
  selectedIds,
  onSelect,
}: SelectableChipsProps) => {
  const { textPrimary, textSecondary } = useThemeClasses();
  return (
    <div>
      <label className={`block text-sm font-medium mb-4 ${textSecondary}`}>
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {items?.map((item) => {
          const isSelected = selectedIds?.includes(item._id);

          return (
            <div
              key={item._id}
              onClick={() => onSelect(item._id)}
              className={clsx(
                "border border-teal-600 px-2.5 py-1 text-sm font-semibold rounded-3xl cursor-pointer transition-colors",
                isSelected && "bg-teal-600 text-white",
                textPrimary,
              )}
            >
              {item.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectableChips;
