import clsx from "clsx";

import { ModalWrapper } from "@/components/wrapper";
import { WizardFooter, WizardStepper } from "@/components/shared";

import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import MinisiteMedia from "./sub-components/MinisiteMedia";
import { MiniSitePreview } from "./sub-components/MinisitePreview";
import ProductWebsiteAndInfo from "./sub-components/ProductWebsiteAndInfo";
import { MinisiteVoucherCreation } from "./sub-components/MinisiteVoucherCreation";
import { VoucherResultsStep } from "./sub-components/VoucherResultsStep";
import ProductSelectionStep from "./sub-components/ProductSelectionStep";
import { useCreateMinisiteWizard } from "../hooks/useCreateMinisiteWizard";

interface CreateMinisiteWizardProps {
  onClose: () => void;
  editData?: IMinisiteDetailsRes;
}

// Main Components
const CreateMinisiteWizard = ({
  onClose,
  editData,
}: CreateMinisiteWizardProps) => {
  const { textPrimary, textTertiary, borderColor } = useThemeClasses();

  const {
    t,
    associatedWebsite,
    isPublishing,
    isCreating,
    isSaving,

    logoGcsUrl,
    setLogoGcsUrl,

    currentStep,
    setCurrentStep,
    steps,
    totalSteps,

    formData,
    setFormData,

    saveDraft,
    handlePublish,

    products,
    isProductsLoading,
    isProductsFetching,
    hasMoreProducts,
    fetchNextProductsPage,
    productSearch,
    setProductSearch,
    selectedProducts,
    primaryProducts,
    toggleProductSelection,
    togglePrimaryProduct,
    removeSelectedProduct,
    MIN_SELECTED_PRODUCTS,

    assignees,
    setAssignees,

    voucherResults,
    isUploadingVouchers,

    handleNext,
    handlePrev,

    copyMiniSiteUrl,
    downloadSampleXLS,
  } = useCreateMinisiteWizard(editData);

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={isCreating || isSaving || isUploadingVouchers}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-6 py-3 border-b ${borderColor}`}
      >
        <div>
          <h2 className={clsx("text-2xl", textPrimary)}>
            {editData ? t("edit_mini_site") : t("create_mini_site")}{" "}
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
            isProductsFetching={isProductsFetching}
            hasMoreProducts={hasMoreProducts}
            fetchNextProductsPage={fetchNextProductsPage}
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
            minSelectedProducts={MIN_SELECTED_PRODUCTS}
          />
        )}

        {/* Step 5: Voucher Creation & Distribution */}
        {currentStep === 5 && (
          <MinisiteVoucherCreation
            purchaser={{
              contactName: formData.contactName,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
            }}
            assignees={assignees}
            setAssignees={setAssignees}
            downloadSampleXLS={downloadSampleXLS}
          />
        )}

        {/* Step 6: Results */}
        {currentStep === 6 && (
          <VoucherResultsStep voucherResults={voucherResults} />
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
        onPublish={() => handlePublish(onClose)}
      />
    </ModalWrapper>
  );
};

export default CreateMinisiteWizard;
