import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ProductAttributesProps {
  t: (key: string)=>string;
  formData: {
    type: string;
    categories: string[];
  };
  setFormData: (data: any) => void;
  errors: {
    type?: string;
    categories?: string;
  };
  availableCategories: string[];
}

const ProductAttributes = ({
  t,
  formData,
  setFormData,
  errors,
  availableCategories,
}: ProductAttributesProps) => {

  const {  textPrimary, textSecondary, borderColor, hoverBg } = useThemeClasses()

  const productTypes = [
    { value: "physical", label: t("physical_product"), icon: "📦" },
    { value: "table-order", label: t("table_order"), icon: "🍽️" },
    { value: "service", label: t("service"), icon: "⚡" },
    { value: "hotel-room", label: t("hotel_room"), icon: "🏨" },
    { value: "experience", label: t("experience"), icon: "🎭" },
  ];

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

      {/* Product Categories */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("select_categories")} *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableCategories.map((category) => (
            <label
              key={category}
              className={`flex items-center gap-2 p-3 rounded-lg border ${borderColor} cursor-pointer ${hoverBg}`}
            >
              <input
                type="checkbox"
                checked={formData.categories.includes(category)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      categories: [...formData.categories, category],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      categories: formData.categories.filter((c) => c !== category),
                    });
                  }
                }}
                className="rounded"
              />
              <span className={`text-sm ${textSecondary}`}>{category}</span>
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
