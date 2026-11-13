import clsx from "clsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { BUCKET, chartTheme, type Band } from "../chartTheme";

interface HistogramBucket {
  range: string;
  from: number;
  count: number;
  band: Band;
}

interface DistributionSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  histogram: HistogramBucket[];
  limit: number;
}

const DistributionSection = ({
  t,
  histogram,
  limit,
}: DistributionSectionProps) => {
  const {
    isDark,
    cardClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();
  const { colors, axisTick, tooltipStyle, tooltipText, valueLabel } =
    chartTheme(isDark);

  const card = clsx("rounded-xl p-5 flex flex-col gap-3 min-w-0", cardClasses);
  const title = clsx("font-semibold", textPrimary);
  const sub = clsx("text-sm", textTertiary);

  return (
    <section className={clsx(card, "lg:col-span-2")}>
      <h2 className={title}>{t("insights_distribution")}</h2>
      <p className={sub}>{t("insights_distribution_desc")}</p>
      <div className="h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogram} margin={{ top: 28, right: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke={colors.grid} />
            <XAxis dataKey="range" tick={axisTick} tickLine={false} />
            <YAxis allowDecimals={false} tick={axisTick} width={40} />
            <Tooltip
              cursor={{ fill: colors.grid, opacity: 0.4 }}
              contentStyle={tooltipStyle}
              itemStyle={tooltipText}
              labelStyle={tooltipText}
              formatter={(value) => [value, t("insights_businesses")]}
            />
            <ReferenceLine
              x={
                histogram.find(
                  (b) => limit >= b.from && limit < b.from + BUCKET,
                )?.range
              }
              stroke={colors.limit}
              strokeDasharray="4 3"
              strokeWidth={2}
              label={{
                value: `${t("insights_limit")} ${limit}`,
                fill: colors.limit,
                fontSize: 12,
                position: "top",
              }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              minPointSize={(value) => (Number(value) > 0 ? 3 : 0)}
            >
              {histogram.map((b) => (
                <Cell key={b.range} fill={colors.band[b.band]} />
              ))}
              {/* count above every bar so small ranges are readable */}
              <LabelList
                dataKey="count"
                position="top"
                style={valueLabel}
                formatter={(value) => (Number(value) > 0 ? value : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        {(["low", "middle", "high"] as Band[]).map((band) => (
          <span
            key={band}
            className={clsx("flex items-center gap-2", textSecondary)}
          >
            <span
              aria-hidden="true"
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: colors.band[band] }}
            />
            {t(`band_${band}`)}
          </span>
        ))}
      </div>
      <details className={clsx("text-sm", textSecondary)}>
        <summary className="cursor-pointer">{t("insights_show_table")}</summary>
        <table className="mt-2 w-full max-w-md text-sm">
          <thead>
            <tr className={textTertiary}>
              <th className="text-start py-1">{t("insights_range")}</th>
              <th className="text-end py-1">{t("insights_businesses")}</th>
            </tr>
          </thead>
          <tbody>
            {histogram.map((b) => (
              <tr key={b.range} className={clsx("border-t", borderColor)}>
                <td className="py-1 tabular-nums">{b.range}</td>
                <td className="py-1 text-end tabular-nums">{b.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
};

export default DistributionSection;
