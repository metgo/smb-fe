type FilterChipsProps = {
  label: string;
  onRemove?: () => void;
  className?: string;
  removable?: boolean;
};

const FilterChips: React.FC<FilterChipsProps> = ({
  label,
  onRemove,
  className = "",
  removable = true,
}) => {
  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs capitalize">
      <span>{label}</span>

      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 text-orange-500 hover:text-orange-700 font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default FilterChips;
