import clsx from "clsx";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Moon, Sun, ChevronDown, Settings, Check } from "lucide-react";

import { routes } from "@/lib/routes";
import { useCommon } from "@/hooks/useCommon";
import { toggleEditMode } from "@/features/uiSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { setLanguage, setTheme } from "@/features/settingsSlice";
import {
  setAuthority,
  setDmo,
  setTimeFrame,
  setWebsite,
  setTimeFrameValue,
} from "@/features/authSlice";
import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { locales } from "@/lib/utils";

export default function Header() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { t, i18n } = useTranslation("common");

  const { allWebsites, dateRanges: timeframes, dmosAuthorities } = useCommon();
  const { language } = useAppSelector((state) => state.settings);
  const { authorityId, dmoId, websiteId, userRole, timeFrame } = useAppSelector(
    (state) => state.auth,
  );

  const { isEditMode } = useAppSelector((state) => state.ui);
  const { textPrimary, selectInputClasses, isDark } = useThemeClasses();
  const selectedParent = dmosAuthorities?.find((item) => item._id === dmoId);

  const filteredWebsites = useMemo(() => {
    const result = [];

    if (!allWebsites?.length) return [];

    // If nothing selected → return empty
    if (!dmoId && !authorityId) {
      return [];
    }

    for (const site of allWebsites) {
      const matchDmo = dmoId && site.dmoIds?.includes(dmoId);
      const matchAuthority =
        authorityId && site.authorityIds?.includes(authorityId);

      // OR logic
      if (matchDmo || matchAuthority) {
        result.push(site);
      }
    }

    return result;
  }, [allWebsites, dmoId, authorityId]);

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

  const handleLanguageChange = (lng: Language) => {
    dispatch(setLanguage(lng));
    i18n.changeLanguage(lng);
  };

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 border-b shadow-sm",
        isDark ? "border-gray-800 bg-gray-900" : "bg-white   border-gray-200",
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={clsx("flex items-center justify-between h-20")}>
          {/* Logo and Brand */}
          <div className={clsx("flex items-center gap-3")}>
            <img
              src="/assets/images/metgologo.png"
              alt="Logo image"
              className="w-10 h-10"
            />
            <div>
              <h1 className={clsx(textPrimary)}>{t("app_title")}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("executive_dashboard")}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className={clsx("flex items-center gap-3")}>
            <ReactSelect
              isClearable={userRole !== "authority"}
              isDisabled={userRole === "authority"}
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
              isClearable
              value={authorityId}
              isDisabled={userRole === "authority"}
              onChange={(value) => dispatch(setAuthority(value))}
              placeholder={t("select_authority")}
              items={selectedParent?.authorities?.map((item) => ({
                _id: item._id,
                name: item.name,
                logo: item?.logoPath,
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

            {/* Date Range Selector */}
            <div className="relative">
              <select
                value={timeFrame}
                onChange={(e) => dispatch(setTimeFrameValue(e.target.value))}
                className={clsx(
                  "appearance-none border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
                  selectInputClasses,
                )}
              >
                {timeframes.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Language Toggle */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) =>
                  handleLanguageChange(e.target.value as Language)
                }
                className={clsx(
                  "appearance-none border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
                  selectInputClasses,
                )}
              >
                {locales.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(setTheme(isDark ? "light" : "dark"))}
              className={clsx(
                "p-2 cursor-pointer rounded-lg  transition-colors",
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

            {/* View Toggle */}
            {/* <button
              className={clsx(
                "p-2 rounded-lg transition-colors cursor-pointer",
                hoverBg,
              )}
              aria-label="Toggle view"
            >
              <Monitor className={clsx("w-5 h-5", textPrimary)} />
            </button> */}

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
          </div>
        </div>
      </div>
    </header>
  );
}
