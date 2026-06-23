import clsx from "clsx";
import { X, Loader, ImageIcon } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import { ConfirmDialog } from "@/components/shared";

interface CampaignMediaProps {
  imagePath: string;
  onImageChange: (url: string) => void;
}

export default function CampaignMedia({
  imagePath,
  onImageChange,
}: CampaignMediaProps) {
  const { t } = useTranslation("campaign");
  const { textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    image,
    isImageDeleting,
    handleImageSelect,
    handleDeleteImage,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
  } = useSingleImageUpload({
    initialImage: imagePath || undefined,
    onChange: (img) => onImageChange(img?.image ?? ""),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageSelect(file, true);
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      <div>
        <p className={clsx("text-sm font-medium mb-1", textSecondary)}>
          {t("campaign_image")}
        </p>
        <p className={clsx("text-xs mb-4", textTertiary)}>
          {t("campaign_image_hint")}
        </p>

        {!image ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={clsx(
              "w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer",
              isDark
                ? "border-gray-700 hover:border-teal-600 hover:bg-gray-800/50"
                : "border-gray-300 hover:border-teal-500 hover:bg-teal-50/50",
            )}
          >
            <div
              className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isDark ? "bg-gray-800" : "bg-gray-100",
              )}
            >
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-center">
              <p
                className={clsx(
                  "text-sm font-medium",
                  isDark ? "text-gray-300" : "text-gray-600",
                )}
              >
                {t("click_to_upload")}
              </p>
              <p className={clsx("text-xs mt-0.5", textTertiary)}>
                {t("image_formats")}
              </p>
            </div>
          </button>
        ) : (
          <div
            className={clsx(
              "relative rounded-xl border overflow-hidden",
              borderColor,
            )}
          >
            <img
              src={image.previewUrl}
              alt={t("campaign_image")}
              className="w-full h-56 object-cover"
            />

            {image.status === "uploading" && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <Loader className="w-6 h-6 text-white animate-spin" />
                <div className="w-40 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full transition-all"
                    style={{ width: `${image.progress}%` }}
                  />
                </div>
                <p className="text-white text-xs">{image.progress}%</p>
              </div>
            )}

            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleDeleteImage(image)}
                disabled={isImageDeleting}
                className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                {isImageDeleting ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {image.status === "success" && (
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-1 rounded-md bg-green-600/90 text-white text-xs">
                  {t("uploaded")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("delete_image_title")}
        message={t("delete_image_message")}
        variant="danger"
        confirmText={t("delete")}
        loading={isImageDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
