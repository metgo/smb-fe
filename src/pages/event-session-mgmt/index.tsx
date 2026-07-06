import clsx from "clsx";
import { useState, useEffect, useCallback } from "react";
import {
  LandingTab,
  CapacityTab,
  NotifyTab,
  RegistrationsTab,
} from "./components";
import { useTranslation } from "react-i18next";
import { store } from "./data";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  TabsSection,
  PageHeader,
  ImageWithFallback,
  ConfirmDialog,
} from "@/components/shared";
import { Layout, Users, Bell, ClipboardList, Compass, Eye } from "lucide-react";
import { TourProvider, TourPortal, useTour } from "@/components/tour";
import type { TourStep } from "@/components/tour";
import { EVENT_SESSION_TOUR_ID } from "@/components/tour";
import { useGetEventByIdQuery } from "@/store/api/eventQueryApi";
import { useGenSessionPrivewLinkQuery } from "@/store/api/eventSessionApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSearchParams } from "react-router-dom";
import { routes } from "@/lib/routes";
import { BackToListBtn } from "@/components/btns";
import { getLngWiseStr } from "@/helpers";

// ─── Tab → tour step mapping ──────────────────────────────────────────────────

const STEP_TAB_MAP: Partial<Record<string, TTabId>> = {
  landing: "landing",
  capacity: "capacity",
  analytics: "analytics",
  notify: "notify",
  regs: "regs",
};

