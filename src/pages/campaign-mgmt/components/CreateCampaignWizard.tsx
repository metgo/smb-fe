import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Building2,
  Landmark,
  DollarSign,
  Eye,
} from "lucide-react";

import { useCommon } from "@/hooks/useCommon";
import { ModalWrapper } from "@/components/wrapper";
import {
  ConfirmDialog,
  WizardFooter,
  WizardStepper,
} from "@/components/shared";
import { PublishButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useGetCampaignByIdQuery,
} from "@/store/api/campaignApi";
import {
  CampaignBasicInfo,
  CampaignDmoSelection,
  CampaignAuthoritySelection,
  CampaignMedia,
  CampaignRewardSettings,
  CampaignReview,
} from "./sub-components";

interface CreateCampaignWizardProps {
  onClose: () => void;
  refetch?: () => void;
  campaignId?: string;
  opMode?: "CREATE" | "EDIT";
}

type CampaignFormData = {
  name: string;
  code: string;
  description: string;
  slogan: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  type: "CASH_IN" | "CASH_BACK";
  startDate: string;
  endDate: string;
  imagePath: string;
  dmoIds: string[];
  authorityIds: string[];
  rewardAmount: string;
  rewardVoucherLimit: string;
};

const INITIAL_FORM: CampaignFormData = {
  name: "",
  code: "",
  description: "",
  slogan: "",
  status: "DRAFT",
  type: "CASH_IN",
  startDate: "",
  endDate: "",
  imagePath: "",
  dmoIds: [],
  authorityIds: [],
  rewardAmount: "",
  rewardVoucherLimit: "",
};

