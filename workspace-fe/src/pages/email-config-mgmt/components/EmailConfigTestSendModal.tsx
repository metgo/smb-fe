import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTestSendEmailConfigMutation } from "@/store/api/emailConfigMutationApi";

import MergeVarsEditor, { type MergeVarRow } from "./MergeVarsEditor";

interface EmailConfigTestSendModalProps {
  emailConfig: IEmailConfig;
  onClose: () => void;
}

const EmailConfigTestSendModal = ({
  emailConfig,
  onClose,
}: EmailConfigTestSendModalProps) => {
  const { t } = useTranslation("email_config");
  const { textPrimary, borderColor, bgPrimary } = useThemeClasses();

  const [to, setTo] = useState("");
  const [rows, setRows] = useState<MergeVarRow[]>([{ key: "", value: "" }]);
  const [error, setError] = useState("");

  const [testSendEmailConfig, { isLoading }] = useTestSendEmailConfigMutation();

  const inputCls = `w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition`;

  const handleSend = async () => {
    if (!to.trim()) {
      setError(t("field_required"));
      return;
    }

    const mergeVars: IEmailConfigMergeVars = {};
    rows.forEach((row) => {
      if (row.key.trim()) mergeVars[row.key.trim()] = row.value;
    });

    try {
      await testSendEmailConfig({
        id: emailConfig._id,
        to: to.trim(),
        mergeVars,
      }).unwrap();
      toast.success(t("test_send_success"));
      onClose();
    } catch {
      toast.error(t("test_send_failed"));
    }
  };

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={isLoading}
      maxWidth="max-w-lg"
      height="max-content"
    >
      <div className="flex flex-col">
        <div className={`px-5 pt-5 pb-4 border-b ${borderColor}`}>
          <h2 className={`text-base font-bold ${textPrimary}`}>
            {t("test_send_template")} — {emailConfig.label}
          </h2>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label
              className={`block text-sm font-semibold mb-1.5 ${textPrimary}`}
            >
              {t("recipient_email")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setError("");
              }}
              className={inputCls}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <MergeVarsEditor rows={rows} onChange={setRows} />
        </div>

        <div
          className={`flex justify-end gap-2 px-5 py-4 border-t ${borderColor}`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium ${textPrimary} transition`}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("send_test")}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EmailConfigTestSendModal;