// ─── Inner component (needs TourProvider above it) ────────────────────────────
function EventSessionMgmtPageInner() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") || "";
  const wrapperId = searchParams.get("wrapperId") || "";

  const { t } = useTranslation("event_session");
  const { t: tt } = useTranslation("tour");
  const { isDark, bgSecondary, textPrimary, textTertiary, language } =
    useThemeClasses();

  const {
    data: eventDetails,
    isFetching,
    isLoading,
  } = useGetEventByIdQuery(eventId ? { eventId } : skipToken);

  const [previewArg, setPreviewArg] = useState<string | typeof skipToken>(
    skipToken,
  );
  const {
    data: previewLinkData,
    isFetching: isPreviewLoading,
    refetch: refetchPreviewLink,
  } = useGenSessionPrivewLinkQuery(previewArg);

  useEffect(() => {
    if (!previewLinkData?.data?.previewLink) return;
    const link = previewLinkData?.data?.previewLink;
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  }, [previewLinkData]);

  function handlePreview() {
    if (!wrapperId) return;
    if (previewArg === skipToken) {
      setPreviewArg(wrapperId);
    } else {
      refetchPreviewLink();
    }
  }

  const [tab, setTab] = useState<TTabId>("landing");
  const [isLandingDirty, setIsLandingDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<TTabId | null>(null);
  const [config, setConfigState] = useState<IAdminConfig>(() =>
    store.getConfig(),
  );
  const [records, _setRecords] = useState<IBookingRecord[]>(() =>
    store.getRecords(),
  );

  function onChange(c: IAdminConfig) {
    setConfigState(c);
    store.setConfig(c);
  }

  function handleTabChange(id: string) {
    if (tab === "landing" && isLandingDirty && id !== tab) {
      setPendingTab(id as TTabId);
      return;
    }
    setTab(id as TTabId);
  }

  function confirmTabChange() {
    if (pendingTab) setTab(pendingTab);
    setPendingTab(null);
  }

  // ─── Tour integration ───────────────────────────────────────────────────────

  const {
    isOpen: isTourOpen,
    steps: tourSteps,
    currentStep,
    startTour,
    refreshTargetRect,
  } = useTour();

  const buildSteps = useCallback(
    (): TourStep[] => [
      {
        id: "welcome",
        placement: "center",
        title: "event_session.welcome.title",
        desc: "event_session.welcome.desc",
      },
      {
        id: "page-header",
        target: '[data-tour="page-header"]',
        placement: "bottom",
        title: "event_session.page_header.title",
        desc: "event_session.page_header.desc",
      },
      {
        id: "tabs-nav",
        target: '[data-tour="tabs-nav"]',
        placement: "bottom",
        title: "event_session.tabs_nav.title",
        desc: "event_session.tabs_nav.desc",
      },
      {
        id: "landing",
        target: '[data-tour="tabs-nav"]',
        placement: "bottom",
        title: "event_session.landing.title",
        desc: "event_session.landing.desc",
      },
      {
        id: "capacity",
        target: '[data-tour="tabs-nav"]',
        placement: "bottom",
        title: "event_session.capacity.title",
        desc: "event_session.capacity.desc",
      },
      // {
      //   id: "analytics",
      //   target: '[data-tour="tabs-nav"]',
      //   placement: "bottom",
      //   title: "event_session.analytics.title",
      //   desc: "event_session.analytics.desc",
      // },
      {
        id: "notify",
        target: '[data-tour="tabs-nav"]',
        placement: "bottom",
        title: "event_session.notify.title",
        desc: "event_session.notify.desc",
      },
      {
        id: "regs",
        target: '[data-tour="tabs-nav"]',
        placement: "bottom",
        title: "event_session.regs.title",
        desc: "event_session.regs.desc",
      },
    ],
    [],
  );

  // Auto-switch tab when tour reaches a tab-specific step
  useEffect(() => {
    if (!isTourOpen) return;
    const stepId = tourSteps[currentStep]?.id;
    if (!stepId) return;
    const targetTab = STEP_TAB_MAP[stepId];
    if (targetTab) {
      setTab(targetTab);
      const raf = requestAnimationFrame(() => {
        setTimeout(() => refreshTargetRect(), 60);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTourOpen, currentStep, tourSteps, refreshTargetRect]);

  // ─── Tabs ───────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "landing", label: t("tab_landing"), icon: Layout },
    { id: "capacity", label: t("tab_capacity"), icon: Users },
    // { id: "analytics", label: t("tab_analytics"), icon: BarChart2 },
    { id: "notify", label: t("tab_notify"), icon: Bell },
    { id: "regs", label: t("tab_regs"), icon: ClipboardList },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className={`min-h-screen ${bgSecondary} ${textPrimary}`}>
        {/* Page header */}
        <div className=" px-2 pt-4" data-tour="page-header">
          <BackToListBtn
            label={t("back_btn")}
            navPath={`${routes.eventDetails}?eventId=${eventId}`}
          />
          <div className="flex justify-between gap-2.5">
            <PageHeader
              title={t("page_title")}
              description={t("page_description")}
              h1Gradient="bg-linear-to-r text-transparent from-blue-500 via-purple-600 to-pink-600"
            />
            {eventDetails && (
              <div
                className={clsx(
                  "rounded-[14px] p-5 flex items-center gap-3 mb-4.5 mx-2",
                )}
              >
                <ImageWithFallback
                  src={eventDetails?.images?.[0]?.image}
                  alt={eventDetails?.name}
                  className="w-12 h-12 rounded-[10px] object-cover shrink-0 border"
                  style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}
                />
                <div className="min-w-0">
                  <p className={clsx("text-xs font-semibold", textTertiary)}>
                    {t("event_header_label")}
                  </p>
                  <h2 className="m-0 text-[15.5px] font-extrabold tracking-tight truncate">
                    {getLngWiseStr(
                      language,
                      eventDetails?.name,
                      eventDetails?.nameHe,
                      eventDetails?.nameAr,
                    )}
                  </h2>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky tabs nav */}
        <nav
          data-tour="tabs-nav"
          className={`px-2 border-b-2 sticky top-0 z-19`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <TabsSection
                tabs={tabs}
                activeTab={tab}
                setActiveTab={handleTabChange}
              />
            </div>

            {/* Preview trigger */}
            <button
              onClick={handlePreview}
              disabled={!wrapperId || isPreviewLoading}
              title={t("preview_btn")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? "border-gray-600 text-gray-400 hover:text-teal-400 hover:border-teal-600 hover:bg-gray-700/50"
                  : "border-gray-300 text-gray-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{t("preview_btn")}</span>
            </button>

            {/* Tour trigger */}
            <button
              onClick={() =>
                startTour(buildSteps(), {
                  tourId: EVENT_SESSION_TOUR_ID,
                })
              }
              title={tt("start_tour")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                isDark
                  ? "border-gray-600 text-gray-400 hover:text-teal-400 hover:border-teal-600 hover:bg-gray-700/50"
                  : "border-gray-300 text-gray-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">{tt("start_tour")}</span>
            </button>
          </div>
        </nav>

        {/* Tab content */}
        <div data-tour="tab-content" className=" p-4">
          {tab === "landing" && (
            <LandingTab
              config={config}
              onChange={onChange}
              eventId={eventId}
              wrapperId={wrapperId}
              onDirtyChange={setIsLandingDirty}
              isLoading={isFetching || isLoading}
            />
          )}
          {tab === "capacity" && <CapacityTab wrapperId={wrapperId} />}
          {/* {tab === "analytics" && (
            <AnalyticsTab
              config={config}
              records={records}
              bookings={bookings}
            />
          )} */}
          {tab === "notify" && (
            <NotifyTab
              wrapperId={wrapperId}
              config={config}
              records={records}
            />
          )}
          {tab === "regs" && <RegistrationsTab wrapperId={wrapperId} />}
        </div>
      </div>

      <TourPortal />

      <ConfirmDialog
        open={pendingTab !== null}
        title="unsaved_changes"
        message="unsaved_changes_confirm"
        confirmText="leave"
        variant="warning"
        onCancel={() => setPendingTab(null)}
        onConfirm={confirmTabChange}
      />
    </>
  );
}

// ─── Exported page (wraps with TourProvider) ──────────────────────────────────

export default function EventSessionMgmtPage() {
  return (
    <TourProvider>
      <EventSessionMgmtPageInner />
    </TourProvider>
  );
}
