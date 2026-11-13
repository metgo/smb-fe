import clsx from "clsx";
import { X, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IUploadedFile } from "../types";
import { getFileTypeMeta } from "../utils";

interface PdfPreviewModalProps {
  file: IUploadedFile;
  onClose: () => void;
  onDownload: () => void;
}

export default function PdfPreviewModal({
  file,
  onClose,
  onDownload,
}: PdfPreviewModalProps) {
  const { t } = useTranslation("dynamic_pages");
  const { isDark, textPrimary } = useThemeClasses();
  const meta = getFileTypeMeta(file.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border shadow-2xl overflow-hidden",
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div
          className={clsx(
            "flex shrink-0 items-center justify-between border-b px-5 py-3",
            isDark ? "border-gray-700" : "border-gray-200",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={clsx(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                meta.bg,
                meta.text,
              )}
            >
              {meta.label}
            </div>
            <p className={clsx("truncate text-sm font-medium", textPrimary)}>
              {file.name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                isDark
                  ? "border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                  : "border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600",
              )}
            >
              <Download className="h-3.5 w-3.5" />
              {t("btn_download")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                "rounded-lg p-1.5 transition-colors",
                isDark
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-500",
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <iframe src={file.gcsUrl} className="flex-1 w-full" title={file.name} />
      </div>
    </div>
  );
}
