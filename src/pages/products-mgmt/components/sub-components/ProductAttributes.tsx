import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";

interface ProductAttributesProps {
  t: (key: string) => string;
  formData: {
    type: string;
    primaryCategory: string;
    categories: string[];
  };
  setFormData: (data: any) => void;
  errors: {
    type?: string;
    primaryCategory?: string;
    categories?: string;
  };
}

const ProductAttributes = ({
  t,
  formData,
  setFormData,
  errors,
}: ProductAttributesProps) => {
  const { textPrimary, textSecondary, borderColor, hoverBg } =
    useThemeClasses();
  const { primaryCategories } = useCommon(); // <-- Use useCommon here

  const productTypes = [
    { value: "PHYSICAL", label: t("physical_product"), icon: "📦" },
    { value: "TABLE_ORDER", label: t("table_order"), icon: "🍽️" },
    { value: "SERVICE", label: t("service"), icon: "⚡" },
    { value: "HOTEL", label: t("hotel_room"), icon: "🏨" },
    { value: "EXPERIENCE", label: t("experience"), icon: "🎭" },
  ];

  // Extract category names (assuming the shape is {_id, name})
  const categoriesList = primaryCategories?.datas?.data || [];

  return (
    <div className="space-y-6">
      {/* Product Type */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("select_product_type")} *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {productTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: type.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.type === type.value
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                  : `${borderColor} ${hoverBg}`
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className={`font-medium ${textPrimary}`}>{type.label}</div>
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="text-red-500 text-sm mt-1">{errors.type}</p>
        )}
      </div>

      {/* Product Categories (checkboxes) */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("select_categories")} *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categoriesList.map((cat: any) => (
            <label
              key={cat._id}
              className={`flex items-center gap-2 p-3 rounded-lg border ${borderColor} cursor-pointer ${hoverBg}`}
            >
              <input
                type="checkbox"
                checked={formData.categories.includes(cat._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      categories: [...formData.categories, cat._id],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      categories: formData.categories.filter(
                        (c) => c !== cat._id,
                      ),
                    });
                  }
                }}
                className="rounded"
              />
              <span className={`text-sm ${textSecondary}`}>{cat.name}</span>
            </label>
          ))}
        </div>
        {errors.categories && (
          <p className="text-red-500 text-sm mt-1">{errors.categories}</p>
        )}
      </div>
    </div>
  );
};

export default ProductAttributes;
