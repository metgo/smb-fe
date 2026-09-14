import { useTranslation } from "react-i18next";

import { ModalWrapper } from "@/components/wrapper";
import { WizardFooter } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import { useMiniCampaignWizard } from "../hooks/useMiniCampaignWizard";
import {
  WebsitePurchaserInfoStep,
  ProductSelectionStep,
  MiniSitePreviewStep,
  VoucherCreationStep,
  VoucherResultsStep,
} from "./sub-components";

interface MiniCampaignWizardProps {
  theme?: Theme;
  onClose: () => void;
  onSubmit: (data: any, status: "draft" | "active") => void;
  editingMiniSite?: any;
}

export default function MiniCampaignWizard({
  onClose,
  onSubmit,
  editingMiniSite,
}: MiniCampaignWizardProps) {
  const { t } = useTranslation("mini_campaign");
  const { bgPrimary, bgSecondary, textPrimary, textTertiary, borderColor } =
    useThemeClasses();

  const {
    currentStep,
    steps,
    actualStepNumber,
    formData,
    setFormData,
    uploadedFile,
    voucherResults,
    marketplaceWebsites,
    handleNext,
    handlePrev,
    handleLogoUpload,
    copyMiniSiteUrl,
    downloadSampleXLS,
    handleFileUpload,
    handleInstanceVoucherAdd,
    handleSaveDraft,
    handlePublish,
    products,
    isProductsLoading,
    productSearch,
    setProductSearch,
    selectedProducts,
    toggleProductSelection,
    primaryProducts,
    togglePrimaryProduct,
    removeSelectedProduct,
    minSelectedProducts,
  } = useMiniCampaignWizard({ onSubmit, editingMiniSite });

  return (
    <ModalWrapper onClose={onClose}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-6 border-b ${borderColor}`}
      >
        <div>
          <h2
            className={`text-2xl bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent`}
          >
            {editingMiniSite
              ? t("edit_mini_campaign")
              : t("create_mini_campaign")}
          </h2>
          <p className={`text-sm ${textTertiary} mt-1`}>
            {t("step")} {currentStep} {t("of")} {steps.length}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className={`px-6 py-4 border-b ${borderColor} ${bgSecondary}`}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= index + 1
                      ? "bg-linear-to-r from-purple-500 to-pink-600 text-white"
                      : `${bgPrimary} border-2 ${borderColor} ${textTertiary}`
                  }`}
                >
                  {index + 1}
                </div>
                <p
                  className={`text-xs mt-2 text-center ${currentStep >= index + 1 ? textPrimary : textTertiary}`}
                >
                  {t(step.name)}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${currentStep > index + 1 ? "bg-linear-to-r from-purple-500 to-pink-600" : borderColor} mx-2`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {actualStepNumber === 1 && (
          <WebsitePurchaserInfoStep
            formData={formData}
            setFormData={setFormData}
            marketplaceWebsites={marketplaceWebsites}
            handleLogoUpload={handleLogoUpload}
          />
        )}

        {actualStepNumber === 2 && (
          <ProductSelectionStep
            products={products}
            isProductsLoading={isProductsLoading}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            selectedProducts={selectedProducts}
            toggleProductSelection={toggleProductSelection}
            primaryProducts={primaryProducts}
            togglePrimaryProduct={togglePrimaryProduct}
            hasWebsite={!!formData.selectedWebsite}
            minSelectedProducts={minSelectedProducts}
          />
        )}

        {actualStepNumber === 3 && (
          <MiniSitePreviewStep
            formData={formData}
            products={products}
            selectedProducts={selectedProducts}
            removeSelectedProduct={removeSelectedProduct}
            copyMiniSiteUrl={copyMiniSiteUrl}
          />
        )}

        {actualStepNumber === 4 && (
          <VoucherCreationStep
            formData={formData}
            setFormData={setFormData}
            uploadedFile={uploadedFile}
            handleFileUpload={handleFileUpload}
            handleInstanceVoucherAdd={handleInstanceVoucherAdd}
            downloadSampleXLS={downloadSampleXLS}
            copyMiniSiteUrl={copyMiniSiteUrl}
          />
        )}

        {actualStepNumber === 5 && (
          <VoucherResultsStep voucherResults={voucherResults} />
        )}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        isSaving={false}
        isPublishing={false}
        onPrevious={handlePrev}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </ModalWrapper>
  );
}
