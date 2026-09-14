import {
  Eye,
  CheckCircle,
  Building2,
  Ticket,
  Briefcase,
  ImageIcon,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useMemo } from "react";

import { ModalWrapper } from "@/components/wrapper";
import { WizardFooter, WizardStepper } from "@/components/shared";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import MinisiteMedia from "./sub-components/MinisiteMedia";
import { MiniSitePreview } from "./sub-components/MinisitePreview";
import ProductWebsiteAndInfo from "./sub-components/ProductWebsiteAndInfo";
import { MinisiteVoucherCreation } from "./sub-components/MinisiteVoucherCreation";
import { VoucherResultsStep } from "./sub-components/VoucherResultsStep";
import {
  useInitMiniSiteCreateMutation,
  useUpdateMiniSiteMutation,
} from "@/store/api/miniSiteMutation";
import { useAppSelector } from "@/hooks/hooks";
import { ReactSelect } from "@/components/form-fields";
import { useGetAllProductsQuery } from "@/store/api/productQueryApi";
import ProductSelectionStep from "./sub-components/ProductSelectionStep";

interface CreateMinisiteWizardProps {
  onClose: () => void;
  editingMiniSite?: any;
}
const totalSteps = 6;

interface MiniSiteFormData {
  // Step 1
  externalApiId: string;
  companyName: string;
  contactName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  officeAddress: string;
  campaignName: string;
  campaignCode: string;
  voucherAmount: string;
  totalVouchers: string;
  startDate: string;
  endDate: string;
  deliveryArea: "home" | "office";
  contentTitle: string;
  contentSubtitle: string;
  contentGreeting: string;
  backgroundImage: string;
  footerImage: string;

  // Step 2
  selectedProducts: string[];
  primaryProducts: string[];

  // Step 4
  sendTiming: "immediate" | "scheduled";
  scheduledDate: string;
  scheduledTime: string;
  allowInstanceCreation: boolean;
  instanceName: string;
  instanceEmail: string;
  instancePhone: string;
  uploadedFile: File | null;
}
interface VoucherRecipient {
  name: string;
  email: string;
  phone: string;
  emailSent: boolean;
  smsSent: boolean;
}

