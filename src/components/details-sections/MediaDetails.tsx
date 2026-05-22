import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";
import { Star, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MediaDetailsProps {
  logoImage?: string | null;
  images: Array<{ previewUrl: string }>;
  primaryImageIndex?: number;
}

const MediaDetails: React.FC<MediaDetailsProps> = ({
  logoImage,
  images,
  primaryImageIndex = 0,
}) => {
  const { t } = useTranslation("common");
  const { isDark, textTertiary } = useThemeClasses();

  return (
    <div className="space-y-6 min-h-150">
      {logoImage && (
        <div>
          <div className={clsx(textTertiary, "font-bold mb-3")}>
            {t("logo")}
          </div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
            <ImageWithFallback
              src={logoImage}
              alt="Business logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className={clsx(textTertiary, "font-bold mb-3")}>{t("images")}</div>

      {images?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={clsx(
                "relative aspect-square rounded-xl overflow-hidden border transition-all duration-200",
                idx === primaryImageIndex
                  ? isDark
                    ? "border-yellow-500/50 ring-2 ring-yellow-500/30"
                    : "border-yellow-400 ring-2 ring-yellow-400/30"
                  : isDark
                    ? "border-gray-700"
                    : "border-gray-300",
              )}
            >
              <ImageWithFallback
                src={img.previewUrl}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {idx === primaryImageIndex && (
                <div className="absolute top-2 left-2 z-5">
                  <div className="px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5 shadow-lg bg-yellow-500 text-white font-semibold text-xs">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    {t("primary") || "Primary"}
                  </div>
                </div>
              )}

              <div className="absolute bottom-2 left-2 z-10">
                <div
                  className={clsx(
                    "px-2 py-1 rounded-md backdrop-blur-sm text-xs font-medium",
                    isDark
                      ? "bg-gray-900/80 text-gray-300"
                      : "bg-white/80 text-gray-700",
                  )}
                >
                  {idx + 1} / {images.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={clsx(
            "rounded-xl border-2 border-dashed p-12 text-center",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-300",
          )}
        >
          <ImageIcon
            className={clsx(
              "w-16 h-16 mx-auto mb-4",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          />
          <h3
            className={clsx(
              "text-lg font-semibold mb-2",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            {t("no_images_uploaded")}
          </h3>
          <p
            className={clsx(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {t("upload_image_info")}
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaDetails;
