export const getStatusColor = (status: string, isDark: boolean) => {
  switch (status) {
    case "ACTIVE":
      return isDark
        ? "bg-green-950/30 text-green-400 border-green-800"
        : "bg-green-100 text-green-700 border-green-200";

    case "DRAFT":
      return isDark
        ? "bg-gray-800 text-gray-300 border-gray-700"
        : "bg-gray-100 text-gray-700 border-gray-200";

    case "COMPLETED":
      return isDark
        ? "bg-blue-950/30 text-blue-400 border-blue-800"
        : "bg-blue-100 text-blue-700 border-blue-200";

    case "PAUSED":
      return isDark
        ? "bg-orange-950/30 text-orange-400 border-orange-800"
        : "bg-orange-100 text-orange-700 border-orange-200";

    default:
      return isDark
        ? "bg-gray-800 text-gray-300 border-gray-700"
        : "bg-gray-100 text-gray-700 border-gray-200";
  }
};
