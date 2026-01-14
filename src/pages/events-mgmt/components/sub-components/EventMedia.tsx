import React from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react";

interface EventMediaProps {
  currentStep: number;

  // Images state
  images: string[]; // Array of image URLs (base64 or public URLs)
  setImages: React.Dispatch<React.SetStateAction<string[]>>;

  // Primary image index
  primaryImageIndex: number;
  setPrimaryImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

const EventMedia: React.FC<EventMediaProps> = ({
  currentStep,
  images,
  setImages,
  primaryImageIndex,
  setPrimaryImageIndex,
}) => {
  const { t } = useTranslation("events");
  const { textPrimary, textSecondary, textTertiary } = useThemeClasses();
  const { theme } = useAppSelector((state) => state.settings);

  if (currentStep !== 6) return null;

  // Placeholder for file upload handler (implement with actual file input or dropzone)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const target = event.target;
          if (target?.result) {
            setImages((prev) => [...prev, target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // Reset primary image if it's being removed
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(images.length > 1 ? 0 : -1);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
          {t("event_images")}
        </h2>
        <p className={`text-base ${textTertiary}`}>
          {t("upload_images")}
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`p-16 rounded-2xl border-2 border-dashed text-center transition-colors cursor-pointer ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800/30 hover:border-teal-500/50"
            : "border-gray-300 bg-gray-50 hover:border-teal-500/50"
        }`}
        onClick={() => document.getElementById("image-upload")?.click()}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files) {
            // Handle drag & drop files
            Array.from(files).forEach((file) => {
              if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const target = event.target;
                  if (target?.result) {
                    setImages((prev) => [...prev, target.result as string]);
                  }
                };
                reader.readAsDataURL(file);
              }
            });
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className={`w-20 h-20 mx-auto mb-6 opacity-60 ${textTertiary}`} />
        <p className={`text-lg font-medium mb-2 ${textSecondary}`}>
          {t("drag_drop_images")}
        </p>
        <p className={`text-sm mb-6 ${textTertiary}`}>
          {t("or")}
        </p>
        <button className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium transition-all shadow-lg shadow-teal-600/20">
          {t("browse_files")}
        </button>
        <p className={`text-xs mt-6 ${textTertiary}`}>
          {t("supported_formats")}
        </p>
        {/* Hidden file input */}
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <h3 className={`text-xl font-semibold mb-5 ${textPrimary}`}>
            {t("your_images")} ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, index) => (
              <div
                key={index}
                className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                  primaryImageIndex === index
                    ? "border-teal-500 ring-2 ring-teal-500/30"
                    : theme === "dark"
                      ? "border-gray-700 hover:border-teal-400"
                      : "border-gray-200 hover:border-teal-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Event ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Primary Image Badge */}
                {primaryImageIndex === index && (
                  <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-teal-500 text-white text-sm font-semibold rounded-full shadow-lg">
                    {t("cover_image")}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-end p-4">
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => setPrimaryImageIndex(index)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        primaryImageIndex === index
                          ? "bg-teal-500 text-white"
                          : "bg-white/90 text-gray-900 hover:bg-white"
                      }`}
                    >
                      {t("set_as_cover")}
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventMedia;