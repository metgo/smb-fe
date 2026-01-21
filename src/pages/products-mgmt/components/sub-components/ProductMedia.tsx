import React from "react";
import { X, Upload } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ProductMediaProps {
  t: (key: string) => string;
  formData: {
    mainImage: string | null;
    additionalImages: string[];
  };
  setFormData: (data: any) => void;
  errors: {
    mainImage?: string;
  };
  handleImageUpload: (file: File, type: "main" | "additional") => void;
}

const ProductMedia: React.FC<ProductMediaProps> = ({
  t,
  formData,
  setFormData,
  errors,
  handleImageUpload,
}) => {

  const { textSecondary, textTertiary, borderColor, hoverBg } = useThemeClasses()

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("upload_main_image")} *
        </label>
        <div
          className={`border-2 border-dashed ${borderColor} rounded-xl p-8 text-center ${hoverBg} cursor-pointer transition-colors`}
          onClick={() => document.getElementById("main-image-input")?.click()}
        >
          {formData.mainImage ? (
            <div className="relative">
              <img
                src={formData.mainImage}
                alt="Main product"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData({ ...formData, mainImage: null });
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${textTertiary}`} />
              <p className={`${textSecondary} mb-2`}>{t("drag_drop_images")}</p>
              <p className={`text-xs ${textTertiary}`}>{t("image_format_size")}</p>
            </>
          )}
        </div>
        <input
          id="main-image-input"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, "main");
          }}
          className="hidden"
        />
        {errors.mainImage && <p className="text-red-500 text-sm mt-1">{errors.mainImage}</p>}
      </div>

      {/* Additional Images */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("upload_additional_images")}
        </label>
        <div
          className={`border-2 border-dashed ${borderColor} rounded-xl p-6 text-center ${hoverBg} cursor-pointer transition-colors`}
          onClick={() => document.getElementById("additional-images-input")?.click()}
        >
          <Upload className={`w-8 h-8 mx-auto mb-2 ${textTertiary}`} />
          <p className={`text-sm ${textSecondary}`}>{t("additional_images_limit")}</p>
        </div>
        <input
          id="additional-images-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach((file) => handleImageUpload(file, "additional"));
          }}
          className="hidden"
        />

        {formData.additionalImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {formData.additionalImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img}
                  alt={`Additional ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      additionalImages: formData.additionalImages.filter((_, i) => i !== idx),
                    })
                  }
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductMedia;