// Main Components
const CreateMinisiteWizard = ({ onClose }: CreateMinisiteWizardProps) => {
  const { t } = useTranslation("minisites");
  const { associatedWebsite } = useAppSelector((state) => state.auth);

  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    bgTertiary,
    language,
  } = useThemeClasses();
  const [isPublishing, _setIsPublishing] = useState(false);
  const [logoGcsUrl, setLogoGcsUrl] = useState<string>("");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MiniSiteFormData>({
    // default values
    externalApiId: "",
    companyName: "",
    contactName: "",
    email: "",
    phoneCountryCode: "+972",
    phoneNumber: "",
    officeAddress: "",
    campaignName: "",
    campaignCode: "",
    voucherAmount: "",
    totalVouchers: "",
    startDate: "",
    endDate: "",
    deliveryArea: "home",
    contentTitle: "",
    contentSubtitle: "",
    contentGreeting: "",
    backgroundImage: "",
    footerImage: "",

    selectedProducts: [],
    primaryProducts: [],

    sendTiming: "immediate",
    scheduledDate: "",
    scheduledTime: "",
    allowInstanceCreation: false,
    instanceName: "",
    instanceEmail: "",
    instancePhone: "",
    uploadedFile: null,
  });
  const campaignPayloadMap = useMemo(
    () => ({
      // Basic campaign metadata (similar to step 1)
      name: formData.campaignName,
      code: formData.campaignCode,
      internalNotes: "", // ← add field to form if needed
      logo: { image: logoGcsUrl },
      backgroundImage: { image: formData.backgroundImage },
      footerImage: { image: formData.footerImage },

      // Monetary / voucher details
      voucher: {
        amount: Number(formData.voucherAmount) || 0,
        totalVouchers: Number(formData.totalVouchers) || 0,
        currency: "ILS", // ← hard-code or add to formData if multi-currency
      },

      // Dates & timing (similar to opening hours / availability)
      validity: {
        startDate: formData.startDate, // should be ISO string "2025-04-10"
        endDate: formData.endDate,
      },
    }),
    [
      formData.campaignName,
      formData.campaignCode,
      formData.voucherAmount,
      formData.totalVouchers,
      formData.startDate,
      formData.endDate,
      formData.backgroundImage,
      formData.footerImage,
      logoGcsUrl,
    ],
  );
  const [initMiniSiteCreate, { isLoading: isCreating }] =
    useInitMiniSiteCreateMutation();
  const [updateMiniSite, { isLoading: isSaving }] = useUpdateMiniSiteMutation();
  const [miniSiteId, setMiniSiteId] = useState("");

  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        let currentMiniSiteId = miniSiteId; // from your state

        // 1. Create if not exists
        if (!currentMiniSiteId) {
          const res = await initMiniSiteCreate().unwrap();
          currentMiniSiteId = res?.id;
          setMiniSiteId(res?.id);
        }

        // 2. Prepare payload
        let payload = { ...campaignPayloadMap };

        if (isPublish) {
          payload = {
            ...payload,
          };
        }

        if (!Object.keys(payload).length) return;

        // 3. Update
        const res = await updateMiniSite({
          miniSiteId: currentMiniSiteId,
          body: payload,
        }).unwrap();

        toast.success(
          res?.message ?? (isPublish ? "Campaign published" : "Draft saved"),
        );
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || "Failed to save");
      }
    },
    [
      miniSiteId,
      setMiniSiteId,
      campaignPayloadMap,
      initMiniSiteCreate,
      updateMiniSite,
    ],
  );
  const retryFailedSends = async () => {
    // Filter failed recipients
    const failedRecipients = voucherResults.filter(
      (r) => !r.emailSent || !r.smsSent,
    );

    if (failedRecipients.length === 0) {
      // Optional: show toast "No failed sends to retry"
      console.log("No failed sends to retry");
      return;
    }

    // Optional: show loading state or disable button
    // setIsRetrying(true);

    try {
      // Example: simulate retry (replace with your real API call)
      const updatedResults = await Promise.all(
        voucherResults.map(async (recipient) => {
          if (recipient.emailSent && recipient.smsSent) {
            return recipient; // already successful → no change
          }

          try {
            // Replace this with your actual send-voucher API call
            // e.g. await api.resendVoucher(recipient.id, recipient.email, recipient.phone);

            // Simulate success for demo (random 70% success rate)
            const shouldSucceed = Math.random() > 0.3;

            return {
              ...recipient,
              emailSent: shouldSucceed ? true : recipient.emailSent,
              smsSent: shouldSucceed ? true : recipient.smsSent,
              // Optional: add error field if you want to show why it failed
              // error: shouldSucceed ? undefined : "Server timeout",
            };
          } catch (err) {
            console.error("Retry failed for:", recipient.email, err);
            return recipient; // keep original status on real error
          }
        }),
      );

      setVoucherResults(updatedResults);

      // Optional: toast success message
      const newSuccessCount = updatedResults.filter(
        (r) => r.emailSent && r.smsSent,
      ).length;
      console.log(`Retry complete. ${newSuccessCount} successful now.`);
    } catch (err) {
      console.error("Bulk retry failed:", err);
      // Show error toast
    } finally {
      // setIsRetrying(false);
    }
  };

  // Step 2: Select Products
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [primaryProducts, setPrimaryProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const MIN_SELECTED_PRODUCTS = 3;

  // Step 5: Results
  const [voucherResults, setVoucherResults] = useState<VoucherRecipient[]>([]);

  const steps: IWizardStep[] = [
    {
      number: 1,
      title: t("website_purchaser_info") || "Website & Purchaser Info",
      icon: Building2,
    },
    { number: 2, title: t("media") || "Media", icon: ImageIcon },
    {
      number: 3,
      title: t("select_products") || "Select Products",
      icon: Briefcase,
    },
    {
      number: 4,
      title: t("mini_site_preview") || "Mini-Site Preview",
      icon: Eye,
    },
    {
      number: 5,
      title: t("voucher_creation") || "Voucher Creation",
      icon: Ticket,
    },
    { number: 6, title: t("results") || "Results", icon: CheckCircle },
  ];

  // Fetch marketplace products for the selected website on both the Select
  // Products step and the Preview step (which renders the selected products).
  const shouldFetchProducts =
    (currentStep === 3 || currentStep === 4) && !!formData.externalApiId;

  const { data: productData, isLoading: isProductsLoading } =
    useGetAllProductsQuery(
      {
        page: 1,
        limit: 20,
        locale: language,
        websiteId: formData.externalApiId,
        ...(productSearch ? { search: productSearch } : {}),
      },
      { skip: !shouldFetchProducts, refetchOnMountOrArgChange: true },
    );

  const products = productData?.data ?? [];

  const toggleProductSelection = useCallback(
    (productId: string) => {
      setSelectedProducts((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId],
      );
    },
    [setSelectedProducts],
  );

  const togglePrimaryProduct = useCallback(
    (productId: string) => {
      setPrimaryProducts((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId],
      );
    },
    [setPrimaryProducts],
  );

  const removeSelectedProduct = useCallback(
    (productId: string) => {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      setPrimaryProducts((prev) => prev.filter((id) => id !== productId));
    },
    [setSelectedProducts, setPrimaryProducts],
  );

  // Step 1: Website & Purchaser Info — Company, Purchaser and Content fields
  // are all required before moving on.
  const isStep1Valid =
    !!formData.companyName.trim() &&
    !!formData.contactName.trim() &&
    !!formData.email.trim() &&
    !!formData.phoneNumber.trim() &&
    !!formData.officeAddress.trim() &&
    !!formData.campaignName.trim() &&
    !!formData.campaignCode.trim() &&
    !!formData.voucherAmount.trim() &&
    !!formData.totalVouchers.trim() &&
    !!formData.startDate.trim() &&
    !!formData.endDate.trim() &&
    !!formData.contentTitle.trim() &&
    !!formData.contentSubtitle.trim() &&
    !!formData.contentGreeting.trim();

  // Step 2: Media — logo, background and footer images are all required.
  const isStep2Valid =
    !!logoGcsUrl && !!formData.backgroundImage && !!formData.footerImage;

  // Step 3: Select Products — require at least MIN_SELECTED_PRODUCTS.
  const isStep3Valid = selectedProducts.length >= MIN_SELECTED_PRODUCTS;

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid) {
      toast.error(
        t("fill_required_fields") || "Please fill all required fields",
      );
      return;
    }
    if (currentStep === 2 && !isStep2Valid) {
      toast.error(
        t("upload_required_images") ||
          "Please upload logo, background and footer images",
      );
      return;
    }
    if (currentStep === 3 && !isStep3Valid) {
      toast.error(t("min_products_required", { count: MIN_SELECTED_PRODUCTS }));
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const copyMiniSiteUrl = () => {
    const url = `https://tav-8.co.il/mini-site?campCode=${formData.campaignCode}&voucherId=65c3874cd753aecdd6cb85ae&customerEmail=${formData.email}`;
    navigator.clipboard.writeText(url);
  };

  const downloadSampleXLS = () => {
    const csvContent =
      "Name,Email,Phone\\nJohn Doe,john@example.com,+972501234567\\nJane Smith,jane@example.com,+972501234568";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "voucher-template.csv";
    link.click();
  };

  const handlePublish = async () => {
    await saveDraft(true);
  };

  return (
    <ModalWrapper onClose={onClose} showSpinner={isCreating || isSaving}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-6 py-3 border-b ${borderColor}`}
      >
        <div>
          <h2 className={clsx("text-2xl", textPrimary)}>
            {t("create_mini_site")}{" "}
          </h2>
          <div className={`text-xs ${textTertiary} mt-0.5`}>
            <p>
              {t("step")} {currentStep} {t("of")} {steps.length} :{" "}
              {steps.find((s) => s.number === currentStep)?.title}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="ml-auto">
          <ReactSelect
            minWidth={180}
            value={formData.externalApiId}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                externalApiId: e,
              }))
            }
            items={associatedWebsite}
            placeholder={t("select_website")}
          />
        </div>
      </div>

      {/* Progress Steps */}
      <div className={`px-4 md:px-6 pt-3 md:pt-4 pb-2 border-b ${borderColor}`}>
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Step 1: Website & Purchaser Info */}
        {currentStep === 1 && (
          <ProductWebsiteAndInfo
            currentStep={currentStep}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {/* Step 2: Media */}
        {currentStep === 2 && (
          <MinisiteMedia
            logoImagePath={logoGcsUrl}
            onLogoImageChange={setLogoGcsUrl}
            backgroundImagePath={formData.backgroundImage}
            onBackgroundImageChange={(url) =>
              setFormData((prev) => ({ ...prev, backgroundImage: url }))
            }
            footerImagePath={formData.footerImage}
            onFooterImageChange={(url) =>
              setFormData((prev) => ({ ...prev, footerImage: url }))
            }
          />
        )}

        {/* Step 3: Select Products */}
        {currentStep === 3 && (
          <ProductSelectionStep
            products={products}
            isProductsLoading={isProductsLoading}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            selectedProducts={selectedProducts}
            toggleProductSelection={toggleProductSelection}
            primaryProducts={primaryProducts}
            togglePrimaryProduct={togglePrimaryProduct}
            hasWebsite={!!formData.externalApiId}
            minSelectedProducts={MIN_SELECTED_PRODUCTS}
          />
        )}
        {/* Step 4: Mini-Site Preview */}
        {currentStep === 4 && (
          <MiniSitePreview
            formData={formData}
            logoImagePath={logoGcsUrl}
            products={products}
            selectedProducts={selectedProducts}
            removeSelectedProduct={removeSelectedProduct}
            copyMiniSiteUrl={copyMiniSiteUrl}
          />
        )}

        {/* Step 5: Voucher Creation & Distribution */}
        {currentStep === 5 && (
          <MinisiteVoucherCreation
            t={t}
            formData={formData}
            setFormData={setFormData}
            downloadSampleXLS={downloadSampleXLS}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textTertiary={textTertiary}
            bgPrimary={bgPrimary}
            bgSecondary={bgSecondary}
            borderColor={borderColor}
          />
        )}

        {/* Step 6: Results */}
        {currentStep === 6 && (
          <VoucherResultsStep
            t={t}
            voucherResults={voucherResults}
            downloadSampleXLS={downloadSampleXLS}
            retryFailedSends={retryFailedSends}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            textTertiary={textTertiary}
            bgSecondary={bgSecondary}
            bgTertiary={bgTertiary}
            borderColor={borderColor}
          />
        )}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={isSaving || isCreating}
        isPublishing={isPublishing}
        onPrevious={handlePrev}
        onNext={handleNext}
        onSaveDraft={saveDraft}
        onPublish={handlePublish}
      />
    </ModalWrapper>
  );
};

export default CreateMinisiteWizard;
