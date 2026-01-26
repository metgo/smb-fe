import { useState, useEffect } from "react";

export interface WidgetConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

export interface DashboardPreferences {
  desktop: WidgetConfig[];
  meeting: WidgetConfig[];
}

const DEFAULT_DESKTOP_WIDGETS: WidgetConfig[] = [
  {
    id: "ga-overview",
    name: "Google Analytics Overview",
    visible: true,
    order: 0,
  },
  { id: "distribution", name: "Distribution Cards", visible: true, order: 1 },
  { id: "events", name: "Upcoming Events", visible: true, order: 2 },
  { id: "financial", name: "Financial Summary", visible: true, order: 3 },
  { id: "purchases", name: "Purchases Report", visible: true, order: 4 },
  { id: "popular-content", name: "Popular Content", visible: true, order: 5 },
];

const DEFAULT_MEETING_WIDGETS: WidgetConfig[] = [
  { id: "ga-kpis", name: "GA KPIs", visible: true, order: 0 },
  {
    id: "distribution-charts",
    name: "Distribution Charts",
    visible: true,
    order: 1,
  },
  { id: "events-list", name: "Events", visible: true, order: 2 },
  { id: "financial-cards", name: "Financial Cards", visible: true, order: 3 },
  { id: "purchases-chart", name: "Purchases Chart", visible: true, order: 4 },
  {
    id: "popular-businesses",
    name: "Popular Businesses",
    visible: true,
    order: 5,
  },
  { id: "popular-products", name: "Popular Products", visible: true, order: 6 },
  { id: "kpi-summary", name: "KPI Summary", visible: true, order: 7 },
];

export function useWidgetPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    const stored = localStorage.getItem("dashboard-widget-preferences");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          desktop: DEFAULT_DESKTOP_WIDGETS,
          meeting: DEFAULT_MEETING_WIDGETS,
        };
      }
    }
    return {
      desktop: DEFAULT_DESKTOP_WIDGETS,
      meeting: DEFAULT_MEETING_WIDGETS,
    };
  });

  useEffect(() => {
    localStorage.setItem(
      "dashboard-widget-preferences",
      JSON.stringify(preferences),
    );
  }, [preferences]);

  const toggleWidgetVisibility = (
    view: "desktop" | "meeting",
    widgetId: string,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [view]: prev[view].map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w,
      ),
    }));
  };

  const reorderWidgets = (
    view: "desktop" | "meeting",
    newOrder: WidgetConfig[],
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [view]: newOrder.map((w, index) => ({ ...w, order: index })),
    }));
  };

  const resetToDefaults = (view: "desktop" | "meeting") => {
    setPreferences((prev) => ({
      ...prev,
      [view]:
        view === "desktop" ? DEFAULT_DESKTOP_WIDGETS : DEFAULT_MEETING_WIDGETS,
    }));
  };

  return {
    preferences,
    toggleWidgetVisibility,
    reorderWidgets,
    resetToDefaults,
  };
}
