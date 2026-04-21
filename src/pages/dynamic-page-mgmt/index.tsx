import clsx from "clsx";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Shield, BookOpen, Upload } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { DraftButton, PublishButton } from "@/components/btns";
import { TabsSection, Spinner } from "@/components/shared";
import { uploadWithProgress } from "@/helpers";
import {
  useCreateSignedUrlMutation,
  useDeleteMediaMutation,
} from "@/store/api/mediaMutationApi";
import {
  useCreateDynamicPageMutation,
  useUpdateDynamicPageMutation,
  useGetDynamicPagesQuery,
} from "@/store/api/dynamicPageApi";

import type { TabId, FileSlot, IUploadedFile, PageFormData } from "./types";
import { ACCEPTED_MIME_TYPES, formatBytes } from "./utils";
import DocumentUploadTab from "./components/DocumentUploadTab";
import PageContentTab from "./components/PageContentTab";

const INITIAL_FORM: PageFormData = {
  title: "",
  subTitle: "",
  content: "",
  status: "DRAFT",
};

export default function DynamicPageMgmt() {
  const { t } = useTranslation("dynamic_pages");
  const { associatedWebsite } = useAppSelector((state) => state.auth);
  const { isDark, bgSecondary, borderColor, textPrimary, textSecondary } =
    useThemeClasses();

  const TABS = [
    {
      id: "terms_and_condition" as TabId,
      label: t("tab_terms"),
      icon: FileText,
    },
    { id: "privacy" as TabId, label: t("tab_privacy"), icon: Shield },
    {
      id: "business_regulation" as TabId,
      label: t("tab_business_regulation"),
      icon: BookOpen,
    },
    {
      id: "document_upload" as TabId,
      label: t("tab_document_upload"),
      icon: Upload,
    },
  ];

  const [externalApiId, setExternalApiId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("terms_and_condition");
  const [forms, setForms] = useState<Record<TabId, PageFormData>>({
    terms_and_condition: { ...INITIAL_FORM },
    privacy: { ...INITIAL_FORM },
    business_regulation: { ...INITIAL_FORM },
    document_upload: { ...INITIAL_FORM },
  });
  const [errors, setErrors] = useState<Record<TabId, Partial<PageFormData>>>({
    terms_and_condition: {},
    privacy: {},
    business_regulation: {},
    document_upload: {},
  });
  const [uploadedFiles, setUploadedFiles] = useState<{
    primary: IUploadedFile | null;
    secondary: IUploadedFile | null;
  }>({ primary: null, secondary: null });
  const [isDragging, setIsDragging] = useState<FileSlot | null>(null);
  const [previewOpen, setPreviewOpen] = useState<FileSlot | null>(null);

  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [createDynamicPage, { isLoading: isCreating }] =
    useCreateDynamicPageMutation();
  const [updateDynamicPage, { isLoading: isUpdating }] =
    useUpdateDynamicPageMutation();

  const {
    data: pageData,
    isLoading,
    isFetching,
  } = useGetDynamicPagesQuery({ externalApiId }, { skip: !externalApiId });

  useEffect(() => {
    const page = pageData?.data?.find((item) => item.type === activeTab);
    if (page) {
      setForms((prev) => ({
        ...prev,
        [activeTab]: {
          title: page.title ?? "",
          subTitle: page.subTitle ?? "",
          content:
            activeTab === "document_upload" ? "" : (page.description ?? ""),
          status: page.status ?? "DRAFT",
        },
      }));

      if (activeTab === "document_upload") {
        const makeEntry = (
          idx: number,
          f: { docUrl?: string; docType?: string; docSize?: string },
        ): IUploadedFile => ({
          id: idx,
          name: f.docType ?? f.docUrl?.split("/").pop() ?? "document",
          gcsUrl: f.docUrl,
          docType: f.docType ?? "",
          docSize: f.docSize ?? "",
          progress: 100,
          status: "success",
        });

        if (page.files && page.files.length > 0) {
          const pf = page.files.find((f) => f.file === "primary");
          const sf = page.files.find((f) => f.file === "secondary");
          setUploadedFiles({
            primary: pf ? makeEntry(0, pf) : null,
            secondary: sf ? makeEntry(1, sf) : null,
          });
        } else if (page.docUrl) {
          setUploadedFiles({
            primary: makeEntry(0, {
              docUrl: page.docUrl,
              docType: page.docType,
              docSize: page.docSize,
            }),
            secondary: null,
          });
        } else {
          setUploadedFiles({ primary: null, secondary: null });
        }
      }
    } else {
      setForms((prev) => ({ ...prev, [activeTab]: { ...INITIAL_FORM } }));
      if (activeTab === "document_upload")
        setUploadedFiles({ primary: null, secondary: null });
    }
    setErrors((prev) => ({ ...prev, [activeTab]: {} }));
  }, [pageData, activeTab]);

  const currentForm = forms[activeTab as TabId];
  const currentErrors = errors[activeTab as TabId];

  const updateField = (field: keyof PageFormData, value: string) => {
    setForms((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab as TabId], [field]: value },
    }));
    if (errors[activeTab as TabId][field]) {
      setErrors((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab as TabId], [field]: undefined },
      }));
    }
  };

  const validate = (): boolean => {
    if (activeTab === "document_upload") {
      const newErrors: Partial<PageFormData> = {};
      if (!(currentForm.title ?? "").trim())
        newErrors.title = t("field_title_required");
      setErrors((prev) => ({ ...prev, [activeTab]: newErrors }));
      if (Object.keys(newErrors).length > 0) return false;
      if (!uploadedFiles.primary) {
        toast.error(t("error_no_document"));
        return false;
      }
      if (
        uploadedFiles.primary.status === "uploading" ||
        uploadedFiles.secondary?.status === "uploading"
      ) {
        toast.error(t("error_upload_in_progress"));
        return false;
      }
      if (
        uploadedFiles.primary.status === "error" ||
        uploadedFiles.secondary?.status === "error"
      ) {
        toast.error(t("error_upload_failed_files"));
        return false;
      }
      return true;
    }
    const newErrors: Partial<PageFormData> = {};
    if (!(currentForm.title ?? "").trim())
      newErrors.title = t("field_title_required");
    if (!(currentForm.content ?? "").trim() || currentForm.content === "<br>")
      newErrors.content = t("field_content_required");
    setErrors((prev) => ({ ...prev, [activeTab]: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const uploadFileToGcs = async (id: number, file: File, slot: FileSlot) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [slot]:
        prev[slot]?.id === id
          ? { ...prev[slot]!, status: "uploading", progress: 0 }
          : prev[slot],
    }));
    try {
      const res = await createSignedUrl([
        { originalName: file.name, mimeType: file.type },
      ]);
      const { signedUrl, gcsURL } = res.data[0];

      await uploadWithProgress(file, signedUrl, (progress) => {
        setUploadedFiles((prev) => ({
          ...prev,
          [slot]:
            prev[slot]?.id === id ? { ...prev[slot]!, progress } : prev[slot],
        }));
      });

      setUploadedFiles((prev) => ({
        ...prev,
        [slot]:
          prev[slot]?.id === id
            ? {
                ...prev[slot]!,
                status: "success",
                progress: 100,
                gcsUrl: gcsURL,
                docType: file.name,
                docSize: formatBytes(file.size),
              }
            : prev[slot],
      }));
    } catch {
      toast.error(t("error_file_upload_failed"));
      setUploadedFiles((prev) => ({
        ...prev,
        [slot]:
          prev[slot]?.id === id
            ? { ...prev[slot]!, status: "error", progress: 0 }
            : prev[slot],
      }));
    }
  };

  const handleFileChange = (files: FileList | null, slot: FileSlot) => {
    if (!files || files.length === 0) return;
    const file = Array.from(files).find((f) =>
      ACCEPTED_MIME_TYPES.includes(f.type),
    );
    if (!file) return;

    const entry: IUploadedFile = {
      id: Date.now(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "idle",
    };

    setUploadedFiles((prev) => ({ ...prev, [slot]: entry }));
    uploadFileToGcs(entry.id, file, slot);
  };

  const removeFile = async (slot: FileSlot) => {
    const file = uploadedFiles[slot];
    if (file?.gcsUrl) {
      try {
        await deleteMedia({ imageUrl: file.gcsUrl }).unwrap();
      } catch (error) {
        console.log(error);
        // Silently ignore delete errors — the file may no longer exist on the server.
        // We still clear the slot so the user can upload a new file.
      }
    }
    setUploadedFiles((prev) => ({ ...prev, [slot]: null }));
  };

  const handleDownload = (slot: FileSlot) => {
    const file = uploadedFiles[slot];
    if (!file?.gcsUrl) return;
    const a = document.createElement("a");
    a.href = file.gcsUrl;
    a.download = file.name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  const handleSubmit = async (status: "DRAFT" | "APPROVED") => {
    if (!validate()) return;
    if (!externalApiId) {
      toast.error(t("error_no_website"));
      return;
    }

    const files: Array<{
      file: FileSlot;
      docUrl?: string;
      docType?: string;
      docSize?: string;
    }> = [];
    if (uploadedFiles.primary) {
      files.push({
        file: "primary",
        docUrl: uploadedFiles.primary.gcsUrl,
        docType: uploadedFiles.primary.docType,
        docSize: uploadedFiles.primary.docSize,
      });
    }
    if (uploadedFiles.secondary) {
      files.push({
        file: "secondary",
        docUrl: uploadedFiles.secondary.gcsUrl,
        docType: uploadedFiles.secondary.docType,
        docSize: uploadedFiles.secondary.docSize,
      });
    }

    const body =
      activeTab === "document_upload"
        ? {
            status,
            externalApiId,
            type: activeTab as TabId,
            title: currentForm.title,
            subTitle: currentForm.subTitle || undefined,
            files,
          }
        : {
            status,
            externalApiId,
            type: activeTab as TabId,
            title: currentForm.title,
            subTitle: currentForm.subTitle || undefined,
            description: currentForm.content,
          };

    try {
      const existingPage = pageData?.data?.find(
        (item) => item.type === activeTab,
      );
      if (existingPage?._id) {
        await updateDynamicPage({ body, _id: existingPage._id }).unwrap();
      } else {
        await createDynamicPage(body).unwrap();
      }
      toast.success(
        status === "DRAFT" ? t("saved_as_draft") : t("published_successfully"),
      );
    } catch {
      toast.error(t("error_save_failed"));
    }
  };

  const activeTabLabel = TABS.find((tab) => tab.id === activeTab)?.label ?? "";

  return (
    <div
      className={clsx(
        "min-h-screen flex flex-col transition-colors relative",
        isDark ? "bg-gray-900" : "bg-white",
      )}
    >
      <Spinner isLoading={isCreating || isLoading || isFetching} />

      {/* Header */}
      <div className={clsx("shrink-0 px-6 pt-6 pb-0 border-b", borderColor)}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-1 bg-linear-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
              {t("page_title")}
            </h1>
            <p className={clsx("text-sm mb-0", textSecondary)}>
              {t("page_subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ReactSelect
              minWidth={180}
              items={associatedWebsite}
              value={externalApiId}
              onChange={(value) => setExternalApiId(value)}
            />
            <div className="flex gap-2">
              <DraftButton
                onClick={() => handleSubmit("DRAFT")}
                isLoading={isCreating || isUpdating}
              />
              <PublishButton
                onClick={() => handleSubmit("APPROVED")}
                isLoading={isCreating || isUpdating}
              />
            </div>
          </div>
        </div>
        <TabsSection
          tabs={TABS}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div
            className={clsx(
              "rounded-xl border p-6 space-y-5",
              borderColor,
              bgSecondary,
            )}
          >
            <h2 className={clsx("text-lg font-semibold", textPrimary)}>
              {activeTabLabel}
            </h2>

            {activeTab === "document_upload" ? (
              <DocumentUploadTab
                currentForm={currentForm}
                currentErrors={currentErrors}
                uploadedFiles={uploadedFiles}
                isDragging={isDragging}
                previewOpen={previewOpen}
                onUpdateField={updateField}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
                onPreview={(slot) => {
                  const file = uploadedFiles[slot];
                  if (file?.gcsUrl) window.open(file.gcsUrl, "_blank");
                }}
                onDownload={handleDownload}
                onSetDragging={setIsDragging}
                onSetPreviewOpen={setPreviewOpen}
              />
            ) : (
              <PageContentTab
                activeTab={activeTab}
                currentForm={currentForm}
                currentErrors={currentErrors}
                onUpdateField={updateField}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
