import { useMemo } from "react";

import type { DashboardRole, TimePeriod } from "../types/dashboard.types";
import {
  mockAuthorities,
  mockBusinesses,
  mockDmos,
  mockOrders,
  mockPendingApprovals,
  mockPerformanceAlerts,
  mockMiniSites,
  mockEvents,
  mockPois,
  mockProducts,
} from "../data/mockDashboardData";
import {
  filterBusinessesByAuthority,
  filterBusinessesByDmo,
  filterByBusiness,
  filterByPeriod,
} from "../data/mockDashboardHelpers";

interface ScopeArgs {
  role: DashboardRole;
  period: TimePeriod;
  dmoId?: string;
  authorityId?: string;
  businessId?: string;
}

/**
 * Derives the role/period/scope-appropriate slice of the centralized mock
 * dataset. Keeping this in one memoized hook means every section of a
 * dashboard reads from the same filtered data, so KPIs/charts/tables never
 * disagree with each other.
 */
export function useDashboardData({
  role,
  period,
  dmoId,
  authorityId,
  businessId,
}: ScopeArgs) {
  const series = useMemo(() => filterByPeriod(period), [period]);

  const scopedBusinesses = useMemo(() => {
    if (role === "traveller" && businessId) {
      return mockBusinesses.filter((b) => b.id === businessId);
    }
    if (role === "authority" && authorityId) {
      return filterBusinessesByAuthority(mockBusinesses, authorityId);
    }
    if (role === "dmo" && dmoId) {
      return filterBusinessesByDmo(mockBusinesses, dmoId);
    }
    return mockBusinesses;
  }, [role, businessId, authorityId, dmoId]);

  const scopedBusinessIds = useMemo(
    () => new Set(scopedBusinesses.map((b) => b.id)),
    [scopedBusinesses],
  );

  const scopedOrders = useMemo(
    () =>
      businessId
        ? filterByBusiness(mockOrders, businessId)
        : mockOrders.filter((o) => scopedBusinessIds.has(o.businessId)),
    [businessId, scopedBusinessIds],
  );

  const scopedProducts = useMemo(
    () =>
      businessId
        ? filterByBusiness(mockProducts, businessId)
        : mockProducts.filter((p) => scopedBusinessIds.has(p.businessId)),
    [businessId, scopedBusinessIds],
  );

  const scopedAuthorities = useMemo(
    () =>
      dmoId
        ? mockAuthorities.filter((a) => a.dmoId === dmoId)
        : mockAuthorities,
    [dmoId],
  );

  const scopedApprovals = useMemo(
    () =>
      mockPendingApprovals.filter((a) => {
        if (authorityId) return a.authorityId === authorityId;
        if (dmoId) return a.dmoId === dmoId;
        return true;
      }),
    [authorityId, dmoId],
  );

  const scopedAlerts = useMemo(
    () =>
      mockPerformanceAlerts.filter((a) => scopedBusinessIds.has(a.businessId)),
    [scopedBusinessIds],
  );

  const scopedEvents = useMemo(
    () =>
      mockEvents.filter((e) => {
        if (businessId) return e.businessId === businessId;
        if (authorityId) return e.authorityId === authorityId;
        if (dmoId) return e.dmoId === dmoId;
        return true;
      }),
    [businessId, authorityId, dmoId],
  );

  const scopedPois = useMemo(
    () =>
      authorityId
        ? mockPois.filter((p) => p.authorityId === authorityId)
        : mockPois,
    [authorityId],
  );

  const scopedMiniSites = useMemo(
    () => mockMiniSites.filter((m) => scopedBusinessIds.has(m.businessId)),
    [scopedBusinessIds],
  );

  return {
    series,
    dmos: mockDmos,
    authorities: scopedAuthorities,
    businesses: scopedBusinesses,
    orders: scopedOrders,
    products: scopedProducts,
    approvals: scopedApprovals,
    alerts: scopedAlerts,
    events: scopedEvents,
    pois: scopedPois,
    miniSites: scopedMiniSites,
  };
}
