import clsx from "clsx";
import { useEffect } from "react";
import { Upload, X } from "lucide-react";

import { ConfirmDialog } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface EventMediaProps {
  t: (key: string) => string;
  markDirty: (step: number) => void;
  images: IImageUpload[];
  imagesRef: React.RefObject<HTMLDivElement | null>;
  primaryImageIndex: number;
  handleImageUpload: (files: FileList) => void;
  setPrimaryImage: (index: number) => void;
  deleteTarget: IDeleteTarget | null;
  setDeleteTarget: (v: IDeleteTarget | null) => void;
  confirmDelete: () => void;
  isImageDeleting: boolean;
  handleDeleteImage: (item: IImageUpload, index: number) => void;
}

const EventMedia: React.FC<EventMediaProps> = ({
  t,
  images,
  markDirty,
  imagesRef,
  setPrimaryImage,
  handleImageUpload,
  primaryImageIndex,
  deleteTarget,
  setDeleteTarget,
  confirmDelete,
  isImageDeleting,
  handleDeleteImage,
}) => {
  const { t: tc } = useTranslation("common");
  const { textPrimary, textSecondary, textTertiary, isDark } =
    useThemeClasses();

  useEffect(() => {
    markDirty(6);
  }, [images, markDirty, imagesRef]);
  useEffect(() => {
    if (images) {
      imagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [images, imagesRef]);

  /* ---------------- JSX  ---------------- */
  return (
    <>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
            {t("event_images")}
          </h2>
          <p className={`text-base ${textTertiary}`}>{t("upload_images")}</p>
        </div>

        {/* Upload Area */}
        <div
          className={`p-16 rounded-2xl border-2 border-dashed text-center transition-colors cursor-pointer ${
            isDark
              ? "border-gray-700 bg-gray-800/30 hover:border-teal-500/50"
              : "border-gray-300 bg-gray-50 hover:border-teal-500/50"
          }`}
          onClick={() => document.getElementById("image-upload")?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files) handleImageUpload({ target: { files } } as any);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload
            className={`w-20 h-20 mx-auto mb-6 opacity-60 ${textTertiary}`}
          />
          <p className={`text-lg font-medium mb-2 ${textSecondary}`}>
            {t("drag_drop_images")}
          </p>
          <p className={`text-sm mb-6 ${textTertiary}`}>{t("or")}</p>
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
            onChange={(e) =>
              e.target.files && handleImageUpload(e.target.files)
            }
            className="hidden"
          />
        </div>

        {/* Images Grid */}
        {images?.length > 0 && (
          <div className="relative" ref={imagesRef}>
            <h3 className={`text-xl mb-2 font-semibold ${textPrimary}`}>
              {t("your_images")} ({images?.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {images?.map((img, index) => (
                <div
                  key={index}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                    primaryImageIndex === index
                      ? "border-teal-500 ring-2 ring-teal-500/30"
                      : isDark
                        ? "border-gray-700 hover:border-teal-400"
                        : "border-gray-200 hover:border-teal-300"
                  }`}
                >
                  <img
                    src={img.previewUrl}
                    alt={`Event ${index + 1}`}
                    className="w-full h-50 object-cover transition-transform group-hover:scale-105"
                  />

                  {/* Progress Bar Overlay */}
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

                  {/* Primary Image Badge */}
                  {primaryImageIndex === index && (
                    <div className="absolute top-2 left-3 z-10 px-2 bg-orange-500 text-white text-sm font-semibold rounded shadow-lg">
                      {tc("primary")}
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteImage(img, index)}
                    className="p-1 absolute top-2 right-3 z-20 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Action Buttons */}
                  <div
                    className={clsx(
                      "absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all hidden group-hover:flex items-end p-4 ",
                      img.status === "uploading" && "bg-black/60",
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => setPrimaryImage(index)}
                        className={`flex-1 cursor-pointer px-4 py-2 rounded-lg font-medium transition-all ${
                          primaryImageIndex === index
                            ? "bg-teal-500 text-white"
                            : "bg-white/90 text-gray-900 hover:bg-white"
                        }`}
                      >
                        {tc("set_as_primary")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
    </>
  );
};

export default EventMedia;
