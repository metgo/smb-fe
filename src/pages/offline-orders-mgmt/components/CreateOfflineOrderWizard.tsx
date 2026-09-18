import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Package, User, CheckCircle } from "lucide-react";

import { ModalWrapper } from "@/components/wrapper";
import {
  ConfirmDialog,
  WizardFooter,
  WizardStepper,
} from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useCreateOfflineOrderMutation,
  useUpdateOfflineOrderMutation,
} from "@/store/api/orderQueryApi";
import {
  OfflineOrderBusinessInfo,
  OfflineOrderProductInfo,
  OfflineOrderContactInfo,
  OfflineOrderReviewSubmit,
} from "./sub-components";

interface CreateOfflineOrderWizardProps {
  onClose: () => void;
  refetch?: () => void;
  order?: IOfflineOrder | null;
}

const INITIAL_FORM_DATA = {
  companyName: "",
  employerType: "",
  leadDate: "",
  initialRequest: "",
  closedDealValue: "",
  dealClosureDate: "",
  vendor: "",
  product: "",
  paymentMethod: "",
  description: "",
  name: "",
  position: "",
  productPrice: "",
  desiredQuantity: "",
  phone: "",
  email: "",
};

export default function CreateOfflineOrderWizard({
  onClose,
  refetch,
  order,
}: CreateOfflineOrderWizardProps) {
  const { t } = useTranslation("orders");
  const { textPrimary, textTertiary, borderColor } = useThemeClasses();
  const isEditMode = !!order;

  const [currentStep, setCurrentStep] = useState(1);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] =
    useState<typeof INITIAL_FORM_DATA>(INITIAL_FORM_DATA);

  const initialFormData = useRef(formData);
  const isFormDirty = () =>
    JSON.stringify(formData) !== JSON.stringify(initialFormData.current);

  useEffect(() => {
    if (!order) return;
    const loaded = {
      companyName: order.companyName || "",
      employerType: order.employerType || "",
      leadDate: order.leadDate || "",
      initialRequest:
        order.initialRequest != null ? String(order.initialRequest) : "",
      closedDealValue:
        order.closedDealValue != null ? String(order.closedDealValue) : "",
      dealClosureDate: order.dealClosureDate || "",
      vendor: order.vendor || "",
      product: order.product || "",
      paymentMethod: order.paymentMethod || "",
      description: order.description || "",
      name: order.name || "",
      position: order.position || "",
      productPrice:
        order.productPrice != null ? String(order.productPrice) : "",
      desiredQuantity:
        order.desiredQuantity != null ? String(order.desiredQuantity) : "",
      phone: order.phone || "",
      email: order.email || "",
    };
    setFormData(loaded);
    initialFormData.current = loaded;
  }, [order]);

  const [createOfflineOrder, { isLoading: isCreating }] =
    useCreateOfflineOrderMutation();
  const [updateOfflineOrder, { isLoading: isUpdating }] =
    useUpdateOfflineOrderMutation();
  const isSubmitting = isCreating || isUpdating;

  const steps = useMemo(
    () => [
      { number: 1, title: t("business_name"), icon: Briefcase },
      { number: 2, title: t("product_name"), icon: Package },
      { number: 3, title: t("customer_name"), icon: User },
      { number: 4, title: t("review_order"), icon: CheckCircle },
    ],
    [t],
  );

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.companyName.trim())
          newErrors.companyName = t("field_required");
        if (!formData.employerType.trim())
          newErrors.employerType = t("field_required");
        break;
      case 2:
        if (!formData.vendor.trim()) newErrors.vendor = t("field_required");
        if (!formData.product.trim()) newErrors.product = t("field_required");
        if (
          !formData.productPrice ||
          parseFloat(String(formData.productPrice)) <= 0
        )
          newErrors.productPrice = t("field_required");
        if (
          formData.desiredQuantity === "" ||
          parseInt(String(formData.desiredQuantity)) < 0
        )
          newErrors.desiredQuantity = t("field_required");
        break;
      case 3:
        if (!formData.name.trim()) newErrors.name = t("field_required");
        if (!formData.phone.trim()) newErrors.phone = t("field_required");
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleClose = () => {
    if (isFormDirty() && !isPublishBtnClicked) {
      setShowClosePopup(true);
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    setIsPublishBtnClicked(true);

    let allValid = true;
    for (let i = 1; i <= 3; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }
    if (!allValid) {
      toast.error(t("fill_all_fields"));
      setIsPublishBtnClicked(false);
      return;
    }

    const payload = {
      ...formData,
      initialRequest: Number(formData.initialRequest) || 0,
      closedDealValue: Number(formData.closedDealValue) || 0,
      productPrice: Number(formData.productPrice) || 0,
      desiredQuantity: Number(formData.desiredQuantity) || 0,
    };

    try {
      if (isEditMode && order) {
        await updateOfflineOrder({
          orderId: order._id,
          data: payload,
        }).unwrap();
        toast.success(t("offline_order_updated"));
      } else {
        await createOfflineOrder(payload).unwrap();
        toast.success(t("offline_order_created"));
      }
      refetch?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          t(
            isEditMode
              ? "offline_order_update_failed"
              : "offline_order_create_failed",
          ),
      );
      setIsPublishBtnClicked(false);
    }
  };

  const renderStepContent = () => {
    const commonProps = { t, formData, setFormData, errors };

    switch (currentStep) {
      case 1:
        return <OfflineOrderBusinessInfo {...commonProps} />;
      case 2:
        return <OfflineOrderProductInfo {...commonProps} />;
      case 3:
        return <OfflineOrderContactInfo {...commonProps} />;
      case 4:
        return (
          <OfflineOrderReviewSubmit
            t={t}
            formData={formData}
            setCurrentStep={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalWrapper onClose={handleClose} showSpinner={isSubmitting}>
      <div
        className={clsx(
          "px-4 py-3 md:p-6 border-b",
          borderColor,
          "flex items-center justify-between gap-3",
        )}
      >
        <div className="min-w-0">
          <h2
            className={clsx(
              "text-lg md:text-2xl mb-0.5 md:mb-1 truncate",
              textPrimary,
            )}
          >
            {isEditMode ? t("edit_offline_order") : t("add_offline_order")}
          </h2>
          <p className={clsx("text-xs md:text-sm truncate", textTertiary)}>
            {t("step")} {currentStep} {t("of")} {steps.length}:{" "}
            {steps[currentStep - 1]?.title}
          </p>
        </div>
      </div>

      <div
        className={clsx("px-4 md:px-6 pt-3 md:pt-4 pb-2 border-b", borderColor)}
      >
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={setCurrentStep}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {renderStepContent()}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        isSaving={false}
        isPublishing={isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPublish={handleSubmit}
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
