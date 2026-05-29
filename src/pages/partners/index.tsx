import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import { ConfirmDialog, PageHeader } from "@/components/shared";
import {
  useDeletePartnerMutation,
  useGetAllPartnersQuery,
  useUpdatePartnerMutation,
} from "@/store/api/websiteConfigApi";
import CreatePartnerWizard from "./CreatePartnerWizard";
import PartnerCard from "./PartnerCard";
import { Handshake } from "lucide-react";
import EntityCardsSkeleton from "@/components/skeletons/EntityCardSkeleton";

const PartnersPage = () => {
  const { t } = useTranslation("website_settings");
  const { t: tc } = useTranslation("common");
  const { language } = useThemeClasses();
  const { allWebsites } = useCommon();

  const {
    data: partners,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllPartnersQuery(language);
  const [deletePartner, { isLoading: isDeleting }] = useDeletePartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updatePartner({ id, body: { isActive: !isActive } }).unwrap();
      toast.success(
        isActive ? t("partner_deactivated") : t("partner_activated"),
      );
      refetch();
    } catch {
      toast.error(t("partner_status_update_failed"));
    }
  };

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editPartnerId, setEditPartnerId] = useState<string | undefined>();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const websiteMap = Object.fromEntries(
    (allWebsites ?? []).map((w) => [w._id, w]),
  );

  const handleEdit = (id: string) => {
    setEditPartnerId(id);
    setIsWizardOpen(true);
  };

  const handleOpenCreate = () => {
    setEditPartnerId(undefined);
    setIsWizardOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deletePartner(deleteTargetId).unwrap();
      toast.success(tc("partner_deleted"));
      refetch();
    } catch {
      toast.error(tc("partner_delete_failed"));
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="flex flex-col h-full pt-10 md:pt-0">
      <PageHeader
        title={t("partners_title")}
        h1Gradient="text-transparent bg-gradient-to-r from-violet-500 to-purple-500"
        totalCount={partners?.length}
        btnLabel={t("add_partner")}
        onClick={handleOpenCreate}
      />

      {isLoading || isFetching ? (
        <EntityCardsSkeleton count={7} />
      ) : (
        <>
          {partners?.length === 0 && (!isFetching || !isFetching) ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Handshake className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-1">{t("no_partners_yet")}</p>
              <p className="text-sm text-gray-400">{t("add_partner_desc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 p-1">
              {partners?.map((partner) => (
                <PartnerCard
                  key={partner._id}
                  partner={partner}
                  websiteMap={websiteMap}
                  onEdit={() => handleEdit(partner._id)}
                  onDelete={() => setDeleteTargetId(partner._id)}
                  onToggleActive={() =>
                    handleToggleActive(partner._id, partner.isActive)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="delete_partner"
        message="delete_partner_confirm"
        variant="danger"
        confirmText="delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {isWizardOpen && (
        <CreatePartnerWizard
          setIsOpen={setIsWizardOpen}
          partnerId={editPartnerId}
        />
      )}
    </div>
  );
};

export default PartnersPage;
