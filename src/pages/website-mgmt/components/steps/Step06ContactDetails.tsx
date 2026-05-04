import clsx from "clsx";
import { Phone } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface Props {
  formData: SiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (
    field: keyof SiteSettingsFormData,
    value: string | boolean,
  ) => void;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  textPrimary,
  textSecondary,
  isDark,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={clsx("text-sm font-medium", textPrimary)}>{label}</p>
        {description && (
          <p className={clsx("text-xs mt-0.5", textSecondary)}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative w-12 h-6 rounded-full transition-colors",
          checked ? "bg-teal-500" : isDark ? "bg-gray-700" : "bg-gray-300",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

const Step06ContactDetails=({
  formData,
  errors,
  onChange,
}: Props) =>{
  const { t } = useTranslation("website_settings");
  const { textPrimary, textSecondary, inputClasses, borderColor, isDark } =
    useThemeClasses();

  const fields: {
    field: keyof SiteSettingsFormData;
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
  }[] = [
    {
      field: "phoneNumber",
      label: t("phone_number"),
      placeholder: "+1 (555) 000-0000",
      type: "tel",
      required: true,
    },
    {
      field: "whatsappNumber",
      label: t("whatsapp_number"),
      placeholder: "+1234567890",
      type: "tel",
    },
    {
      field: "email",
      label: t("email_address"),
      placeholder: "contact@example.com",
      type: "email",
      required: true,
    },
    {
      field: "supportEmail",
      label: t("support_email"),
      placeholder: "support@example.com",
      type: "email",
    },
    {
      field: "physicalAddress",
      label: t("physical_address"),
      placeholder: "123 Main St, City, Country",
    },
    {
      field: "googleMapsEmbed",
      label: t("google_maps_embed"),
      placeholder: "https://maps.google.com/embed?...",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Phone className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          {t("contact_title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fields.map(
          ({ field, label, placeholder, type = "text", required }) => (
            <div key={field} className="flex flex-col gap-2">
              <label className={clsx("text-sm font-medium", textPrimary)}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={type}
                value={formData[field] as string}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={placeholder}
                className={clsx(
                  "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
                  inputClasses,
                  errors[field] && "border-red-500",
                )}
              />
              {errors[field] && (
                <span className="text-xs text-red-500">{errors[field]}</span>
              )}
            </div>
          ),
        )}
      </div>

      <div className={clsx("flex flex-col gap-4 pt-4 border-t", borderColor)}>
        <Toggle
          label={t("enable_click_to_call")}
          description={t("enable_click_to_call_desc")}
          checked={formData.enableClickToCall}
          onChange={(v) => onChange("enableClickToCall", v)}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          isDark={isDark}
        />
        <Toggle
          label={t("enable_whatsapp_chat")}
          description={t("enable_whatsapp_chat_desc")}
          checked={formData.enableWhatsappChat}
          onChange={(v) => onChange("enableWhatsappChat", v)}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
export default Step06ContactDetails