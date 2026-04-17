import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import clsx from "clsx";
import { ModalWrapper } from "@/components/wrapper";

interface CreateDocumentWizardProps {
  onClose: () => void;
}

type DocumentFormData = {
  title: string;
  subTitle: string;
  file: File | null;
};

export const CreateDocumentWizard = ({
  onClose,
}: CreateDocumentWizardProps) => {
  const { t } = useTranslation("documents");
  const { isDark, borderColor, textPrimary } = useThemeClasses();
  const { websiteId } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<DocumentFormData>({
    title: "",
    subTitle: "",
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewFileName, setPreviewFileName] = useState<string>("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleFileChange = useCallback(
    (file: File) => {
      if (!file) return;

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (
        !allowedTypes.includes(file.type) &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        toast.error(t("invalid_file_type"));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("file_too_large"));
        return;
      }

      setFormData((prev) => ({ ...prev, file }));
      setPreviewFileName(file.name);
    },
    [t],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(t("title_required"));
      return;
    }

    if (!formData.file) {
      toast.error(t("file_required"));
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(t("uploading_document"));

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("title", formData.title.trim());
      uploadFormData.append("subTitle", formData.subTitle.trim());
      uploadFormData.append("file", formData.file);
      uploadFormData.append("externalApiId", websiteId || "");

      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success(t("document_uploaded_success"), { id: toastId });

      setFormData({ title: "", subTitle: "", file: null });
      setPreviewFileName("");
      onClose();
    } catch (error: any) {
      toast.error(error?.message || t("upload_failed"), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    setPreviewFileName("");
  };

  return (
    <ModalWrapper onClose={onClose}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-6 border-b ${
          isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
        }`}
      >
        <div>
          <h2
            className={`text-2xl mt-1 ${isDark ? "text-gray-300" : "text-black"}`}
          >
            {t("upload_new_document")}
          </h2>
          <p
            className={`text-sm mt-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t("fill_document_details")}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`p-6 space-y-6 ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        <div className="flex flex-col overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("title")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={t("enter_document_title")}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  : "bg-white border-gray-200"
              }`}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("subtitle")}
            </label>
            <textarea
              name="subTitle"
              value={formData.subTitle}
              onChange={handleInputChange}
              placeholder={t("enter_document_subtitle_optional")}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y min-h-[80px] ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  : "bg-white border-gray-200"
              }`}
              disabled={isSubmitting}
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("document_file")} <span className="text-red-500">*</span>
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={clsx(
                "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                dragActive
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                  : isDark
                    ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                    : "border-gray-300 hover:border-gray-400",
              )}
            >
              {formData.file ? (
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-violet-600 mb-3" />
                  <p className="font-medium text-sm break-all">
                    {previewFileName}
                  </p>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="mt-3 text-xs text-red-500 hover:underline"
                    disabled={isSubmitting}
                  >
                    {t("remove_file")}
                  </button>
                </div>
              ) : (
                <>
                  <Upload
                    className={`w-10 h-10 mx-auto mb-4 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <p className="font-medium mb-1">{t("drag_drop_or_click")}</p>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    PDF, DOC, DOCX, TXT • Max 10MB
                  </p>

                  <label className="mt-4 inline-block">
                    <span className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full cursor-pointer transition">
                      {t("select_file")}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl border font-medium transition ${borderColor} ${textPrimary} ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.file}
            className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("uploading")}
              </>
            ) : (
              t("upload_document")
            )}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
