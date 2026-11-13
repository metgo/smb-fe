import clsx from "clsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { chartTheme } from "../chartTheme";

interface SignalsAverageSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  signals: { name: string; average: number }[];
}

const SignalsAverageSection = ({ t, signals }: SignalsAverageSectionProps) => {
  const { isDark, cardClasses, textPrimary, textTertiary } = useThemeClasses();
  const { colors, axisTick, tooltipStyle, tooltipText } = chartTheme(isDark);

  const card = clsx("rounded-xl p-5 flex flex-col gap-3 min-w-0", cardClasses);
  const title = clsx("font-semibold", textPrimary);
  const sub = clsx("text-sm", textTertiary);

  return (
    <section className={card}>
      <h2 className={title}>{t("insights_signals")}</h2>
      <p className={sub}>{t("insights_signals_desc")}</p>
      <div style={{ height: Math.max(200, signals.length * 40) }} dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={signals}
            layout="vertical"
            margin={{ left: 8, right: 32 }}
          >
            <CartesianGrid horizontal={false} stroke={colors.grid} />
            <XAxis type="number" domain={[0, 100]} tick={axisTick} />
            <YAxis
              type="category"
              dataKey="name"
              tick={axisTick}
              width={120}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: colors.grid, opacity: 0.4 }}
              contentStyle={tooltipStyle}
              itemStyle={tooltipText}
              labelStyle={tooltipText}
              formatter={(value) => [
                `${value}/100`,
                t("insights_average_mark"),
              ]}
            />
            <Bar
              dataKey="average"
              fill={colors.series1}
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
              label={{ position: "right", fill: colors.axis, fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default SignalsAverageSection;
