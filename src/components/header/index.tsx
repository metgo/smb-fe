import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, ChevronDown, Monitor, Calendar, Settings, Check } from 'lucide-react';

import { useAppSelector } from '@/hooks/hooks';
import { toggleEditMode } from '@/features/uiSlice';
import { setLanguage, setTheme } from '@/features/settingsSlice';
import { useCommon } from '@/hooks/useCommon';
import clsx from 'clsx';
import { useThemeClasses } from '@/hooks/useThemeClasses';



export default function Header() {
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation('common');

  const { languages, authorities, websites, dateRanges } = useCommon()
  const { theme, language } = useAppSelector((state) => state.settings)
  const { isEditMode, } = useAppSelector((state) => state.ui)
  const { textPrimary, selectInputClasses } = useThemeClasses()

  const handleLanguageChange = (lng: string) => {
    dispatch(setLanguage(lng))
    i18n.changeLanguage(lng)
  }
  return (
    <header className={clsx(
      "fixed top-0 left-0 right-0 z-50 border-b shadow-sm",
      theme === "dark" ? "border-gray-800 bg-gray-900" : "bg-white   border-gray-200"
    )}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={clsx(textPrimary)}>{t('app_title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('executive_dashboard')}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Authority Selector */}
            <div className="relative">
              <select
                // value={selectedAuthority}
                // onChange={(e) => setSelectedAuthority(e.target.value)}
                className={clsx(
                  "appearance-none border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-50",
                  selectInputClasses
                )}
              >
                {authorities.map((auth) => (
                  <option key={auth.value} value={auth.value}>
                    {auth.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Website Selector */}
            <div className="relative">
              <select
                // value={selectedWebsite}
                // onChange={(e) => setSelectedWebsite(e.target.value)}
                className={clsx(
                  "appearance-none border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-45",
                  selectInputClasses
                )}
              >
                {websites.map((site) => (
                  <option key={site.value} value={site.value}>
                    {site.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Date Range Selector */}
            <div className="relative">
              <Calendar className="absolute top-1/2 ltr:left-3 rtl:right-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <select
                // value={dateRange}
                // onChange={(e) => setDateRange(e.target.value)}
                className={clsx(
                  "appearance-none border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-40",
                  selectInputClasses
                )}
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Language Toggle */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className={clsx(
                  "appearance-none border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
                  selectInputClasses
                )}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))}
              className="p-2 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* View Toggle */}
            {/* {onSwitchView && ( */}
            <button
              // onClick={onSwitchView}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle view"
            >
              <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            {/* )} */}

            {/* Edit Mode Toggle */}
            {toggleEditMode() && (
              <button
                onClick={() => dispatch(toggleEditMode())}
                className={`p-2 cursor-pointer rounded-lg border transition-colors ${isEditMode
                  ? 'bg-teal-500 border-teal-600 hover:bg-teal-600'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
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