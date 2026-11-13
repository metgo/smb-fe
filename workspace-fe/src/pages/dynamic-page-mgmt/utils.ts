export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileExt = (name: string): string =>
  name.split(".").pop()?.toLowerCase() ?? "";

export const canPreview = (name: string): boolean => getFileExt(name) === "pdf";

export const getFileTypeMeta = (name: string) => {
  const ext = getFileExt(name);
  switch (ext) {
    case "pdf":
      return {
        label: "PDF",
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
      };
    case "doc":
    case "docx":
      return {
        label: "DOC",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
      };
    case "xls":
    case "xlsx":
      return {
        label: "XLS",
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
      };
    case "ppt":
    case "pptx":
      return {
        label: "PPT",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-800",
      };
    case "txt":
      return {
        label: "TXT",
        bg: "bg-gray-100 dark:bg-gray-700",
        text: "text-gray-600 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-600",
      };
    default:
      return {
        label: ext.toUpperCase() || "FILE",
        bg: "bg-teal-100 dark:bg-teal-900/30",
        text: "text-teal-600 dark:text-teal-400",
        border: "border-teal-200 dark:border-teal-800",
      };
  }
};
