import clsx from "clsx";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { useTranslation } from "react-i18next";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import {
  X,
  Send,
  List,
  Edit3,
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
import { Spinner } from "@/components/shared";
import { PublishButton } from "@/components/btns";
import DraftButton from "@/components/btns/DraftButton";
// import { ConfirmDialog } from "@/components/shared";

import {
  usePanelLayout,
  useContentTabs,
  useContentData,
  useContentTemplate,
} from "./hooks";

interface SendResult {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  emailStatus: "success" | "failed";
  smsStatus: "success" | "failed";
  errorMessage?: string;
}

// ─── Animation config ──────────────────────────────────────────────────────────

const SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.8,
} as const;

const panelVariants = {
  expanded: { flexGrow: 1, flexBasis: 0, opacity: 1 },
  half: { flexGrow: 1, flexBasis: "50%", opacity: 1 },
  hidden: { flexGrow: 0, flexBasis: 0, opacity: 0, overflow: "hidden" },
};

// ─── PanelExpandButton ─────────────────────────────────────────────────────────

interface PanelExpandButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseIcon: React.ReactNode;
  isDark: boolean;
  posClass: string;
  t: (key: string) => string;
}

const PanelExpandButton = ({
  t,
  isExpanded,
  onToggle,
  expandLabel,
  collapseIcon,
  isDark,
  posClass,
}: PanelExpandButtonProps) => (
  <motion.button
    onClick={onToggle}
    title={isExpanded ? "Split view" : expandLabel}
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0 }}
    className={clsx(
      "absolute z-50 flex items-center gap-1 py-2 rounded-md text-xs font-medium",
      "hidden md:group-hover:flex transition-opacity duration-150",
      isExpanded
        ? "left-0 right-0 mx-auto w-max top-0 px-4"
        : `px-2 top-0 ${posClass}`,
      isDark
        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
        : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200",
    )}
  >
    {isExpanded ? (
      <>
        {collapseIcon} {t("split")}
      </>
    ) : (
      <>
        <Maximize2 className="w-3.5 h-3.5" /> {expandLabel}
      </>
    )}
  </motion.button>
);

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContentMgmtPage() {
  const { t } = useTranslation("content");
  const { isDark, language, isRTL } = useThemeClasses();
  const { dmoId, authorityId, associatedWebsite } = useAppSelector(
    (state) => state.auth,
  );

  const [externalApiId, setExternalApiId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TViewMode>(
    (localStorage.getItem("contentViewMode") as TViewMode) ?? "grid",
  );

  // ── Hooks ────────────────────────────────────────────────────────────────────

  const panel = usePanelLayout();

  const tabs = useContentTabs(externalApiId);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const selectedWebsite = (associatedWebsite as IWebsite[]).find(
    (w) => w._id === externalApiId,
  );
  const isMarketplace = selectedWebsite?.purpose === "MARKETPLACE";
  const selectedWebsiteName = selectedWebsite?.name ?? "";

  const data = useContentData({
    selected: tabs.selected,
    tabState: tabs.tabState,
    externalApiId,
    dmoId,
    authorityId,
    language,
    isMarketplace,
  });

  const template = useContentTemplate({
    externalApiId,
    dmoId,
    authorityId,
    combinedBusinesses: data.combinedBusinesses,
    combinedProducts: data.combinedProducts,
    selected: tabs.selected,
    filters: tabs.filters,
    searchQuery: tabs.searchQuery,
  });

  // ── Message composer (mock) ──────────────────────────────────────────────────

  const [selectedBacklogIds, setSelectedBacklogIds] = useState<Set<string>>(
    new Set(),
  );
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showSendResults, setShowSendResults] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);

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

  const marketplaceHiddenTabs = isMarketplace
    ? ["Businesses"] // MARKETPLACE: show only Products
    : ["Products"]; // TRAVELLER: show only Businesses

  // When switching to a marketplace site, jump off any now-hidden tab
  // When switching to a TRAVELLER site, jump off Products tab
  useEffect(() => {
    if (marketplaceHiddenTabs.includes(tabs.selected)) {
      tabs.setSelected(isMarketplace ? "Products" : "Businesses");
    }
  }, [isMarketplace]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={clsx(
          "h-[86vh] transition-colors flex flex-col p-2 rounded-2xl",
          isDark ? "bg-gray-900" : "bg-gray-50",
        )}
      >
        <Spinner
          isLoading={template.isTemplateFetching || template.isTemplateLoading}
        />

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
              <div className="flex flex-col sm:flex-row justify-between items-start w-full gap-3">
                <div className="flex flex-col">
                  <h1
                    className={clsx(
                      "text-xl sm:text-2xl font-bold mb-1",
                      isDark ? "text-gray-400" : "text-gray-900",
                    )}
                  >
                    {t("content_manager_title")}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                    {t("content_manager_description")}
                  </p>
                </div>

                <div className="flex gap-2 sm:gap-3 sm:mt-4 shrink-0">
                  <DraftButton
                    onClick={() => template.handleSubmit("DRAFT")}
                    isLoading={template.isCreating || template.isUpdating}
                  />
                  <PublishButton
                    onClick={() => template.handleSubmit("APPROVED")}
                    isLoading={template.isCreating || template.isUpdating}
                  />
                </div>
              </div>

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

            {/* ── Mobile panel switcher ── */}
            <div
              className={clsx(
                "md:hidden flex border-b shrink-0 mt-2",
                isDark ? "border-gray-700" : "border-gray-200",
              )}
            >
              <button
                onClick={() => panel.setMobilePanel("left")}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  panel.mobilePanel === "left"
                    ? "border-teal-500 text-teal-600"
                    : isDark
                      ? "border-transparent text-gray-400"
                      : "border-transparent text-gray-500",
                )}
              >
                <List className="w-4 h-4" />
                {t("source_backlog_title")}
              </button>
              <button
                onClick={() => panel.setMobilePanel("right")}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  panel.mobilePanel === "right"
                    ? "border-teal-500 text-teal-600"
                    : isDark
                      ? "border-transparent text-gray-400"
                      : "border-transparent text-gray-500",
                )}
              >
                <Edit3 className="w-4 h-4" />
                {t("content_composer_title")}
              </button>
            </div>

            {/* ── Two-panel layout ── */}
            <div className="flex gap-0 flex-1 overflow-hidden min-h-0">
              {/* ── LEFT: Contents ── */}
              <AnimatePresence initial={false}>
                {panel.effectiveFocus !== "right" && (
                  <motion.div
                    key="left-panel"
                    className="group relative flex flex-col min-w-0 overflow-hidden"
                    variants={panelVariants}
                    initial="hidden"
                    animate={
                      panel.effectiveFocus === "left" ? "expanded" : "half"
                    }
                    exit="hidden"
                    transition={SPRING}
                    style={{ minWidth: 0 }}
                  >
                    <PanelExpandButton
                      t={t}
                      isDark={isDark}
                      onToggle={panel.expandLeft}
                      expandLabel={t("expand")}
                      isExpanded={panel.effectiveFocus === "left"}
                      posClass={isRTL ? "left-0" : "right-0"}
                      collapseIcon={<PanelRightClose className="w-3.5 h-3.5" />}
                    />

                    {!externalApiId ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={clsx(
                            "w-20 h-20 opacity-30",
                            isDark ? "text-gray-400" : "text-gray-400",
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.2}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <p
                          className={clsx(
                            "text-base font-semibold",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          {t("select_website_first")}
                        </p>
                        <p
                          className={clsx(
                            "text-sm",
                            isDark ? "text-gray-600" : "text-gray-400",
                          )}
                        >
                          {t("select_website_first_subtitle")}
                        </p>
                      </div>
                    ) : (
                      <Contents
                        currentTab={tabs.currentTab}
                        selected={tabs.selected}
                        setSelected={tabs.setSelected}
                        isExpanded={panel.effectiveFocus === "both"}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        totalData={data.totalData}
                        tabCounts={data.tabCounts}
                        tabLoadings={data.tabLoadings}
                        combinedBusinesses={data.combinedItems}
                        clearFilter={tabs.clearFilter}
                        filters={tabs.filters}
                        setFilters={tabs.setFilters}
                        searchQuery={tabs.searchQuery}
                        setSearchQuery={tabs.setSearchQuery}
                        isLoading={data.activeIsLoading}
                        loadMore={data.activeLoadMore}
                        hasMore={data.activeHasMore}
                        templateContents={template.templateContents}
                        setTemplateContent={template.setTemplateContent}
                        hiddenTabs={marketplaceHiddenTabs}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Animated divider ── */}
              <AnimatePresence>
                {panel.effectiveFocus === "both" && (
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
                {panel.effectiveFocus !== "left" && (
                  <motion.div
                    key="right-panel"
                    className="group relative flex flex-col min-w-0 overflow-hidden"
                    variants={panelVariants}
                    initial="hidden"
                    animate={
                      panel.effectiveFocus === "right" ? "expanded" : "half"
                    }
                    exit="hidden"
                    transition={SPRING}
                    style={{ minWidth: 0 }}
                  >
                    <PanelExpandButton
                      t={t}
                      isDark={isDark}
                      onToggle={panel.expandRight}
                      expandLabel={t("expand")}
                      isExpanded={panel.effectiveFocus === "right"}
                      posClass={isRTL ? "right-0" : "left-0"}
                      collapseIcon={<PanelLeftClose className="w-3.5 h-3.5" />}
                    />
                    <ContentComposer
                      header={template.header}
                      setHeader={template.setHeader}
                      contentStatus={template.contentStatus}
                      isExpanded={panel.effectiveFocus === "both"}
                      externalApiId={externalApiId}
                      setExternalApiId={setExternalApiId}
                      templateContents={template.templateContents}
                      templateContentId={template.templateContentId}
                      setTemplateContent={template.setTemplateContent}
                      onStatusChangeHandler={template.onStatusChangeHandler}
                      views={template.views}
                      isLoadingViews={template.isLoadingViews}
                      websiteName={selectedWebsiteName}
                      onViewSelect={template.handleViewSelect}
                      onViewsRefetch={template.refetchViews}
                      onRefetchTemplate={template.refetchTemplate}
                      hasUnsavedContent={template.hasUnsavedContent}
                      onSaveCurrentAsView={template.handleSaveCurrentAsView}
                      isSavingCurrentAsView={
                        template.isCreating || template.isUpdating
                      }
                      isMarketplace={isMarketplace}
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

        {/* {template.blocker.state === "blocked" && (
          <ConfirmDialog
            open
            title="No Active View"
            message="This website has no active view — content will not appear on the site. Are you sure you want to leave?"
            confirmText="Leave Anyway"
            cancelText="Stay"
            variant="warning"
            onConfirm={() => template.blocker.proceed?.()}
            onCancel={() => template.blocker.reset?.()}
          />
        )} */}
      </div>
    </DndProvider>
  );
}
