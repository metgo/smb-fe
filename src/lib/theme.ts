export const getThemeClasses = (isDark: boolean): ThemeClasses => ({
  bgPrimary: isDark ? "bg-gray-950" : "bg-white",
  bgSecondary: isDark ? "bg-gray-900" : "bg-gray-50",
  bgTertiary: isDark ? "bg-gray-800" : "bg-gray-100",

  bgStatus: isDark ? "#1f2937" : "#ffffff",
  textStatus: isDark ? "#ffffff" : "#111827",

  textPrimary: isDark ? "text-white" : "text-gray-900",
  textSecondary: isDark ? "text-gray-300" : "text-gray-700",
  textTertiary: isDark ? "text-gray-400" : "text-gray-600",

  borderColor: isDark ? "border-gray-800" : "border-gray-200",
  hoverBg: isDark ? "hover:bg-gray-800" : "hover:bg-gray-50",

  cardClasses: isDark
    ? "bg-gray-800/50 backdrop-blur border border-gray-700"
    : "bg-white border border-gray-200 shadow-sm",

  inputClasses: isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",

  selectInputClasses: isDark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-gray-50 border-gray-300 text-gray-900",

  exportBtnBgClasses: isDark
    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700",
});
