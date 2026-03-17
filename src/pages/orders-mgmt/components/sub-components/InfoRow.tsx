import { useThemeClasses } from "@/hooks/useThemeClasses";

export default function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { textPrimary, textTertiary } = useThemeClasses();
  return (
    <div>
      <p className={`text-xs ${textTertiary} mb-1`}>{label}</p>
      <p className={`text-sm ${textPrimary}`}>{value}</p>
    </div>
  );
}
