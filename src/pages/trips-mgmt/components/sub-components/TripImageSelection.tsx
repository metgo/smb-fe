import { Loader2, Plus, X } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { useFilesUpload } from "@/hooks/useFilesUpload";

interface TripImageSelectionProps {
  t: (key: string) => string;
  selectedImages: SelectedImage[];
  setSelectedImages: (images: SelectedImage[]) => void;
}

const TripImageSelection = ({
  t,
  selectedImages,
  setSelectedImages,
}: TripImageSelectionProps) => {
  const { isDark } = useThemeClasses();

  const {
    images,
    imagesRef,
    primaryImageIndex,
    setPrimaryImage,
    handleImageUpload,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isImageDeleting,
    handleDeleteImage,
  } = useFilesUpload({
    initialImages: selectedImages,
    onChange: (payload) =>
      setSelectedImages(
        payload.map((img) => ({
          image: img.image,
          caption: "",
          alt: "",
          isPrimary: img.isPrimary ?? false,
        })),
      ),
  });

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {t("media")}
      </h3>

      <div>
        <label
          className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("images")}
          <span className="text-xs ml-2 text-gray-500">
            ({t("upload_up_to_10_images")})
          </span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" ref={imagesRef}>
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
                  {t("primary_image")}
                </div>
              )}
              <button
                onClick={() => setPrimaryImage(idx)}
                className="absolute bottom-2 left-2 right-2 cursor-pointer px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-teal-700"
              >
                {t("set_as_primary")}
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
                document.getElementById("trip-image-upload")?.click()
              }
            >
              <input
                id="trip-image-upload"
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
                  {t("upload_images")}
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
    </div>
  );
};

export default TripImageSelection;
