import clsx from "clsx";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  ChevronDown,
  Maximize2,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { mockBusinesses } from "@/helpers/mockBusinesses";
import {
  ContentComposer,
  Contents,
  MessageComposerModal,
  SendResultsModal,
} from "./components";
import { useGetAllbusinessesQuery } from "@/store/api/businessQueryApi";

interface SendResult {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  emailStatus: "success" | "failed";
  smsStatus: "success" | "failed";
  errorMessage?: string;
}
interface Filters {
  status: string;
  hasProductFilter: string;
  primaryCategory: string;
}
type PanelFocus = "both" | "left" | "right";

// ─── Animation config ─────────────────────────────────────────────────────────

const SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.8,
} as const;

const panelVariants = {
  // full width when expanded
  expanded: { flexGrow: 1, flexBasis: 0, opacity: 1 },
  // half width in split view
  half: { flexGrow: 1, flexBasis: "50%", opacity: 1 },
  // exits by collapsing width to 0
  hidden: { flexGrow: 0, flexBasis: 0, opacity: 0, overflow: "hidden" },
};

// ─── PanelExpandButton ────────────────────────────────────────────────────────

interface PanelExpandButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseIcon: React.ReactNode;
  isDark: boolean;
}

const PanelExpandButton = ({
  isExpanded,
  onToggle,
  expandLabel,
  collapseIcon,
  isDark,
}: PanelExpandButtonProps) => (
  <motion.button
    onClick={onToggle}
    title={isExpanded ? "Split view" : expandLabel}
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className={clsx(
      "absolute  z-50 flex items-center gap-1 py-2 rounded-md text-xs font-medium",
      "hidden group-hover:flex transition-opacity duration-150",
      isExpanded
        ? "left-0 right-0 mx-auto w-max top-0 px-4"
        : "px-2 top-2 right-0",
      isDark
        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
        : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200",
    )}
  >
    {isExpanded ? (
      <>{collapseIcon} Split</>
    ) : (
      <>
        <Maximize2 className="w-3.5 h-3.5" /> {expandLabel}
      </>
    )}
  </motion.button>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentMgmtPage() {
  const { t } = useTranslation("businesses");
  const { isDark, language } = useThemeClasses();

  const [viewMode, setViewMode] = useState<TViewMode>(
    (localStorage.getItem("contentViewMode") as TViewMode) ?? "list",
  );

  const initialTemplateContent: IContentTemplate[] = [
    {
      header: "",
      topic: t("featured_businesses"),
      isPrimary: true,
      groups: [{ isPrimary: true, category: "Category 2", contents: [] }],
    },
    {
      header: "",
      topic: t("homepage_hero_section"),
      isPrimary: false,
      groups: [{ isPrimary: false, category: "Category 1", contents: [] }],
    },
    {
      header: "",
      topic: t("recommended_this_week"),
      isPrimary: false,
      groups: [{ isPrimary: false, category: "", contents: [] }],
    },
  ];

  const [templateContents, setTemplateContent] = useState<IContentTemplate[]>(
    initialTemplateContent,
  );
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<Set<string>>(
    new Set(),
  );
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showSendResults, setShowSendResults] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [focus, setFocus] = useState<PanelFocus>("both");

  const { dmoId, authorityId, startDate, endDate, websiteId } = useAppSelector(
    (state) => state.auth,
  );

  // ─── Multi-select state ───────────────────────────────────────────────────

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    hasProductFilter: "all",
    primaryCategory: "all",
  });

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      dmoId,
      startDate,
      endDate,
      authorityId,
      limit: 20,
      locale: language,
      externalApiId: websiteId,
    };

    if (searchQuery) params.search = searchQuery;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.hasProductFilter !== "all")
      params.hasProductFilter = filters.hasProductFilter === "yes";

    return params;
  }, [
    page,
    searchQuery,
    language,
    dmoId,
    authorityId,
    startDate,
    endDate,
    websiteId,
    filters,
  ]);

  const {
    data: businessData,
    isLoading,
    isFetching,
  } = useGetAllbusinessesQuery(queryParams);

  const hasMore = businessData?.meta?.hasNextPage;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters, dmoId, authorityId, startDate, endDate]);

  const [combinedBusinesses, setCombinedBusinesses] = useState<any[]>([]);

  useEffect(() => {
    if (!businessData?.data) return;
    if (page === 1) {
      setCombinedBusinesses(businessData.data);
    } else {
      setCombinedBusinesses((prev) => {
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = businessData.data.filter(
          (b: any) => !existingIds.has(b._id),
        );
        return [...prev, ...newItems];
      });
    }
  }, [businessData?.data, page]);

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  };
  const clearFilter = () => {
    setFilters({
      status: "all",
      hasProductFilter: "all",
      primaryCategory: "all",
    });
    setSearchQuery("");
    setPage(1);
  };

  const handleSendMessage = () => {
    const selected = mockBusinesses.filter((b) => selectedBacklogIds.has(b.id));
    const results: SendResult[] = selected.map((business) => {
      const emailSuccess = Math.random() > 0.1;
      const smsSuccess = Math.random() > 0.15;
      return {
        customerId: business.id,
        customerName: `Customer of ${business.name}`,
        email: `customer@${business.name.toLowerCase().replace(/\s+/g, "")}.com`,
        phone: `+972-5${Math.floor(Math.random() * 10)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
        emailStatus: emailSuccess ? "success" : "failed",
        smsStatus: smsSuccess ? "success" : "failed",
        errorMessage:
          !emailSuccess || !smsSuccess ? "Network timeout" : undefined,
      };
    });

    setSendResults(results);
    setShowMessageComposer(false);
    setShowSendResults(true);
    setSelectedBacklogIds(new Set());
    toast.success(t("messages_sent_to_customers", { count: results?.length }));
  };

  const expandLeft = () => setFocus((p) => (p === "left" ? "both" : "left"));
  const expandRight = () => setFocus((p) => (p === "right" ? "both" : "right"));

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={clsx(
          "h-[86vh] transition-colors flex flex-col p-2",
          isDark ? "bg-gray-900" : "bg-gray-50",
        )}
      >
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* ── Page Header ── */}
            <div
              className={clsx(
                "shrink-0 border-b p-2 rounded-md",
                isDark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200",
              )}
            >
              <h1
                className={clsx(
                  "text-2xl font-bold mb-2",
                  isDark ? "text-gray-400" : "text-gray-900",
                )}
              >
                {t("content_manager_title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("content_manager_description")}
              </p>

              <AnimatePresence>
                {selectedBacklogIds.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={SPRING}
                    className="overflow-hidden"
                  >
                    <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4 mt-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-teal-900 dark:text-teal-100">
                          {selectedBacklogIds.size} business
                          {selectedBacklogIds.size !== 1 ? "es" : ""} selected
                        </p>
                        <div className="flex items-center gap-2">
                          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                            Actions <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                          <Send className="w-4 h-4" />
                          Send Message
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBacklogIds(new Set())}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Two-panel layout ── */}
            <div className="flex gap-0 flex-1 overflow-hidden min-h-0">
              {/* ── LEFT: Contents ── */}
              <AnimatePresence initial={false}>
                {focus !== "right" && (
                  <motion.div
                    key="left-panel"
                    className="group relative flex flex-col min-w-0 overflow-hidden"
                    variants={panelVariants}
                    initial="hidden"
                    animate={focus === "left" ? "expanded" : "half"}
                    exit="hidden"
                    transition={SPRING}
                    style={{ minWidth: 0 }}
                  >
                    <PanelExpandButton
                      isExpanded={focus === "left"}
                      onToggle={expandLeft}
                      expandLabel="Expand"
                      collapseIcon={<PanelRightClose className="w-3.5 h-3.5" />}
                      isDark={isDark}
                    />
                    <Contents
                      isExpanded={focus === "both"}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      combinedBusinesses={combinedBusinesses}
                      fetchNextPage={fetchNextPage}
                      clearFilter={clearFilter}
                      hasMore={hasMore}
                      filters={filters}
                      setFilters={setFilters}
                      isLoading={isLoading}
                      templateContents={templateContents}
                      setTemplateContent={setTemplateContent}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Animated divider ── */}
              <AnimatePresence>
                {focus === "both" && (
                  <motion.div
                    key="divider"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{ duration: 0.2 }}
                    className={clsx(
                      "w-px mx-3 shrink-0 self-stretch",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                )}
              </AnimatePresence>

              {/* ── RIGHT: ContentComposer ── */}
              <AnimatePresence initial={false}>
                {focus !== "left" && (
                  <motion.div
                    key="right-panel"
                    className="group relative flex flex-col min-w-0 overflow-hidden"
                    variants={panelVariants}
                    initial="hidden"
                    animate={focus === "right" ? "expanded" : "half"}
                    exit="hidden"
                    transition={SPRING}
                    style={{ minWidth: 0 }}
                  >
                    <PanelExpandButton
                      isExpanded={focus === "right"}
                      onToggle={expandRight}
                      expandLabel="Expand"
                      collapseIcon={<PanelLeftClose className="w-3.5 h-3.5" />}
                      isDark={isDark}
                    />
                    <ContentComposer
                      templateContents={templateContents}
                      setTemplateContent={setTemplateContent}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <MessageComposerModal
          isOpen={showMessageComposer}
          onClose={() => setShowMessageComposer(false)}
          recipientCount={selectedBacklogIds.size}
          onSend={handleSendMessage}
        />

        <SendResultsModal
          isOpen={showSendResults}
          onClose={() => setShowSendResults(false)}
          results={sendResults}
        />
      </div>
    </DndProvider>
  );
}
