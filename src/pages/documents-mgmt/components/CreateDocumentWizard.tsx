"use client";

import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import { ModalWrapper } from "@/components/wrapper";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import {
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  type DocumentPayload,
} from "@/store/api/doumentMutationApi";
import { ReactSelect } from "@/components/form-fields";
import { EMAIL_TEMPLATE_IMAGE_KEYS } from "@/lib/utils";

interface CreateDocumentWizardProps {
  onClose: () => void;
  refetch: () => void;
  documentToEdit?: IDoucment | null;
}

type DocumentFormData = {
  title: string;
};

export const CreateDocumentWizard = ({
  onClose,
  refetch,
  documentToEdit,
}: CreateDocumentWizardProps) => {
  const { t } = useTranslation("documents");
  const { isDark, borderColor, textPrimary } = useThemeClasses();
  const isEditMode = !!documentToEdit;

  const [formData, setFormData] = useState<DocumentFormData>({
    title: documentToEdit?.title ?? "",
  });
  const { associatedWebsite } = useAppSelector((state) => state.auth);
  const [externalApiId, setExternalApiId] = useState(
    documentToEdit?.externalApiId ?? "",
  );
  const [emailTempKey, setEmailTempKey] = useState(
    documentToEdit?.templateKey ?? "",
  );

  const [dragActive, setDragActive] = useState(false);

  const [createDocument, { isLoading: isCreating }] =
    useCreateDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] =
    useUpdateDocumentMutation();

  const {
    image,
    isImageDeleting,
    handleImageSelect,
    uploadImage,
    deleteTarget,
    setDeleteTarget,
    handleDeleteImage,
    confirmDelete,
  } = useSingleImageUpload({
    initialImage: documentToEdit?.imageUrl,
    onChange: () => {},
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error(t("invalid_image_type"));
        return;
      }
      handleImageSelect(file);
    },
    [t, handleImageSelect],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = "";
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
    if (file) handleImageFile(file);
  };

  const isUploadingImage = image?.status === "uploading";
  const isSubmitting = isCreating || isUpdating || isUploadingImage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(t("title_required"));
      return;
    }

    if (!image) {
      toast.error(t("image_required"));
      return;
    }

    try {
      const imageUrl =
        image.status === "success" && image.gcsURL
          ? image.gcsURL
          : await uploadImage();

      if (!imageUrl) return;

      const payload: DocumentPayload = {
        title: formData.title.trim(),
        externalApiId,
        templateKey: emailTempKey,
        imageUrl,
      };

      if (documentToEdit) {
        await updateDocument({ docId: documentToEdit._id, payload }).unwrap();
        toast.success(t("document_updated_success"));
      } else {
        await createDocument(payload).unwrap();
        toast.success(t("document_uploaded_success"));
      }

      refetch();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(documentToEdit ? t("update_failed") : t("upload_failed"));
    }
  };

  return (
    <ModalWrapper onClose={onClose} height="" maxWidth="max-w-3xl">
      {/* Header */}
      <div className="p-4">
        <div>
          <h2
            className={`text-2xl mt-1 ${isDark ? "text-gray-300" : "text-black"}`}
          >
            {isEditMode ? t("edit_document") : t("upload_new_document")}
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
        className={`p-6 space-y-6 overflow-y-auto ${
          isDark ? "bg-gray-900 text-white" : " text-black"
        }`}
      >
        <div className="flex flex-col overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3 items-center">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium ">
                {t("title")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t("enter_document_title")}
                className={`w-full mt-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    : "bg-white border-gray-300"
                }`}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("website")} <span className="text-red-500">*</span>
              </label>
              <ReactSelect
                minWidth={180}
                value={externalApiId}
                items={associatedWebsite}
                onChange={(value) => setExternalApiId(value)}
                placeholder={t("select_website")}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("email_template_key")} <span className="text-red-500">*</span>
            </label>
            <ReactSelect
              minWidth={180}
              value={emailTempKey}
              items={EMAIL_TEMPLATE_IMAGE_KEYS}
              onChange={(value) => setEmailTempKey(value)}
              placeholder={t("select_email_template_key")}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t("image")} <span className="text-red-500">*</span>
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
              {image ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border">
                    <ImageWithFallback
                      src={image.previewUrl}
                      alt={formData.title || "preview"}
                      className="w-full h-full object-cover"
                    />

                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                        <span className="mt-1 text-white font-bold text-xs">
                          {image.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {!isUploadingImage && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image)}
                      className="mt-1 text-xs text-red-500 hover:underline"
                      disabled={isSubmitting}
                    >
                      {t("remove_image")}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <ImageIcon
                    className={`w-10 h-10 mx-auto mb-4 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <p className="font-medium mb-1">
                    {t("drag_drop_image_or_click")}
                  </p>
                  <label className="mt-4 inline-block">
                    <span className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full cursor-pointer transition">
                      {t("select_image")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
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
            disabled={
              isSubmitting ||
              !formData.title.trim() ||
              !image ||
              !externalApiId ||
              !emailTempKey
            }
            className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-violet-600 to-fuchsia-600 hover:brightness-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditMode ? t("updating") : t("uploading")}
              </>
            ) : isEditMode ? (
              t("update_document")
            ) : (
              t("upload_document")
            )}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={!!deleteTarget}
        title="delete_image"
        message="delete_image_confirm"
        confirmText="delete"
        variant="danger"
        loading={isImageDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </ModalWrapper>
  );
};
