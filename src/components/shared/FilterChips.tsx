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
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full 
      bg-green-100 dark:bg-green-900 
      text-green-800 dark:text-blue-100 
      text-sm ${className}`}
    >
      <span>{label}</span>

      {removable && (
        <button
          onClick={onRemove}
          className="hover:text-red-500 transition"
          aria-label="Remove filter"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default FilterChips;
