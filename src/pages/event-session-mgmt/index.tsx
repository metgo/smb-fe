import { useState, useEffect } from "react";
import {
  LandingTab,
  ThemeTab,
  CapacityTab,
  AnalyticsTab,
  NotifyTab,
  RegistrationsTab,
} from "./components";
import { useTranslation } from "react-i18next";
import { LS, store, encodeToken, shortToken } from "./data";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { TabsSection } from "@/components/shared";
import { Layout, Users, BarChart2, Bell, ClipboardList } from "lucide-react";

export default function EventSessionMgmtPage() {
  const { t } = useTranslation("event_session");
  const { isDark, bgSecondary, textPrimary } = useThemeClasses();

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

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS.holds) setHolds(store.getHolds());
      if (e.key === LS.bookings) setBookings(store.getBookings());
      if (e.key === LS.records) setRecords(store.getRecords());
    };
    window.addEventListener("storage", onStorage);
    const iv = setInterval(() => setHolds(store.getHolds()), 1000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(iv);
    };
  }, []);

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

  function onPreview() {
    const token = encodeToken({
      jti: "preview_" + shortToken(5),
      code: "PREVIEW",
      name: "",
      email: "",
      phone: "",
      exp: Date.now() + 36e5,
    });
    location.hash = "/b/" + token;
  }

  const tabs = [
    // { id: 'content', label: t('tab_content'), icon: FileText },
    { id: "landing", label: t("tab_landing"), icon: Layout },
    // { id: 'theme', label: t('tab_theme'), icon: Palette },
    { id: "capacity", label: t("tab_capacity"), icon: Users },
    { id: "analytics", label: t("tab_analytics"), icon: BarChart2 },
    { id: "notify", label: t("tab_notify"), icon: Bell },
    { id: "regs", label: t("tab_regs"), icon: ClipboardList },
  ];

  return (
    <div className={`min-h-screen ${bgSecondary} ${textPrimary}`}>
      <nav
        className={`px-6 border-b sticky top-0 z-19 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <TabsSection
          tabs={tabs}
          activeTab={tab}
          setActiveTab={(id) => setTab(id as TTabId)}
        />
      </nav>

      <div className="max-w-270 mx-auto p-6 max-[560px]:p-4">
        {/* {tab === 'content' && (
          <ContentTab config={config} onChange={onChange} />
        )} */}
        {tab === "landing" && (
          <LandingTab config={config} onChange={onChange} />
        )}
        {tab === "theme" && (
          <ThemeTab config={config} onChange={onChange} onPreview={onPreview} />
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
          <AnalyticsTab config={config} records={records} bookings={bookings} />
        )}
        {tab === "notify" && <NotifyTab config={config} records={records} />}
        {tab === "regs" && (
          <RegistrationsTab records={records} onResetData={onResetData} />
        )}
      </div>
    </div>
  );
}
