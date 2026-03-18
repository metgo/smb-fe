import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

const SortIcon = ({
  field,
  sortConfig,
}: {
  field: string;
  sortConfig: { field: any; direction: TSortDirection };
}) => {
  if (sortConfig.field !== field) {
    return (
      <ArrowUpDown 
        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity duration-150"
        aria-hidden
      />
    );
  }
  return sortConfig.direction === "asc" ? (
    <ArrowUp className="w-3.5 h-3.5 text-teal-500" aria-hidden />
  ) : (
    <ArrowDown className="w-3.5 h-3.5 text-teal-500" aria-hidden />
  );
};
export default SortIcon;