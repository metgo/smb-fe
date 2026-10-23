import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/hooks/hooks";
import { SCORE_SIGNAL_KEYS } from "@/components/score/scoreMeta";
import { useGetScoreInsightsQuery } from "@/store/api/businessScoreApi";
import { bandOf, BUCKET, MAX, MIDDLE, MIN } from "./chartTheme";

export const useScoreInsights = () => {
  const { t, i18n } = useTranslation("score");

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

  return {
    t,
    data,
    isLoading,
    isFetching,
    isError,
    days,
    setDays,
    limit,
    setLimit,
    dmoId,
    authorityId,
    scopeName,
    bands,
    total,
    atOrAbove,
    below,
    histogram,
    signals,
    regions,
    authorities,
    notes,
    trend,
    pct,
  };
};
