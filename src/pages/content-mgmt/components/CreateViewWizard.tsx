import clsx from "clsx";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Layers, Grid, Link2 } from "lucide-react";
import { toast } from "sonner";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { WizardStepper, WizardFooter } from "@/components/shared";
import {
  useCreateContentMutation,
  useUpdateContentMutation,
  useActivateViewMutation,
} from "@/store/api/contentMutationApi";

import Step1Topics from "../wizard-steps/Step1Topics";
import Step2Categories from "../wizard-steps/Step2Categories";
import Step3Assign from "../wizard-steps/Step3Assign";

const STEPS: IWizardStep[] = [
  { number: 1, title: "Topics", icon: Layers },
  { number: 2, title: "Categories", icon: Grid },
  { number: 3, title: "Assign Content", icon: Link2 },
];

interface Props {
  externalApiId: string;
  websiteName: string;
  existingView?: IView;
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
  onClose,
  onCreated,
}: Props) {
  const { isDark } = useThemeClasses();
  const isEditMode = !!existingView;
  const [step, setStep] = useState(1);
  const [viewName, setViewName] = useState(existingView?.viewName ?? "");
  const [themeContext, setThemeContext] = useState(
    (existingView as any)?.themeContext ?? "",
  );
  const [topics, setTopics] = useState<WizardTopic[]>(() =>
    existingView ? viewToWizardTopics(existingView.siteTopics ?? []) : [],
  );
  const [savedViewId, setSavedViewId] = useState<string | null>(
    existingView?._id ?? null,
  );
  const [isAssigning, setIsAssigning] = useState(false);

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
      viewName.trim() || `View ${new Date().toLocaleDateString("en-GB")}`,
    themeContext: themeContext.trim() || null,
    siteTopics: topics.map((topic, topicIndex) => {
      const siteCategories = topic.categories
        .filter((cat) => cat.title || cat.titleHe)
        .map((cat) => ({
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
          businessIds: [],
          productIds: [],
          isPrimary: false,
          isArchived: false,
        }));

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
  const buildMetadataPayload = (status: string) => ({
    status,
    viewName:
      viewName.trim() || `View ${new Date().toLocaleDateString("en-GB")}`,
    themeContext: themeContext.trim() || null,
    externalApiId,
  });

  const handleNext = async () => {
    if (step === 1 && !canProceedStep1) {
      toast.error("Add at least one topic before continuing.");
      return;
    }
    if (step === 2 && !canProceedStep2) {
      toast.error(
        "Each topic must have at least one category before continuing.",
      );
      return;
    }

    // Auto-save the view (create or update) before entering Step 3
    if (step === 2) {
      try {
        if (savedViewId) {
          await updateContent({
            body: buildPayload("DRAFT"),
            contentId: savedViewId,
          }).unwrap();
        } else {
          const res = await createContent(buildPayload("DRAFT")).unwrap();
          setSavedViewId(res._id || res.id);
        }
        setStep(3);
      } catch (error: any) {
        toast.error(
          error?.data?.message || "Failed to prepare view — please try again.",
        );
      }
      return;
    }

    setStep((s) => Math.min(s + 1, 3));
  };

  const handleSaveDraft = async () => {
    if (savedViewId) {
      try {
        await updateContent({
          body: buildMetadataPayload("DRAFT"),
          contentId: savedViewId,
        }).unwrap();
        onCreated(savedViewId, false);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to save draft");
      }
      return;
    }

    try {
      const res = await createContent(buildPayload("DRAFT")).unwrap();
      const id = res._id || res.id;
      onCreated(id, false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save draft");
    }
  };

  const handlePublish = async () => {
    if (isAssigning) {
      toast.error("Please wait for AI assignment to finish before publishing.");
      return;
    }

    if (savedViewId) {
      try {
        await updateContent({
          body: buildMetadataPayload("APPROVED"),
          contentId: savedViewId,
        }).unwrap();
        try {
          await activateView({ viewId: savedViewId }).unwrap();
          onCreated(savedViewId, true);
        } catch (error: any) {
          toast.error(
            error?.data?.message ||
              "View saved, but it cannot go live until content is assigned.",
          );
          onCreated(savedViewId, false);
        }
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to publish view");
      }
      return;
    }

    try {
      const res = await createContent(buildPayload("APPROVED")).unwrap();
      const id = res._id || res.id;
      try {
        await activateView({ viewId: id }).unwrap();
        onCreated(id, true);
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
            "View saved, but it cannot go live until content is assigned.",
        );
        onCreated(id, false);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to publish view");
    }
  };

  const isBusy = isCreating || isUpdating || isActivating;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={clsx(
          "w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden",
          isDark
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-gray-200",
        )}
      >
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
              {isEditMode ? "Edit View" : "Create New View"}
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

          <div className="flex items-center gap-3">
            <input
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="View name (optional)"
              className={clsx(
                "text-sm px-3 py-1.5 rounded-lg border hidden sm:block",
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-400",
              )}
            />
            <button
              onClick={onClose}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                isDark
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-500",
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-5 pb-0 shrink-0">
          <WizardStepper
            steps={STEPS}
            currentStep={step}
            totalSteps={STEPS.length}
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
              onAssignStart={() => setIsAssigning(true)}
              onAssignEnd={() => setIsAssigning(false)}
            />
          )}
        </div>

        {/* Footer */}
        <WizardFooter
          currentStep={step}
          totalSteps={STEPS.length}
          isSaving={isBusy}
          isPublishing={isBusy}
          isDisabled={isAssigning}
          onPrevious={() => setStep((s) => Math.max(s - 1, 1))}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>
    </div>,
    document.body,
  );
}
