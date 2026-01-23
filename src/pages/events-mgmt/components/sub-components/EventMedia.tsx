import React, { useState, useEffect, useRef } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadWithProgress } from "@/helpers";
import { useCreateSignedUrlMutation } from "@/store/api/eventMutationApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";

interface EventMediaProps {
  t: (key: string) => string;
  eventImages: TEventImages;
  setEventImages: (v: TEventImages) => void;
  theme: Theme;
  markDirty: (step: number) => void;
}


const EventMedia: React.FC<EventMediaProps> = ({
  t,
  eventImages,
  setEventImages,
  theme,
  markDirty,
}) => {
  const [createSignedUrl] = useCreateSignedUrlMutation();
  const { textPrimary, textSecondary, textTertiary, } = useThemeClasses()


  const imagesRef = useRef<HTMLDivElement>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [images, setImages] = useState<IEventImageUpload[]>([]);


  useEffect(() => {
    if (images) {
      imagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [images])

  useEffect(() => {
    setImages([])
  }, [])

  useEffect(() => {
    if (!eventImages?.length) return;
    if (images.length > 0) return; // prevent duplicate hydration
    setImages([])
    const hasPrimary = eventImages.some(img => img.isPrimary);

    const hydratedImages: IEventImageUpload[] = eventImages.map(
      (img, index) => ({
        id: Date.now() + index,
        previewUrl: img.image,
        progress: 100,
        status: "success",
        isPrimary: img.isPrimary || (!hasPrimary && index === 0),
        gcsURL: img.image,
      })
    );

    setImages(hydratedImages);
    setPrimaryImageIndex(
      hydratedImages.findIndex(img => img.isPrimary) || 0
    );
  }, [eventImages]);


  useEffect(() => {
    markDirty(6);
  }, [eventImages])

  /* ---------------- File Select ---------------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: IEventImageUpload[] = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "idle",
      isPrimary: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  /* ---------------- Signed URL ---------------- */
  const generateSignedUrl = async (image: IEventImageUpload) => {
    if (image?.file) {
      const res = await createSignedUrl([
        {
          originalName: image.file.name,
          mimeType: image.file.type,
        },
      ]);

      return {
        signedUrl: res.data[0].signedUrl,
        gcsURL: res.data[0].gcsURL,
      };
    }
  };

  /* ---------------- Upload ---------------- */
  const uploadImage = async (id: number) => {
    const image = images.find((i) => i.id === id);
    if (!image) return;

    try {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: "uploading", progress: 0 } : img
        )
      );

      const gcs = await generateSignedUrl(image);
      const signedUrl = gcs?.signedUrl
      const gcsURL = gcs?.gcsURL


      await uploadWithProgress(image.file!, signedUrl, (progress) => {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, progress } : img
          )
        );
      });

      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? {
              ...img,
              signedUrl,
              gcsURL,
              progress: 100,
              status: "success",
            }
            : img
        )
      );

      toast.success("Image has been uploaded successfully!");
    } catch {
      toast.error("Image upload failed! Please try again...");
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: "error" } : img
        )
      );
    }
  };

  /* ---------------- Upload All ---------------- */
  const handleUploadAll = async () => {
    if (!images.length) return;

    // Upload images one by one sequentially
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.status !== "success") {
        await uploadImage(img.id);
      }
    }
  };

  /* ---------------- Primary Image ---------------- */
  const setPrimaryImage = (index: number) => {
    setPrimaryImageIndex(index);
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  /* ---------------- Remove Image ---------------- */
  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((_, i) => i !== index);
    });

    if (primaryImageIndex === index) setPrimaryImageIndex(0);
  };

  /* ---------------- Final Payload ---------------- */
  useEffect(() => {
    const payload: TEventImages = images
      .filter((img) => img.status === "success")
      .map((img) => ({
        image: img.gcsURL!,
        isPrimary: img.isPrimary,
      }));

    setEventImages(payload);
  }, [images, setEventImages]);

  /* ---------------- JSX remains UNCHANGED ---------------- */
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
        className={`p-16 rounded-2xl border-2 border-dashed text-center transition-colors cursor-pointer ${theme === "dark"
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
        <div className="relative" ref={imagesRef}>
          <div className="flex items-center justify-between mb-2 sticky top-0 w-full z-50 bg-white/20 backdrop-blur-2xl px-2 py-1 rounded-md">
            <h3 className={`text-xl font-semibold ${textPrimary}`}>
              {t("your_images")} ({images.length})
            </h3>
            <button
              type="button"
              onClick={handleUploadAll}
              className=" cursor-pointer border border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded-md"
            >
              Upload Now
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, index) => (
              <div
                key={index}
                className={`relative rounded-xl overflow-hidden border-2 transition-all group ${primaryImageIndex === index
                  ? "border-teal-500 ring-2 ring-teal-500/30"
                  : theme === "dark"
                    ? "border-gray-700 hover:border-teal-400"
                    : "border-gray-200 hover:border-teal-300"
                  }`}
              >
                <img
                  src={img.previewUrl}
                  alt={`Event ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                />

                {/* Progress Bar Overlay */}
                {img.status === "uploading" && (
                  <div className="absolute bottom-16 left-0 w-full flex items-center px-2 z-50">
                    <div className="bg-green-500 h-1 rounded transition-all" style={{ width: `${img.progress}%` }} />
                    <span className="ml-2 text-green-600 text-xs font-bold">{img.progress}%</span>
                  </div>
                )}

                {/* Primary Image Badge */}
                {primaryImageIndex === index && (
                  <div className="absolute top-2 left-3 z-10 px-3 py-1 bg-teal-500 text-white text-sm font-semibold rounded-full shadow-lg">
                    {t("cover_image")}
                  </div>
                )}

                {/* Action Buttons */}
                <div className={clsx(
                  "absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-end p-4",
                  img.status === "uploading" && "bg-black/60"
                )}>
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => setPrimaryImage(index)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${primaryImageIndex === index
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
