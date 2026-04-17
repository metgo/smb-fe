import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";

import { FileText } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { PageHeader } from "@/components/shared";

import EmptyState from "@/components/shared/EmptyState";
import { CreateDocumentWizard } from "./components/sub-components/CreateDocumentWizard";
import { ReordableDataTable } from "@/components/shared";
import { useGetDocumentQuery } from "@/store/api/doumentMutationApi";

const STORAGE_KEY = "document_query_state";

export default function DocumentsManagement() {
  const { t } = useTranslation("documents");
  const { isDark, borderColor, bgSecondary } = useThemeClasses();

  const { websiteId } = useAppSelector((state) => state.auth);

  // Local State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set(),
  );
  const [combinedDocuments, setCombinedDocuments] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetDocumentQuery({});

  useEffect(() => {
    if (data?.data) {
      // Adjust this path if your API returns documents differently (e.g., data.documents)
      setCombinedDocuments(Array.isArray(data.data) ? data.data : []);
    } else if (data) {
      // Fallback in case API returns flat array
      setCombinedDocuments(Array.isArray(data) ? data : []);
    }
  }, [data]);

  // Persist page state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ page }));
  }, [page]);

  // Reset page when website changes
  useEffect(() => {
    setPage(1);
  }, [websiteId]);

  const hasMore = false; // Keep as-is (you can enhance later with pagination from API)
  const totalData = combinedDocuments.length;

  const fetchNextPage = useCallback(() => {
    toast.info("No more documents to load");
  }, []);

  // Table Columns Definition (unchanged)
  const columns = [
    {
      key: "title",
      label: t("title") || "Title",
      sortable: true,
    },
    {
      key: "subTitle",
      label: t("subtitle") || "Subtitle",
      sortable: false,
      render: (doc: any) => {
        const subtitle = doc.subTitle || doc.subtitle; // handle both camelCase & snake_case if needed
        return subtitle && subtitle.trim() !== "" ? subtitle : "-";
      },
    },

    {
      key: "createdAt",
      label: t("created_at") || "Created At",
      sortable: true,
      render: (doc: any) => new Date(doc.createdAt).toLocaleDateString(),
    },

    {
      key: "docType",
      label: t("file_type") || "File Type",
      sortable: false,
    },
    {
      key: "file",
      label: t("file") || "Uploaded File",
      sortable: false,
      render: (doc: any) => {
        const fileName =
          doc.fileName ||
          `${doc.title}.${(doc.fileType || "pdf").toLowerCase()}`;

        return (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <span className="text-sm truncate max-w-[200px]" title={fileName}>
              {fileName}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={`border-b ${isDark ? "border-gray-800" : "border-gray-200"} z-10`}
        >
          <PageHeader
            title={t("page_title")}
            description={t("page_description")}
            btnLabel={t("upload_document")}
            onClick={() => setIsCreateModalOpen(true)}
            h1Gradient="bg-linear-to-r text-transparent from-violet-500 via-fuchsia-600 to-pink-600"
            totalCount={totalData}
          />

          {/* Controls */}
          <div className="py-4 flex justify-end gap-3"></div>
        </div>

        {/* Content Area */}
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

        {/* Create Document Wizard */}
        {isCreateModalOpen && (
          <CreateDocumentWizard onClose={() => setIsCreateModalOpen(false)} />
        )}
      </div>
    </>
  );
}
