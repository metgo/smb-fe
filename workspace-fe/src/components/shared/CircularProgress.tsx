interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgress({
  progress,
  size = 52,
  strokeWidth = 4,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference -
    (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-white transition-all duration-150"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-white leading-none">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
