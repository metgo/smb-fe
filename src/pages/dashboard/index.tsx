import { useCallback } from "react";
import { DndProvider } from "react-dnd";
import { Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useWidgetPreferences } from "@/hooks/useWidgetPreferences";
import { toggleEditMode } from "@/features/uiSlice";
import {
  DistributionCards,
  DraggableWidget,
  FinancialSummary,
  GAOverview,
  PopularContent,
  PurchasesReport,
  UpcomingEvents,
  WidgetSettingsPanel,
} from "./components";

const Dashboard = () => {
  const { t } = useTranslation("dashboard");
  const { isEditMode } = useAppSelector((state) => state.ui);
  const {
    preferences,
    toggleWidgetVisibility,
    reorderWidgets,
    resetToDefaults,
  } = useWidgetPreferences();
  const dispatch = useAppDispatch();

  // Desktop Dashboard widget management - always define these
  const desktopWidgets = preferences.desktop.sort((a, b) => a.order - b.order);

  const widgetComponents: Record<string, React.ReactNode> = {
    "ga-overview": <GAOverview />,
    distribution: <DistributionCards />,
    events: <UpcomingEvents />,
    financial: <FinancialSummary />,
    purchases: <PurchasesReport />,
    "popular-content": <PopularContent />,
  };

  const moveWidget = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      // Work with all widgets (including hidden ones) to maintain proper indexing
      const allWidgets = [...preferences.desktop].sort(
        (a, b) => a.order - b.order,
      );
      const [removed] = allWidgets.splice(dragIndex, 1);
      allWidgets.splice(hoverIndex, 0, removed);
      reorderWidgets("desktop", allWidgets);
    },
    [preferences.desktop, reorderWidgets],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex-1 transition-all duration-300 `}>
        <main
          className={`overflow-y-auto pt-6 pb-12 px-4 sm:px-6 lg:px-2 max-w-400 mx-auto transition-all duration-300 ${isEditMode ? "mr-96" : ""}`}
        >
          {/* Edit Mode Banner */}
          {isEditMode && (
            <div className="mb-6 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <div className="flex-1">
                  <p className="text-sm text-teal-900 dark:text-teal-100">
                    {t("edit_mode_active")} - {t("edit_mode_instructions")}
                  </p>
                </div>
                <Button
                  onClick={() => dispatch(toggleEditMode())}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors"
                >
                  {t("done_editing")}
                </Button>
              </div>
            </div>
          )}

          <div className={`space-y-8 ${isEditMode ? "pt-6" : ""}`}>
            {desktopWidgets
              .filter((widget) => widget.visible)
              .map((widget, index) => (
                <DraggableWidget
                  key={widget.id}
                  id={widget.id}
                  index={index}
                  onMove={moveWidget}
                  isEditMode={isEditMode}
                >
                  {widgetComponents[widget.id]}
                </DraggableWidget>
              ))}
          </div>
        </main>

        {/* Widget Settings Panel */}
        <WidgetSettingsPanel
          isOpen={isEditMode}
          onClose={() => dispatch(toggleEditMode())}
          widgets={preferences.desktop}
          onToggleWidget={(id) => toggleWidgetVisibility("desktop", id)}
          onReset={() => resetToDefaults("desktop")}
          viewName="Desktop Dashboard"
        />
      </div>
    </DndProvider>
  );
};

export default Dashboard;
