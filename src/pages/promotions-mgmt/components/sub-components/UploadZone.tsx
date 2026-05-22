import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, Upload, Link as LinkIcon } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import CircularProgress from "@/components/shared/CircularProgress";
import type { FileUploadStatus } from "@/hooks/useFileUpload";

interface UploadZoneProps {
  side: "desktop" | "mobile";
  label: string;
  hint: string;
  icon: React.ElementType;
  mediaUrl: string;
  mediaType?: "image" | "video";
  uploadStatus?: FileUploadStatus;
  uploadProgress?: number;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDelete: () => void;
  urlValue: string;
  onUrlChange: (v: string) => void;
  onFileSelect: (file: File) => void;
  required?: boolean;
}

export default function UploadZone({
  side,
  label,
  hint,
  icon: Icon,
  mediaUrl,
  mediaType = "image",
  uploadStatus = "idle",
  uploadProgress = 0,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDelete,
  urlValue,
  onUrlChange,
  onFileSelect,
  required = true,
}: UploadZoneProps) {
  const { t } = useTranslation("promotions");
  const {
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    bgPrimary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();

  const inputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadStatus === "uploading";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    /* Reset so the same file can be re-selected after deletion */
    e.target.value = "";
  };

  return (
    <div
      className={`space-y-3 rounded-md ${isDark ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Label row */}
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${textSecondary}`} />
        <span className={`text-sm font-semibold ${textPrimary}`}>{label}</span>
        {required && <span className="text-red-500 text-sm">*</span>}
      </div>

      {/* ── URL input ─────────────────────────────────────────────────── */}
      <div className="relative">
        <LinkIcon
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
        />
        <input
          type="url"
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={t("media_url_placeholder")}
          className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
        />
      </div>

      {/* ── "or" divider ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
        />
        <span className={`text-xs font-medium ${textTertiary}`}>{t("or")}</span>
        <div
          className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
        />
      </div>

      {/* ── Preview or Drop zone ───────────────────────────────────────── */}
      {mediaUrl ? (
        /* ── Preview (with progress overlay while uploading) ─────────── */
        <div
          className={`relative rounded-xl overflow-hidden border ${
            isDark ? "border-gray-700" : "border-gray-200"
          } shadow-sm group`}
        >
          {mediaType === "video" ? (
            <video
              src={mediaUrl}
              className="w-full h-44 object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={mediaUrl}
              alt={`${side} preview`}
              className="w-full h-44 object-cover"
            />
          )}

          {isUploading ? (
            /* Progress overlay */
            <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-2 rounded-xl">
              <CircularProgress progress={uploadProgress} size={56} />
              <span className="text-white text-[11px] font-medium">
                {t("uploading")}
              </span>
            </div>
          ) : (
            /* Delete overlay on hover */
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <button
                onClick={onDelete}
                disabled={isUploading}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all shadow-lg disabled:cursor-not-allowed"
              >
                <X className="w-3.5 h-3.5" />
                {t("remove")}
              </button>
            </div>
          )}

          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm">
            {side === "desktop"
              ? t("desktop_recommendation")
              : t("mobile_recommendation")}
          </div>
        </div>
      ) : (
        /* ── Drop zone ────────────────────────────────────────────────── */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver(e);
          }}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none ${
            dragOver
              ? "border-green-500 bg-green-50 dark:bg-gray-700 scale-[1.01]"
              : `${borderColor} hover:border-green-400 dark:hover:border-green-600 dark:hover:bg-gray-700`
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                dragOver ? "bg-green-100 dark:bg-gray-700" : bgSecondary
              }`}
            >
              <Upload
                className={`w-5 h-5 ${dragOver ? "text-green-500" : textTertiary}`}
              />
            </div>
            <div>
              <p className={`text-sm font-medium ${textPrimary}`}>
                {dragOver ? t("drop_to_upload") : t("drag_or_click_upload")}
              </p>
              <p className={`text-xs ${textTertiary} mt-0.5`}>{hint}</p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
