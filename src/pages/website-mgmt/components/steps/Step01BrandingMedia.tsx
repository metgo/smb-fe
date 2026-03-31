import { useRef } from "react";
import { X, Image as ImageIcon, Loader } from "lucide-react";
import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: SiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (field: keyof SiteSettingsFormData, value: string) => void;
  uploadStates: Record<string, "idle" | "uploading" | "done" | "error">;
  onFileSelect: (field: keyof SiteSettingsFormData, file: File) => void;
  onFileClear: (field: keyof SiteSettingsFormData) => void;
}

function UploadBox({
  label,
  hint,
  accept,
  value,
  uploadState,
  onSelect,
  onClear,
  icon: Icon,
  inputClasses,
  borderColor,
  textPrimary,
  textSecondary,
  isDark,
}: {
  label: string;
  hint: string;
  accept: string;
  value: string;
  uploadState: "idle" | "uploading" | "done" | "error";
  onSelect: (f: File) => void;
  onClear: () => void;
  icon: React.FC<{ className?: string }>;
  inputClasses: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  void inputClasses;

  return (
    <div className="flex flex-col gap-2">
      <span className={clsx("text-sm font-medium", textPrimary)}>{label}</span>

      {value ? (
        <div
          className={clsx(
            "relative rounded-xl border overflow-hidden",
            borderColor,
          )}
        >
          <img
            src={value}
            alt={label}
            className="w-full h-40 object-contain p-2"
          />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          disabled={uploadState === "uploading"}
          className={clsx(
            "flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed transition-colors cursor-pointer",
            isDark
              ? "border-gray-700 hover:border-teal-600"
              : "border-gray-300 hover:border-teal-500",
            uploadState === "uploading" && "opacity-60 cursor-not-allowed",
          )}
        >
          {uploadState === "uploading" ? (
            <Loader className="w-6 h-6 animate-spin text-teal-500" />
          ) : (
            <Icon className="w-6 h-6 text-gray-400" />
          )}
          <span className={clsx("text-sm", textSecondary)}>
            {uploadState === "uploading" ? "Uploading…" : "Click to upload"}
          </span>
          <span className={clsx("text-xs", textSecondary)}>{hint}</span>
        </button>
      )}

      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
      />
    </div>
  );
}

export default function Step01BrandingMedia({
  formData,
  uploadStates,
  onFileSelect,
  onFileClear,
}: Props) {
  const { inputClasses, borderColor, textPrimary, textSecondary, isDark } =
    useThemeClasses();

  const shared = {
    inputClasses,
    borderColor,
    textPrimary,
    textSecondary,
    isDark,
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <ImageIcon className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          Branding & Media Assets
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <UploadBox
          {...shared}
          label="Website Logo"
          hint="PNG / SVG • Recommended 200×60px"
          accept="image/png,image/svg+xml,image/webp"
          value={formData.logoUrl}
          uploadState={uploadStates["logoUrl"] ?? "idle"}
          onSelect={(f) => onFileSelect("logoUrl", f)}
          onClear={() => onFileClear("logoUrl")}
          icon={ImageIcon}
        />

        <UploadBox
          {...shared}
          label="Favicon"
          hint=".ico / PNG • 32×32px"
          accept="image/x-icon,image/png"
          value={formData.faviconUrl}
          uploadState={uploadStates["faviconUrl"] ?? "idle"}
          onSelect={(f) => onFileSelect("faviconUrl", f)}
          onClear={() => onFileClear("faviconUrl")}
          icon={ImageIcon}
        />

        <UploadBox
          {...shared}
          label="Loader / Splash Screen Logo"
          hint="PNG / SVG (optional)"
          accept="image/png,image/svg+xml"
          value={formData.splashLogoUrl}
          uploadState={uploadStates["splashLogoUrl"] ?? "idle"}
          onSelect={(f) => onFileSelect("splashLogoUrl", f)}
          onClear={() => onFileClear("splashLogoUrl")}
          icon={ImageIcon}
        />
      </div>
    </div>
  );
}
