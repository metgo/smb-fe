import { MessageSquareText } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: IVoucherFormData;
  setFormData: React.Dispatch<React.SetStateAction<IVoucherFormData>>;
  t: (key: string) => string;
}

const MAX_LEN = 500;

const VoucherGreeting = ({ formData, setFormData, t }: Props) => {
  const { isDark, textTertiary } = useThemeClasses();

  const card = isDark
    ? "bg-gray-900 border-gray-800"
    : "bg-white border-gray-200";

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border p-6 space-y-3 ${card}`}>
        <div className="flex items-center justify-between">
          <h2
            className={`flex items-center gap-2 text-sm uppercase tracking-wider ${textTertiary}`}
          >
            <MessageSquareText className="w-4 h-4" />
            {t("greeting_message")}
          </h2>
          <span
            className={`text-xs ${
              formData.greeting.length > MAX_LEN - 50
                ? "text-orange-500"
                : textTertiary
            }`}
          >
            {formData.greeting.length} / {MAX_LEN}
          </span>
        </div>

        <textarea
          value={formData.greeting}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              greeting: e.target.value.slice(0, MAX_LEN),
            }))
          }
          placeholder={t("greeting_placeholder")}
          rows={6}
          className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors resize-none focus:ring-1 focus:ring-teal-500 ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          }`}
        />
      </div>
    </div>
  );
};

export default VoucherGreeting;
