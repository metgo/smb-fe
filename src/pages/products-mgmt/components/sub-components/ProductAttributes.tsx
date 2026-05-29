import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import { SelectableChips } from "@/components/shared";
import { useEffect, useMemo } from "react";

interface ProductAttributesProps {
  t: (key: string) => string;
  formData: {
    type: string;
    primaryCategory: string;
    categories: string[];
    subCategories: string[];
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
  errors,
  formData,
  setFormData,
}: ProductAttributesProps) => {
  const { textSecondary, borderColor, hoverBg } = useThemeClasses();
  const { categories, subCategories } = useCommon();

  const filteredSubCategories = useMemo(() => {
    if (!formData?.categories?.length) return [];

    return (subCategories || []).filter((sub: any) =>
      sub.bussCategoryId?.some((cat: any) =>
        formData?.categories?.includes(cat._id),
      ),
    );
  }, [formData?.categories, subCategories]);

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      subCategories: prev?.subCategories?.filter((subId: string) =>
        filteredSubCategories?.some((sub: any) => sub._id === subId),
      ),
    }));
  }, [filteredSubCategories, setFormData]);

  const handleToggle = (id: string) => {
    setFormData((prev: any) => {
      const currentSubCategories = prev.subCategories ?? [];

      if (currentSubCategories.includes(id)) {
        return {
          ...prev,
          subCategories: currentSubCategories.filter(
            (item: any) => item !== id,
          ),
        };
      }

      return {
        ...prev,
        subCategories: [...currentSubCategories, id],
      };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("select_categories")} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories?.map((cat: any) => (
            <label
              key={cat._id}
              className={`flex items-center gap-2 p-3 rounded-lg border ${borderColor} cursor-pointer ${hoverBg}`}
            >
              <input
                type="checkbox"
                checked={formData?.categories?.includes(cat._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      categories: [...formData.categories, cat._id],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      categories: formData?.categories?.filter(
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

      <SelectableChips
        label={"sub_categories"}
        items={filteredSubCategories ?? []}
        selectedIds={formData?.subCategories}
        onSelect={handleToggle}
      />
    </div>
  );
};

export default ProductAttributes;
