import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AddButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FilterSelect } from "@/pages/orders-mgmt/components";
import { usePersistentState } from "@/hooks/usePersistentState";
import { SearchInput, ConfirmDialog } from "@/components/shared";
import { useGetEmailConfigsQuery } from "@/store/api/emailConfigQueryApi";
import { useSyncEmailConfigsMutation } from "@/store/api/emailConfigMutationApi";

import { EmailConfigList, EmailConfigFormModal } from "./components";

const LIMIT = 20;

const EmailConfigMgmtPage = () => {
  const { t } = useTranslation("email_config");
  const { textPrimary, borderColor } = useThemeClasses();

  const [searchQuery, setSearchQuery] = usePersistentState(
    "emailConfigSearch",
    "",
  );
  const [category, setCategory] = usePersistentState(
    "emailConfigCategoryFilter",
    "all",
  );
  const [language, setLanguage] = usePersistentState(
    "emailConfigLanguageFilter",
    "all",
  );
  const [page, setPage] = useState(1);
  const [combinedConfigs, setCombinedConfigs] = useState<IEmailConfig[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);

  useEffect(() => {
    setPage(1);
    setCombinedConfigs([]);
  }, [searchQuery, category, language]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(searchQuery && { search: searchQuery }),
      ...(category !== "all" && { category }),
      ...(language !== "all" && { language: language as EmailConfigLanguage }),
    }),
    [page, searchQuery, category, language],
  );

  const { data, isLoading, isFetching, refetch } = useGetEmailConfigsQuery(
    queryParams,
    { refetchOnMountOrArgChange: true },
  );

  const [syncEmailConfigs, { isLoading: isSyncing }] =
    useSyncEmailConfigsMutation();

  const hasMore = !!data?.datas?.meta?.hasNextPage;
  const totalData: number = data?.datas?.totalData ?? 0;

  useEffect(() => {
    const pageItems: IEmailConfig[] = data?.datas?.data ?? [];

    if (!pageItems.length) {
      if (page === 1) setCombinedConfigs([]);
      return;
    }

    setCombinedConfigs((prev) => {
      if (page === 1) return pageItems;
      const existingIds = new Set(prev.map((item) => item._id));
      const newItems = pageItems.filter((item) => !existingIds.has(item._id));
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [data, page]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(combinedConfigs.map((item) => item.category).filter(Boolean)),
    );
    return [
      { value: "all", label: t("all_categories") },
      ...categories.map((c) => ({ value: c, label: c })),
    ];
  }, [combinedConfigs, t]);

  const handleSync = async () => {
    try {
      await syncEmailConfigs().unwrap();
      toast.success(t("sync_success"));
      setPage(1);
      setCombinedConfigs([]);
      refetch();
    } catch {
      toast.error(t("sync_failed"));
    } finally {
      setIsSyncConfirmOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full pt-10 md:pt-0 gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className={`text-xl md:text-2xl font-bold ${textPrimary}`}>
          {t("email_config_management")}
          {!!totalData && (
            <span className="text-violet-500 ml-2">({totalData})</span>
          )}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSyncConfirmOpen(true)}
            disabled={isSyncing}
            className={`px-3 py-2 rounded-lg border ${borderColor} text-sm font-medium ${textPrimary} flex items-center gap-2 hover:bg-gray-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span className="hidden md:block">{t("sync_from_mailchimp")}</span>
          </button>
          <AddButton
            label={t("new_template")}
            handleClick={() => setIsCreateModalOpen(true)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-55">
          <SearchInput
            placeholder={t("search_placeholder")}
            searchTerm={searchQuery}
            setSearchTerm={(value) => {
              setSearchQuery(value);
            }}
          />
        </div>
        <div className="w-44">
          <FilterSelect
            value={category}
            onChange={(value) => {
              setCategory(value);
            }}
            options={categoryOptions}
          />
        </div>
        <div className="w-36">
          <FilterSelect
            value={language}
            onChange={(value) => {
              setLanguage(value);
            }}
            options={[
              { value: "all", label: t("all_languages") },
              { value: "en", label: "EN" },
              { value: "he", label: "HE" },
            ]}
          />
        </div>
      </div>

      {!isLoading && combinedConfigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg font-medium mb-1">{t("no_templates_found")}</p>
          <p className="text-sm text-gray-400">{t("no_templates_desc")}</p>
        </div>
      ) : (
        <EmailConfigList
          data={combinedConfigs}
          isLoading={isLoading || (page === 1 && isFetching)}
          onRefetch={refetch}
          hasMore={hasMore}
          next={fetchNextPage}
        />
      )}

      {isCreateModalOpen && (
        <EmailConfigFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={refetch}
        />
      )}

      <ConfirmDialog
        open={isSyncConfirmOpen}
        title={t("sync_templates")}
        message={t("sync_templates_confirm")}
        variant="warning"
        confirmText="confirm"
        loading={isSyncing}
        onConfirm={handleSync}
        onCancel={() => setIsSyncConfirmOpen(false)}
      />
    </div>
  );
};

export default EmailConfigMgmtPage;
