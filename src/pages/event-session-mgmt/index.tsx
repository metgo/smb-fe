import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Layout, Users, Bell, ClipboardList, Compass, Eye } from "lucide-react";

import {
  LandingTab,
  CapacityTab,
  NotifyTab,
  RegistrationsTab,
} from "./components";
import { store } from "./data";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  TabsSection,
  PageHeader,
  ImageWithFallback,
  ConfirmDialog,
} from "@/components/shared";
import type { TourStep } from "@/components/tour";
import { EVENT_SESSION_TOUR_ID } from "@/components/tour";
import { TourProvider, TourPortal, useTour } from "@/components/tour";
import { useGetEventByIdQuery } from "@/store/api/eventQueryApi";
import { useLazyGenSessionPrivewLinkQuery } from "@/store/api/eventSessionApi";
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
  const ticketId = searchParams.get("ticketId") || null;
  const isDuplicate = searchParams.get("isDuplicate") || null;

  const [wrapperId, setWrapperId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  const { t } = useTranslation("event_session");
  const { t: tt } = useTranslation("tour");
  const { isDark, bgSecondary, textPrimary, textTertiary, language } =
    useThemeClasses();

  const {
    data: eventDetails,
    isFetching,
    isLoading,
    refetch,
  } = useGetEventByIdQuery(eventId ? { eventId } : skipToken);

  const [triggerPreviewLink, { isFetching: isPreviewLoading }] =
    useLazyGenSessionPrivewLinkQuery();

  useEffect(() => {
    const eventId = searchParams.get("eventId") || null;
    const wrapperId = searchParams.get("wrapperId") || null;
    setEventId(eventId);
    setWrapperId(wrapperId);
  }, [searchParams]);

  async function handlePreview() {
    if (!wrapperId) return;
    const res = await triggerPreviewLink(wrapperId);
    const link = res.data?.data?.previewLink;
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  }

  const [tab, setTab] = useState<TTabId>("landing");
  const [isLandingDirty, setIsLandingDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<TTabId | null>(null);
  const [config, setConfigState] = useState<IAdminConfig>(() =>
    store.getConfig(),
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
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2.5">
            <PageHeader
              title={t("page_title")}
              description={t("page_description")}
              h1Gradient="bg-linear-to-r text-transparent from-blue-500 via-purple-600 to-pink-600"
            />
            {eventDetails && (
              <div
                className={clsx(
                  "rounded-[14px] p-5 flex items-center gap-3 mb-4.5 mx-2 min-w-0 w-full sm:w-auto sm:shrink-0",
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
              setWrapperId={setWrapperId}
              ticketId={ticketId}
              isDuplicate={isDuplicate === "true"}
              onDirtyChange={setIsLandingDirty}
              isLoading={isFetching || isLoading}
              refetch={refetch}
            />
          )}
          {tab === "capacity" && <CapacityTab wrapperId={wrapperId} />}
          {tab === "notify" && <NotifyTab wrapperId={wrapperId} />}
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
