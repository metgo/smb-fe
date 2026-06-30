import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface StatProps {
  label: string;
  value: string | number;
}

export function Stat({ label, value }: StatProps) {
  const { textTertiary, cardClasses } = useThemeClasses();

  return (
    <div className={clsx(cardClasses, "rounded-xl p-4 text-center")}>
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      <div className={clsx("mt-0.5 text-xs", textTertiary)}>{label}</div>
    </div>
  );
}
