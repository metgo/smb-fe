import clsx from "clsx";

type SummaryCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  isDark?: boolean;
  iconColor?: string;
};

export default function TicketSummaryCard({
  icon,
  label,
  value,
  isDark,
  iconColor,
}: SummaryCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-4",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={clsx("w-5 h-5", iconColor)}>{icon}</div>

        <span
          className={clsx(
            "text-xs font-medium uppercase tracking-wide",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {label}
        </span>
      </div>

      <p
        className={clsx(
          "text-2xl font-bold",
          isDark ? "text-white" : "text-gray-900",
        )}
      >
        {value ?? 0}
      </p>
    </div>
  );
}
