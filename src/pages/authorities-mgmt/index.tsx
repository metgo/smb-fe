import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Landmark } from "lucide-react";

import { useGetDmosQuery } from "@/store/api/masterDataApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, PageHeader } from "@/components/shared";
import { AuthorityCard, AuthorityTabs } from "./components";

// ─── Page ────────────────────────────────────────────────────────────────────

const AuthoritiesMgmtPage = () => {
  const [searchParams] = useSearchParams();
  const { data, refetch, isFetching } = useGetDmosQuery();
  const { cardClasses, textPrimary, textTertiary, bgPrimary, isDark } =
    useThemeClasses();

  const [activeTab, setActiveTab] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<EnrichedAuthority | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [migrateTarget, setMigrateTarget] = useState<EnrichedAuthority | null>(
    null,
  );
  const [isMigrating, setIsMigrating] = useState(false);

  const dmos: IDmo[] = data?.data ?? [];

  // Seed active tab from ?dmoId= navigation (e.g. from DMO card redirect)
  useEffect(() => {
    const dmoId = searchParams.get("dmoId");
    if (dmoId) setActiveTab(dmoId);
  }, [searchParams]);

  const allAuthorities: EnrichedAuthority[] = dmos.flatMap((dmo) =>
    (dmo.authorities ?? []).map((auth) => ({
      _id: auth._id,
      name: auth.name,
      logoPath: auth.logoPath,
      dmoId: dmo._id,
      dmoName: dmo.name,
      dmoLogo: dmo.logoPath,
    })),
  );

  const visibleAuthorities =
    activeTab === "all"
      ? allAuthorities
      : allAuthorities.filter((a) => a.dmoId === activeTab);

  const handleEdit = (auth: EnrichedAuthority) => {
    // TODO: open edit modal
    console.log("edit authority", auth._id);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // TODO: call delete mutation
      console.log("delete authority", deleteTarget._id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleMigrateToProd = (auth: EnrichedAuthority) => {
    setMigrateTarget(auth);
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
          totalCount={allAuthorities.length}
          btnLabel="Add Authority"
          onClick={() => console.log("add authority")}
          onRefreshClick={refetch}
          isRefreshing={isFetching}
        />

        {/* ── Tabs ── */}
        <AuthorityTabs
          dmos={dmos}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          allAuthorities={allAuthorities}
          isDark={isDark}
        />
      </div>

      {/* ── Content ── */}
      <div className="mt-4 flex-1">
        {visibleAuthorities.length === 0 && !isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Landmark className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-1">No authorities found</p>
            <p className="text-sm text-gray-400">
              {activeTab === "all"
                ? "Add an authority to get started."
                : "This DMO has no authorities yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
            {visibleAuthorities.map((auth) => (
              <AuthorityCard
                key={auth._id}
                authority={auth}
                cardClasses={cardClasses}
                textPrimary={textPrimary}
                textTertiary={textTertiary}
                isDark={isDark}
                onEdit={() => handleEdit(auth)}
                onDelete={() => setDeleteTarget(auth)}
                onMigrateToProd={() => handleMigrateToProd(auth)}
              />
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
    </div>
  );
};

export default AuthoritiesMgmtPage;
