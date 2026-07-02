import { useState, useEffect, useCallback } from "react";
import {
  LandingTab,
  CapacityTab,
  AnalyticsTab,
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
} from "@/components/shared";
import {
  Layout,
  Users,
  BarChart2,
  Bell,
  ClipboardList,
  Compass,
  Eye,
} from "lucide-react";
import { TourProvider, TourPortal, useTour } from "@/components/tour";
import type { TourStep } from "@/components/tour";
import { EVENT_SESSION_TOUR_ID } from "@/components/tour";
import clsx from "clsx";
import { useGetEventByIdQuery } from "@/store/api/eventQueryApi";
import { useGenSessionPrivewLinkQuery } from "@/store/api/eventSessionApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSearchParams } from "react-router-dom";
import { routes } from "@/lib/routes";
import { BackToListBtn } from "@/components/btns";

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
  const sessionId = searchParams.get("sessionId") || "";

  const { t } = useTranslation("event_session");
  const { t: tt } = useTranslation("tour");
  const { isDark, bgSecondary, textPrimary, textTertiary, cardClasses } =
    useThemeClasses();

  const { data: eventDetails } = useGetEventByIdQuery(
    eventId ? { eventId } : skipToken,
  );

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
    if (!sessionId) return;
    if (previewArg === skipToken) {
      setPreviewArg(sessionId);
    } else {
      refetchPreviewLink();
    }
  }

  const [tab, setTab] = useState<TTabId>("landing");
  const [config, setConfigState] = useState<IAdminConfig>(() =>
    store.getConfig(),
  );
  const [bookings, setBookings] = useState<TBookings>(() =>
    store.getBookings(),
  );
  const [records, setRecords] = useState<IBookingRecord[]>(() =>
    store.getRecords(),
  );
  const [holds, setHolds] = useState<THolds>(() => store.getHolds());

  // useEffect(() => {
  //   const onStorage = (e: StorageEvent) => {
  //     if (e.key === LS.holds) setHolds(store.getHolds());
  //     if (e.key === LS.bookings) setBookings(store.getBookings());
  //     if (e.key === LS.records) setRecords(store.getRecords());
  //   };
  //   window.addEventListener("storage", onStorage);
  //   const iv = setInterval(() => setHolds(store.getHolds()), 1000);
  //   return () => {
  //     window.removeEventListener("storage", onStorage);
  //     clearInterval(iv);
  //   };
  // }, []);

  function onChange(c: IAdminConfig) {
    setConfigState(c);
    store.setConfig(c);
  }

  function onResetData() {
    if (
      !confirm(
        "Reset all bookings, holds, invites and content to demo defaults?",
      )
    )
      return;
    store.resetAll();
    setConfigState(store.getConfig());
    setBookings(store.getBookings());
    setRecords(store.getRecords());
    setHolds(store.getHolds());
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
        id: "analytics",
        target: '[data-tour="tabs-nav"]',
        placement: "bottom",
        title: "event_session.analytics.title",
        desc: "event_session.analytics.desc",
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
    { id: "analytics", label: t("tab_analytics"), icon: BarChart2 },
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
          <PageHeader
            title={t("page_title")}
            description={t("page_description")}
            h1Gradient="bg-linear-to-r text-transparent from-blue-500 via-purple-600 to-pink-600"
          />
        </div>

        {eventDetails && (
          <div
            className={clsx(
              cardClasses,
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
                {eventDetails?.name}
              </h2>
            </div>
          </div>
        )}

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
                setActiveTab={(id) => setTab(id as TTabId)}
              />
            </div>

            {/* Preview trigger */}
            <button
              onClick={handlePreview}
              disabled={!sessionId || isPreviewLoading}
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
            <LandingTab config={config} onChange={onChange} />
          )}
          {tab === "capacity" && (
            <CapacityTab
              config={config}
              records={records}
              bookings={bookings}
              holds={holds}
            />
          )}
          {tab === "analytics" && (
            <AnalyticsTab
              config={config}
              records={records}
              bookings={bookings}
            />
          )}
          {tab === "notify" && <NotifyTab config={config} records={records} />}
          {tab === "regs" && (
            <RegistrationsTab records={records} onResetData={onResetData} />
          )}
        </div>
      </div>

      <TourPortal />
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
