import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { Star, Eye, Trash2 } from "lucide-react";
interface MediaErrors {
  logo?: string;
}
interface BusinessMediaDetailsProps {
  isDark: boolean;
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
  uploadLogoImage: (file: File) => void;
}

/* ---------- Component ---------- */
const BusinessMediaDetails: React.FC<BusinessMediaDetailsProps> = ({
  t,
  isDark,

  logoImage,
  // handleLogoImageSelect,

  images,
  primaryImageIndex,
  handleDeleteImage,
  deleteTarget,
  setDeleteTarget,
  confirmDelete,
  isImageDeleting,
  // handleImageUpload,
}) => {
  return (
    <div className="space-y-6">
      {/* Logo */}
      <div>
        <h3 className={`mb-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {t("logo")}
        </h3>
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

      {/* Image Gallery Header */}
      <div className="flex items-center justify-between">
        {images.length > 0 && (
          <h3
            className={`text-md  ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {t("image_gallery")}
          </h3>
        )}

        {images.length < 10 && (
          <>
            {/* <button
              type="button"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-none transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />

              {t("upload_images") || "Upload Images"}
            </button> */}

            {/* Hidden file input */}
            {/* <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files)
              }
              className="hidden"
            /> */}
          </>
        )}
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`relative aspect-square rounded-lg overflow-hidden border group ${
              isDark ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <ImageWithFallback
              src={img.previewUrl}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Delete */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {/* View */}
              <button
                type="button"
                className="p-2 bg-white text-red rounded-full hover:bg-white"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDeleteImage(img, idx)}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>

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
              <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10 flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                {t("primary_image")}
              </div>
            )}
          </div>
        ))}
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
    </div>
  );
};

export default BusinessMediaDetails;
