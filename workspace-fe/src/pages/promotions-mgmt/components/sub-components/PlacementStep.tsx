import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  Monitor,
  Smartphone,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  Video,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { FileUploadStatus } from "@/hooks/useFileUpload";
import UploadZone from "./UploadZone";

interface PlacementStepProps {
  availablePlacements: string[];
  placement: string;
  mediaType: "image" | "video";

  /* Desktop upload state */
  desktopMediaUrl: string;
  desktopUploadStatus: FileUploadStatus;
  desktopUploadProgress: number;
  desktopDragOver: boolean;
  desktopUrlValue: string;
  setDesktopDragOver: (v: boolean) => void;
  onDesktopFileSelect: (file: File) => void;
  onDesktopUrlChange: (url: string) => void;
  onDesktopDelete: () => void;
  onDragOverDesktop: (e: React.DragEvent) => void;
  onDropDesktop: (e: React.DragEvent) => void;

  /* Mobile upload state */
  mobileMediaUrl: string;
  mobileUploadStatus: FileUploadStatus;
  mobileUploadProgress: number;
  mobileDragOver: boolean;
  mobileUrlValue: string;
  setMobileDragOver: (v: boolean) => void;
  onMobileFileSelect: (file: File) => void;
  onMobileUrlChange: (url: string) => void;
  onMobileDelete: () => void;
  onDragOverMobile: (e: React.DragEvent) => void;
  onDropMobile: (e: React.DragEvent) => void;

  onPlacementChange: (p: string) => void;
  onMediaTypeChange: (t: "image" | "video") => void;
}

export default function PlacementStep({
  availablePlacements,
  placement,
  mediaType,

  desktopMediaUrl,
  desktopUploadStatus,
  desktopUploadProgress,
  desktopDragOver,
  desktopUrlValue,
  setDesktopDragOver,
  onDesktopFileSelect,
  onDesktopUrlChange,
  onDesktopDelete,
  onDragOverDesktop,
  onDropDesktop,

  mobileMediaUrl,
  mobileUploadStatus,
  mobileUploadProgress,
  mobileDragOver,
  mobileUrlValue,
  setMobileDragOver,
  onMobileFileSelect,
  onMobileUrlChange,
  onMobileDelete,
  onDragOverMobile,
  onDropMobile,

  onPlacementChange,
  onMediaTypeChange,
}: PlacementStepProps) {
  const { t } = useTranslation("promotions");
  const { isDark, textPrimary, textSecondary, textTertiary } =
    useThemeClasses();

  return (
    <div
      className={clsx(
        "space-y-6 rounded-md p-4",
        isDark ? "bg-gray-900" : "bg-white",
      )}
    >
      {/* Placement cards */}
      <div>
        <label
          className={clsx("block text-sm font-semibold mb-3", textPrimary)}
        >
          {t("placement_label")} <span className="text-red-500">*</span>
        </label>

        {availablePlacements.length <= 6 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availablePlacements.map((p) => {
              const selected = placement === p;
              return (
                <button
                  key={p}
                  onClick={() => onPlacementChange(p)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 text-left",
                    isDark
                      ? "text-gray-300 bg-gray-900"
                      : "text-gray-700 bg-white",
                    selected && [
                      "border-green-600",
                      "bg-gray-50 dark:bg-green-900/20",
                      "text-green-700 dark:text-green-300 shadow-sm",
                    ],
                    !selected && [
                      "border-gray-200 dark:border-gray-900",
                      "hover:border-green-300 dark:hover:border-green-600",
                      "dark:hover:bg-gray-700",
                      "hover:text-green-600 dark:hover:text-green-400",
                    ],
                  )}
                >
                  <Layers
                    className={clsx(
                      "w-4 h-4 shrink-0",
                      selected ? "text-green-600" : textTertiary,
                    )}
                  />
                  <span className="truncate">{t(p)}</span>
                  {selected && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <select
            value={placement}
            onChange={(e) => onPlacementChange(e.target.value)}
            className={clsx(
              "w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition",
              isDark
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-200",
            )}
          >
            {availablePlacements.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

        <p className={clsx("text-xs mt-2", textTertiary)}>
          {t("placement_help_text")}
        </p>
      </div>

      {/* Media type toggle */}
      <div>
        <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
          {t("media_type")} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["image", "video"] as const).map((type) => (
            <button
              key={type}
              onClick={() => onMediaTypeChange(type)}
              className={clsx(
                "flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all",
                mediaType === type
                  ? [
                      "border-green-600",
                      isDark
                        ? "bg-green-950/30 text-green-300"
                        : "bg-green-50 text-green-700",
                    ]
                  : [
                      isDark ? "border-gray-700" : "border-gray-200",
                      textSecondary,
                      isDark
                        ? "hover:border-green-700"
                        : "hover:border-green-300",
                    ],
              )}
            >
              {type === "image" ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              {type === "image" ? t("image") : t("video")}
            </button>
          ))}
        </div>
      </div>

      {/* Upload zones */}
      <div className="grid sm:grid-cols-2 gap-5">
        <UploadZone
          side="desktop"
          label={t("desktop")}
          hint="Recommended: 1920×800 (16:7)"
          icon={Monitor}
          mediaType={mediaType}
          mediaUrl={desktopMediaUrl}
          uploadStatus={desktopUploadStatus}
          uploadProgress={desktopUploadProgress}
          dragOver={desktopDragOver}
          onDragOver={onDragOverDesktop}
          onDragLeave={() => setDesktopDragOver(false)}
          onDrop={onDropDesktop}
          onDelete={onDesktopDelete}
          urlValue={desktopUrlValue}
          onUrlChange={onDesktopUrlChange}
          onFileSelect={onDesktopFileSelect}
        />

        <UploadZone
          side="mobile"
          label={t("mobile")}
          required={false}
          hint="Recommended: 800×600 (4:3)"
          icon={Smartphone}
          mediaType={mediaType}
          mediaUrl={mobileMediaUrl}
          uploadStatus={mobileUploadStatus}
          uploadProgress={mobileUploadProgress}
          dragOver={mobileDragOver}
          onDragOver={onDragOverMobile}
          onDragLeave={() => setMobileDragOver(false)}
          onDrop={onDropMobile}
          onDelete={onMobileDelete}
          urlValue={mobileUrlValue}
          onUrlChange={onMobileUrlChange}
          onFileSelect={onMobileFileSelect}
        />
      </div>
    </div>
  );
}
