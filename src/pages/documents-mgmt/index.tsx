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

const STORAGE_KEY = "document_query_state";

// Dummy Data
const dummyDocuments = [
  {
    _id: "doc1",
    title: "Employee Handbook 2025",
    subTitle: "Complete guidelines for company policies and procedures",
    status: "ACTIVE",
    createdAt: "2025-03-15T10:30:00Z",
    updatedAt: "2025-04-10T14:20:00Z",
    fileSize: 2457600, // 2.45 MB
    fileType: "PDF",
  },
  {
    _id: "doc2",
    title: "Q1 Financial Report",
    subTitle: "Quarterly financial summary and projections",
    status: "APPROVED",
    createdAt: "2025-04-01T09:15:00Z",
    updatedAt: "2025-04-05T16:45:00Z",
    fileSize: 1843200, // 1.84 MB
    fileType: "PDF",
  },
  {
    _id: "doc3",
    title: "Product Launch Presentation",
    subTitle: "Slides for upcoming product launch event",
    status: "DRAFT",
    createdAt: "2025-04-12T11:00:00Z",
    updatedAt: "2025-04-16T08:30:00Z",
    fileSize: 5120000, // 5.12 MB
    fileType: "PPTX",
  },
  {
    _id: "doc4",
    title: "Client Contract - Acme Corp",
    subTitle: "Service agreement and terms",
    status: "ACTIVE",
    createdAt: "2025-02-20T14:00:00Z",
    updatedAt: "2025-03-25T10:10:00Z",
    fileSize: 768000, // 0.768 MB
    fileType: "DOCX",
  },
  {
    _id: "doc5",
    title: "Marketing Strategy 2026",
    subTitle: "Long-term marketing goals and campaigns",
    status: "DRAFT",
    createdAt: "2025-04-10T13:45:00Z",
    updatedAt: "2025-04-17T09:20:00Z",
    fileSize: 1536000, // 1.536 MB
    fileType: "PDF",
  },
];

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

  // Load dummy data (simulating API behavior)
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      if (page === 1) {
        setCombinedDocuments(dummyDocuments);
      } else {
        // For demo purposes, no more data after first page
        setCombinedDocuments((prev) => [...prev]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [page]);

  // Persist page state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ page }));
  }, [page]);

  // Reset page when website changes
  useEffect(() => {
    setPage(1);
  }, [websiteId]);

  const hasMore = false; // No more pages in dummy data
  const totalData = dummyDocuments.length;
  const isLoading = false;

  const fetchNextPage = useCallback(() => {
    toast.info("No more documents to load");
  }, []);

  // Table Columns Definition
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
    },
    {
      key: "status",
      label: t("status") || "Status",
      sortable: true,
      render: (doc: any) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
            doc.status === "ACTIVE" || doc.status === "APPROVED"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : doc.status === "DRAFT"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {doc.status || "DRAFT"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("created_at") || "Created At",
      sortable: true,
      render: (doc: any) => new Date(doc.createdAt).toLocaleDateString(),
    },
    {
      key: "updatedAt",
      label: t("updated_at") || "Updated At",
      sortable: true,
      render: (doc: any) => new Date(doc.updatedAt).toLocaleDateString(),
    },
    {
      key: "fileSize",
      label: t("file_size") || "File Size",
      sortable: true,
      render: (doc: any) =>
        doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : "—",
    },
    {
      key: "fileType",
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

        {/* Content Area - Direct ReordableDataTable */}
        <div className="flex-1 overflow-hidden mt-2">
          {combinedDocuments.length === 0 && !isLoading ? (
            <EmptyState searchQuery="" />
          ) : (
            <div
              className={`rounded-xl border ${borderColor} ${bgSecondary} h-full overflow-hidden`}
            >
              <ReordableDataTable
                rowKey="_id"
                data={combinedDocuments}
                isDataLoading={isLoading}
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