const toDateInput = (dateStr?: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const payloadToForm = (data: ICampaignPayload): CampaignFormData => ({
  name: data.name ?? "",
  code: data.code ?? "",
  description: data.description ?? "",
  slogan: data.slogan ?? "",
  status: (data.status as CampaignFormData["status"]) ?? "DRAFT",
  type: (data.type as CampaignFormData["type"]) ?? "CASH_IN",
  startDate: toDateInput(data.startDate),
  endDate: toDateInput(data.endDate),
  imagePath: data.imagePath ?? "",
  dmoIds: data.dmoIds ?? [],
  authorityIds: data.authorityIds ?? [],
  rewardAmount: data.rewardAmount?.toString() ?? "",
  rewardVoucherLimit: data.rewardVoucherLimit?.toString() ?? "",
});

export default function CreateCampaignWizard({
  onClose,
  refetch,
  campaignId,
  opMode = "CREATE",
}: CreateCampaignWizardProps) {
  const { t } = useTranslation("campaign");
  const { textPrimary, textTertiary, borderColor, isDark } = useThemeClasses();
  const { dmosAuthorities } = useCommon();

  const STEPS: IWizardStep[] = [
    { number: 1, title: t("step_basic_info"), icon: FileText },
    { number: 2, title: t("step_media"), icon: ImageIcon },
    { number: 3, title: t("step_dmo_selection"), icon: Building2 },
    { number: 4, title: t("step_authority_selection"), icon: Landmark },
    { number: 5, title: t("step_rewards"), icon: DollarSign },
    { number: 6, title: t("step_review"), icon: Eye },
  ];

  // Fetch full campaign payload only in EDIT mode
  const { data: campaignData, isLoading: isFetchingCampaign } =
    useGetCampaignByIdQuery(
      opMode === "EDIT" && campaignId ? campaignId : skipToken,
    );

  const [currentStep, setCurrentStep] = useState(1);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CampaignFormData>(INITIAL_FORM);
  const initialFormData = useRef<CampaignFormData>(INITIAL_FORM);
  const hydrated = useRef(false);

  // Hydrate formData once the API response arrives
  useEffect(() => {
    if (!campaignData || hydrated.current) return;
    const mapped = payloadToForm(campaignData);
    setFormData(mapped);
    initialFormData.current = mapped;
    hydrated.current = true;
  }, [campaignData]);

  const [createCampaign, { isLoading: isCreating }] =
    useCreateCampaignMutation();
  const [updateCampaign, { isLoading: isUpdating }] =
    useUpdateCampaignMutation();

  const isSaving = isCreating || isUpdating;

  const handleChange = useCallback((updates: Partial<CampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const isFormDirty = () =>
    JSON.stringify(formData) !== JSON.stringify(initialFormData.current);

  const completionPercent = useMemo(() => {
    const checks = [
      { weight: 15, filled: !!formData.name.trim() },
      { weight: 15, filled: !!formData.code.trim() },
      { weight: 10, filled: !!formData.type },
      { weight: 10, filled: !!formData.startDate && !!formData.endDate },
      { weight: 15, filled: !!formData.imagePath },
      { weight: 15, filled: formData.dmoIds.length > 0 },
      { weight: 10, filled: formData.authorityIds.length > 0 },
      {
        weight: 10,
        filled: !!formData.rewardAmount || !!formData.rewardVoucherLimit,
      },
    ];
    const total = checks.reduce((s, c) => s + c.weight, 0);
    const earned = checks.reduce((s, c) => s + (c.filled ? c.weight : 0), 0);
    return Math.round((earned / total) * 100);
  }, [formData]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = t("name_required");
        if (!formData.code.trim()) newErrors.code = t("code_required");
        if (!formData.startDate) newErrors.startDate = t("start_date_required");
        if (!formData.endDate) newErrors.endDate = t("end_date_required");
        break;
      case 3:
        if (!formData.dmoIds.length)
          newErrors.dmoIds = t("select_at_least_one_dmo");
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (): Partial<ICampaignPayload> => ({
    name: formData.name,
    code: formData.code,
    description: formData.description || undefined,
    slogan: formData.slogan || undefined,
    status: formData.status,
    type: formData.type as ICampaignPayload["type"],
    startDate: formData.startDate,
    endDate: formData.endDate,
    imagePath: formData.imagePath || undefined,
    dmoIds: formData.dmoIds,
    authorityIds: formData.authorityIds,
    rewardAmount: formData.rewardAmount
      ? parseFloat(formData.rewardAmount)
      : undefined,
    rewardVoucherLimit: formData.rewardVoucherLimit
      ? parseInt(formData.rewardVoucherLimit)
      : undefined,
  });

  const handleSaveDraft = async () => {
    if (!formData.name.trim()) {
      toast.error(t("name_required_for_draft"));
      return;
    }
    try {
      const payload = { ...buildPayload(), status: "DRAFT" as const };
      if (opMode === "EDIT" && campaignId) {
        await updateCampaign({ id: campaignId, body: payload }).unwrap();
      } else {
        await createCampaign(payload).unwrap();
      }
      toast.success(t("draft_saved"));
      refetch?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? t("draft_failed"));
    }
  };

  const handlePublish = async () => {
    let allValid = true;
    for (let i = 1; i <= STEPS.length - 1; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }
    if (!allValid) {
      toast.error(t("fill_required_fields"));
      return;
    }

    setIsPublishing(true);
    try {
      const payload = buildPayload();
      if (opMode === "EDIT" && campaignId) {
        await updateCampaign({ id: campaignId, body: payload }).unwrap();
        toast.success(t("campaign_updated"));
      } else {
        await createCampaign(payload).unwrap();
        toast.success(t("campaign_published"));
      }
      refetch?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? t("publish_failed"));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleClose = () => {
    if (isFormDirty()) {
      setShowClosePopup(true);
      return;
    }
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CampaignBasicInfo
            formData={{
              name: formData.name,
              code: formData.code,
              description: formData.description,
              slogan: formData.slogan,
              status: formData.status,
              type: formData.type,
              startDate: formData.startDate,
              endDate: formData.endDate,
            }}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <CampaignMedia
            imagePath={formData.imagePath}
            onImageChange={(url) => handleChange({ imagePath: url })}
          />
        );
      case 3:
        return (
          <CampaignDmoSelection
            selectedDmoIds={formData.dmoIds}
            onChange={(ids) => {
              const validAuthorityIds = new Set(
                (dmosAuthorities ?? [])
                  .filter((dmo) => ids.includes(dmo._id))
                  .flatMap((dmo) => (dmo.authorities ?? []).map((a) => a._id)),
              );
              handleChange({
                dmoIds: ids,
                authorityIds: formData.authorityIds.filter((id) =>
                  validAuthorityIds.has(id),
                ),
              });
            }}
            errors={errors}
          />
        );
      case 4:
        return (
          <CampaignAuthoritySelection
            selectedDmoIds={formData.dmoIds}
            selectedAuthorityIds={formData.authorityIds}
            onChange={(ids) => handleChange({ authorityIds: ids })}
            errors={errors}
          />
        );
      case 5:
        return (
          <CampaignRewardSettings
            rewardAmount={formData.rewardAmount}
            rewardVoucherLimit={formData.rewardVoucherLimit}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 6:
        return (
          <CampaignReview formData={formData} onGoToStep={setCurrentStep} />
        );
      default:
        return null;
    }
  };

  return (
    <ModalWrapper
      onClose={handleClose}
      showSpinner={isSaving || isFetchingCampaign}
    >
      {/* Header */}
      <div
        className={clsx(
          "px-4 py-3 md:p-6 border-b flex items-center justify-between gap-3",
          borderColor,
        )}
      >
        <div className="min-w-0">
          <h2 className={clsx("text-lg md:text-2xl mb-0.5", textPrimary)}>
            {opMode === "EDIT" ? t("edit_campaign") : t("create_campaign")}
          </h2>
          <p className={clsx("text-xs md:text-sm truncate", textTertiary)}>
            {t("step")} {currentStep} {t("of")} {STEPS.length}:{" "}
            {STEPS[currentStep - 1]?.title}
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="relative w-10 h-10 md:w-14 md:h-14">
            <svg
              className="w-10 h-10 md:w-14 md:h-14 -rotate-90"
              viewBox="0 0 56 56"
            >
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                strokeWidth="5"
                className={isDark ? "stroke-gray-700" : "stroke-gray-200"}
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - completionPercent / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
                stroke={
                  completionPercent >= 70
                    ? "#16a34a"
                    : completionPercent >= 40
                      ? "#f59e0b"
                      : "#ef4444"
                }
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={clsx(
                  "text-[10px] md:text-xs font-bold",
                  completionPercent >= 70
                    ? "text-green-600"
                    : completionPercent >= 40
                      ? "text-amber-500"
                      : "text-red-500",
                )}
              >
                {completionPercent}%
              </span>
            </div>
          </div>

          <PublishButton onClick={handlePublish} isLoading={isPublishing} />
        </div>
      </div>

      {/* Stepper */}
      <div
        className={clsx("px-4 md:px-6 pt-3 md:pt-4 pb-2 border-b", borderColor)}
      >
        <WizardStepper
          steps={STEPS}
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">{renderStep()}</div>

      {/* Footer */}
      <WizardFooter
        currentStep={currentStep}
        totalSteps={STEPS.length}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <ConfirmDialog
        open={showClosePopup}
        title={t("unsaved_changes")}
        message={t("close_without_saving")}
        confirmText={t("close")}
        variant="danger"
        onCancel={() => setShowClosePopup(false)}
        onConfirm={() => {
          setShowClosePopup(false);
          onClose();
        }}
      />
    </ModalWrapper>
  );
}
