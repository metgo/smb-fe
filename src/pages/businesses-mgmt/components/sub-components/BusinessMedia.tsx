import type { FC } from "react";
import { Plus, Upload, X } from "lucide-react";

/* ---------- Types ---------- */

type Theme = "light" | "dark";

interface MediaFormData {
  logo: string | null;
  images: string[];
}

interface MediaErrors {
  logo?: string;
}

interface MediaTranslations {
  logo_required: string;
  upload_logo: string;
  image_gallery: string;
  upload_up_to_10_images: string;
  primary_image: string;
  set_as_primary?: string;
  upload_images?: string;
}

/* ---------- Props ---------- */

interface BusinessMediaProps {
  theme: Theme;
  t: (key: string) => string; // translation function, snake_case
  formData: MediaFormData;
  errors: MediaErrors;
  setFormData: (data: MediaFormData) => void;
}

/* ---------- Component ---------- */

const BusinessMedia: FC<BusinessMediaProps> = ({
  theme,
  t,
  formData,
  errors,
  setFormData,
}) => {
  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("logo_required")} *
        </label>

        <div className="flex items-center gap-4">
          {formData.logo ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
              <img
                src={formData.logo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setFormData({ ...formData, logo: null })}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${
                errors.logo
                  ? "border-red-500"
                  : theme === "dark"
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => {
                // TODO: Replace with real upload
                setFormData({
                  ...formData,
                  logo:
                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop",
                });
              }}
            >
              <div className="text-center">
                <Upload
                  className={`w-6 h-6 mx-auto mb-1 ${
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {t("upload_logo")}
                </p>
              </div>
            </div>
          )}
        </div>

        {errors.logo && (
          <p className="text-red-500 text-sm mt-1">{errors.logo}</p>
        )}
      </div>

      {/* Image Gallery */}
      <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("image_gallery")}
          <span className="text-xs ml-2 text-gray-500">
            ({t("upload_up_to_10_images")})
          </span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-lg overflow-hidden border group ${
                theme === "dark" ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <img
                src={img}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Delete */}
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    images: formData.images.filter((_, i) => i !== idx),
                  })
                }
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Primary Badge */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10">
                  {t("primary_image")}
                </div>
              )}

              {/* Set as Primary */}
              {idx !== 0 && (
                <button
                  onClick={() => {
                    const newImages = [...formData.images];
                    const [selected] = newImages.splice(idx, 1);
                    newImages.unshift(selected);
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-teal-700"
                >
                  {t("set_as_primary") || "Set as Primary"}
                </button>
              )}
            </div>
          ))}

          {/* Upload New Image */}
          {formData.images.length < 10 && (
            <div
              className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer ${
                theme === "dark"
                  ? "border-gray-700 hover:border-gray-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => {
                // TODO: Replace with real upload
                setFormData({
                  ...formData,
                  images: [
                    ...formData.images,
                    `https://images.unsplash.com/photo-${
                      1500000000000 + formData.images.length
                    }?w=400&h=400&fit=crop`,
                  ],
                });
              }}
            >
              <div className="text-center">
                <Plus
                  className={`w-8 h-8 mx-auto mb-1 ${
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {t("upload_images") || "Upload"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessMedia;
