import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Trash2,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { FileSlot, IUploadedFile } from "../types";
import { formatBytes, getFileTypeMeta, canPreview } from "../utils";

interface FileUploadSlotProps {
  slot: FileSlot;
  label: string;
  uploadedFile: IUploadedFile | null;
  isDragging: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (files: FileList) => void;
  onFileChange: (files: FileList | null) => void;
  onPreview: () => void;
  onDownload: () => void;
  onRemove: () => void;
}

export default function FileUploadSlot({
  slot,
  label,
  uploadedFile,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onPreview,
  onDownload,
  onRemove,
}: FileUploadSlotProps) {
  const { t } = useTranslation("dynamic_pages");
  const { isDark, textPrimary, textTertiary, borderColor } = useThemeClasses();
  const inputId = `doc-file-input-${slot}`;

  if (!uploadedFile) {
    return (
      <div className="space-y-2">
        <label className={clsx("block text-sm font-medium", textPrimary)}>
          {label}
          {slot === "primary" && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver();
          }}
          onDragLeave={onDragLeave}
          onDrop={(e) => {
            e.preventDefault();
            onDrop(e.dataTransfer.files);
          }}
          onClick={() => document.getElementById(inputId)?.click()}
          className={clsx(
            "group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-5 sm:p-8 text-center transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-teal-500 bg-teal-500/10 scale-[1.01]"
              : isDark
                ? "border-gray-600 hover:border-teal-500 hover:bg-teal-500/5"
                : "border-gray-300 hover:border-teal-500 hover:bg-teal-50/60",
          )}
        >
          <input
            id={inputId}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files)}
          />
          <div
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
              isDragging
                ? "bg-teal-500/20"
                : isDark
                  ? "bg-gray-700 group-hover:bg-teal-500/20"
                  : "bg-gray-100 group-hover:bg-teal-100",
            )}
          >
            <Upload
              className={clsx(
                "h-6 w-6 transition-colors",
                isDragging ? "text-teal-400" : "text-teal-500",
              )}
            />
          </div>
          <div className="space-y-1">
            <p className={clsx("text-sm font-semibold", textPrimary)}>
              {t("upload_drag_drop")}
            </p>
            <p className={clsx("text-xs", textTertiary)}>
              {t("upload_supported_formats")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {["PDF", "DOC", "XLS", "PPT", "TXT"].map((ext) => (
              <span
                key={ext}
                className={clsx(
                  "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                  isDark
                    ? "border-gray-600 bg-gray-700 text-gray-300"
                    : "border-gray-200 bg-white text-gray-500",
                )}
              >
                {ext}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const meta = getFileTypeMeta(uploadedFile.name);
  const isUploading = uploadedFile.status === "uploading";
  const isSuccess = uploadedFile.status === "success";
  const isError = uploadedFile.status === "error";

  return (
    <div className="space-y-2">
      <label className={clsx("block text-sm font-medium", textPrimary)}>
        {label}
        {slot === "primary" && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={clsx(
          "rounded-2xl border p-5 transition-colors",
          borderColor,
          isDark ? "bg-gray-800/60" : "bg-gray-50",
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border-2 font-bold text-xs tracking-wide",
              meta.bg,
              meta.text,
              meta.border,
            )}
          >
            {meta.label}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={clsx(
                    "truncate text-sm font-semibold",
                    textPrimary,
                  )}
                >
                  {uploadedFile.name}
                </p>
                <p className={clsx("text-xs mt-0.5", textTertiary)}>
                  {uploadedFile.size != null
                    ? formatBytes(uploadedFile.size)
                    : uploadedFile.docSize}
                </p>
              </div>
              <div className="shrink-0 mt-0.5">
                {isUploading && (
                  <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                )}
                {isSuccess && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {isError && <AlertCircle className="h-4 w-4 text-red-500" />}
              </div>
            </div>

            {isUploading && (
              <div className="space-y-1">
                <div
                  className={clsx(
                    "h-1.5 w-full overflow-hidden rounded-full",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                >
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-200"
                    style={{ width: `${uploadedFile.progress}%` }}
                  />
                </div>
                <p className={clsx("text-right text-xs", textTertiary)}>
                  {uploadedFile.progress}%
                </p>
              </div>
            )}

            {isSuccess && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onPreview}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    isDark
                      ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                      : "border-gray-200 bg-white text-gray-600 hover:border-teal-500 hover:text-teal-600",
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {canPreview(uploadedFile.name)
                    ? t("btn_preview")
                    : t("btn_open")}
                </button>
                <button
                  type="button"
                  onClick={onDownload}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    isDark
                      ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                      : "border-gray-200 bg-white text-gray-600 hover:border-teal-500 hover:text-teal-600",
                  )}
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("btn_download")}
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    isDark
                      ? "border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                      : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100",
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("btn_remove")}
                </button>
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onRemove}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    isDark
                      ? "border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                      : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100",
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                  {t("btn_remove")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
