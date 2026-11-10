import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IScoreGroup } from "@/store/api/businessScoreApi";
import { chartTheme, type Band } from "../chartTheme";

export type GroupRow = IScoreGroup & { name: string };

interface BandGroupChartProps {
  title: string;
  description: string;
  nameHeader: string;
  rows: GroupRow[];
  highlightId: string | null;
}

// one bar per DMO or authority, split into Low / Middle / High with the total
// at the end; hover shows the average score
const BandGroupChart = ({
  title,
  description,
  nameHeader,
  rows,
  highlightId,
}: BandGroupChartProps) => {
  const { t } = useTranslation("score");
  const {
    isDark,
    cardClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();
  const { colors, axisTick, valueLabel } = chartTheme(isDark);
  const text = { color: isDark ? "#f9fafb" : "#111827" };

  return (
    <section
      className={clsx(
        "rounded-xl p-5 flex flex-col gap-3 min-w-0 lg:col-span-2",
        cardClasses,
      )}
    >
      <h2 className={clsx("font-semibold", textPrimary)}>{title}</h2>
      <p className={clsx("text-sm", textTertiary)}>{description}</p>
      {rows.length === 0 ? (
        <p className={clsx("text-sm py-6 text-center", textTertiary)}>
          {t("insights_no_data")}
        </p>
      ) : (
        <div style={{ height: Math.max(160, rows.length * 34 + 60) }} dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ left: 8, right: 56 }}
              barCategoryGap={6}
            >
              <CartesianGrid horizontal={false} stroke={colors.grid} />
              <XAxis type="number" allowDecimals={false} tick={axisTick} />
              <YAxis
                type="category"
                dataKey="name"
                tick={axisTick}
                width={210}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: colors.grid, opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: isDark ? "#111827" : "#ffffff",
                  border: `1px solid ${colors.grid}`,
                  borderRadius: 8,
                }}
                itemStyle={text}
                labelStyle={text}
                labelFormatter={(label, items) => {
                  const row = items?.[0]?.payload as GroupRow | undefined;
                  return row
                    ? `${label} · ${t("insights_average")} ${row.average} · ${row.businesses} ${t("insights_businesses")}`
                    : String(label);
                }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              {(["low", "middle", "high"] as Band[]).map((band, i) => (
                <Bar
                  key={band}
                  dataKey={band}
                  name={t(`band_${band}`)}
                  stackId="bands"
                  fill={colors.band[band]}
                  stroke={isDark ? "#111827" : "#ffffff"}
                  strokeWidth={1}
                  maxBarSize={20}
                  radius={i === 2 ? [0, 4, 4, 0] : 0}
                >
                  {i === 2 && (
                    <LabelList
                      dataKey="businesses"
                      position="right"
                      style={valueLabel}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <details className={clsx("text-sm", textSecondary)}>
        <summary className="cursor-pointer">{t("insights_show_table")}</summary>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full max-w-3xl text-sm">
            <thead>
              <tr className={textTertiary}>
                <th className="text-start py-1">{nameHeader}</th>
                <th className="text-end py-1">{t("insights_businesses")}</th>
                <th className="text-end py-1">{t("insights_average")}</th>
                <th className="text-end py-1">{t("band_high")}</th>
                <th className="text-end py-1">{t("band_middle")}</th>
                <th className="text-end py-1">{t("band_low")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id ?? "none"}
                  className={clsx(
                    "border-t",
                    borderColor,
                    highlightId && r.id === highlightId && "font-semibold",
                  )}
                >
                  <td className="py-1">{r.name}</td>
                  <td className="py-1 text-end tabular-nums">{r.businesses}</td>
                  <td className="py-1 text-end tabular-nums">{r.average}</td>
                  <td className="py-1 text-end tabular-nums">{r.high}</td>
                  <td className="py-1 text-end tabular-nums">{r.middle}</td>
                  <td className="py-1 text-end tabular-nums">{r.low}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
};

export default BandGroupChart;
