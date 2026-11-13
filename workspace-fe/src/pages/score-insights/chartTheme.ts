export type Band = "high" | "middle" | "low";

// bands match the score pill on the business list
export const HIGH = 650;
export const MIDDLE = 450;
export const MIN = 200;
export const MAX = 800;
export const BUCKET = 50;

export const bandOf = (score: number): Band =>
  score >= HIGH ? "high" : score >= MIDDLE ? "middle" : "low";

// ordinal blue ramp (low → high) and two categorical slots, light and dark
// steps from the reference palette
export const PALETTE = {
  light: {
    band: { low: "#86b6ef", middle: "#3987e5", high: "#184f95" },
    series1: "#2a78d6",
    series2: "#eb6834",
    grid: "#e5e7eb",
    axis: "#6b7280",
    limit: "#b45309",
  },
  dark: {
    band: { low: "#184f95", middle: "#3987e5", high: "#86b6ef" },
    series1: "#3987e5",
    series2: "#d95926",
    grid: "#374151",
    axis: "#9ca3af",
    limit: "#fbbf24",
  },
};

export const chartTheme = (isDark: boolean) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light;
  return {
    colors,
    axisTick: { fill: colors.axis, fontSize: 12 },
    tooltipStyle: {
      backgroundColor: isDark ? "#111827" : "#ffffff",
      border: `1px solid ${colors.grid}`,
      borderRadius: 8,
      color: isDark ? "#f9fafb" : "#111827",
    },
    // recharts colours tooltip rows itself; keep them readable in both themes
    tooltipText: { color: isDark ? "#f9fafb" : "#111827" },
    valueLabel: { fill: isDark ? "#e5e7eb" : "#374151", fontSize: 12 },
  };
};
