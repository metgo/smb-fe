import clsx from "clsx";
import { useState } from "react";
import { Layers, Grid, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { WizardStepper, WizardFooter } from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import {
  useCreateContentMutation,
  useUpdateContentMutation,
  useActivateViewMutation,
} from "@/store/api/contentMutationApi";

import Step1Topics from "../wizard-steps/Step1Topics";
import Step2Categories from "../wizard-steps/Step2Categories";
import Step3Assign from "../wizard-steps/Step3Assign";

interface Props {
  externalApiId: string;
  websiteName: string;
  existingView?: IView;
  isMarketplace?: boolean;
  onClose: () => void;
  onCreated: (viewId: string, publishNow: boolean) => void;
}

const viewToWizardTopics = (siteTopics: IContentTopic[]): WizardTopic[] =>
  siteTopics.map((topic) => ({
    id: Math.random().toString(36).slice(2),
    title: topic.title || topic.titleHe || topic.titleAr || "",
    titleHe: topic.titleHe || topic.title || "",
    titleAr: topic.titleAr || topic.title || "",
    description:
      topic.description || topic.descriptionHe || topic.descriptionAr || "",
    descriptionHe: topic.descriptionHe || topic.description || "",
    descriptionAr: topic.descriptionAr || topic.description || "",
    categories: (topic.siteCategories ?? []).map((cat) => ({
      id: Math.random().toString(36).slice(2),
      title: cat.title || cat.titleHe || cat.titleAr || "",
      titleHe: cat.titleHe || cat.title || "",
      titleAr: cat.titleAr || cat.title || "",
      description:
        cat.description || cat.descriptionHe || cat.descriptionAr || "",
      descriptionHe: cat.descriptionHe || cat.description || "",
      descriptionAr: cat.descriptionAr || cat.description || "",
      synonyms: (cat as any).synonyms ?? [],
      synonymsHe: (cat as any).synonymsHe ?? [],
      synonymsAr: (cat as any).synonymsAr ?? [],
      searchKeywords: (cat as any).searchKeywords ?? [],
      assignedBusinesses: [],
      assignedProducts: [],
    })),
  }));

export default function CreateViewWizard({
  externalApiId,
  websiteName,
  existingView,
  isMarketplace = false,
  onClose,
  onCreated,
}: Props) {
  const { t } = useTranslation("content");
  const { isDark } = useThemeClasses();
  const isEditMode = !!existingView;
  const [step, setStep] = useState(1);
  const [viewName, setViewName] = useState(existingView?.viewName ?? "");
  const [themeContext, setThemeContext] = useState(
    existingView?.themeContext ?? "",
  );
  const [topics, setTopics] = useState<WizardTopic[]>(() =>
    existingView ? viewToWizardTopics(existingView.siteTopics ?? []) : [],
  );
  const [savedViewId, setSavedViewId] = useState<string | null>(
    existingView?._id ?? null,
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const steps = [
    { number: 1, title: t("wizard_step_topics"), icon: Layers },
    { number: 2, title: t("wizard_step_categories"), icon: Grid },
    { number: 3, title: t("wizard_step_assign"), icon: Link2 },
  ];

  // Preserve original status when editing (don't auto-change APPROVED to DRAFT)
  const originalStatus = existingView?.status ?? "DRAFT";

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const [activateView, { isLoading: isActivating }] = useActivateViewMutation();

  const canProceedStep1 = topics.length > 0;
  const canProceedStep2 = topics.every((t) => t.categories.length > 0);

  const buildPayload = (status: string) => ({
    header: websiteName,
    status,
    externalApiId,
    viewName:
      viewName.trim() ||
      t("view_default_name", { date: new Date().toLocaleDateString("en-GB") }),
    themeContext: themeContext.trim() || null,
    siteTopics: topics.map((topic, topicIndex) => {
      // In edit mode, try to find the matching original topic to preserve its category assignments
      const originalTopic = isEditMode
        ? (existingView?.siteTopics ?? [])[topicIndex]
        : undefined;

      const siteCategories = topic.categories
        .filter((cat) => cat.title || cat.titleHe)
        .map((cat, catIndex) => {
          // In edit mode, try to find the matching original category to preserve its businessIds/productIds
          const originalCat = originalTopic
            ? (originalTopic.siteCategories ?? [])[catIndex]
            : undefined;

          return {
            title: cat.title,
            titleHe: cat.titleHe,
            titleAr: cat.titleAr,
            description: cat.description,
            descriptionHe: cat.descriptionHe,
            descriptionAr: cat.descriptionAr,
            synonyms: cat.synonyms,
            synonymsHe: cat.synonymsHe,
            synonymsAr: cat.synonymsAr,
            searchKeywords: cat.searchKeywords,
            // Preserve existing assignments in edit mode, otherwise empty
            businessIds: (originalCat as any)?.businessIds ?? [],
            productIds: (originalCat as any)?.productIds ?? [],
            eventIds: (originalCat as any)?.eventIds ?? [],
            poiIds: (originalCat as any)?.poiIds ?? [],
            tripIds: (originalCat as any)?.tripIds ?? [],
            fundayIds: (originalCat as any)?.fundayIds ?? [],
            isPrimary: false,
            isArchived: false,
          };
        });

      return {
        title: topic.title,
        titleHe: topic.titleHe,
        titleAr: topic.titleAr,
        description: topic.description,
        descriptionHe: topic.descriptionHe,
        descriptionAr: topic.descriptionAr,
        isPrimary: topicIndex === 0,
        isArchived: false,
        order: topicIndex,
        siteCategories,
      };
    }),
  });

  // For updating existing views: only metadata, never overwrite topics
  const buildMetadataPayload = (status: string) => {
    const payload = {
      status,
      viewName:
        viewName.trim() ||
        t("view_default_name", {
          date: new Date().toLocaleDateString("en-GB"),
        }),
      themeContext: themeContext.trim() || null,
      externalApiId,
    };
    console.log("[CreateViewWizard] buildMetadataPayload:", payload);
    return payload;
  };

  const handleNext = async () => {
    if (step === 1 && !canProceedStep1) {
      toast.error(t("toast_add_topic_error"));
      return;
    }
    if (step === 2 && !canProceedStep2) {
      toast.error(t("toast_add_category_error"));
      return;
    }

    // Auto-save the view (create or update) before entering Step 3
    if (step === 2) {
      try {
        if (savedViewId) {
          // When editing, preserve the original status (don't change APPROVED to DRAFT)
          await updateContent({
            body: buildPayload(originalStatus),
            contentId: savedViewId,
          }).unwrap();
        } else {
          // When creating new, use DRAFT
          const res = await createContent(buildPayload("DRAFT")).unwrap();
          setSavedViewId(res._id || res.id);
        }
        setStep(3);
      } catch (error: any) {
        toast.error(error?.data?.message || t("toast_prepare_view_error"));
      }
      return;
    }

    setStep((s) => Math.min(s + 1, 3));
  };

  const handleSaveDraft = async () => {
    if (savedViewId) {
      try {
        // When editing existing view, preserve original status unless explicitly saving as draft
        // For new views (no existingView), save as DRAFT
        await updateContent({
          body: buildMetadataPayload(isEditMode ? originalStatus : "DRAFT"),
          contentId: savedViewId,
        }).unwrap();
        onCreated(savedViewId, false);
      } catch (error: any) {
        toast.error(error?.data?.message || t("toast_save_draft_error"));
      }
      return;
    }

    try {
      const res = await createContent(buildPayload("DRAFT")).unwrap();
      const id = res._id || res.id;
      onCreated(id, false);
    } catch (error: any) {
      toast.error(error?.data?.message || t("toast_save_draft_error"));
    }
  };

  const handlePublish = async () => {
    if (isAssigning) {
      toast.error(t("toast_ai_assignment_busy"));
      return;
    }

    if (savedViewId) {
      try {
        const payload = buildMetadataPayload("APPROVED");
        console.log("[CreateViewWizard] Publishing with payload:", payload);
        console.log(
          "[CreateViewWizard] themeContext state value:",
          themeContext,
        );

        await updateContent({
          body: payload,
          contentId: savedViewId,
        }).unwrap();

        try {
          await activateView({ viewId: savedViewId }).unwrap();
          onCreated(savedViewId, true);
        } catch (error: any) {
          toast.error(
            error?.data?.message || t("toast_publish_no_content_warning"),
          );
          onCreated(savedViewId, false);
        }
      } catch (error: any) {
        toast.error(error?.data?.message || t("toast_publish_view_error"));
      }
      return;
    }

    try {
      const payload = buildPayload("APPROVED");
      console.log(
        "[CreateViewWizard] Creating new view with payload:",
        payload,
      );
      console.log("[CreateViewWizard] themeContext state value:", themeContext);

      const res = await createContent(payload).unwrap();
      const id = res._id || res.id;
      try {
        await activateView({ viewId: id }).unwrap();
        onCreated(id, true);
      } catch (error: any) {
        toast.error(
          error?.data?.message || t("toast_publish_no_content_warning"),
        );
        onCreated(id, false);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || t("toast_publish_view_error"));
    }
  };

  const isBusy = isCreating || isUpdating || isActivating;

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-2xl" showSpinner={isBusy}>
      {/* Solid background overlay — overrides the semi-transparent cardClasses */}
      <div
        className={clsx(
          "absolute inset-0 rounded-t-2xl md:rounded-2xl -z-[1] pointer-events-none",
          isDark ? "bg-gray-900" : "bg-white",
        )}
      />
      {/* Header */}
      <div
        className={clsx(
          "flex items-center justify-between px-6 py-4 shrink-0 border-b",
          isDark
            ? "border-gray-700 bg-gray-800/60"
            : "border-gray-100 bg-gray-50",
        )}
      >
        <div>
          <h2
            className={clsx(
              "text-base font-semibold",
              isDark ? "text-gray-200" : "text-gray-800",
            )}
          >
            {isEditMode ? t("edit_view") : t("create_new_view")}
          </h2>
          <p
            className={clsx(
              "text-xs mt-0.5",
              isDark ? "text-gray-500" : "text-gray-400",
            )}
          >
            {websiteName}
          </p>
        </div>

        <input
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          placeholder={t("view_name_optional")}
          className={clsx(
            "text-sm px-3 py-1.5 rounded-lg border hidden sm:block",
            isDark
              ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-800 placeholder-gray-400",
          )}
        />
      </div>

      {/* Stepper */}
      <div className="px-6 pt-5 pb-0 shrink-0">
        <WizardStepper
          steps={steps}
          currentStep={step}
          totalSteps={steps.length}
          onStepClick={(s) => {
            if (s < step) setStep(s);
          }}
        />
      </div>

      {/* Step content — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {step === 1 && (
          <Step1Topics
            topics={topics}
            setTopics={setTopics}
            externalApiId={externalApiId}
            themeContext={themeContext}
            setThemeContext={setThemeContext}
          />
        )}
        {step === 2 && (
          <Step2Categories
            topics={topics}
            setTopics={setTopics}
            externalApiId={externalApiId}
          />
        )}
        {step === 3 && (
          <Step3Assign
            topics={topics}
            externalApiId={externalApiId}
            viewId={savedViewId ?? ""}
            isMarketplace={isMarketplace}
            onAssignStart={() => setIsAssigning(true)}
            onAssignEnd={() => setIsAssigning(false)}
          />
        )}
      </div>

      {/* Footer */}
      <WizardFooter
        currentStep={step}
        totalSteps={steps.length}
        isSaving={isBusy}
        isPublishing={isBusy}
        isDisabled={isAssigning}
        onPrevious={() => setStep((s) => Math.max(s - 1, 1))}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </ModalWrapper>
  );
}
