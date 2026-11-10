import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "sonner";

import { ModalWrapper } from "@/components/wrapper";
import { Spinner } from "@/components/shared";
import CircularProgress from "@/components/shared/CircularProgress";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import {
  useCreatePartnerMutation,
  useGetPartnerByIdQuery,
  useUpdatePartnerMutation,
} from "@/store/api/websiteConfigApi";

interface CreatePartnerWizardProps {
  setIsOpen: (v: boolean) => void;
  partnerId?: string;
  onSuccess?: () => void;
}

interface PartnerFormData {
  nameEn: string;
  nameHe: string;
  nameAr: string;
  descriptionEn: string;
  descriptionHe: string;
  descriptionAr: string;
  siteUrl: string;
  selectedWebsites: string[];
}

const CreatePartnerWizard = ({
  setIsOpen,
  partnerId,
  onSuccess,
}: CreatePartnerWizardProps) => {
  const { t } = useTranslation("website_settings");
  const {
    textPrimary,
    textTertiary,
    isDark,
    bgPrimary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();
  const { allWebsites } = useCommon();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState<PartnerFormData>({
    nameEn: "",
    nameHe: "",
    nameAr: "",
    descriptionEn: "",
    descriptionHe: "",
    descriptionAr: "",
    siteUrl: "",
    selectedWebsites: [],
  });

  const fileUpload = useFileUpload({ mediaType: "image" });

  const { data: partnerEditData, isLoading } = useGetPartnerByIdQuery(
    partnerId ?? skipToken,
  );
  const [createPartner, { isLoading: isCreating }] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: isUpdating }] = useUpdatePartnerMutation();

  const isUploading = fileUpload.status === "uploading";

  const updateField = <K extends keyof PartnerFormData>(
    key: K,
    value: PartnerFormData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (!partnerEditData) return;

    setFormData({
      nameEn: partnerEditData.nameEn ?? "",
      nameHe: partnerEditData.nameHe ?? "",
      nameAr: partnerEditData.nameAr ?? "",
      descriptionEn: partnerEditData.descriptionEn ?? "",
      descriptionHe: partnerEditData.descriptionHe ?? "",
      descriptionAr: partnerEditData.descriptionAr ?? "",
      siteUrl: partnerEditData.siteUrl ?? "",
      selectedWebsites: partnerEditData.websites ?? [],
    });

    if (partnerEditData.logo) {
      fileUpload.setExternalUrl(partnerEditData.logo);
    }
  }, [partnerEditData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      fileUpload.handleFileSelect(file);
    }

    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    setDragOver(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      fileUpload.handleFileSelect(file);
    }
  };

  const toggleWebsite = (id: string) => {
    const updated = formData.selectedWebsites.includes(id)
      ? formData.selectedWebsites.filter((w) => w !== id)
      : [...formData.selectedWebsites, id];

    updateField("selectedWebsites", updated);
  };

  const toggleAll = () => {
    if (!allWebsites?.length) return;

    const allIds = allWebsites.map((w) => w._id);

    updateField(
      "selectedWebsites",
      formData.selectedWebsites.length === allIds.length ? [] : allIds,
    );
  };

  const handleSave = async () => {
    const payload = {
      nameEn: formData.nameEn,
      nameHe: formData.nameHe,
      nameAr: formData.nameAr,
      descriptionEn: formData.descriptionEn,
      descriptionHe: formData.descriptionHe,
      descriptionAr: formData.descriptionAr,
      isActive: true,
      siteUrl: formData.siteUrl,
      websites: formData.selectedWebsites,
      logo: fileUpload.gcsUrl || "",
    };

    try {
      if (partnerId) {
        await updatePartner({
          id: partnerId,
          body: payload,
        }).unwrap();

        toast.success(t("partner_updated_success"));
      } else {
        await createPartner(payload).unwrap();

        toast.success(t("partner_created_success"));
      }

      setIsOpen(false);
      onSuccess?.();
    } catch {
      toast.error(
        partnerId ? t("partner_update_failed") : t("partner_create_failed"),
      );
    }
  };

  const inputCls = `
    w-full px-4 py-3 rounded-lg border
    ${borderColor}
    ${bgPrimary}
    ${textPrimary}
    text-sm
    focus:ring-2 focus:ring-violet-500 focus:border-transparent
    transition
  `;

  const allSelected =
    !!allWebsites?.length &&
    formData.selectedWebsites.length === allWebsites.length;

  return (
    <ModalWrapper
      onClose={() => setIsOpen(false)}
      maxWidth="max-w-5xl"
      height="max-content"
    >
      <div className="flex flex-col relative">
        <Spinner isLoading={isLoading} />

        {/* Header */}
        <div className={`px-5 pt-5 pb-0 border-b ${borderColor}`}>
          <h2 className={`text-base font-bold ${textPrimary} mb-3`}>
            {partnerId ? t("edit_partner") : t("create_partner")}
          </h2>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Names */}
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textTertiary}`}
            >
              {t("partner_names")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: "nameEn",
                  label: t("lang_english"),
                  placeholder: t("partner_name_en_placeholder"),
                  required: true,
                },
                {
                  key: "nameHe",
                  label: t("lang_hebrew"),
                  placeholder: t("partner_name_he_placeholder"),
                },
                {
                  key: "nameAr",
                  label: t("lang_arabic"),
                  placeholder: t("partner_name_ar_placeholder"),
                },
              ].map((field) => (
                <div key={field.key}>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${textTertiary}`}
                  >
                    {field.label}

                    {field.required && <span className="text-red-500">*</span>}
                  </label>

                  <input
                    type="text"
                    maxLength={100}
                    value={
                      formData[field.key as keyof PartnerFormData] as string
                    }
                    onChange={(e) =>
                      updateField(
                        field.key as keyof PartnerFormData,
                        e.target.value,
                      )
                    }
                    placeholder={field.placeholder}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textTertiary}`}
            >
              {t("partner_descriptions")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: "descriptionEn",
                  label: t("lang_english"),
                  placeholder: t("partner_desc_en_placeholder"),
                },
                {
                  key: "descriptionHe",
                  label: t("lang_hebrew"),
                  placeholder: t("partner_desc_he_placeholder"),
                },
                {
                  key: "descriptionAr",
                  label: t("lang_arabic"),
                  placeholder: t("partner_desc_ar_placeholder"),
                },
              ].map((field) => (
                <div key={field.key}>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${textTertiary}`}
                  >
                    {field.label}
                  </label>

                  <textarea
                    rows={4}
                    maxLength={500}
                    value={
                      formData[field.key as keyof PartnerFormData] as string
                    }
                    onChange={(e) =>
                      updateField(
                        field.key as keyof PartnerFormData,
                        e.target.value,
                      )
                    }
                    placeholder={field.placeholder}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Logo + URL */}
          <div className="flex gap-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${textPrimary}`}>
                {t("partner_logo")}
              </label>

              {fileUpload.previewUrl ? (
                <div
                  className={`relative rounded-xl overflow-hidden border py-4 ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  } shadow-sm group`}
                >
                  <img
                    src={fileUpload.previewUrl}
                    alt="logo preview"
                    className="w-20 h-10 object-contain"
                  />

                  {isUploading ? (
                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-2">
                      <CircularProgress
                        progress={fileUpload.progress}
                        size={48}
                      />

                      <span className="text-white text-[11px] font-medium">
                        {t("partner_uploading")}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute left-0 top-0 inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <button
                        onClick={fileUpload.deleteFile}
                        className="opacity-0 group-hover:opacity-100 flex items-center p-2 gap-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all shadow-lg"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all select-none ${
                    dragOver
                      ? "border-violet-500 bg-violet-50 dark:bg-gray-700 scale-[1.01]"
                      : `${borderColor} hover:border-violet-400 dark:hover:border-violet-600 dark:hover:bg-gray-700`
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        dragOver
                          ? "bg-violet-100 dark:bg-gray-700"
                          : bgSecondary
                      }`}
                    >
                      <Upload
                        className={`w-4 h-4 ${
                          dragOver ? "text-violet-500" : textTertiary
                        }`}
                      />
                    </div>

                    <p className={`text-xs ${textTertiary}`}>PNG, JPG, SVG</p>
                  </div>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Site URL */}
            <div className="flex-2">
              <label
                className={`block text-sm font-semibold mb-1.5 ${textPrimary}`}
              >
                {t("partner_site_url")}
              </label>

              <input
                type="url"
                value={formData.siteUrl}
                onChange={(e) => updateField("siteUrl", e.target.value)}
                placeholder="https://example.com"
                className={inputCls}
              />
            </div>
          </div>

          {/* Websites */}
          <div className="space-y-3 overflow-y-auto max-h-[65vh]">
            {allWebsites?.length ? (
              <>
                <label
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${borderColor} cursor-pointer`}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-violet-600"
                  />

                  <span className={`text-sm font-semibold ${textPrimary}`}>
                    {t("partner_select_all")}
                  </span>

                  <span className={`ml-auto text-xs ${textTertiary}`}>
                    {formData.selectedWebsites.length} / {allWebsites.length}{" "}
                    {t("selected")}
                  </span>
                </label>

                <div className="grid  grid-cols-3 md:grid-cols-4 gap-2">
                  {allWebsites.map((website) => {
                    const checked = formData.selectedWebsites.includes(
                      website._id,
                    );

                    return (
                      <label
                        key={website._id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                            : `${borderColor} hover:border-violet-400`
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleWebsite(website._id)}
                          className="w-4 h-4 rounded accent-violet-600 shrink-0"
                        />

                        {website.logo && (
                          <img
                            src={website.logo}
                            alt={website.name}
                            className="w-6 h-6 object-contain rounded shrink-0"
                          />
                        )}

                        <div className="min-w-0">
                          <p
                            className={`md:text-sm text-xs  font-medium truncate ${textPrimary}`}
                          >
                            {website.name}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className={`text-sm text-center py-8 ${textTertiary}`}>
                {t("partner_no_websites")}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className={`flex justify-end gap-2 px-5 py-4 border-t ${borderColor}`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={`px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium ${textPrimary} transition`}
          >
            {t("cancel")}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              !formData.nameEn.trim() || isCreating || isUpdating || isUploading
            }
            className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {isCreating || isUpdating
              ? t("partner_saving")
              : partnerId
                ? t("partner_save_changes")
                : t("create_partner")}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreatePartnerWizard;
