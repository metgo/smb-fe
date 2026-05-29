import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ScorePillProps {
  score: number;
}

// Score breakdown:
// >= 650 → High (green)
// >= 450 → Medium (yellow)
//  < 450 → Low (gray)
const ScorePill = ({ score }: ScorePillProps) => {
  const { isDark } = useThemeClasses();

  let colorClass: string;
  switch (true) {
    case score >= 650:
      colorClass = isDark
        ? "bg-green-500/20 text-green-400"
        : "bg-green-100 text-green-700";
      break;
    case score >= 450:
      colorClass = isDark
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-yellow-100 text-yellow-700";
      break;
    default:
      colorClass = isDark
        ? "bg-gray-700 text-gray-400"
        : "bg-gray-100 text-gray-600";
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-medium",
        colorClass,
      )}
    >
      {score}
    </span>
  );
};

export default ScorePill;
