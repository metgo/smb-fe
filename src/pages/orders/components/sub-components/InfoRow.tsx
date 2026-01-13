
export default function InfoRow({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  const textTertiary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';

  return (
    <div>
      <p className={`text-xs ${textTertiary} mb-1`}>{label}</p>
      <p className={`text-sm ${textPrimary}`}>{value}</p>
    </div>
  );
}