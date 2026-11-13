import { toast } from "sonner";
import { PenBox, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";

import { useAppSelector } from "@/hooks/hooks";
import { PageHeader } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ActionIconButtons } from "@/components/btns";

import EmptyState from "@/components/shared/EmptyState";
import {
  ReordableDataTable,
  ConfirmDialog,
  ImageWithFallback,
} from "@/components/shared";
import {
  useGetAllDocumentsQuery,
  useDeleteDocumentMutation,
} from "@/store/api/doumentMutationApi";
import { CreateDocumentWizard } from "./components";

const STORAGE_KEY = "document_query_state";

export default function DocumentsManagement() {
  const { t } = useTranslation("documents");
  const { t: tc } = useTranslation("common");
  const { isDark, borderColor, bgSecondary } = useThemeClasses();

  const { websiteId, associatedWebsite } = useAppSelector(
    (state) => state.auth,
  );

  const [wizardDocument, setWizardDocument] = useState<
    IDoucment | null | undefined
  >(undefined);
  const [deleteTarget, setDeleteTarget] = useState<IDoucment | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set(),
  );
  const [combinedDocuments, setCombinedDocuments] = useState<IDoucment[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useGetAllDocumentsQuery();
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

  useEffect(() => {
    setCombinedDocuments(Array.isArray(data?.data) ? data.data : []);
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ page }));
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [websiteId]);

  const hasMore = false;
  const totalData = combinedDocuments.length;

  const fetchNextPage = useCallback(() => {
    toast.info("No more documents to load");
  }, []);

  const getWebsiteName = useCallback(
    (externalApiId: string) =>
      associatedWebsite.find((website) => website._id === externalApiId)
        ?.name ?? "-",
    [associatedWebsite],
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDocument(deleteTarget._id).unwrap();
      toast.success(t("document_deleted_success"));
      setDeleteTarget(null);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error(t("delete_failed"));
    }
  };

  const columns = [
    {
      key: "imageUrl",
      label: t("image"),
      sortable: false,
      render: (doc: IDoucment) => (
        <ImageWithFallback
          src={doc.imageUrl}
          alt={doc.title}
          className="w-14 h-10 rounded-lg object-cover"
        />
      ),
    },
    {
      key: "title",
      label: t("title"),
      sortable: true,
    },
    {
      key: "externalApiId",
      label: t("website"),
      sortable: false,
      render: (doc: IDoucment) => getWebsiteName(doc.externalApiId),
    },
    {
      key: "templateKey",
      label: t("email_template_key"),
      sortable: true,
    },
    {
      key: "actions",
      label: t("actions"),
      sortable: false,
      render: (doc: IDoucment) => {
        const actions: IActionIconButton[] = [
          {
            title: tc("edit"),
            icon: PenBox,
            color: "gray",
            onClick: () => setWizardDocument(doc),
          },
          {
            title: tc("delete"),
            icon: Trash2,
            color: "red",
            onClick: () => setDeleteTarget(doc),
          },
        ];

        return <ActionIconButtons isDark={isDark} actions={actions} />;
      },
    },
  ];

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={`border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          } z-10`}
        >
          <PageHeader
            title={t("page_title")}
            description={t("page_description")}
            btnLabel={t("upload_document")}
            onClick={() => setWizardDocument(null)}
            h1Gradient="bg-linear-to-r text-transparent from-violet-500 via-fuchsia-600 to-pink-600"
            totalCount={totalData}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden mt-2">
          {combinedDocuments.length === 0 && !isLoading && !isFetching ? (
            <EmptyState searchQuery="" />
          ) : (
            <div
              className={`rounded-xl border ${borderColor} ${bgSecondary} h-full overflow-hidden`}
            >
              <ReordableDataTable
                rowKey="_id"
                data={combinedDocuments}
                isDataLoading={isLoading || isFetching}
                selectedItems={selectedDocuments}
                onSelectionChange={setSelectedDocuments}
                storageKey="documentsTableColumnOrder"
                columns={columns}
                hasMore={hasMore}
                next={fetchNextPage}
              />
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {wizardDocument !== undefined && (
          <CreateDocumentWizard
            documentToEdit={wizardDocument}
            onClose={() => setWizardDocument(undefined)}
            refetch={refetch}
          />
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title={t("delete_document")}
        message={t("delete_document_confirm", { title: deleteTarget?.title })}
        confirmText="delete"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
