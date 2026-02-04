import type { FC } from "react";
import { Plus, Upload, X } from "lucide-react";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

/* ---------- Errors ---------- */
interface ProductErrors {
  logo?: string;
  images?: string;
}

/* ---------- Props ---------- */
interface ProductMediaProps {
  t: (key: string) => string;
  errors: ProductErrors;

  /* Logo */
  logoImage: IImageUpload | null;
  handleLogoImageSelect: (file: File) => void;
  deleteTargetLogo: string | null;
  setDeleteTargetLogo: (v: string | null) => void;
  confirmDeleteLogo: () => void;
  isLogoImageDeleting: boolean;
  handleDeleteLogoImage: (logoImg: IImageUpload) => void;

  /* Gallery */
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

/* ---------- Component ---------- */
const ProductMedia: FC<ProductMediaProps> = ({
  t,
  errors,

  logoImage,
  handleLogoImageSelect,
  deleteTargetLogo,
  setDeleteTargetLogo,
  confirmDeleteLogo,
  isLogoImageDeleting,
  handleDeleteLogoImage,

  images,
  primaryImageIndex,
  setPrimaryImage,
  handleDeleteImage,
  deleteTarget,
  setDeleteTarget,
  confirmDelete,
  isImageDeleting,
  handleImageUpload,
}) => {
  const { textSecondary, textTertiary, borderColor } = useThemeClasses();

  return (
    <div className="space-y-6">
      {/* ---------------- Logo Upload ---------------- */}
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>
          {t("product_logo")} <span className="text-red-500">*</span>
        </label>

        <div className="flex items-center gap-4">
          {logoImage?.previewUrl ? (
            <div className="relative w-32 h-32 rounded-full border-2 border-gray-300">
              <div
                className="w-full h-full cursor-pointer"
                onClick={() =>
                  document.getElementById("product-logo-upload")?.click()
                }
              >
                <ImageWithFallback
                  src={logoImage.previewUrl}
                  alt="Product Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <button
                onClick={() => handleDeleteLogoImage(logoImage)}
                className="absolute top-2 right-2 z-50 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${borderColor}`}
              onClick={() =>
                document.getElementById("product-logo-upload")?.click()
              }
            >
              <div className="text-center">
                <Upload className={`w-6 h-6 mx-auto mb-1 ${textTertiary}`} />
                <p className={`text-xs ${textTertiary}`}>{t("upload_logo")}</p>
                <input
                  id="product-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoImageSelect(file);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {errors.logo && (
          <p className="text-red-500 text-sm mt-1">{errors.logo}</p>
        )}
      </div>

      {/* ---------------- Image Gallery ---------------- */}
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>
          {t("product_images")}
          <span className={`text-xs ml-2 ${textTertiary}`}>
            ({t("upload_up_to_10_images")})
          </span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-lg overflow-hidden border group ${borderColor}`}
            >
              <ImageWithFallback
                src={img.previewUrl}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Delete */}
              <button
                onClick={() => handleDeleteImage(img, idx)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Upload progress */}
              {img.status === "uploading" && (
                <div className="absolute bottom-16 left-0 w-full flex items-center px-2 z-20">
                  <div
                    className="bg-white h-1 rounded transition-all"
                    style={{ width: `${img.progress}%` }}
                  />
                  <span className="ml-2 text-green-600 text-xs font-bold">
                    {img.progress}%
                  </span>
                </div>
              )}

              {/* Primary badge */}
              {idx === primaryImageIndex && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10">
                  {t("primary_image")}
                </div>
              )}

              {/* Set primary */}
              <button
                onClick={() => setPrimaryImage(idx)}
                className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition hover:bg-teal-700 z-10"
              >
                {t("set_as_primary")}
              </button>
            </div>
          ))}

          {/* Upload new */}
          {images.length < 10 && (
            <div
              className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer ${borderColor}`}
              onClick={() =>
                document.getElementById("product-image-upload")?.click()
              }
            >
              <input
                id="product-image-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files)
                }
              />
              <div className="text-center">
                <Plus className={`w-8 h-8 mx-auto mb-1 ${textTertiary}`} />
                <p className={`text-xs ${textTertiary}`}>
                  {t("upload_images")}
                </p>
              </div>
            </div>
          )}
        </div>

        {errors.images && (
          <p className="text-red-500 text-sm mt-2">{errors.images}</p>
        )}
      </div>

      {/* ---------------- Confirm Dialogs ---------------- */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="delete_image"
        message="delete_image_confirm"
        confirmText="delete"
        loading={isImageDeleting}
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={!!deleteTargetLogo}
        title="delete_image"
        message="delete_image_confirm"
        confirmText="delete"
        loading={isLogoImageDeleting}
        variant="danger"
        onCancel={() => setDeleteTargetLogo(null)}
        onConfirm={confirmDeleteLogo}
      />
    </div>
  );
};

export default ProductMedia;
