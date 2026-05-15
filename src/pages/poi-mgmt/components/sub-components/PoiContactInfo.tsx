import { type FC } from "react";
import { Mail, Phone, Globe } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper } from "@/components/form-fields";

interface PoiContactInfoProps {
  t: (key: string) => string;
  formData: { email: string; phone: string; website: string };
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  markDirty: (step: number) => void;
}

const PoiContactInfo: FC<PoiContactInfoProps> = ({
  t,
  formData,
  setFormData,
  errors,
  markDirty,
}) => {
  const { isDark, borderColor, bgTertiary, textPrimary } = useThemeClasses();

  const inputClass = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-teal-500`;

  return (
    <div className="space-y-6 mx-auto">
      <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {t("contact_online_info")}
      </h3>

      <FormFieldWrapper label={t("email")} error={errors?.email} >
        <div className="relative">
          <Mail
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              markDirty(4);
            }}
            placeholder={t("enter_email")}
            className={`${inputClass} pl-10`}
          />
        </div>
      </FormFieldWrapper>

      <FormFieldWrapper label={t("phone")} error={errors?.phone}>
        <div className="relative">
          <Phone
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              markDirty(4);
            }}
            placeholder={t("enter_phone")}
            className={`${inputClass} pl-10`}
          />
        </div>
      </FormFieldWrapper>

      <FormFieldWrapper label={t("website")} error={errors?.website}>
        <div className="relative">
          <Globe
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          />
          <input
            type="url"
            value={formData.website}
            onChange={(e) => {
              setFormData({ ...formData, website: e.target.value });
              markDirty(4);
            }}
            placeholder="https://example.com"
            className={`${inputClass} pl-10`}
          />
        </div>
      </FormFieldWrapper>
    </div>
  );
};

export default PoiContactInfo;
