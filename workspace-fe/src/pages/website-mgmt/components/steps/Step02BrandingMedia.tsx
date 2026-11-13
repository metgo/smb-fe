import clsx from "clsx";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, Image as ImageIcon } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import CircularProgress from "@/components/shared/CircularProgress";

interface Props {
  formData: ISiteSettingsFormData;
  uploadStates: Record<string, "idle" | "uploading" | "done" | "error">;
  uploadProgress: Record<string, number>;
  onFileSelect: (field: keyof ISiteSettingsFormData, file: File) => void;
  onFileClear: (field: keyof ISiteSettingsFormData) => void;
}

function UploadBox({
  label,
  hint,
  clickToUpload,
  accept,
  value,
  uploadState,
  uploadProgress,
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
  clickToUpload: string;
  accept: string;
  value: string;
  uploadState: "idle" | "uploading" | "done" | "error";
  uploadProgress: number;
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
          {uploadState === "uploading" ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
              <CircularProgress progress={uploadProgress} />
            </div>
          ) : (
            <button
              onClick={onClear}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}
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
          <Icon className="w-6 h-6 text-gray-400" />
          <span className={clsx("text-sm", textSecondary)}>
            {clickToUpload}
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

const Step02BrandingMedia = ({
  formData,
  uploadStates,
  uploadProgress,
  onFileSelect,
  onFileClear,
}: Props) => {
  const { t } = useTranslation("website_settings");
  const { inputClasses, borderColor, textPrimary, textSecondary, isDark } =
    useThemeClasses();

  const shared = {
    inputClasses,
    borderColor,
    textPrimary,
    textSecondary,
    isDark,
    clickToUpload: t("click_to_upload"),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ImageIcon className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          {t("branding_title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <UploadBox
          {...shared}
          label={t("website_logo")}
          hint={t("logo_hint")}
          accept="image/png,image/svg+xml,image/webp"
          value={formData.logoUrl}
          uploadState={uploadStates["logoUrl"] ?? "idle"}
          uploadProgress={uploadProgress["logoUrl"] ?? 0}
          onSelect={(f) => onFileSelect("logoUrl", f)}
          onClear={() => onFileClear("logoUrl")}
          icon={ImageIcon}
        />

        <UploadBox
          {...shared}
          label={t("favicon")}
          hint={t("favicon_hint")}
          accept="image/x-icon,image/png"
          value={formData.faviconUrl}
          uploadState={uploadStates["faviconUrl"] ?? "idle"}
          uploadProgress={uploadProgress["faviconUrl"] ?? 0}
          onSelect={(f) => onFileSelect("faviconUrl", f)}
          onClear={() => onFileClear("faviconUrl")}
          icon={ImageIcon}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <UploadBox
          {...shared}
          label={t("special_symbole")}
          hint={t("logo_hint")}
          accept="image/png,image/svg+xml,image/webp"
          value={formData.specialSymbolUrl}
          uploadState={uploadStates["specialSymbolUrl"] ?? "idle"}
          uploadProgress={uploadProgress["specialSymbolUrl"] ?? 0}
          onSelect={(f) => onFileSelect("specialSymbolUrl", f)}
          onClear={() => onFileClear("specialSymbolUrl")}
          icon={ImageIcon}
        />

        <UploadBox
          {...shared}
          label={t("background_image")}
          hint={t("favicon_hint")}
          accept="image/x-icon,image/png"
          value={formData.bgImageUrl}
          uploadState={uploadStates["bgImageUrl"] ?? "idle"}
          uploadProgress={uploadProgress["bgImageUrl"] ?? 0}
          onSelect={(f) => onFileSelect("bgImageUrl", f)}
          onClear={() => onFileClear("bgImageUrl")}
          icon={ImageIcon}
        />
      </div>
    </div>
  );
};

export default Step02BrandingMedia;
