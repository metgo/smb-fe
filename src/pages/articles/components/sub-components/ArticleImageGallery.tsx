import { X, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ArticleImageGalleryProps {
  images: any[];
  primaryImageIndex: number;
  onImageUpload: (files: FileList) => void;
  onImageDelete: (img: any, idx: number) => void;
  onSetPrimaryImage: (idx: number) => void;
}

export default function ArticleImageGallery({
  images,
  primaryImageIndex,
  onImageUpload,
  onImageDelete,
  onSetPrimaryImage,
}: ArticleImageGalleryProps) {
  const { t } = useTranslation("article");
  const { theme } = useThemeClasses();

  return (
    <div>
      <label
        className={`block text-sm font-medium mb-2 ${
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
            className={`relative aspect-square rounded-xl overflow-hidden border-2 group transition-all ${
              idx === primaryImageIndex
                ? "border-yellow-400"
                : theme === "dark"
                  ? "border-gray-700"
                  : "border-gray-200"
            }`}
          >
            <ImageWithFallback
              src={img.previewUrl}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Uploading overlay */}
            {img.status === "uploading" && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <span className="mt-1 text-white font-semibold text-xs">
                  {img.progress}%
                </span>
              </div>
            )}

            {/* Primary badge */}
            {idx === primaryImageIndex && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full z-10">
                {t("primary_image")}
              </div>
            )}

            {/* Action buttons (visible on hover) */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all z-10" />

            <button
              onClick={() => onImageDelete(img, idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onSetPrimaryImage(idx)}
              className="absolute bottom-2 left-2 right-2 px-2 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-teal-700"
            >
              {t("set_as_primary")}
            </button>
          </div>
        ))}

        {/* Upload slot */}
        {images.length < 10 && (
          <label
            htmlFor="article-image-upload"
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
              theme === "dark"
                ? "border-gray-700 hover:border-gray-500 bg-gray-800/40"
                : "border-gray-300 hover:border-blue-400 bg-gray-50"
            }`}
          >
            <input
              id="article-image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && onImageUpload(e.target.files)}
              className="hidden"
            />
            <Plus
              className={`w-7 h-7 mb-1 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <p
              className={`text-xs font-medium ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {t("upload_images")}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                theme === "dark" ? "text-gray-600" : "text-gray-300"
              }`}
            >
              {images.length}/10
            </p>
          </label>
        )}
      </div>
    </div>
  );
}
