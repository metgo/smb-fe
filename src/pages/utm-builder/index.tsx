import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  UtmPageHeader,
  FormHeader,
  DestinationSection,
  UtmParametersSection,
  InfluencerSection,
  GeneratedUrlCard,
  SavedLinksPanel,
} from "./components";
import { useUtmBuilder } from "./hooks/useUtmBuilder";

const UtmBuilderPage = () => {
  const { t } = useTranslation("utm_campaign");
  const { cardClasses } = useThemeClasses();
  const builder = useUtmBuilder();

  return (
    <div className="flex flex-col h-full overflow-y-auto xl:overflow-hidden pt-10 md:pt-0">
      <UtmPageHeader />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-2 pb-10 xl:pb-0 xl:flex-1 xl:min-h-0">
        {/* Builder form */}
        <div
          className={clsx(
            "xl:col-span-3 rounded-xl p-6 xl:overflow-y-auto",
            cardClasses,
          )}
        >
          <FormHeader
            isEditing={!!builder.editingId}
            isSaving={builder.isSaving}
            canSave={builder.canGenerate}
            onSave={builder.handleSave}
            onReset={builder.resetForm}
          />
          <DestinationSection
            websites={builder.allWebsites}
            selectedWebsiteId={builder.selectedWebsiteId}
            onWebsiteSelect={builder.handleWebsiteSelect}
            baseUrl={builder.form.baseUrl}
            onBaseUrlChange={builder.handleBaseUrlChange}
          />
          <UtmParametersSection
            form={builder.form}
            onChange={builder.updateForm}
            onCampaignIdChange={builder.handleCampaignIdChange}
          />
          <InfluencerSection
            contact={builder.contact}
            onInfluencerChange={builder.handleInfluencerChange}
            onContactChange={builder.updateContact}
          />
        </div>

        {/* Preview + saved links */}
        <div className="xl:col-span-2 flex flex-col gap-2 xl:min-h-0">
          <GeneratedUrlCard
            generatedUrl={builder.generatedUrl}
            readableUrl={builder.readableUrl}
            missingRequired={builder.missingRequired}
            canGenerate={builder.canGenerate}
            onPasteUrl={builder.fillFormFromUrl}
          />
          <SavedLinksPanel
            links={builder.savedLinks}
            isLoading={builder.isLoadingLinks}
            editingId={builder.editingId}
            websiteByHost={builder.websiteByHost}
            onDuplicate={builder.handleDuplicate}
            onEdit={builder.handleEdit}
            onDelete={builder.setDeleteTarget}
          />
        </div>
      </div>

      <ConfirmDialog
        open={!!builder.deleteTarget}
        title={t("delete_dialog_title")}
        message={t("delete_dialog_message")}
        variant="danger"
        confirmText={t("delete_confirm")}
        onConfirm={builder.handleDelete}
        onCancel={() => builder.setDeleteTarget(null)}
      />
    </div>
  );
};

export default UtmBuilderPage;
