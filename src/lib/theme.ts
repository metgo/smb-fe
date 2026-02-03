export const getThemeClasses = (theme: Theme): ThemeClasses => ({
  bgPrimary: theme === "dark" ? "bg-gray-950" : "bg-white",
  bgSecondary: theme === "dark" ? "bg-gray-900" : "bg-gray-50",
  bgTertiary: theme === "dark" ? "bg-gray-800" : "bg-gray-100",

  bgStatus: theme === "dark" ? "#1f2937" : "#ffffff",
  textStatus: theme === "dark" ? "#ffffff" : "#111827",

  textPrimary: theme === "dark" ? "text-white" : "text-gray-900",
  textSecondary: theme === "dark" ? "text-gray-300" : "text-gray-700",
  textTertiary: theme === "dark" ? "text-gray-400" : "text-gray-600",

  borderColor: theme === "dark" ? "border-gray-800" : "border-gray-200",
  hoverBg: theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50",

  cardClasses:
    theme === "dark"
      ? "bg-gray-800/50 backdrop-blur border border-gray-700"
      : "bg-white border border-gray-200 shadow-sm",

  inputClasses:
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",

  selectInputClasses:
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-white"
      : "bg-gray-50 border-gray-300 text-gray-900",

  exportBtnBgClasses:
    theme === "dark"
      ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
      : "bg-gray-100 hover:bg-gray-200 text-gray-700",
});
