import clsx from "clsx";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Shield, BookOpen } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks/hooks";
import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { DraftButton, PublishButton } from "@/components/btns";
import { TabsSection, RichTextEditor } from "@/components/shared";
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
type TabId = "terms_and_condition" | "privacy" | "business_regulation";

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
  ];

  const [externalApiId, setExternalApiId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("terms_and_condition");

  const [forms, setForms] = useState<Record<TabId, PageFormData>>({
    terms_and_condition: { ...INITIAL_FORM },
    privacy: { ...INITIAL_FORM },
    business_regulation: { ...INITIAL_FORM },
  });
  const [errors, setErrors] = useState<Record<TabId, Partial<PageFormData>>>({
    terms_and_condition: {},
    privacy: {},
    business_regulation: {},
  });

  const [createDynamicPage, { isLoading: isCreating }] =
    useCreateDynamicPageMutation();
  const [updateDynamicPage, { isLoading: isUpdating }] =
    useUpdateDynamicPageMutation();

  const { data: pageData } = useGetDynamicPagesQuery(
    { externalApiId },
    { skip: !externalApiId },
  );

  useEffect(() => {
    const page = pageData?.data?.find((item) => item.type === activeTab);
    if (page) {
      setForms((prev) => ({
        ...prev,
        [activeTab]: {
          title: page.title ?? "",
          subTitle: page.subTitle ?? "",
          content: page.description ?? "",
          status: page.status ?? "DRAFT",
        },
      }));
    } else {
      setForms((prev) => ({ ...prev, [activeTab]: { ...INITIAL_FORM } }));
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
    const newErrors: Partial<PageFormData> = {};
    if (!(currentForm.title ?? "").trim())
      newErrors.title = t("field_title_required");
    if (!(currentForm.content ?? "").trim() || currentForm.content === "<br>")
      newErrors.content = t("field_content_required");

    setErrors((prev) => ({ ...prev, [activeTab]: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: "DRAFT" | "APPROVED") => {
    if (!validate()) return;
    if (!externalApiId) {
      toast.error(t("error_no_website"));
      return;
    }

    const body = {
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
        "min-h-screen flex flex-col transition-colors",
        isDark ? "bg-gray-900" : "bg-white",
      )}
    >
      {/* Header */}
      <div className={clsx("shrink-0 px-6 pt-6 pb-0 border-b", borderColor)}>
        <h1 className="text-3xl mb-1 bg-linear-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
          {t("page_title")}
        </h1>
        <p className={clsx("text-sm mb-0", textSecondary)}>
          {t("page_subtitle")}
        </p>

        <div className="flex items-center justify-between">
          <TabsSection
            tabs={TABS}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
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
                    currentErrors.title && "border-red-500 focus:ring-red-400",
                  )}
                />
                {currentErrors.title && (
                  <p className="text-xs text-red-500">{currentErrors.title}</p>
                )}
              </div>
              {/* Subtitle */}
              <div className="space-y-1.5">
                <label
                  className={clsx("block text-sm font-medium", textPrimary)}
                >
                  {t("field_subtitle")}{" "}
                  <span className={clsx("text-xs font-normal", textTertiary)}>
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
              <label className={clsx("block text-sm font-medium", textPrimary)}>
                {t("field_content")} <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={currentForm.content}
                onChange={(html) => updateField("content", html)}
                placeholder={t("field_content_placeholder")}
                className={clsx(currentErrors.content && "border-red-500")}
              />
              {currentErrors.content && (
                <p className="text-xs text-red-500">{currentErrors.content}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
