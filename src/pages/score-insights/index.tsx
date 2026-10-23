import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  InsightsHeader,
  BandTiles,
  LimitSection,
  DistributionSection,
  SignalsAverageSection,
  NotesSection,
  TrendSection,
  BandGroupChart,
} from "./components";
import { useScoreInsights } from "./useScoreInsights";

const ScoreInsightsPage = () => {
  const { textSecondary, textTertiary } = useThemeClasses();
  const {
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
    atOrAbove,
    below,
    histogram,
    signals,
    regions,
    authorities,
    notes,
    trend,
    pct,
  } = useScoreInsights();

  if (isLoading) return <div className={clsx("p-6", textTertiary)}>…</div>;
  if (isError || !data)
    return (
      <div className={clsx("p-6", textSecondary)}>{t("insights_failed")}</div>
    );

  return (
    <div className="flex flex-col gap-5 pb-10">
      <InsightsHeader
        t={t}
        data={data}
        dmoId={dmoId}
        authorityId={authorityId}
        scopeName={scopeName}
        isFetching={isFetching}
      />

      <BandTiles t={t} bands={bands} notScored={data.notScored} pct={pct} />

      <LimitSection
        t={t}
        limit={limit}
        setLimit={setLimit}
        atOrAbove={atOrAbove}
        below={below}
        pct={pct}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <DistributionSection t={t} histogram={histogram} limit={limit} />

        <SignalsAverageSection t={t} signals={signals} />

        <NotesSection t={t} notes={notes} />

        <TrendSection
          t={t}
          days={days}
          setDays={setDays}
          trend={trend}
          limit={limit}
        />

        {/* by DMO, by authority - how many businesses in each band */}
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
