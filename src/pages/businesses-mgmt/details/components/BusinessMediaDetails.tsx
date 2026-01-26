import { Upload, Star, Eye, Trash2, ImageIcon } from "lucide-react";
import type { FC } from "react";

/* ---------- Types ---------- */

type Theme = "light" | "dark";

interface Business {
  name: string;
  logo: string;
  images: string[];
}

/* ---------- Props ---------- */

interface BusinessMediaDetailsProps {
  theme: Theme;
  t: (key: string) => string;
  business: Business;
}

/* ---------- Component ---------- */

const BusinessMediaDetails: FC<BusinessMediaDetailsProps> = ({
  theme,
  t,
  business,
}) => {
  return (
    <div className="space-y-6">
      {/* Logo */}
      <div>
        <h3
          className={`mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
        >
          {t("logo")}
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={business.logo}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {t("replace_logo")}
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
            {t("image_gallery")}
          </h3>
          <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded transition-colors flex items-center gap-1">
            <Upload className="w-4 h-4" />
            {t("upload_images")}
          </button>
        </div>

        {business.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {business.images.map((img, idx) => (
              <div
                key={idx}
                className={`relative aspect-video rounded-lg overflow-hidden border ${
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                } group`}
              >
                <img
                  src={img}
                  alt={`${business.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {t("primary_image")}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                    <Eye className="w-4 h-4 text-gray-800" />
                  </button>
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`p-8 text-center rounded-lg border-2 border-dashed ${
              theme === "dark" ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <ImageIcon
              className={`w-12 h-12 mx-auto mb-2 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}
            />
            <p className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>
              {t("no_images_uploaded")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessMediaDetails;
