import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import {
  ModalWrapper,
  EmailHtmlEditor,
  EmailHtmlPreview,
} from "@/components/wrapper";
import { Switch } from "@/components/ui/switch";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useCreateEmailConfigMutation,
  useUpdateEmailConfigMutation,
} from "@/store/api/emailConfigMutationApi";

const DEFAULT_MERGE_VARS = ["Name", "Email"];

type FormTab = "general" | "editor" | "preview";

interface EmailConfigFormModalProps {
  emailConfig?: IEmailConfig | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM: IEmailConfigFormPayload = {
  eventKey: "",
  label: "",
  category: "",
  language: "en",
  mailchimpTemplateName: "",
  subject: "",
  htmlContent: "",
  isActive: true,
};

const EmailConfigFormModal = ({
  emailConfig,
  onClose,
  onSuccess,
}: EmailConfigFormModalProps) => {
  const { t } = useTranslation("email_config");
  const { isRTL, textPrimary, borderColor, bgPrimary } = useThemeClasses();
  const isEdit = !!emailConfig;

  const [createEmailConfig, { isLoading: isCreating }] =
    useCreateEmailConfigMutation();
  const [updateEmailConfig, { isLoading: isUpdating }] =
    useUpdateEmailConfigMutation();
  const isSaving = isCreating || isUpdating;

  const [form, setForm] = useState<IEmailConfigFormPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<FormTab>("general");

  useEffect(() => {
    if (!emailConfig) return;
    setForm({
      eventKey: emailConfig.eventKey,
      label: emailConfig.label,
      category: emailConfig.category,
      language: emailConfig.language,
      mailchimpTemplateName: emailConfig.mailchimpTemplateName,
      subject: emailConfig.subject,
      htmlContent: emailConfig.htmlContent,
      isActive: emailConfig.isActive,
    });
  }, [emailConfig]);

  const set = <K extends keyof IEmailConfigFormPayload>(
    field: K,
    value: IEmailConfigFormPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.label.trim()) next.label = t("field_required");
    if (!form.eventKey.trim()) next.eventKey = t("field_required");
    if (!form.category.trim()) next.category = t("field_required");
    if (!form.mailchimpTemplateName.trim())
      next.mailchimpTemplateName = t("field_required");
    setErrors(next);
    if (Object.keys(next).length > 0) setActiveTab("general");
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEdit) {
        const { eventKey: _eventKey, ...updatePayload } = form;
        await updateEmailConfig({
          id: emailConfig._id,
          body: updatePayload,
        }).unwrap();
        toast.success(t("template_updated_success"));
      } else {
        await createEmailConfig(form).unwrap();
        toast.success(t("template_created_success"));
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(
        isEdit ? t("template_update_failed") : t("template_create_failed"),
      );
    }
  };

  const inputCls = `w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition`;
  const labelCls = `block text-sm font-semibold mb-1.5 ${textPrimary}`;

  const previewData = Object.fromEntries(
    DEFAULT_MERGE_VARS.map((v) => [v, `{{${v}}}`]),
  );

  const tabs: { key: FormTab; label: string }[] = [
    { key: "general", label: t("general") },
    { key: "editor", label: t("editor") },
    { key: "preview", label: t("live_preview") },
  ];

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={isSaving}
      maxWidth="max-w-4xl"
      height="h-[85dvh] md:h-[85vh]"
    >
      <div className="flex flex-col h-full">
        <div className={`px-5 pt-5 pb-4 border-b ${borderColor}`}>
          <h2 className={`text-base font-bold ${textPrimary}`}>
            {isEdit ? t("edit_template") : t("create_template")}
          </h2>
        </div>

        <div className={`flex gap-1 px-5 pt-3 border-b ${borderColor}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? "border-violet-500 text-violet-500"
                  : `border-transparent ${textPrimary} opacity-60 hover:opacity-100`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    {t("label")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => set("label", e.target.value)}
                    className={inputCls}
                  />
                  {errors.label && (
                    <p className="text-xs text-red-500 mt-1">{errors.label}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>
                    {t("event_key")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={isEdit}
                    value={form.eventKey}
                    onChange={(e) => set("eventKey", e.target.value)}
                    className={`${inputCls} ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                  {errors.eventKey && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.eventKey}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>
                    {t("category")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className={inputCls}
                  />
                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>{t("language")}</label>
                  <select
                    value={form.language}
                    onChange={(e) =>
                      set("language", e.target.value as EmailConfigLanguage)
                    }
                    className={inputCls}
                  >
                    <option value="en">EN</option>
                    <option value="he">HE</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    {t("mailchimp_template_name")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.mailchimpTemplateName}
                    onChange={(e) =>
                      set("mailchimpTemplateName", e.target.value)
                    }
                    className={inputCls}
                  />
                  {errors.mailchimpTemplateName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.mailchimpTemplateName}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>{t("subject")}</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => set("isActive", checked)}
                />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  {t("is_active")}
                </span>
              </div>
            </div>
          )}

          {activeTab === "editor" && (
            <EmailHtmlEditor
              value={form.htmlContent}
              onChange={(value) => set("htmlContent", value)}
              height="h-[55vh]"
            />
          )}

          {activeTab === "preview" && (
            <EmailHtmlPreview
              value={form.htmlContent}
              previewData={previewData}
              isRTL={isRTL}
              height="h-[55vh]"
            />
          )}
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
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {isSaving ? t("saving") : isEdit ? t("save_changes") : t("create")}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EmailConfigFormModal;
