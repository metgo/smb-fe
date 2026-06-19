import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useUpdateVoucherMutation } from "@/store/api/voucherMutationApi";

interface Props {
  voucherId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const AssignVoucherModal = ({ voucherId, onClose, onSuccess }: Props) => {
  const { t } = useTranslation("vouchers");
  const { isDark } = useThemeClasses();

  const [updateVoucher, { isLoading }] = useUpdateVoucherMutation();

  const [form, setForm] = useState({
    assigneeName: "",
    assigneeEmail: "",
    assigneePhone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.assigneeName.trim())
      next.assigneeName =
        t("assignee_name") +
        " " +
        t("is_required", { defaultValue: "is required" });
    if (!form.assigneeEmail.trim())
      next.assigneeEmail =
        t("assignee_email") +
        " " +
        t("is_required", { defaultValue: "is required" });
    if (!form.assigneePhone.trim())
      next.assigneePhone =
        t("assignee_phone") +
        " " +
        t("is_required", { defaultValue: "is required" });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await updateVoucher({ voucherId, body: form }).unwrap();
      toast.success(
        t("voucher_assigned_successfully", {
          defaultValue: "Voucher assigned successfully",
        }),
      );
      onSuccess?.();
      onClose();
    } catch {
      toast.error(
        t("failed_to_assign_voucher", {
          defaultValue: "Failed to assign voucher",
        }),
      );
    }
  };

  const inputClass = `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
    isDark
      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  const labelClass = `block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={isLoading}
      maxWidth="max-w-lg"
      height="max-content"
    >
      {/* Header */}
      <div
        className={`px-6 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <h2
          className={`text-lg font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          {t("assign_voucher", { defaultValue: "Assign Voucher" })}
        </h2>
        <p
          className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {t("assignee_details")}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Name */}
        <div>
          <label className={labelClass}>{t("assignee_name")} *</label>
          <input
            type="text"
            value={form.assigneeName}
            placeholder={t("enter_assignee_name")}
            onChange={(e) => set("assigneeName", e.target.value)}
            className={inputClass}
          />
          {errors.assigneeName && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneeName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>{t("assignee_email")} *</label>
          <input
            type="email"
            value={form.assigneeEmail}
            placeholder="email@example.com"
            onChange={(e) => set("assigneeEmail", e.target.value)}
            className={inputClass}
          />
          {errors.assigneeEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneeEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>{t("assignee_phone")} *</label>
          <input
            type="tel"
            value={form.assigneePhone}
            placeholder="+972-XX-XXXXXXX"
            onChange={(e) => set("assigneePhone", e.target.value)}
            className={inputClass}
          />
          {errors.assigneePhone && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneePhone}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDark
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("cancel", { defaultValue: "Cancel" })}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("assign", { defaultValue: "Assign" })}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default AssignVoucherModal;
