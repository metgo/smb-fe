import clsx from "clsx";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { BarChart3, Settings2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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
import { useAppSelector } from "@/hooks/hooks";
import { routes } from "@/lib/routes";
import { SCORE_SIGNAL_KEYS } from "@/components/score/scoreMeta";
import {
  useGetScoreInsightsQuery,
  type IScoreGroup,
} from "@/store/api/businessScoreApi";

// bands match the score pill on the business list
const HIGH = 650;
const MIDDLE = 450;
const MIN = 200;
const MAX = 800;
const BUCKET = 50;

type Band = "high" | "middle" | "low";
const bandOf = (score: number): Band =>
  score >= HIGH ? "high" : score >= MIDDLE ? "middle" : "low";

// ordinal blue ramp (low → high) and two categorical slots, light and dark
// steps from the reference palette
const PALETTE = {
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

type GroupRow = IScoreGroup & { name: string };

// one bar per DMO or authority, split into Low / Middle / High with the total
// at the end; hover shows the average score
const BandGroupChart = ({
  title,
  description,
  nameHeader,
  rows,
  highlightId,
}: {
  title: string;
  description: string;
  nameHeader: string;
  rows: GroupRow[];
  highlightId: string | null;
}) => {
  const { t } = useTranslation("score");
  const {
    isDark,
    cardClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();
  const colors = isDark ? PALETTE.dark : PALETTE.light;
  const axisTick = { fill: colors.axis, fontSize: 12 };
  const text = { color: isDark ? "#f9fafb" : "#111827" };
  const valueLabel = { fill: isDark ? "#e5e7eb" : "#374151", fontSize: 12 };

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

const ScoreInsightsPage = () => {
  const { t, i18n } = useTranslation("score");
  const navigate = useNavigate();
  const {
    isDark,
    cardClasses,
    inputClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();
  const colors = isDark ? PALETTE.dark : PALETTE.light;

  const [days, setDays] = useState(90);
  const [limit, setLimit] = useState(MIDDLE);
  // follows the DMO and Authority pickers in the top bar
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);
  const { data, isLoading, isFetching, isError } = useGetScoreInsightsQuery({
    days,
    dmoId: dmoId || undefined,
    authorityId: authorityId || undefined,
  });

  const impacts = useMemo(() => data?.impacts ?? [], [data]);
  const total = impacts.length;

  const bands = useMemo(() => {
    const counts = { high: 0, middle: 0, low: 0 };
    impacts.forEach((score) => {
      counts[bandOf(score)] += 1;
    });
    return counts;
  }, [impacts]);

  // businesses at or above the limit; impacts are sorted ascending
  const atOrAbove = useMemo(() => {
    let lo = 0;
    let hi = impacts.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (impacts[mid] < limit) lo = mid + 1;
      else hi = mid;
    }
    return impacts.length - lo;
  }, [impacts, limit]);
  const below = total - atOrAbove;

  const histogram = useMemo(() => {
    const buckets = [];
    for (let from = MIN; from < MAX; from += BUCKET) {
      const to = from + BUCKET;
      const count = impacts.filter(
        (s) => s >= from && (to === MAX ? s <= to : s < to),
      ).length;
      buckets.push({ range: `${from}–${to}`, from, count, band: bandOf(from) });
    }
    return buckets;
  }, [impacts]);

  const signals = useMemo(
    () =>
      SCORE_SIGNAL_KEYS.map((key) => {
        const row = data?.signals.find((s) => s.key === key);
        return row ? { name: t(`signal_${key}`), average: row.average } : null;
      }).filter(Boolean) as { name: string; average: number }[],
    [data, t],
  );

  const regions = useMemo(
    () =>
      (data?.regions ?? []).map((r) => ({
        ...r,
        name: r.name ?? t("insights_no_region"),
      })),
    [data, t],
  );
  const authorities = useMemo(
    () =>
      (data?.authorities ?? []).map((r) => ({
        ...r,
        name: r.name ?? t("insights_no_authority"),
      })),
    [data, t],
  );
  const scopeName = useMemo(() => {
    if (authorityId)
      return data?.authorities.find((a) => a.id === authorityId)?.name ?? null;
    if (dmoId) return data?.regions.find((r) => r.id === dmoId)?.name ?? null;
    return null;
  }, [data, dmoId, authorityId]);

  const notes = useMemo(
    () =>
      ["NO_SALES", "NO_LISTINGS", "LOW_SAMPLE", "NEW_BUSINESS"].map((flag) => ({
        name: t(`flag_${flag}`),
        count: data?.flags?.[flag] ?? 0,
      })),
    [data, t],
  );

  const trend = useMemo(
    () =>
      (data?.trend ?? []).map((p) => ({
        ...p,
        label: new Date(`${p.date}T12:00:00Z`).toLocaleDateString(
          i18n.language,
          { day: "numeric", month: "short" },
        ),
      })),
    [data, i18n.language],
  );

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const axisTick = { fill: colors.axis, fontSize: 12 };
  const tooltipStyle = {
    backgroundColor: isDark ? "#111827" : "#ffffff",
    border: `1px solid ${colors.grid}`,
    borderRadius: 8,
    color: isDark ? "#f9fafb" : "#111827",
  };
  // recharts colours tooltip rows itself; keep them readable in both themes
  const tooltipText = { color: isDark ? "#f9fafb" : "#111827" };
  const valueLabel = { fill: isDark ? "#e5e7eb" : "#374151", fontSize: 12 };
  const card = clsx("rounded-xl p-5 flex flex-col gap-3 min-w-0", cardClasses);
  const title = clsx("font-semibold", textPrimary);
  const sub = clsx("text-sm", textTertiary);

  if (isLoading) return <div className={clsx("p-6", textTertiary)}>…</div>;
  if (isError || !data)
    return (
      <div className={clsx("p-6", textSecondary)}>{t("insights_failed")}</div>
    );

  const tiles: {
    band: Band | "none";
    label: string;
    range: string;
    count: number;
  }[] = [
    {
      band: "high",
      label: t("band_high"),
      range: `${HIGH}–${MAX}`,
      count: bands.high,
    },
    {
      band: "middle",
      label: t("band_middle"),
      range: `${MIDDLE}–${HIGH - 1}`,
      count: bands.middle,
    },
    {
      band: "low",
      label: t("band_low"),
      range: `${MIN}–${MIDDLE - 1}`,
      count: bands.low,
    },
    {
      band: "none",
      label: t("band_not_scored"),
      range: t("band_not_scored_hint"),
      count: data.notScored,
    },
  ];

  return (
    <div className="flex flex-col gap-5 pb-10 max-w-6xl">
      {/* header */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <BarChart3
            className={clsx(
              "w-7 h-7 mt-1 shrink-0",
              isDark ? "text-emerald-400" : "text-emerald-600",
            )}
          />
          <div className="min-w-0">
            <h1 className={clsx("text-2xl font-bold", textPrimary)}>
              {t("insights_title")}
            </h1>
            {(dmoId || authorityId) && (
              <p
                className={clsx(
                  "inline-flex items-center gap-2 text-sm font-medium px-2.5 py-1 rounded-md mt-1 mb-1",
                  isDark
                    ? "bg-sky-500/15 text-sky-300"
                    : "bg-sky-100 text-sky-800",
                )}
              >
                {t("insights_filtered", {
                  name:
                    scopeName ??
                    (authorityId
                      ? t("insights_authority")
                      : t("insights_region")),
                })}
                {isFetching && " …"}
              </p>
            )}
            <p className={clsx("text-sm max-w-2xl", textTertiary)}>
              {t("insights_desc", {
                approved: data.approved,
                notApproved: data.notApproved,
              })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(routes.scoreSettings)}
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer",
            borderColor,
            textSecondary,
          )}
        >
          <Settings2 className="w-4 h-4" />
          {t("score_settings")}
        </button>
      </div>

      {/* band tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <div key={tile.band} className={clsx(card, "gap-1")}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{
                  background:
                    tile.band === "none" ? colors.grid : colors.band[tile.band],
                }}
              />
              <span className={clsx("text-sm font-medium", textSecondary)}>
                {tile.label}
              </span>
            </div>
            <span
              className={clsx("text-3xl font-bold tabular-nums", textPrimary)}
            >
              {tile.count.toLocaleString()}
            </span>
            <span className={sub}>
              {tile.range}
              {tile.band !== "none" && ` · ${pct(tile.count)}%`}
            </span>
          </div>
        ))}
      </div>

      {/* limit */}
      <section className={card} aria-labelledby="limit-title">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[14rem]">
            <h2 id="limit-title" className={title}>
              {t("insights_limit_title")}
            </h2>
            <p className={sub}>{t("insights_limit_desc")}</p>
          </div>
          <label
            htmlFor="score-limit"
            className={clsx("flex items-center gap-2 text-sm", textSecondary)}
          >
            {t("insights_limit")}
            <input
              id="score-limit"
              type="number"
              min={MIN}
              max={MAX}
              step={10}
              value={limit}
              onChange={(e) =>
                setLimit(
                  Math.min(MAX, Math.max(MIN, Number(e.target.value) || MIN)),
                )
              }
              className={clsx(
                "w-24 px-2 py-1.5 rounded-md border text-end tabular-nums",
                inputClasses,
              )}
            />
          </label>
        </div>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={10}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          aria-label={t("insights_limit")}
          className="w-full accent-emerald-600"
        />
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <span className={textPrimary}>
            <b className="text-2xl tabular-nums">
              {atOrAbove.toLocaleString()}
            </b>{" "}
            {t("insights_at_or_above", { limit, pct: pct(atOrAbove) })}
          </span>
          <span className={textPrimary}>
            <b className="text-2xl tabular-nums">{below.toLocaleString()}</b>{" "}
            {t("insights_below", { limit, pct: pct(below) })}
          </span>
        </div>
        <div
          className="flex h-3 rounded-full overflow-hidden gap-0.5"
          role="img"
          aria-label={t("insights_limit_bar", { atOrAbove, below })}
        >
          <div style={{ flex: below || 0.0001, background: colors.band.low }} />
          <div
            style={{ flex: atOrAbove || 0.0001, background: colors.band.high }}
          />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 1. distribution */}
        <section className={clsx(card, "lg:col-span-2")}>
          <h2 className={title}>{t("insights_distribution")}</h2>
          <p className={sub}>{t("insights_distribution_desc")}</p>
          <div className="h-72" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={histogram}
                margin={{ top: 28, right: 8, left: 0 }}
              >
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
            <summary className="cursor-pointer">
              {t("insights_show_table")}
            </summary>
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

        {/* 2. average mark per part */}
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

        {/* 3. notes */}
        <section className={card}>
          <h2 className={title}>{t("insights_notes")}</h2>
          <p className={sub}>{t("insights_notes_desc")}</p>
          <div className="h-56" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={notes}
                layout="vertical"
                margin={{ left: 8, right: 40 }}
              >
                <CartesianGrid horizontal={false} stroke={colors.grid} />
                <XAxis type="number" allowDecimals={false} tick={axisTick} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisTick}
                  width={170}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: colors.grid, opacity: 0.4 }}
                  contentStyle={tooltipStyle}
                  itemStyle={tooltipText}
                  labelStyle={tooltipText}
                  formatter={(value) => [value, t("insights_businesses")]}
                />
                <Bar
                  dataKey="count"
                  fill={colors.series1}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={22}
                  label={{ position: "right", fill: colors.axis, fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 4. trend */}
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

        {/* 5. by DMO, 6. by authority - how many businesses in each band */}
        <BandGroupChart
          title={t("insights_dmos")}
          description={t("insights_dmos_desc")}
          nameHeader={t("insights_region")}
          rows={regions}
          highlightId={dmoId || null}
        />
        <BandGroupChart
          title={t("insights_authorities")}
          description={t("insights_authorities_desc")}
          nameHeader={t("insights_authority")}
          rows={authorities}
          highlightId={authorityId || null}
        />
      </div>
    </div>
  );
};

export default ScoreInsightsPage;
