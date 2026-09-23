import { Plus, Trash2 } from "lucide-react";

import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";
import SelectField from "@/components/form-fields/SelectField";
import { useThemeClasses } from "@/hooks/useThemeClasses";

type TCatalogueItem = IPunchPassPayload["catalogues"][number];

interface PunchPassCatalogueProps {
  t: (key: string) => string;
  formData: IPunchPassPayload;
  setFormData: (data: any) => void;
  errors: {
    catalogues?: string;
  };
}

const CATALOGUE_TYPES: TCatalogueItem["type"][] = ["ITEM", "SERVICE", "OTHER"];

const emptyCatalogueItem: TCatalogueItem = {
  name: "",
  nameHe: "",
  nameAr: "",
  type: "ITEM",
  quantity: 1,
  time: "",
};

const PunchPassCatalogue = ({
  t,
  errors,
  formData,
  setFormData,
}: PunchPassCatalogueProps) => {
  const {
    textSecondary,
    textPrimary,
    textTertiary,
    bgTertiary,
    borderColor,
    language,
  } = useThemeClasses();

  const nameField =
    language === "en"
      ? "name"
      : `name${language.charAt(0).toUpperCase()}${language.slice(1)}`;
  const isRtl = language === "he" || language === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const inputClasses = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`;

  const catalogues = formData.catalogues || [];

  const updateCatalogue = (index: number, updates: Partial<TCatalogueItem>) => {
    setFormData((prev: any) => ({
      ...prev,
      catalogues: prev.catalogues.map((item: TCatalogueItem, i: number) =>
        i === index ? { ...item, ...updates } : item,
      ),
    }));
  };

  const addCatalogue = () => {
    setFormData((prev: any) => ({
      ...prev,
      catalogues: [...(prev.catalogues || []), { ...emptyCatalogueItem }],
    }));
  };

  const removeCatalogue = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      catalogues: prev.catalogues.filter(
        (_: TCatalogueItem, i: number) => i !== index,
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className={`block text-sm font-medium ${textSecondary}`}>
          {t("catalogues")} <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={addCatalogue}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("add_catalogue")}
        </button>
      </div>

      {errors.catalogues && (
        <p className="text-red-500 text-sm">{errors.catalogues}</p>
      )}

      {catalogues.length === 0 && (
        <div
          className={`rounded-xl border border-dashed ${borderColor} p-6 text-center text-sm ${textTertiary}`}
        >
          {t("no_catalogues_added")}
        </div>
      )}

      <div className="space-y-4">
        {catalogues.map((item, index) => (
          <div
            key={index}
            className={`rounded-xl border ${borderColor} p-4 space-y-4 relative`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${textSecondary}`}>
                {t("catalogue")} {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeCatalogue(index)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormFieldWrapper label={t("catalogue_name")} required>
                <input
                  type="text"
                  dir={dir}
                  value={(item as any)[nameField] || ""}
                  onChange={(e) =>
                    updateCatalogue(index, {
                      [nameField]: e.target.value,
                    } as any)
                  }
                  placeholder={t("catalogue_name_placeholder")}
                  className={inputClasses}
                />
              </FormFieldWrapper>

              <FormFieldWrapper label={t("catalogue_type")}>
                <SelectField
                  value={item.type || "ITEM"}
                  onChange={(value) =>
                    updateCatalogue(index, {
                      type: value as TCatalogueItem["type"],
                    })
                  }
                  options={CATALOGUE_TYPES.map((type) => ({
                    label: t(`catalogue_type_${type?.toLowerCase()}`),
                    value: type as string,
                  }))}
                  placeholder={t("catalogue_type")}
                  selectInputClasses={`${borderColor} ${bgTertiary} ${textPrimary}`}
                />
              </FormFieldWrapper>

              <FormFieldWrapper label={t("catalogue_quantity")}>
                <input
                  type="number"
                  min={1}
                  value={item.quantity ?? ""}
                  onChange={(e) =>
                    updateCatalogue(index, { quantity: Number(e.target.value) })
                  }
                  placeholder="1"
                  className={inputClasses}
                />
              </FormFieldWrapper>

              <FormFieldWrapper label={t("catalogue_time")}>
                <input
                  type="time"
                  value={item.time || ""}
                  onChange={(e) =>
                    updateCatalogue(index, { time: e.target.value })
                  }
                  className={inputClasses}
                />
              </FormFieldWrapper>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PunchPassCatalogue;
