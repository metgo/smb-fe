import { useRef, useState } from "react";
import {
  Video,
  Loader,
  CheckCircle2,
  Monitor,
  Smartphone,
  Upload,
  X,
  Play,
} from "lucide-react";
import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: SiteSettingsFormData;
  uploadStates: Record<string, "idle" | "uploading" | "done" | "error">;
  onVideoAdd: (
    field: "desktopVideos" | "mobileVideos",
    file: File,
  ) => Promise<void>;
  onVideoRemove: (field: "desktopVideos" | "mobileVideos", id: string) => void;
  onVideoActivate: (
    field: "desktopVideos" | "mobileVideos",
    id: string,
  ) => void;
}

interface SectionProps {
  label: string;
  icon: React.FC<{ className?: string }>;
  videos: VideoItem[];
  uploadStates: Record<string, "idle" | "uploading" | "done" | "error">;
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  onActivate: (id: string) => void;
  onPreview: (video: VideoItem) => void;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
}

/* ------------------------------------------------------------------ */
/*  Video Preview Modal                                                 */
/* ------------------------------------------------------------------ */

function VideoModal({
  video,
  onClose,
  textPrimary,
  isDark,
}: {
  video: VideoItem;
  onClose: () => void;
  textPrimary: string;
  isDark: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className={clsx(
          "relative z-10 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl",
          isDark ? "bg-gray-900" : "bg-white",
        )}
        onClick={(e) => e.stopPropagation()}
      >
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
                Active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video player */}
        <div className="bg-black aspect-video">
          <video src={video.url} controls autoPlay className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Video Card                                                          */
/* ------------------------------------------------------------------ */

function VideoCard({
  video,
  uploadState,
  onPreview,
  onActivate,
  onRemove,
  borderColor,
  textPrimary,
  textSecondary,
  isDark,
}: {
  video: VideoItem;
  uploadState: "idle" | "uploading" | "done" | "error";
  onPreview: () => void;
  onActivate: () => void;
  onRemove: () => void;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
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
            <Loader className="w-6 h-6 animate-spin text-teal-500" />
            <span className={clsx("text-xs", textSecondary)}>Uploading…</span>
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
            Active
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
            <p className="text-xs text-red-400">Upload failed</p>
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
            Set Active
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
  onAdd,
  onRemove,
  onActivate,
  onPreview,
  borderColor,
  textPrimary,
  textSecondary,
  isDark,
}: SectionProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-teal-500" />
          <span className={clsx("text-sm font-semibold", textPrimary)}>
            {label}
          </span>
          <span
            className={clsx(
              "text-xs px-2 py-0.5 rounded-full",
              isDark
                ? "bg-gray-700 text-gray-400"
                : "bg-gray-100 text-gray-500",
            )}
          >
            {videos.length} video{videos.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => ref.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Video
        </button>
      </div>

      {/* Empty state */}
      {videos.length === 0 ? (
        <button
          onClick={() => ref.current?.click()}
          className={clsx(
            "flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed transition-colors cursor-pointer w-full",
            isDark
              ? "border-gray-700 hover:border-teal-600"
              : "border-gray-300 hover:border-teal-500",
          )}
        >
          <Video className="w-6 h-6 text-gray-400" />
          <span className={clsx("text-sm", textSecondary)}>
            Click to upload your first video
          </span>
          <span className={clsx("text-xs", textSecondary)}>MP4 / WebM</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              uploadState={uploadStates[video.id] ?? "done"}
              onPreview={() => onPreview(video)}
              onActivate={() => onActivate(video.id)}
              onRemove={() => onRemove(video.id)}
              borderColor={borderColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              isDark={isDark}
            />
          ))}
        </div>
      )}

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
/*  Main Step                                                           */
/* ------------------------------------------------------------------ */

export default function Step02HomeVideo({
  formData,
  uploadStates,
  onVideoAdd,
  onVideoRemove,
  onVideoActivate,
}: Props) {
  const { borderColor, textPrimary, textSecondary, isDark } = useThemeClasses();
  const theme = { borderColor, textPrimary, textSecondary, isDark };

  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-teal-500" />
          <div>
            <h2 className={clsx("text-lg font-semibold", textPrimary)}>
              Home Page Videos
            </h2>
            <p className={clsx("text-sm mt-0.5", textSecondary)}>
              Upload multiple videos per device. Only the active video will be
              shown on your home page.
            </p>
          </div>
        </div>

        <VideoSection
          {...theme}
          label="Desktop Videos"
          icon={Monitor}
          videos={formData.desktopVideos}
          uploadStates={uploadStates}
          onAdd={(f) => onVideoAdd("desktopVideos", f)}
          onRemove={(id) => onVideoRemove("desktopVideos", id)}
          onActivate={(id) => onVideoActivate("desktopVideos", id)}
          onPreview={setPreviewVideo}
        />

        <div className={clsx("border-t", borderColor)} />

        <VideoSection
          {...theme}
          label="Mobile Videos"
          icon={Smartphone}
          videos={formData.mobileVideos}
          uploadStates={uploadStates}
          onAdd={(f) => onVideoAdd("mobileVideos", f)}
          onRemove={(id) => onVideoRemove("mobileVideos", id)}
          onActivate={(id) => onVideoActivate("mobileVideos", id)}
          onPreview={setPreviewVideo}
        />
      </div>

      {/* Video preview modal */}
      {previewVideo && (
        <VideoModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
          textPrimary={textPrimary}
          isDark={isDark}
        />
      )}
    </>
  );
}
