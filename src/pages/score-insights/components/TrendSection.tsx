import clsx from "clsx";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { chartTheme, MAX, MIN } from "../chartTheme";

interface TrendSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  days: number;
  setDays: (days: number) => void;
  trend: { label: string; average: number; median: number }[];
  limit: number;
}

const TrendSection = ({
  t,
  days,
  setDays,
  trend,
  limit,
}: TrendSectionProps) => {
  const {
    isDark,
    cardClasses,
    inputClasses,
    textPrimary,
    textSecondary,
    textTertiary,
  } = useThemeClasses();
  const { colors, axisTick, tooltipStyle, tooltipText } = chartTheme(isDark);

  const card = clsx("rounded-xl p-5 flex flex-col gap-3 min-w-0", cardClasses);
  const title = clsx("font-semibold", textPrimary);
  const sub = clsx("text-sm", textTertiary);

  return (
    <section className={clsx(card, "lg:col-span-2")}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[14rem]">
          <h2 className={title}>{t("insights_trend")}</h2>
          <p className={sub}>{t("insights_trend_desc")}</p>
        </div>
        <label
          htmlFor="trend-days"
          className={clsx("flex items-center gap-2 text-sm", textSecondary)}
        >
          {t("insights_period")}
          <select
            id="trend-days"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={clsx("px-2 py-1.5 rounded-md border", inputClasses)}
          >
            {[30, 90, 180, 365].map((d) => (
              <option key={d} value={d}>
                {t("insights_days", { days: d })}
              </option>
            ))}
          </select>
        </label>
      </div>
      {trend.length < 2 ? (
        <p className={clsx("text-sm py-10 text-center", textTertiary)}>
          {t("insights_trend_empty")}
        </p>
      ) : (
        <div className="h-72" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 16, left: 0 }}>
              <CartesianGrid vertical={false} stroke={colors.grid} />
              <XAxis
                dataKey="label"
                tick={axisTick}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis domain={[MIN, MAX]} tick={axisTick} width={40} />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipText}
                labelStyle={tooltipText}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <ReferenceLine
                y={limit}
                stroke={colors.limit}
                strokeDasharray="4 3"
              />
              <Line
                type="monotone"
                dataKey="average"
                name={t("insights_average")}
                stroke={colors.series1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="median"
                name={t("median")}
                stroke={colors.series2}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default TrendSection;
