import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { usePreviewEmailConfigMutation } from "@/store/api/emailConfigMutationApi";

import MergeVarsEditor, { type MergeVarRow } from "./MergeVarsEditor";

interface EmailConfigPreviewModalProps {
  emailConfig: IEmailConfig;
  onClose: () => void;
}

const EmailConfigPreviewModal = ({
  emailConfig,
  onClose,
}: EmailConfigPreviewModalProps) => {
  const { t } = useTranslation("email_config");
  const { textPrimary, borderColor } = useThemeClasses();

  const [rows, setRows] = useState<MergeVarRow[]>([{ key: "", value: "" }]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const [previewEmailConfig, { isLoading }] = usePreviewEmailConfigMutation();

  const handleRenderPreview = async () => {
    const mergeVars: IEmailConfigMergeVars = {};
    rows.forEach((row) => {
      if (row.key.trim()) mergeVars[row.key.trim()] = row.value;
    });

    try {
      const response = await previewEmailConfig({
        id: emailConfig._id,
        mergeVars,
      }).unwrap();
      setPreviewHtml(response?.datas?.html ?? "");
    } catch {
      toast.error(t("preview_failed"));
    }
  };

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={isLoading}
      maxWidth="max-w-3xl"
      height="h-[85dvh] md:h-[85vh]"
    >
      <div className="flex flex-col h-full">
        <div className={`px-5 pt-5 pb-4 border-b ${borderColor}`}>
          <h2 className={`text-base font-bold ${textPrimary}`}>
            {t("preview_template")} — {emailConfig.label}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <MergeVarsEditor rows={rows} onChange={setRows} />

          <button
            type="button"
            onClick={handleRenderPreview}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {t("render_preview")}
          </button>

          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white min-h-72">
            {previewHtml != null ? (
              <iframe
                title="email-preview"
                srcDoc={previewHtml}
                sandbox=""
                className="w-full h-[50vh] bg-white"
              />
            ) : (
              <div className="flex items-center justify-center h-72 text-sm text-gray-400">
                {t("no_preview_yet")}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EmailConfigPreviewModal;
