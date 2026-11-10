import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { chartTheme, HIGH, MAX, MIDDLE, MIN, type Band } from "../chartTheme";

interface BandTilesProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  bands: { high: number; middle: number; low: number };
  notScored: number;
  pct: (n: number) => number;
}

const BandTiles = ({ t, bands, notScored, pct }: BandTilesProps) => {
  const { isDark, cardClasses, textPrimary, textSecondary, textTertiary } =
    useThemeClasses();
  const { colors } = chartTheme(isDark);

  const card = clsx("rounded-xl p-5 flex flex-col gap-3 min-w-0", cardClasses);
  const sub = clsx("text-sm", textTertiary);

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
      count: notScored,
    },
  ];

  return (
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
  );
};

export default BandTiles;
