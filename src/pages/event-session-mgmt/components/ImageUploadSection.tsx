import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, X } from "lucide-react";

import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ImageUploadSectionProps {
  id: string;
  images: IImage[];
  onImagesChange: (images: IImage[]) => void;
  title: string;
  cardClasses: string;
}

const ImageUploadSection = ({
  id,
  images: initialImages,
  onImagesChange,
  title,
  cardClasses,
}: ImageUploadSectionProps) => {
  const { t: tc } = useTranslation("common");
  const { textTertiary, borderColor } = useThemeClasses();

  const {
    images,
    imagesRef,
    primaryImageIndex,
    setPrimaryImage,
    handleImageUpload,
    deleteTarget,
    setDeleteTarget,
    isImageDeleting,
    confirmDelete,
    handleDeleteImage,
  } = useFilesUpload({ initialImages: initialImages || [], onImagesChange });

  return (
    <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
          {title}
        </h3>
        <span className={clsx("text-xs", textTertiary)}>
          {tc("upload_up_to_10_images")}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" ref={imagesRef}>
        {images.map((img, idx) => (
          <div
            key={idx}
            className={clsx(
              "relative aspect-square rounded-lg overflow-hidden border group",
              borderColor,
            )}
          >
            <ImageWithFallback
              src={img.previewUrl}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleDeleteImage(img, idx)}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {img.status === "uploading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
                <span className="mt-1 text-white text-xs font-bold">
                  {img.progress}%
                </span>
              </div>
            )}
            {idx === primaryImageIndex && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10">
                {tc("primary")}
              </div>
            )}
            <button
              onClick={() => setPrimaryImage(idx)}
              className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition hover:bg-teal-700 z-10"
            >
              {tc("set_as_primary")}
            </button>
          </div>
        ))}
        {images.length < 10 && (
          <div
            className={clsx(
              "aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer",
              borderColor,
            )}
            onClick={() =>
              document.getElementById(`session-img-${id}`)?.click()
            }
          >
            <input
              id={`session-img-${id}`}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files)
              }
            />
            <div className="text-center">
              <Plus className={clsx("w-8 h-8 mx-auto mb-1", textTertiary)} />
              <p className={clsx("text-xs", textTertiary)}>
                {tc("upload_up_to_10_images")}
              </p>
            </div>
          </div>
        )}
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

export default ImageUploadSection;
