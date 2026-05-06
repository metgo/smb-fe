import { useEffect, type FC } from "react";
import { Loader2, Plus, Upload, X, Video, Map } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { FormFieldWrapper } from "@/components/form-fields";

interface PoiMediaProps {
  markDirty?: (step: number) => void;

  // Logo
  logoImage?: IImageUpload | null;
  handleLogoImageSelect?: (file: File) => void;
  confirmDeleteLogo?: () => void;
  deleteTargetLogo?: string | null;
  setDeleteTargetLogo?: (imgUrl: string | null) => void;
  isLogoImageDeleting?: boolean;
  handleDeleteLogoImage?: (logoImg: IImageUpload) => void;

  // Gallery
  images: IImageUpload[];
  imagesRef?: React.RefObject<HTMLDivElement | null>;
  primaryImageIndex: number;
  setPrimaryImage: (idx: number) => void;
  handleImageUpload: (files: FileList) => void;
  deleteTarget: IDeleteTarget | null;
  setDeleteTarget: (v: IDeleteTarget | null) => void;
  confirmDelete: () => void;
  isImageDeleting: boolean;
  handleDeleteImage: (item: IImageUpload, index: number) => void;

  // URLs
  videoUrl: string;
  setVideoUrl: (v: string) => void;
  virtualTourUrl: string;
  setVirtualTourUrl: (v: string) => void;
}

const PoiMedia: FC<PoiMediaProps> = ({
  markDirty,
  logoImage,
  handleLogoImageSelect,
  deleteTargetLogo,
  setDeleteTargetLogo,
  isLogoImageDeleting,
  handleDeleteLogoImage,
  confirmDeleteLogo,
  images,
  imagesRef,
  primaryImageIndex,
  setPrimaryImage,
  handleDeleteImage,
  deleteTarget,
  setDeleteTarget,
  confirmDelete,
  isImageDeleting,
  handleImageUpload,
  videoUrl,
  setVideoUrl,
  virtualTourUrl,
  setVirtualTourUrl,
}) => {
  const { t } = useTranslation("poi");
  const { t: tb } = useTranslation("businesses");
  const { isDark, borderColor, bgTertiary, textPrimary } = useThemeClasses();

  useEffect(() => {
    markDirty?.(5);
  }, [images, logoImage, videoUrl, virtualTourUrl, markDirty]);

  const inputClass = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-teal-500`;

  return (
    <div className="space-y-8">
      {/* Logo Upload */}
      <div>
        <label
          className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {tb("logo_required")}
        </label>
        <div className="flex items-center gap-4">
          {logoImage?.previewUrl ? (
            <div className="relative w-32 h-32 rounded-full border-2 border-gray-300">
              <div
                className="w-full h-full"
                onClick={() =>
                  document.getElementById("poi-logo-upload")?.click()
                }
              >
                <ImageWithFallback
                  src={logoImage.previewUrl}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button
                onClick={() => handleDeleteLogoImage?.(logoImage)}
                className="absolute top-2 right-2 z-50 cursor-pointer p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
              {logoImage?.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-40">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                  <span className="mt-2 text-white font-bold text-xs">
                    {logoImage.progress}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${
                isDark
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() =>
                document.getElementById("poi-logo-upload")?.click()
              }
            >
              <div className="text-center">
                <Upload
                  className={`w-6 h-6 mx-auto mb-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                />
                <p
                  className={`text-xs ${isDark ? "text-gray-600" : "text-gray-500"}`}
                >
                  {tb("upload_logo")}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoImageSelect?.(file);
                  }}
                  className="hidden"
                  id="poi-logo-upload"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div>
        <label
          className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {tb("image_gallery")}
          <span className="text-xs ml-2 text-gray-500">
            ({tb("upload_up_to_10_images")})
          </span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" ref={imagesRef}>
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-lg overflow-hidden border group ${isDark ? "border-gray-700" : "border-gray-300"}`}
            >
              <ImageWithFallback
                src={img.previewUrl}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDeleteImage(img, idx)}
                className="absolute top-2 right-2 cursor-pointer p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
              >
                <X className="w-4 h-4" />
              </button>
              {img.status === "uploading" && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
                  <Loader2 className="w-16 h-16 text-white animate-spin" />
                  <span className="mt-2 text-white font-bold text-xs">
                    {img.progress}%
                  </span>
                </div>
              )}
              {idx === primaryImageIndex && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10">
                  {tb("primary_image")}
                </div>
              )}
              <button
                onClick={() => setPrimaryImage(idx)}
                className="absolute bottom-2 left-2 right-2 cursor-pointer px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-teal-700"
              >
                {tb("set_as_primary")}
              </button>
            </div>
          ))}

          {images.length < 10 && (
            <div
              className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer ${
                isDark
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() =>
                document.getElementById("poi-image-upload")?.click()
              }
            >
              <input
                id="poi-image-upload"
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
                  className={`w-8 h-8 mx-auto mb-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                />
                <p
                  className={`text-xs ${isDark ? "text-gray-600" : "text-gray-500"}`}
                >
                  {tb("upload_images")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video URL */}
      <FormFieldWrapper label={t("video_url")} hint={t("video_url_hint")}>
        <div className="relative">
          <Video
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          />
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className={`${inputClass} pl-10`}
          />
        </div>
      </FormFieldWrapper>

      {/* Virtual Tour URL */}
      <FormFieldWrapper
        label={t("virtual_tour_url")}
        hint={t("virtual_tour_url_hint")}
      >
        <div className="relative">
          <Map
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          />
          <input
            type="url"
            value={virtualTourUrl}
            onChange={(e) => setVirtualTourUrl(e.target.value)}
            placeholder="https://..."
            className={`${inputClass} pl-10`}
          />
        </div>
      </FormFieldWrapper>

      {/* Confirm delete dialogs */}
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
      {confirmDeleteLogo && (
        <ConfirmDialog
          open={!!deleteTargetLogo}
          title="delete_image"
          message="delete_image_confirm"
          confirmText="delete"
          loading={isLogoImageDeleting}
          variant="danger"
          onCancel={() => setDeleteTargetLogo?.(null)}
          onConfirm={confirmDeleteLogo}
        />
      )}
    </div>
  );
};

export default PoiMedia;
