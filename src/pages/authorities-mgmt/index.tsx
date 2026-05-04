import clsx from "clsx";
import { useState, useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { Landmark, Building2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, PageHeader, EntityCard, Spinner } from "@/components/shared";
import { AuthorityTabs, CreateAuthorityWizardModal } from "./components";
import { useGetAllDmosQuery, useGetAuthoritiesByDmoIdQuery, useUpdateAuthorityMutation } from "@/store/api/websiteConfigApi";
import { toast } from "sonner";

const AuthoritiesMgmtPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: dmos } = useGetAllDmosQuery();

  const { bgPrimary, isDark, textTertiary } = useThemeClasses();
  const [updateAuthority, { isLoading: isUpdating }] = useUpdateAuthorityMutation();

  const [activeDmoId, setActiveDmoId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [migrateTarget, setMigrateTarget] = useState<IAuthorityRes | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editAuthorityId, setEditAuthorityId] = useState<string | undefined>();
  const [isMigrating, setIsMigrating] = useState(false);


  const { data: authorities, refetch, isLoading, isFetching } = useGetAuthoritiesByDmoIdQuery(activeDmoId ? activeDmoId : skipToken)

  useEffect(() => {
    if (!dmos?.length) return;
    const paramId = searchParams.get("dmoId");
    if (paramId) {
      setActiveDmoId(paramId);
    } else {
      setActiveDmoId(dmos[0]._id);
      setSearchParams((prev) => { prev.set("dmoId", dmos[0]._id); return prev; }, { replace: true });
    }
  }, [dmos, searchParams]);

  const handleTabChange = (dmoId: string) => {
    setActiveDmoId(dmoId);
    setSearchParams((prev) => { prev.set("dmoId", dmoId); return prev; }, { replace: true });
  };

  const activeDmo: IDmoRes | undefined = dmos?.find(item => item._id === activeDmoId);

  const handleEdit = (authorityId: string) => {
    setEditAuthorityId(authorityId);
    setCreateModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      console.log("delete authority", deleteTarget);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleMigrateToProd = (authorityId: string) => {
    console.log("🚀 ~ handleMigrateToProd ~ authorityId:", authorityId)
    // setMigrateTarget(authorityId);
  };

  const handleToggleActive = async (authorityId: string, isActive: boolean=false) => {
    try {
      await updateAuthority({ id: authorityId, body: { isActive } }).unwrap();
      toast.success("Authority updated successfully");
      refetch()
    } catch {
      toast.error(authorityId ? "Failed to update Authority" : "Failed to create Authority");
    }
  };

  const handleMigrateConfirm = async () => {
    if (!migrateTarget) return;
    setIsMigrating(true);
    try {
      // TODO: call migrate mutation
      console.log("migrate authority to prod", migrateTarget._id);
    } finally {
      setIsMigrating(false);
      setMigrateTarget(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className={`sticky top-0 z-10 ${bgPrimary}`}>
        <PageHeader
          title="Authority Management"
          h1Gradient="text-transparent bg-gradient-to-r from-violet-500 to-purple-500"
          totalCount={dmos?.reduce((sum, d) => sum + (d.authorityCount ?? 0), 0) ?? 0}
          btnLabel="Add Authority"
          onClick={() => setCreateModalOpen(true)}
        />

        <AuthorityTabs
          dmos={dmos || []}
          activeTab={activeDmoId}
          onTabChange={handleTabChange}
          isDark={isDark}
        />
      </div>

      <Spinner isLoading={isUpdating || isLoading || isFetching} />

      <div className="mt-4 flex-1">
        {(authorities?.length ?? 0) === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Landmark className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-1">No authorities found</p>
            <p className="text-sm text-gray-400">
              {!activeDmoId
                ? "Add an authority to get started."
                : "This DMO has no authorities yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
            {authorities?.map((auth) => (
              <EntityCard
                key={auth._id}
                logo={auth.logoPath}
                name={auth.name}
                fallbackIcon={<Landmark className="w-12 h-12 text-gray-400" />}
                isActive={auth.isActive ?? false}
                onToggleActive={() => handleToggleActive(auth?._id, !auth?.isActive)}
                onEdit={() => handleEdit(auth?._id)}
                onDelete={() => setDeleteTarget(auth?._id)}
                onMigrateToProd={() => handleMigrateToProd(auth?._id)}
              >
                <div className="flex items-center gap-1.5">
                  {activeDmo?.logoPath ? (
                    <img
                      src={activeDmo.logoPath}
                      alt={activeDmo.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <Building2 className="w-3.5 h-3.5 text-violet-500" />
                  )}
                  <span
                    className={clsx(
                      "text-xs font-medium truncate",
                      textTertiary,
                    )}
                  >
                    {activeDmo?.name}
                  </span>
                </div>
              </EntityCard>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="delete_authority"
        message="delete_authority_confirm"
        variant="danger"
        confirmText="delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!migrateTarget}
        title="migrate_authority_to_prod"
        message="migrate_authority_to_prod_confirm"
        variant="warning"
        confirmText="migrate_to_prod"
        loading={isMigrating}
        onConfirm={handleMigrateConfirm}
        onCancel={() => setMigrateTarget(null)}
      />

      {createModalOpen && (
        <CreateAuthorityWizardModal
          setIsOpen={(v) => { setCreateModalOpen(v); if (!v) setEditAuthorityId(undefined); }}
          authorityId={editAuthorityId}
        />
      )}
    </div>
  );
};

export default AuthoritiesMgmtPage;
