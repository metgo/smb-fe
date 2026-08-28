import { useThemeClasses } from "@/hooks/useThemeClasses";
import { User, Mail, Phone } from "lucide-react";

export const VOUCHER_COUNTRY_CODES = [
  { code: "+972", flag: "🇮🇱", label: "IL" },
  { code: "+1", flag: "🇺🇸", label: "US" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+33", flag: "🇫🇷", label: "FR" },
  { code: "+49", flag: "🇩🇪", label: "DE" },
];

interface VoucherInformationProps {
  formData: IVoucherFormData;
  setFormData: React.Dispatch<React.SetStateAction<IVoucherFormData>>;
  errors: Record<string, string>;
  t: (key: string) => string;
}

const VoucherInformation = ({
  formData,
  t,
  setFormData,
  errors,
}: VoucherInformationProps) => {
  const { isDark, isRTL, textSecondary, textTertiary } = useThemeClasses();

  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:ring-1 focus:ring-teal-500 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;
  const selectCls = `px-2 py-2 rounded-lg border text-sm outline-none transition-colors ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div className="space-y-4">
      <h3
        className={`text-sm uppercase tracking-wider flex items-center gap-2 ${textTertiary}`}
      >
        <User className="w-4 h-4" />
        {t("purchaser_details")}
      </h3>

      <div className="space-y-4 max-w-full">
        {/* Name */}
        <div>
          <label className={`block text-xs mb-1.5 ${textSecondary}`}>
            {t("name")} *
          </label>
          <div className="relative">
            <User
              className={`absolute top-2.5 ${
                isRTL ? "right-3" : "left-3"
              } w-4 h-4 ${textTertiary}`}
            />
            <input
              type="text"
              value={formData.purchaserName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  purchaserName: e.target.value,
                }))
              }
              placeholder={t("name")}
              className={`${inputCls} ${isRTL ? "pr-9" : "pl-9"}`}
            />
          </div>
          {errors.purchaserName && (
            <p className="text-red-500 text-xs mt-1">{errors.purchaserName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={`block text-xs mb-1.5 ${textSecondary}`}>
            {t("email")}
          </label>
          <div className="relative">
            <Mail
              className={`absolute top-2.5 ${
                isRTL ? "right-3" : "left-3"
              } w-4 h-4 ${textTertiary}`}
            />
            <input
              type="email"
              value={formData.purchaserEmail}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  purchaserEmail: e.target.value,
                }))
              }
              placeholder="email@example.com"
              className={`${inputCls} ${isRTL ? "pr-9" : "pl-9"}`}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className={`block text-xs mb-1.5 ${textSecondary}`}>
            {t("phone")}
          </label>
          <div className="flex gap-2">
            <select
              value={formData.purchaserCountryCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  purchaserCountryCode: e.target.value,
                }))
              }
              className={`${selectCls} shrink-0`}
            >
              {VOUCHER_COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Phone
                className={`absolute top-2.5 ${
                  isRTL ? "right-3" : "left-3"
                } w-4 h-4 ${textTertiary}`}
              />
              <input
                type="tel"
                value={formData.purchaserPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    purchaserPhone: e.target.value,
                  }))
                }
                placeholder="50-000-0000"
                className={`${inputCls} ${isRTL ? "pr-9" : "pl-9"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherInformation;
