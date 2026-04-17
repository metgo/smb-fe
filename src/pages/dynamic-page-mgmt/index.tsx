import clsx from "clsx";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Shield,
  BookOpen,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks/hooks";
import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { DraftButton, PublishButton } from "@/components/btns";
import { TabsSection, RichTextEditor, Spinner } from "@/components/shared";
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface PageFormData {
  title: string;
  subTitle: string;
  content: string;
  status?: "DRAFT" | "APPROVED";
}
type TabId =
  | "terms_and_condition"
  | "privacy"
  | "business_regulation"
  | "document_upload";

interface IUploadedFile {
  id: number;
  file?: File;
  name: string;
  size?: number;
  gcsUrl?: string;
  docType?: string;
  docSize?: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
}

const INITIAL_FORM: PageFormData = {
  title: "",
  subTitle: "",
  content: "",
  status: "DRAFT",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DynamicPageMgmt() {
  const { t } = useTranslation("dynamic_pages");

  const { associatedWebsite } = useAppSelector((state) => state.auth);
  const {
    isDark,
    bgSecondary,
    borderColor,
    textPrimary,
    textSecondary,
    textTertiary,
    inputClasses,
  } = useThemeClasses();

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
  const [uploadedFile, setUploadedFile] = useState<IUploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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

      if (activeTab === "document_upload" && page.docUrl) {
        setUploadedFile({
          id: 0,
          name: page.docType ?? page.docUrl.split("/").pop() ?? "document",
          size: undefined,
          gcsUrl: page.docUrl,
          docType: page.docType ?? "",
          docSize: page.docSize ?? "",
          progress: 100,
          status: "success",
        });
      } else if (activeTab === "document_upload") {
        setUploadedFile(null);
      }
    } else {
      setForms((prev) => ({ ...prev, [activeTab]: { ...INITIAL_FORM } }));
      if (activeTab === "document_upload") setUploadedFile(null);
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
      if (!uploadedFile) {
        toast.error(t("error_no_document"));
        return false;
      }
      if (uploadedFile.status === "uploading") {
        toast.error(t("error_upload_in_progress"));
        return false;
      }
      if (uploadedFile.status === "error") {
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

  const ACCEPTED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExt = (name: string) =>
    name.split(".").pop()?.toLowerCase() ?? "";

  const getFileTypeMeta = (name: string) => {
    const ext = getFileExt(name);
    switch (ext) {
      case "pdf":
        return {
          label: "PDF",
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-200 dark:border-red-800",
        };
      case "doc":
      case "docx":
        return {
          label: "DOC",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-800",
        };
      case "xls":
      case "xlsx":
        return {
          label: "XLS",
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
          border: "border-green-200 dark:border-green-800",
        };
      case "ppt":
      case "pptx":
        return {
          label: "PPT",
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-600 dark:text-orange-400",
          border: "border-orange-200 dark:border-orange-800",
        };
      case "txt":
        return {
          label: "TXT",
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-200 dark:border-gray-600",
        };
      default:
        return {
          label: ext.toUpperCase() || "FILE",
          bg: "bg-teal-100 dark:bg-teal-900/30",
          text: "text-teal-600 dark:text-teal-400",
          border: "border-teal-200 dark:border-teal-800",
        };
    }
  };

  const canPreview = (name: string) => getFileExt(name) === "pdf";

  const handlePreview = () => {
    if (!uploadedFile?.gcsUrl) return;
    if (canPreview(uploadedFile.name)) {
      setPreviewOpen(true);
    } else {
      window.open(uploadedFile.gcsUrl, "_blank");
    }
  };

  const handleDownload = () => {
    if (!uploadedFile?.gcsUrl) return;
    const a = document.createElement("a");
    a.href = uploadedFile.gcsUrl;
    a.download = uploadedFile.name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  const uploadFileToGcs = async (id: number, file: File) => {
    setUploadedFile((prev) =>
      prev?.id === id ? { ...prev, status: "uploading", progress: 0 } : prev,
    );
    try {
      const res = await createSignedUrl([
        { originalName: file.name, mimeType: file.type },
      ]);
      const { signedUrl, gcsURL } = res.data[0];

      await uploadWithProgress(file, signedUrl, (progress) => {
        setUploadedFile((prev) =>
          prev?.id === id ? { ...prev, progress } : prev,
        );
      });

      setUploadedFile((prev) =>
        prev?.id === id
          ? {
              ...prev,
              status: "success",
              progress: 100,
              gcsUrl: gcsURL,
              docType: file.name,
              docSize: formatBytes(file.size),
            }
          : prev,
      );
    } catch {
      toast.error(t("error_file_upload_failed"));
      setUploadedFile((prev) =>
        prev?.id === id ? { ...prev, status: "error", progress: 0 } : prev,
      );
    }
  };

  const handleFileChange = (files: FileList | null) => {
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

    setUploadedFile(entry);
    uploadFileToGcs(entry.id, file);
  };

  const removeFile = async () => {
    if (uploadedFile?.gcsUrl) {
      try {
        await deleteMedia({ imageUrl: uploadedFile.gcsUrl }).unwrap();
      } catch {
        toast.error(t("error_file_upload_failed"));
        return;
      }
    }
    setUploadedFile(null);
  };

  const handleSubmit = async (status: "DRAFT" | "APPROVED") => {
    if (!validate()) return;
    if (!externalApiId) {
      toast.error(t("error_no_website"));
      return;
    }

    const body =
      activeTab === "document_upload"
        ? {
            status,
            externalApiId,
            type: activeTab as TabId,
            title: currentForm.title,
            subTitle: currentForm.subTitle || undefined,
            docUrl: uploadedFile!.gcsUrl,
            docType: uploadedFile!.docType,
            docSize: uploadedFile!.docSize,
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

  const titlePlaceholder =
    activeTab === "terms"
      ? t("field_title_placeholder_terms")
      : t("field_title_placeholder_privacy");

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
          {/* Tab card */}
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
              /* ── Document Upload UI ── */
              <div className="space-y-4">
                {/* Title + Subtitle */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      className={clsx("block text-sm font-medium", textPrimary)}
                    >
                      {t("field_title")} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={currentForm.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder={t("field_title_placeholder_privacy")}
                      className={clsx(
                        inputClasses,
                        currentErrors.title &&
                          "border-red-500 focus:ring-red-400",
                      )}
                    />
                    {currentErrors.title && (
                      <p className="text-xs text-red-500">
                        {currentErrors.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className={clsx("block text-sm font-medium", textPrimary)}
                    >
                      {t("field_subtitle")}{" "}
                      <span
                        className={clsx("text-xs font-normal", textTertiary)}
                      >
                        {t("field_subtitle_optional")}
                      </span>
                    </label>
                    <Input
                      value={currentForm.subTitle}
                      onChange={(e) => updateField("subTitle", e.target.value)}
                      placeholder={t("field_subtitle_placeholder")}
                      className={clsx(inputClasses)}
                    />
                  </div>
                </div>

                {/* Drop zone — hidden once a file is selected */}
                {!uploadedFile && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFileChange(e.dataTransfer.files);
                    }}
                    onClick={() =>
                      document.getElementById("doc-file-input")?.click()
                    }
                    className={clsx(
                      "group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer",
                      isDragging
                        ? "border-teal-500 bg-teal-500/10 scale-[1.01]"
                        : isDark
                          ? "border-gray-600 hover:border-teal-500 hover:bg-teal-500/5"
                          : "border-gray-300 hover:border-teal-500 hover:bg-teal-50/60",
                    )}
                  >
                    <input
                      id="doc-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files)}
                    />
                    <div
                      className={clsx(
                        "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
                        isDragging
                          ? "bg-teal-500/20"
                          : isDark
                            ? "bg-gray-700 group-hover:bg-teal-500/20"
                            : "bg-gray-100 group-hover:bg-teal-100",
                      )}
                    >
                      <Upload
                        className={clsx(
                          "h-7 w-7 transition-colors",
                          isDragging ? "text-teal-400" : "text-teal-500",
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className={clsx("text-sm font-semibold", textPrimary)}>
                        {t("upload_drag_drop")}
                      </p>
                      <p className={clsx("text-xs", textTertiary)}>
                        {t("upload_supported_formats")}
                      </p>
                    </div>
                    {/* File type badges */}
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {["PDF", "DOC", "XLS", "PPT", "TXT"].map((ext) => (
                        <span
                          key={ext}
                          className={clsx(
                            "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                            isDark
                              ? "border-gray-600 bg-gray-700 text-gray-300"
                              : "border-gray-200 bg-white text-gray-500",
                          )}
                        >
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* File card */}
                {uploadedFile &&
                  (() => {
                    const meta = getFileTypeMeta(uploadedFile.name);
                    const isUploading = uploadedFile.status === "uploading";
                    const isSuccess = uploadedFile.status === "success";
                    const isError = uploadedFile.status === "error";
                    return (
                      <div
                        className={clsx(
                          "rounded-2xl border p-5 transition-colors",
                          borderColor,
                          isDark ? "bg-gray-800/60" : "bg-gray-50",
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* File type badge */}
                          <div
                            className={clsx(
                              "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border-2 font-bold text-xs tracking-wide",
                              meta.bg,
                              meta.text,
                              meta.border,
                            )}
                          >
                            {meta.label}
                          </div>

                          {/* File info */}
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p
                                  className={clsx(
                                    "truncate text-sm font-semibold",
                                    textPrimary,
                                  )}
                                >
                                  {uploadedFile.name}
                                </p>
                                <p
                                  className={clsx(
                                    "text-xs mt-0.5",
                                    textTertiary,
                                  )}
                                >
                                  {uploadedFile.size != null
                                    ? formatBytes(uploadedFile.size)
                                    : uploadedFile.docSize}
                                </p>
                              </div>

                              {/* Status icon */}
                              <div className="shrink-0 mt-0.5">
                                {isUploading && (
                                  <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                                )}
                                {isSuccess && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {isError && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </div>

                            {/* Progress bar */}
                            {isUploading && (
                              <div className="space-y-1">
                                <div
                                  className={clsx(
                                    "h-1.5 w-full overflow-hidden rounded-full",
                                    isDark ? "bg-gray-700" : "bg-gray-200",
                                  )}
                                >
                                  <div
                                    className="h-full rounded-full bg-teal-500 transition-all duration-200"
                                    style={{
                                      width: `${uploadedFile.progress}%`,
                                    }}
                                  />
                                </div>
                                <p
                                  className={clsx(
                                    "text-right text-xs",
                                    textTertiary,
                                  )}
                                >
                                  {uploadedFile.progress}%
                                </p>
                              </div>
                            )}

                            {/* Action buttons */}
                            {isSuccess && (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={handlePreview}
                                  className={clsx(
                                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                                    isDark
                                      ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-teal-500 hover:text-teal-600",
                                  )}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  {canPreview(uploadedFile.name)
                                    ? t("btn_preview")
                                    : t("btn_open")}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDownload}
                                  className={clsx(
                                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                                    isDark
                                      ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-teal-500 hover:text-teal-600",
                                  )}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  {t("btn_download")}
                                </button>
                                <button
                                  type="button"
                                  onClick={removeFile}
                                  className={clsx(
                                    "ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                                    isDark
                                      ? "border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                                      : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100",
                                  )}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {t("btn_remove")}
                                </button>
                              </div>
                            )}

                            {/* Error retry / remove */}
                            {isError && (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={removeFile}
                                  className={clsx(
                                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                                    isDark
                                      ? "border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                                      : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100",
                                  )}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  {t("btn_remove")}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* PDF Preview Modal */}
                {previewOpen && uploadedFile?.gcsUrl && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                      onClick={() => setPreviewOpen(false)}
                    />
                    <div
                      className={clsx(
                        "relative flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border shadow-2xl overflow-hidden",
                        isDark
                          ? "bg-gray-900 border-gray-700"
                          : "bg-white border-gray-200",
                      )}
                    >
                      {/* Modal header */}
                      <div
                        className={clsx(
                          "flex shrink-0 items-center justify-between border-b px-5 py-3",
                          isDark ? "border-gray-700" : "border-gray-200",
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={clsx(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                              getFileTypeMeta(uploadedFile.name).bg,
                              getFileTypeMeta(uploadedFile.name).text,
                            )}
                          >
                            {getFileTypeMeta(uploadedFile.name).label}
                          </div>
                          <p
                            className={clsx(
                              "truncate text-sm font-medium",
                              textPrimary,
                            )}
                          >
                            {uploadedFile.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDownload}
                            className={clsx(
                              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                              isDark
                                ? "border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400"
                                : "border-gray-200 text-gray-600 hover:border-teal-500 hover:text-teal-600",
                            )}
                          >
                            <Download className="h-3.5 w-3.5" />
                            {t("btn_download")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewOpen(false)}
                            className={clsx(
                              "rounded-lg p-1.5 transition-colors",
                              isDark
                                ? "hover:bg-gray-700 text-gray-400"
                                : "hover:bg-gray-100 text-gray-500",
                            )}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      {/* iframe */}
                      <iframe
                        src={uploadedFile.gcsUrl}
                        className="flex-1 w-full"
                        title={uploadedFile.name}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label
                      className={clsx("block text-sm font-medium", textPrimary)}
                    >
                      {t("field_title")} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={currentForm.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder={titlePlaceholder}
                      className={clsx(
                        inputClasses,
                        currentErrors.title &&
                          "border-red-500 focus:ring-red-400",
                      )}
                    />
                    {currentErrors.title && (
                      <p className="text-xs text-red-500">
                        {currentErrors.title}
                      </p>
                    )}
                  </div>
                  {/* Subtitle */}
                  <div className="space-y-1.5">
                    <label
                      className={clsx("block text-sm font-medium", textPrimary)}
                    >
                      {t("field_subtitle")}{" "}
                      <span
                        className={clsx("text-xs font-normal", textTertiary)}
                      >
                        {t("field_subtitle_optional")}
                      </span>
                    </label>
                    <Input
                      value={currentForm.subTitle}
                      onChange={(e) => updateField("subTitle", e.target.value)}
                      placeholder={t("field_subtitle_placeholder")}
                      className={clsx(inputClasses)}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label
                    className={clsx("block text-sm font-medium", textPrimary)}
                  >
                    {t("field_content")} <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={currentForm.content}
                    onChange={(html) => updateField("content", html)}
                    placeholder={t("field_content_placeholder")}
                    className={clsx(currentErrors.content && "border-red-500")}
                  />
                  {currentErrors.content && (
                    <p className="text-xs text-red-500">
                      {currentErrors.content}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
