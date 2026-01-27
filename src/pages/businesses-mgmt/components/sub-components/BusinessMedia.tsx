import type { FC } from "react";
import { Plus, Upload, X } from "lucide-react";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";

interface MediaErrors {
  logo?: string;
}

/* ---------- Props ---------- */

interface BusinessMediaProps {
  theme: Theme;
  t: (key: string) => string;
  errors: MediaErrors;

  logoImage: IImageUpload | null;
  handleLogoImageSelect: (file: File) => void;
  confirmDeleteLogo: () => void;
  deleteTargetLogo: string | null;
  setDeleteTargetLogo: (imgUrl: string | null) => void;
  isLogoImageDeleting: boolean;
  handleDeleteLogoImage: (logoImg: IImageUpload) => void;

  images: IImageUpload[];
  primaryImageIndex: number;
  setPrimaryImage: (idx: number) => void;
  handleImageUpload: (files: FileList) => void;
  deleteTarget: IDeleteTarget | null;
  setDeleteTarget: (v: IDeleteTarget | null) => void;
  confirmDelete: () => void;
  isImageDeleting: boolean;
  business: any;
  handleDeleteImage: (item: IImageUpload, index: number) => void;
}

/* ---------- Component ---------- */

const BusinessMedia: FC<BusinessMediaProps> = ({
  t,
  theme,
  errors,
  // business,
  logoImage,
  handleLogoImageSelect,
  deleteTargetLogo,
  setDeleteTargetLogo,
  isLogoImageDeleting,
  handleDeleteLogoImage,
  confirmDeleteLogo,

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
  console.log("images0", images);

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("logo_required")} *
        </label>

        <div className="flex items-center gap-4">
          {logoImage?.previewUrl ? (
            <div className="relative w-32 h-32 rounded-full border-2 border-gray-300">
              <div
                className=""
                onClick={() =>
                  document.getElementById("logo-image-upload")?.click()
                }
              >
                <ImageWithFallback
                  src={logoImage?.previewUrl}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <button
                onClick={() => handleDeleteLogoImage(logoImage)}
                className="absolute top-2 right-2 z-50 cursor-pointer p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${
                errors.logo
                  ? "border-red-500"
                  : theme === "dark"
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() =>
                document.getElementById("logo-image-upload")?.click()
              }
            >
              <div className="text-center">
                <Upload
                  className={`w-6 h-6 mx-auto mb-1 ${
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {t("upload_logo")}
                </p>
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
              </div>
            </div>
          )}
        </div>
        {errors.logo && (
          <p className="text-red-500 text-sm mt-1">{errors.logo}</p>
        )}
      </div>

      {/* Image Gallery */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("image_gallery")}
          <span className="text-xs ml-2 text-gray-500">
            ({t("upload_up_to_10_images")})
          </span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-lg overflow-hidden border group ${
                theme === "dark" ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <ImageWithFallback
                src={img.previewUrl}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Delete */}
              <button
                onClick={() => handleDeleteImage(img, idx)}
                className="absolute top-2 right-2 cursor-pointer p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
              >
                <X className="w-4 h-4" />
              </button>
              {img.status === "uploading" && (
                <div className="absolute bottom-16 left-0 w-full flex items-center px-2 z-50">
                  <div
                    className="bg-white h-1 rounded transition-all"
                    style={{ width: `${img.progress}%` }}
                  />
                  <span className="ml-2 text-green-600 text-xs font-bold">
                    {img.progress}%
                  </span>
                </div>
              )}
              {/* Primary Badge */}
              {idx === primaryImageIndex && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10">
                  {t("primary_image")}
                </div>
              )}

              {/* Set as Primary */}
              <button
                onClick={() => setPrimaryImage(idx)}
                className="absolute bottom-2 left-2 right-2 cursor-pointer px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-teal-700"
              >
                {t("set_as_primary") || "Set as Primary"}
              </button>
            </div>
          ))}

          {/* Upload New Image */}
          {images?.length < 10 && (
            <div
              className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer ${
                theme === "dark"
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              {/* Hidden file input */}
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
              <div className="text-center">
                <Plus
                  className={`w-8 h-8 mx-auto mb-1 ${
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {t("upload_images") || "Upload"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default BusinessMedia;
