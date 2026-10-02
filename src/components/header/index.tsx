import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Moon,
  Sun,
  Settings,
  Check,
  Languages,
  Menu,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { routes } from "@/lib/routes";
import { useCommon } from "@/hooks/useCommon";
import { toggleEditMode, toggleMobileSidebar } from "@/features/uiSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { setTheme } from "@/features/settingsSlice";
import {
  setAuthority,
  setDmo,
  setTimeFrame,
  setWebsite,
  setFilteredWebsite,
} from "@/features/authSlice";
import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { locales, getLogoByLanguage } from "@/lib/utils";
import NotificationsBell from "./NotificationsBell";
import ChatNotificationBell from "./ChatNotificationBell";

export default function Header() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { t, i18n } = useTranslation("common");

  const { allWebsites, dmosAuthorities } = useCommon();
  const { authorityId, dmoId, websiteId, userRole, timeFrame } = useAppSelector(
    (state) => state.auth,
  );

  const { isEditMode } = useAppSelector((state) => state.ui);
  const { textPrimary, isDark, language } = useThemeClasses();

  const selectedParent = dmosAuthorities?.find((item) => item._id === dmoId);

  const filteredWebsites = useMemo(() => {
    if (!allWebsites?.length) return [];
    if (!dmoId && !authorityId) return allWebsites;
    return allWebsites.filter((site) => {
      const matchDmo = dmoId && site.dmoIds?.includes(dmoId);
      const matchAuthority =
        authorityId && site.authorityIds?.includes(authorityId);
      return matchDmo || matchAuthority;
    });
  }, [allWebsites, dmoId, authorityId]);

  useEffect(() => {
    dispatch(setFilteredWebsite(filteredWebsites));
  }, [filteredWebsites]);

  useEffect(() => {
    const today = new Date();
    let start: Date;
    switch (timeFrame) {
      case "last_7_days":
        start = new Date();
        start.setDate(today.getDate() - 6);
        break;
      case "last_30_days":
        start = new Date();
        start.setDate(today.getDate() - 29);
        break;
      case "last_90_days":
        start = new Date();
        start.setDate(today.getDate() - 89);
        break;
      case "last_year":
        start = new Date();
        start.setFullYear(today.getFullYear() - 1);
        start.setDate(today.getDate() + 1);
        break;
      case "all_time":
        start = new Date();
        start.setFullYear(today.getFullYear() - 10);
        start.setDate(today.getDate() + 10);
        break;
      default:
        start = new Date();
        start.setDate(today.getDate() - 29);
        break;
    }
    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    dispatch(
      setTimeFrame({
        startDate: formatDate(start),
        endDate: formatDate(today),
      }),
    );
  }, [timeFrame, dispatch]);

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (
        filtersRef.current &&
        !filtersRef.current.contains(e.target as Node)
      ) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLanguageChange = (lng: Language) => {
    // Redux `settings.language`/`isRTL` are updated via the i18n
    // "languageChanged" listener once the bundle actually loads — see src/i18n/index.ts.
    i18n.changeLanguage(lng).catch((error) => {
      console.error("Failed to change language", error);
    });
  };

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 border-b shadow-sm",
          isDark ? "border-gray-800 bg-gray-900" : "bg-white border-gray-200",
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-2">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => dispatch(toggleMobileSidebar())}
                className={clsx(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  isDark
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100",
                )}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <img
                src={getLogoByLanguage(language)}
                alt="Logo image"
                className="h-14 sm:h-16 w-auto object-contain shrink-0"
              />
              <div className="hidden sm:block">
                <h1 className={clsx(textPrimary)}>{t("app_title")}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("executive_dashboard")}
                </p>
              </div>
            </div>

            {/* Center: selects — desktop only */}
            <div className="hidden lg:flex items-center gap-3 flex-1 justify-center">
              <ReactSelect
                isClearable={userRole !== "authority" && userRole !== "dmo"}
                isDisabled={userRole === "authority" || userRole === "dmo"}
                value={dmoId}
                onChange={(value) => dispatch(setDmo(value))}
                placeholder={t("select_dmo")}
                items={dmosAuthorities?.map((item) => ({
                  _id: item._id,
                  name: item.name,
                  logo: item?.logoPath || "",
                }))}
              />
              <ReactSelect
                isClearable={userRole !== "authority"}
                value={authorityId}
                isDisabled={userRole === "authority"}
                onChange={(value) => dispatch(setAuthority(value))}
                placeholder={t("select_authority")}
                items={selectedParent?.authorities?.map((item) => ({
                  _id: item._id,
                  name: item.name,
                  logo: item?.logoPath ?? "",
                }))}
              />
              <ReactSelect
                isClearable
                minWidth={180}
                items={filteredWebsites}
                value={websiteId}
                onChange={(value) => dispatch(setWebsite(value))}
                placeholder={t("select_website")}
              />
            </div>

            {/* Right: action icons */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className={clsx(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  filtersOpen
                    ? "bg-teal-500/20 text-teal-500"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100",
                )}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              {/* Language Toggle */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen((o) => !o)}
                  className={clsx(
                    "flex items-center justify-center border rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-teal-500",
                    textPrimary,
                  )}
                >
                  <div className="relative">
                    <span className="text-lg absolute -top-3 left-2">
                      {language === "en" && locales[0]?.flag}
                      {language === "he" && locales[1]?.flag}
                      {language === "ar" && locales[2]?.flag}
                    </span>
                    <Languages size={20} />
                  </div>
                </button>
                {langOpen && (
                  <div
                    className={clsx(
                      "absolute top-full mt-1 ltr:right-0 rtl:left-0 z-50 rounded-lg border shadow-lg min-w-37.5",
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200",
                    )}
                  >
                    {locales.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => {
                          handleLanguageChange(lang.value);
                          setLangOpen(false);
                        }}
                        className={clsx(
                          "flex items-center gap-2 w-full px-3 py-2 text-sm text-start first:rounded-t-lg last:rounded-b-lg",
                          isDark ? "hover:bg-gray-700" : "hover:bg-teal-50",
                          language === lang.value &&
                            (isDark ? "bg-gray-700" : "bg-teal-50"),
                          textPrimary,
                        )}
                      >
                        <div>{lang.flag}</div>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => dispatch(setTheme(isDark ? "light" : "dark"))}
                className={clsx(
                  "p-2 cursor-pointer rounded-lg transition-colors",
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100",
                )}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Moon className={clsx("w-5 h-5", textPrimary)} />
                ) : (
                  <Sun className={clsx("w-5 h-5", textPrimary)} />
                )}
              </button>

              {/* Edit Mode Toggle */}
              {toggleEditMode() && location.pathname === routes.dashboard && (
                <button
                  onClick={() => dispatch(toggleEditMode())}
                  className={clsx(
                    "p-2 cursor-pointer rounded-lg border transition-colors",
                    isEditMode
                      ? "bg-teal-500 border-teal-600 hover:bg-teal-600"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700",
                  )}
                  aria-label="Toggle edit mode"
                >
                  {isEditMode ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
              )}

              <ChatNotificationBell />
              <NotificationsBell />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile filters panel */}
      {filtersOpen && (
        <div
          ref={filtersRef}
          className={clsx(
            "fixed top-20 left-0 right-0 z-49 lg:hidden border-b shadow-lg px-4 py-4 flex flex-col gap-3",
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={clsx("text-sm font-medium", textPrimary)}>
              {t("filters") || "Filters"}
            </span>
            <button
              onClick={() => setFiltersOpen(false)}
              className={clsx(
                "p-1 rounded-lg transition-colors",
                isDark
                  ? "text-gray-400 hover:bg-gray-800"
                  : "text-gray-500 hover:bg-gray-100",
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ReactSelect
            isClearable={userRole !== "authority" && userRole !== "dmo"}
            isDisabled={userRole === "authority" || userRole === "dmo"}
            value={dmoId}
            onChange={(value) => dispatch(setDmo(value))}
            placeholder={t("select_dmo")}
            items={dmosAuthorities?.map((item) => ({
              _id: item._id,
              name: item.name,
              logo: item?.logoPath || "",
            }))}
          />
          <ReactSelect
            isClearable={userRole !== "dmo"}
            value={authorityId}
            isDisabled={userRole === "authority" || userRole === "dmo"}
            onChange={(value) => dispatch(setAuthority(value))}
            placeholder={t("select_authority")}
            items={selectedParent?.authorities?.map((item) => ({
              _id: item._id,
              name: item.name,
              logo: item?.logoPath ?? "",
            }))}
          />
          <ReactSelect
            isClearable
            items={filteredWebsites}
            value={websiteId}
            onChange={(value) => dispatch(setWebsite(value))}
            placeholder={t("select_website")}
          />
        </div>
      )}
    </>
  );
}
