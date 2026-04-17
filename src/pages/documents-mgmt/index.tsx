import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";

import { FileText, X } from "lucide-react";
import FileViewer from "react-file-viewer";

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set(),
  );
  const [combinedDocuments, setCombinedDocuments] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  // popup state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const { data, isLoading, isFetching } = useGetDocumentQuery({});

  useEffect(() => {
    if (data?.data) {
      setCombinedDocuments(Array.isArray(data.data) ? data.data : []);
    } else if (data) {
      setCombinedDocuments(Array.isArray(data) ? data : []);
    }
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

  const getFileType = (docType: string) => {
    if (docType?.includes("pdf")) return "pdf";
    if (docType?.includes("png")) return "png";
    if (docType?.includes("jpeg")) return "jpg";
    if (docType?.includes("jpg")) return "jpg";
    if (docType?.includes("doc")) return "docx";
    if (docType?.includes("sheet")) return "xlsx";
    return "pdf";
  };

  const openViewer = (doc: any) => {
    setSelectedFile(doc);
    setIsViewerOpen(true);
  };

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
        const subtitle = doc.subTitle || doc.subtitle;
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
          doc.fileName || `${doc.title}.${getFileType(doc.docType || "pdf")}`;

        return (
          <div
            onClick={() => openViewer(doc)}
            className="flex items-center gap-2 cursor-pointer hover:text-violet-600"
          >
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
          className={`border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          } z-10`}
        >
          <PageHeader
            title={t("page_title")}
            description={t("page_description")}
            btnLabel={t("upload_document")}
            onClick={() => setIsCreateModalOpen(true)}
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

        {/* Upload Modal */}
        {isCreateModalOpen && (
          <CreateDocumentWizard onClose={() => setIsCreateModalOpen(false)} />
        )}

        {/* File Viewer Popup */}
        {isViewerOpen && selectedFile && (
          <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-5xl h-[90vh] relative overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <h2 className="font-semibold text-lg truncate">
                  {selectedFile.title}
                </h2>

                <button onClick={() => setIsViewerOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Viewer */}
              <div className="h-[calc(100%-60px)] overflow-auto">
                {selectedFile.docType?.includes("pdf") ? (
                  <iframe
                    src={selectedFile.docUrl}
                    title="Document Viewer"
                    className="w-full h-full"
                  />
                ) : selectedFile.docType?.includes("image") ? (
                  <img
                    src={selectedFile.docUrl}
                    alt="Preview"
                    className="max-w-full max-h-full mx-auto p-4"
                  />
                ) : (
                  <div className="p-6 text-center">
                    <a
                      href={selectedFile.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 underline"
                    >
                      Open File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
