import { useMemo, useState } from "react";

import type { TimePeriod } from "../types/dashboard.types";
import { filterByPeriod } from "../data/mockDashboardHelpers";

export function useDashboardFilters(initialPeriod: TimePeriod = "monthly") {
  const [period, setPeriod] = useState<TimePeriod>(initialPeriod);

  const series = useMemo(() => filterByPeriod(period), [period]);

  return { period, setPeriod, series };
}
