import clsx from "clsx";

interface Row {
  label: string;
  value: string | React.ReactNode;
}

interface SectionAttributeCardProps {
  icon?: React.ReactNode;
  title?: string;
  step?: string | number;
  rows?: Row[];
  tags: string[];
  isDark?: boolean;
}

const SectionAttributeCard: React.FC<SectionAttributeCardProps> = ({
  icon,
  title,
  step,
  rows = [],
  tags,
  isDark = false,
}) => {
  return (
    <div className="section-card border rounded-none shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold">{title}</h3>
        {step && <span className="ml-auto text-sm text-gray-500">{step}</span>}
      </div>

      {/* Rows in 3-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {rows.map((row, idx) => (
          <div key={idx} className="flex flex-col">
            <span
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {row.label}
            </span>
            <span
              className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-800"}`}
            >
              {row.value || "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div>
        <span className={clsx("text-sm text-gray-400")}>Tags</span>
        {tags?.length > 0 ? (
          <div className="flex items-center flex-wrap gap-1 mt-1">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className={clsx(
                  "px-2 py-1 rounded-md flex items-center gap-2 text-sm font-medium border transition-all mt-2",
                  isDark
                    ? "bg-black text-gray-200 border-gray-800 shadow-sm"
                    : "bg-white text-gray-900 border-gray-700 shadow-sm",
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div
            className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-800"}`}
          >
            —
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionAttributeCard;
