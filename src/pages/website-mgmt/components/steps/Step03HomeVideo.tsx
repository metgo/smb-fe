import { useRef, useState } from "react";
import {
  Video,
  CheckCircle2,
  Monitor,
  Smartphone,
  Upload,
  X,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import CircularProgress from "@/components/shared/CircularProgress";
import { ModalWrapper } from "@/components/wrapper";

interface Props {
  formData: ISiteSettingsFormData;
  uploadStates: Record<string, "idle" | "uploading" | "done" | "error">;
  uploadProgress: Record<string, number>;
  onVideoAdd: (
    field: "desktopVideos" | "mobileVideos",
    file: File,
  ) => Promise<void>;
  onVideoRemove: (field: "desktopVideos" | "mobileVideos", id: string) => void;
  onVideoActivate: (
    field: "desktopVideos" | "mobileVideos",
    id: string,
  ) => void;
  onThumbnailAdd: (
    field: "desktopVideoThumbnails" | "mobileVideoThumbnails",
    file: File,
  ) => Promise<void>;
  onThumbnailRemove: (
    field: "desktopVideoThumbnails" | "mobileVideoThumbnails",
    id: string,
  ) => void;
  onThumbnailActivate: (
    field: "desktopVideoThumbnails" | "mobileVideoThumbnails",
    id: string,
  ) => void;
}

interface SectionProps {
  label: string;
  icon: React.FC<{ className?: string }>;
  videos: VideoItem[];
  uploadStates: Record<string, "idle" | "uploading" | "done" | "error">;
  uploadProgress: Record<string, number>;
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  onActivate: (id: string) => void;
  onPreview: (video: VideoItem) => void;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
  labels: {
    active: string;
    setActive: string;
    uploadVideo: string;
    uploadFailed: string;
    uploadFirstVideo: string;
    videoFormats: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Video Preview Modal                                                 */
/* ------------------------------------------------------------------ */

function VideoModal({
  video,
  onClose,
  textPrimary,
  labels,
}: {
  video: VideoItem;
  onClose: () => void;
  textPrimary: string;
  labels: { active: string };
}) {
  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-2xl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/10">
          <div className="flex items-center gap-2 min-w-0">
            <Video className="w-4 h-4 text-teal-500 shrink-0" />
            <span className={clsx("text-sm font-medium truncate", textPrimary)}>
              {video.name}
            </span>
            {video.isActive && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-medium shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                {labels.active}
              </span>
            )}
          </div>
        </div>

        {/* Video player */}
        <div className="bg-black aspect-video">
          <video src={video.url} controls autoPlay className="w-full h-full" />
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ------------------------------------------------------------------ */
/*  Video Card                                                          */
/* ------------------------------------------------------------------ */

function VideoCard({
  video,
  uploadState,
  uploadProgress,
  onPreview,
  onActivate,
  onRemove,
  borderColor,
  textPrimary,
  isDark,
  labels,
}: {
  video: VideoItem;
  uploadState: "idle" | "uploading" | "done" | "error";
  uploadProgress: number;
  onPreview: () => void;
  onActivate: () => void;
  onRemove: () => void;
  borderColor: string;
  textPrimary: string;
  isDark: boolean;
  labels: { active: string; setActive: string; uploadFailed: string };
}) {
  return (
    <div
      className={clsx(
        "flex flex-col rounded-xl border overflow-hidden transition-all",
        borderColor,
        video.isActive
          ? isDark
            ? "ring-2 ring-teal-500/60 border-teal-500/40"
            : "ring-2 ring-teal-500/40 border-teal-300"
          : isDark
            ? "hover:border-gray-600"
            : "hover:border-gray-300",
      )}
    >
      {/* Thumbnail / preview area */}
      <button
        onClick={uploadState === "uploading" ? undefined : onPreview}
        disabled={uploadState === "uploading"}
        className={clsx(
          "relative flex items-center justify-center aspect-video w-full group",
          isDark ? "bg-gray-800" : "bg-gray-100",
          uploadState !== "uploading" && "cursor-pointer",
        )}
      >
        {uploadState === "uploading" ? (
          <div className="flex flex-col items-center gap-2">
            <CircularProgress progress={uploadProgress} size={56} />
          </div>
        ) : (
          <>
            {/* Video thumbnail via video element (hidden, just for poster) */}
            <video
              src={video.url}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              muted
              preload="metadata"
            />
            {/* Play button overlay */}
            <div className="relative z-10 w-11 h-11 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-teal-500/80 group-hover:scale-110 transition-all">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </>
        )}

        {/* Active badge overlay */}
        {video.isActive && uploadState !== "uploading" && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-500 text-white text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {labels.active}
          </div>
        )}
      </button>

      {/* Card footer */}
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-2.5",
          isDark ? "bg-gray-800/60" : "bg-white",
        )}
      >
        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className={clsx("text-xs font-medium truncate", textPrimary)}>
            {video.name}
          </p>
          {uploadState === "error" && (
            <p className="text-xs text-red-400">{labels.uploadFailed}</p>
          )}
        </div>

        {/* Set active button */}
        {!video.isActive && uploadState !== "uploading" && (
          <button
            onClick={onActivate}
            className={clsx(
              "px-2 py-1 rounded-md border text-xs font-medium transition-colors shrink-0",
              isDark
                ? "border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                : "border-gray-200 text-gray-500 hover:border-teal-400 hover:text-teal-600",
            )}
          >
            {labels.setActive}
          </button>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="p-1 rounded-md text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Video Section                                                       */
/* ------------------------------------------------------------------ */

function VideoSection({
  label,
  icon: Icon,
  videos,
  uploadStates,
  uploadProgress,
  onAdd,
  onRemove,
  onActivate,
  onPreview,
  borderColor,
  textPrimary,
  textSecondary,
  isDark,
  labels,
}: SectionProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-teal-500" />
        <span className={clsx("text-sm font-semibold", textPrimary)}>
          {label}
        </span>
        <span
          className={clsx(
            "text-xs px-2 py-0.5 rounded-full",
            isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500",
          )}
        >
          {videos.length} video{videos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid — always shown, upload card at the end */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            uploadState={uploadStates[video._id] ?? "done"}
            uploadProgress={uploadProgress[video._id] ?? 0}
            onPreview={() => onPreview(video)}
            onActivate={() => onActivate(video._id)}
            onRemove={() => onRemove(video._id)}
            borderColor={borderColor}
            textPrimary={textPrimary}
            isDark={isDark}
            labels={labels}
          />
        ))}

        {/* Upload card */}
        <button
          onClick={() => ref.current?.click()}
          className={clsx(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed aspect-video transition-colors",
            isDark
              ? "border-gray-700 hover:border-teal-500 hover:bg-teal-500/5"
              : "border-gray-300 hover:border-teal-500 hover:bg-teal-50",
          )}
        >
          <div
            className={clsx(
              "w-9 h-9 rounded-full flex items-center justify-center",
              isDark ? "bg-gray-700" : "bg-gray-100",
            )}
          >
            <Upload className="w-4 h-4 text-teal-500" />
          </div>
          <span className={clsx("text-xs font-medium", textSecondary)}>
            {videos.length === 0 ? labels.uploadFirstVideo : labels.uploadVideo}
          </span>
          {videos.length === 0 && (
            <span className={clsx("text-xs", textSecondary)}>
              {labels.videoFormats}
            </span>
          )}
        </button>
      </div>

      <input
        ref={ref}
        type="file"
        accept="video/mp4,video/webm"
        multiple
        className="hidden"
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach((f) => onAdd(f));
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Thumbnail Card                                                      */
/* ------------------------------------------------------------------ */

function ThumbnailCard({
  thumbnail,
  uploadState,
  uploadProgress,
  onActivate,
  onRemove,
  borderColor,
  textPrimary,
  isDark,
  labels,
}: {
  thumbnail: ThumnailItem;
  uploadState: "idle" | "uploading" | "done" | "error";
  uploadProgress: number;
  onActivate: () => void;
  onRemove: () => void;
  borderColor: string;
  textPrimary: string;
  isDark: boolean;
  labels: { active: string; setActive: string; uploadFailed: string };
}) {
  return (
    <div
      className={clsx(
        "flex flex-col rounded-xl border overflow-hidden transition-all",
        borderColor,
        thumbnail.isActive
          ? isDark
            ? "ring-2 ring-teal-500/60 border-teal-500/40"
            : "ring-2 ring-teal-500/40 border-teal-300"
          : isDark
            ? "hover:border-gray-600"
            : "hover:border-gray-300",
      )}
    >
      <div
        className={clsx(
          "relative flex items-center justify-center aspect-video w-full",
          isDark ? "bg-gray-800" : "bg-gray-100",
        )}
      >
        {uploadState === "uploading" ? (
          <CircularProgress progress={uploadProgress} size={56} />
        ) : (
          <img
            src={thumbnail.url}
            alt={thumbnail.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {thumbnail.isActive && uploadState !== "uploading" && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-500 text-white text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {labels.active}
          </div>
        )}
      </div>

      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-2.5",
          isDark ? "bg-gray-800/60" : "bg-white",
        )}
      >
        <div className="flex-1 min-w-0">
          <p className={clsx("text-xs font-medium truncate", textPrimary)}>
            {thumbnail.name}
          </p>
          {uploadState === "error" && (
            <p className="text-xs text-red-400">{labels.uploadFailed}</p>
          )}
        </div>

        {!thumbnail.isActive && uploadState !== "uploading" && (
          <button
            onClick={onActivate}
            className={clsx(
              "px-2 py-1 rounded-md border text-xs font-medium transition-colors shrink-0",
              isDark
                ? "border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                : "border-gray-200 text-gray-500 hover:border-teal-400 hover:text-teal-600",
            )}
          >
            {labels.setActive}
          </button>
        )}

        <button
          onClick={onRemove}
          className="p-1 rounded-md text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Thumbnail Section                                                   */
/* ------------------------------------------------------------------ */

function ThumbnailSection({
  label,
  thumbnails,
  uploadStates,
  uploadProgress,
  onAdd,
  onRemove,
  onActivate,
  borderColor,
  textPrimary,
  textSecondary,
  isDark,
  labels,
}: {
  label: string;
  thumbnails: ThumnailItem[];
  uploadStates: Record<string, "idle" | "uploading" | "done" | "error">;
  uploadProgress: Record<string, number>;
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  onActivate: (id: string) => void;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
  labels: {
    active: string;
    setActive: string;
    uploadFailed: string;
    uploadThumbnail: string;
    uploadFirstThumbnail: string;
    thumbnailFormats: string;
  };
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-teal-500" />
        <span className={clsx("text-sm font-semibold", textPrimary)}>
          {label}
        </span>
        <span
          className={clsx(
            "text-xs px-2 py-0.5 rounded-full",
            isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500",
          )}
        >
          {thumbnails.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {thumbnails.map((thumbnail) => (
          <ThumbnailCard
            key={thumbnail._id}
            thumbnail={thumbnail}
            uploadState={uploadStates[thumbnail._id] ?? "done"}
            uploadProgress={uploadProgress[thumbnail._id] ?? 0}
            onActivate={() => onActivate(thumbnail._id)}
            onRemove={() => onRemove(thumbnail._id)}
            borderColor={borderColor}
            textPrimary={textPrimary}
            isDark={isDark}
            labels={labels}
          />
        ))}

        {/* Upload card */}
        <button
          onClick={() => ref.current?.click()}
          className={clsx(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed aspect-video transition-colors",
            isDark
              ? "border-gray-700 hover:border-teal-500 hover:bg-teal-500/5"
              : "border-gray-300 hover:border-teal-500 hover:bg-teal-50",
          )}
        >
          <div
            className={clsx(
              "w-9 h-9 rounded-full flex items-center justify-center",
              isDark ? "bg-gray-700" : "bg-gray-100",
            )}
          >
            <Upload className="w-4 h-4 text-teal-500" />
          </div>
          <span className={clsx("text-xs font-medium", textSecondary)}>
            {thumbnails.length === 0
              ? labels.uploadFirstThumbnail
              : labels.uploadThumbnail}
          </span>
          {thumbnails.length === 0 && (
            <span className={clsx("text-xs", textSecondary)}>
              {labels.thumbnailFormats}
            </span>
          )}
        </button>
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onAdd(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Step                                                           */
/* ------------------------------------------------------------------ */

const Step03HomeVideo = ({
  formData,
  uploadStates,
  uploadProgress,
  onVideoAdd,
  onVideoRemove,
  onVideoActivate,
  onThumbnailAdd,
  onThumbnailRemove,
  onThumbnailActivate,
}: Props) => {
  const { t } = useTranslation("website_settings");
  const { borderColor, textPrimary, textSecondary, isDark } = useThemeClasses();
  const theme = { borderColor, textPrimary, textSecondary, isDark };

  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");

  const videoLabels = {
    active: t("active"),
    setActive: t("set_active"),
    uploadVideo: t("upload_video"),
    uploadFailed: t("upload_failed_label"),
    uploadFirstVideo: t("upload_first_video"),
    videoFormats: t("video_formats"),
  };

  const thumbnailLabels = {
    active: t("active"),
    setActive: t("set_active"),
    uploadFailed: t("upload_failed_label"),
    uploadThumbnail: t("upload_thumbnail"),
    uploadFirstThumbnail: t("upload_first_thumbnail"),
    thumbnailFormats: t("thumbnail_formats"),
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-teal-500" />
          <div>
            <h2 className={clsx("text-lg font-semibold", textPrimary)}>
              {t("videos_title")}
            </h2>
            <p className={clsx("text-sm mt-0.5", textSecondary)}>
              {t("videos_subtitle")}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className={clsx(
            "flex gap-1 p-1 rounded-xl self-start",
            isDark ? "bg-gray-800" : "bg-gray-100",
          )}
        >
          {(["desktop", "mobile"] as const).map((tab) => {
            const Icon = tab === "desktop" ? Monitor : Smartphone;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                  isActive
                    ? isDark
                      ? "bg-gray-700 text-teal-400 shadow-sm"
                      : "bg-white text-teal-600 shadow-sm"
                    : isDark
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-500 hover:text-gray-700",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab === "desktop" ? t("desktop_videos") : t("mobile_videos")}
              </button>
            );
          })}
        </div>

        {activeTab === "desktop" ? (
          <>
            <VideoSection
              {...theme}
              label={t("desktop_videos")}
              icon={Monitor}
              videos={formData.desktopVideos}
              uploadStates={uploadStates}
              uploadProgress={uploadProgress}
              onAdd={(f) => onVideoAdd("desktopVideos", f)}
              onRemove={(id) => onVideoRemove("desktopVideos", id)}
              onActivate={(id) => onVideoActivate("desktopVideos", id)}
              onPreview={setPreviewVideo}
              labels={videoLabels}
            />
            <ThumbnailSection
              {...theme}
              label={t("desktop_video_thumbnails")}
              thumbnails={formData.desktopVideoThumbnails}
              uploadStates={uploadStates}
              uploadProgress={uploadProgress}
              onAdd={(f) => onThumbnailAdd("desktopVideoThumbnails", f)}
              onRemove={(id) => onThumbnailRemove("desktopVideoThumbnails", id)}
              onActivate={(id) =>
                onThumbnailActivate("desktopVideoThumbnails", id)
              }
              labels={thumbnailLabels}
            />
          </>
        ) : (
          <>
            <VideoSection
              {...theme}
              label={t("mobile_videos")}
              icon={Smartphone}
              videos={formData.mobileVideos}
              uploadStates={uploadStates}
              uploadProgress={uploadProgress}
              onAdd={(f) => onVideoAdd("mobileVideos", f)}
              onRemove={(id) => onVideoRemove("mobileVideos", id)}
              onActivate={(id) => onVideoActivate("mobileVideos", id)}
              onPreview={setPreviewVideo}
              labels={videoLabels}
            />
            <ThumbnailSection
              {...theme}
              label={t("mobile_video_thumbnails")}
              thumbnails={formData.mobileVideoThumbnails}
              uploadStates={uploadStates}
              uploadProgress={uploadProgress}
              onAdd={(f) => onThumbnailAdd("mobileVideoThumbnails", f)}
              onRemove={(id) => onThumbnailRemove("mobileVideoThumbnails", id)}
              onActivate={(id) =>
                onThumbnailActivate("mobileVideoThumbnails", id)
              }
              labels={thumbnailLabels}
            />
          </>
        )}
      </div>

      {previewVideo && (
        <VideoModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
          textPrimary={textPrimary}
          labels={{ active: videoLabels.active }}
        />
      )}
    </>
  );
};
export default Step03HomeVideo;
