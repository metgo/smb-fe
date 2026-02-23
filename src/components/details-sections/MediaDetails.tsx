import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import {
  Star,
  Eye,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface MediaDetailsProps {
  logoImage?: IImageUpload | null;
  handleLogoImageSelect?: (file: File) => void;
  confirmDeleteLogo?: () => void;
  deleteTargetLogo?: string | null;
  setDeleteTargetLogo?: (imgUrl: string | null) => void;
  isLogoImageDeleting?: boolean;
  handleDeleteLogoImage?: (logoImg: IImageUpload) => void;

  images: IImageUpload[];
  primaryImageIndex: number;
  setPrimaryImage: (idx: number) => void;
  handleImageUpload: (files: FileList) => void;
  deleteTarget: IDeleteTarget | null;
  setDeleteTarget: (v: IDeleteTarget | null) => void;
  confirmDelete: () => void;
  isImageDeleting: boolean;
  handleDeleteImage: (item: IImageUpload, index: number) => void;
}

const MediaDetails: React.FC<MediaDetailsProps> = ({
  images,
  primaryImageIndex,
  setPrimaryImage,
  handleDeleteImage,
  deleteTarget,
  setDeleteTarget,
  confirmDelete,
  isImageDeleting,
  handleImageUpload,
  logoImage,
}) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  const handleViewImage = (img: IImageUpload) => {
    window.open(img.previewUrl, "_blank");
  };

  return (
    <div className="space-y-6 min-h-150">
      {logoImage && (
        <div>
          <div className="">{t("logo")}</div>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
              <ImageWithFallback
                src={logoImage?.previewUrl}
                alt={"Business logo"}
                className="w-full h-full object-cover"
              />
            </div>
            {/* <div className="flex gap-2">
            <label
              htmlFor="logo-image-upload"
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {t("replace_logo")}
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoImageSelect(file);
              }}
              className="hidden"
              id="logo-image-upload"
            />
          </div> */}
          </div>
        </div>
      )}

      {/* Header */}
      <div className={clsx("flex items-center justify-between mb-2")}>
        <div className="">{t("images")}</div>

        {/* <div>
          <h2
            className={clsx(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {t("image_gallery") || "Image Gallery"}
          </h2>
          <p
            className={clsx(
              "text-sm mt-1",
              isDark ? "text-gray-400" : "text-gray-600",
            )}
          >
            {images?.length} {images?.length === 1 ? "image" : "images"}{" "}
            uploaded
            {images?.length < 10 && ` • ${10 - images.length} more allowed`}
          </p>
        </div> */}

        {images?.length < 10 && (
          <>
            {/* ---------FUTURE USE----------- */}
            {/* <button
                type="button"
                onClick={() => document.getElementById("image-upload")?.click()}
                className={clsx(
                  "px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg",
                  isDark
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "bg-teal-600 hover:bg-teal-700 text-white",
                )}
              >
                <Upload className="w-4 h-4" />
                {t("upload_images") || "Upload Images"}
              </button> */}

            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files)
              }
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Upload limit warning */}
      {images.length >= 8 && images.length < 10 && (
        <div
          className={clsx(
            "mt-4 p-3 rounded-lg flex items-center gap-2 text-sm",
            isDark
              ? "bg-yellow-500/10 border border-yellow-800/50 text-yellow-400"
              : "bg-yellow-50 border border-yellow-200 text-yellow-800",
          )}
        >
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>
            You can upload {10 - images.length} more{" "}
            {10 - images.length === 1 ? "image" : "images"}
          </span>
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={clsx(
                "relative aspect-square rounded-xl overflow-hidden border group transition-all duration-200",
                idx === primaryImageIndex
                  ? isDark
                    ? "border-yellow-500/50 ring-2 ring-yellow-500/30"
                    : "border-yellow-400 ring-2 ring-yellow-400/30"
                  : isDark
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-300 hover:border-gray-400",
              )}
            >
              <ImageWithFallback
                src={img.previewUrl}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              {/* Overlay Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                {/* Set as Primary */}
                {idx !== primaryImageIndex && (
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(idx)}
                    className={clsx(
                      "p-2.5 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-110",
                      isDark
                        ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50"
                        : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300",
                    )}
                    title="Set as primary image"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}

                {/* View */}
                <button
                  type="button"
                  onClick={() => handleViewImage(img)}
                  className={clsx(
                    "p-2.5 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-110",
                    isDark
                      ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/50"
                      : "bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300",
                  )}
                  title="View full image"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img, idx)}
                  className={clsx(
                    "p-2.5 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-110",
                    "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50",
                  )}
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Progress */}
              {img.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
                  <div className="w-3/4 bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${img.progress}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-semibold">
                    Uploading... {img.progress}%
                  </span>
                </div>
              )}

              {/* Success Badge */}
              {img.status === "uploaded" && (
                <div className="absolute top-2 right-2 z-10">
                  <div className={clsx("p-1 rounded-full", "bg-green-500")}>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Primary Badge */}
              {idx === primaryImageIndex && (
                <div className="absolute top-2 left-2 z-5">
                  <div
                    className={clsx(
                      "px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 shadow-lg",
                      "bg-yellow-500 text-white font-semibold text-xs",
                    )}
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    {t("primary") || "Primary"}
                  </div>
                </div>
              )}

              {/* Image Number */}
              <div className="absolute bottom-2 left-2 z-10">
                <div
                  className={clsx(
                    "px-2 py-1 rounded-md backdrop-blur-sm text-xs font-medium",
                    isDark
                      ? "bg-gray-900/80 text-gray-300"
                      : "bg-white/80 text-gray-700",
                  )}
                >
                  {idx + 1} / {images.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className={clsx(
            "rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200",
            isDark
              ? "bg-gray-800 border-gray-700 hover:border-gray-600"
              : "bg-gray-50 border-gray-300 hover:border-gray-400",
          )}
        >
          <ImageIcon
            className={clsx(
              "w-16 h-16 mx-auto mb-4",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          />
          <h3
            className={clsx(
              "text-lg font-semibold mb-2",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            {t("no_images_uploaded")}
          </h3>
          <p
            className={clsx(
              "text-sm mb-4",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {t("upload_image_info")}
          </p>
          {/* ---------FUTURE USE----------- */}
          {/* <button
            type="button"
            onClick={() => document.getElementById("image-upload")?.click()}
            className={clsx(
              "px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2 hover:scale-105",
              isDark
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white",
            )}
          >
            <Upload className="w-4 h-4" />
            Upload Your First Image
          </button> */}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t("delete_image") || "Delete Image"}
        message={
          t("delete_image_confirm") ||
          "Are you sure you want to delete this image? This action cannot be undone."
        }
        confirmText={t("delete") || "Delete"}
        loading={isImageDeleting}
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default MediaDetails;
