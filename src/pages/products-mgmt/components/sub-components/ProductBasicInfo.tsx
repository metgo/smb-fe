import { ReactSelect } from "@/components/form-fields";
import ProductContentForm from "./ProductContentForm";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getLngWiseStr } from "@/helpers";

interface ProductBasicInfoProps {
  t: (key: string) => string;
  selectedFormLanguage: Language;
  setSelectedFormLanguage: (lang: Language) => void;
  formData: {
    businessId: string;
    name: string;
    nameHe: string;
    nameAr: string;

    shortDescription: string;
    shortDescriptionHe: string;
    shortDescriptionAr: string;

    fullDescription: string;
    fullDescriptionHe: string;
    fullDescriptionAr: string;
  };
  setBusinessId: (data: string) => void;
  setFormData: (data: any) => void;
  errors: {
    businessId?: string;
    nameEn?: string;
    shortDescEn?: string;
  };
  businesses: ISearchBusiness[] | [];
  searchBusiness: (key: string) => void;
  isLoading: boolean;
  presetBusinessId: string;
}

const ProductBasicInfo = ({
  t,
  isLoading,
  // selectedFormLanguage,
  // setSelectedFormLanguage,
  formData,
  setFormData,
  errors,
  businesses,
  setBusinessId,
  searchBusiness,
  presetBusinessId,
}: ProductBasicInfoProps) => {
  const { textSecondary, language } = useThemeClasses();
  const handleChange = (updates: Partial<IArticleFormData>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      {/* Select Business - unchanged */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("select_business")} <span className="text-red-500">*</span>
        </label>

        <ReactSelect
          isDisabled={!!presetBusinessId}
          value={formData.businessId}
          onChange={(selectedBusinessId: string) => {
            setFormData({
              ...formData,
              businessId: selectedBusinessId,
            });
            setBusinessId(selectedBusinessId);
          }}
          placeholder={t("select_business")}
          items={
            businesses?.map((biz) => ({
              _id: biz._id,
              name: getLngWiseStr(language, biz.name, biz.nameHe, biz.nameAr),
            })) || []
          }
          onSearch={searchBusiness}
          isLoading={isLoading}
        />

        {errors.businessId && (
          <p className="text-red-500 text-sm mt-1">{errors.businessId}</p>
        )}
      </div>
      {/* Language Selector */}
      <ProductContentForm formData={formData} onChange={handleChange} />
    </div>
  );
};

export default ProductBasicInfo;
