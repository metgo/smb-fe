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
import { Spinner } from "@/components/shared";
import { PublishButton } from "@/components/btns";
import { skipToken } from "@reduxjs/toolkit/query";
import DraftButton from "@/components/btns/DraftButton";
import { useGetAllbusinessesQuery } from "@/store/api/businessQueryApi";
import { useGetContentByExternalIdQuery } from "@/store/api/contentQueryApi";
import {
  useCreateContentMutation,
  useUpdateContentMutation,
} from "@/store/api/contentMutationApi";
import { useGetAllProductsQuery } from "@/store/api/productQueryApi";
import { useGetAllTripsQuery } from "@/store/api/tripsQueryApi";
import { useGetAllEventsQuery } from "@/store/api/eventQueryApi";
import { useGetAllPOIQuery } from "@/store/api/poiQueryApi";

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
      "hidden group-hover:flex transition-opacity duration-150",
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentMgmtPage() {
  const { t } = useTranslation("content");
  const { t: tt } = useTranslation("toast");
  const [selected, setSelected] = useState<string | null>(null);

  const { isDark, language, isRTL } = useThemeClasses();

  const { dmoId, authorityId, startDate, endDate, websiteId } = useAppSelector(
    (state) => state.auth,
  );

  const [viewMode, setViewMode] = useState<TViewMode>(
    (localStorage.getItem("contentViewMode") as TViewMode) ?? "grid",
  );
  const [header, setHeader] = useState("<p></p>");
  const [externalApiId, setExternalApiId] = useState("");
  const [contentStatus, setContentStatus] = useState<TStatus>("draft");
  const [templateContentId, setTemplateContentId] = useState<string | null>(
    null,
  );

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();

  const {
    refetch,
    data: templateContentsData,
    isLoading: isTemplateLoading,
    isFetching: isTemplateFetching,
  } = useGetContentByExternalIdQuery(
    externalApiId ? { externalApiId } : skipToken,
  );

  const initialTemplateContent: IContentTemplate[] = [
    {
      topic: t("homepage_hero_section"),
      isHideTopic: false,
      groups: [
        {
          isPrimary: false,
          isHideCategory: false,
          category: "Limited Time Offers",
          contents: [],
        },
      ],
    },
    {
      topic: t("recommended_this_week"),
      isHideTopic: false,
      groups: [
        {
          isPrimary: false,
          isHideCategory: false,
          category: "Trending This Week",
          contents: [],
        },
      ],
    },
    {
      topic: t("featured_businesses"),
      isHideTopic: false,
      groups: [],
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

  useEffect(() => {
    if (templateContentsData && externalApiId) {
      if (externalApiId === templateContentsData.externalApiId._id) {
        const formattedTemplateContents = templateContentsData?.siteTopics?.map(
          (topic) => ({
            topic: topic.title,
            order: topic.order,
            isHideTopic: topic.isArchived,
            groups: topic.siteCategories?.map((item) => ({
              isPrimary: item.isPrimary,
              isHideCategory: item.isArchived,
              category: item.title,
              contents: item?.businessIds?.map((content) => ({
                _id: content._id,
                name: content.name,
                desc: content.description,
                imageUrl: content?.images[0]?.image,
                primaryCategory: content?.primaryCategoryId?.name,
                title: content.name || "", // Provide a fallback if needed
                message: content.description || "", // Provide a fallback if needed
              })),
            })),
          }),
        );
        setContentStatus(
          templateContentsData?.status?.toLowerCase() as TStatus,
        );
        setTemplateContent(formattedTemplateContents);
        setHeader(templateContentsData?.header || "");
        setTemplateContentId(templateContentsData._id);
      } else {
        setHeader("<p></p>");
        setTemplateContentId(null);
        setContentStatus("draft");
        setTemplateContent(initialTemplateContent);
      }
    }
  }, [templateContentsData, externalApiId]);

  // ─── Multi-select state ───────────────────────────────────────────────────
  const [filters, setFilters] = useState<Filters>({
    hasProductFilter: "all",
    primaryCategory: "all",
  });

  // const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const queryParams = useMemo(() => {
    const params: any = {
      // page,
      dmoId,
      startDate,
      endDate,
      authorityId,
      limit: 20,
      locale: language,
      externalApiId: websiteId,
    };

    if (searchQuery) params.search = searchQuery;
    params.status = "APPROVED";
    if (filters.hasProductFilter !== "all")
      params.hasProductFilter = filters.hasProductFilter === "yes";

    return params;
  }, [
    // page,
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

  const {
    data: productData,
    isLoading: isLoadingProduct,
    isFetching: isFetchingProduct,

    error,
  } = useGetAllProductsQuery({});

  const {
    data: tripData,
    isLoading: isLoadingTrip,
    isFetching: isFetchingTrip,
  } = useGetAllTripsQuery({});

  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isFetching: isFetchingEvent,
  } = useGetAllEventsQuery({});

  const {
    data: poiData,
    isLoading: isLoadingPOI,
    isFetching: isFetchingPOI,
  } = useGetAllPOIQuery({});
  // Replace the single page/search state with per-tab state
  const [tabState, setTabState] = useState<Record<string, { page: number }>>({
    Businesses: { page: 1 },
    Products: { page: 1 },
    Trips: { page: 1 },
    Events: { page: 1 },
    POI: { page: 1 },
  });

  const currentTab = selected ?? "Businesses";
  const page = tabState[currentTab]?.page ?? 1;

  const setPage = (updater: (prev: number) => number) => {
    setTabState((prev) => ({
      ...prev,
      [currentTab]: { page: updater(prev[currentTab]?.page ?? 1) },
    }));
  };
  // const hasMore = businessData?.meta?.hasNextPage;
  const hasMoreBusinesses = businessData?.meta?.hasNextPage;
  const hasMoreProducts = productData?.meta?.hasNextPage;
  const hasMoreTrips = tripData?.meta?.hasNextPage;
  const hasMoreEvents = eventData?.meta?.hasNextPage;
  const hasMorePOI = false; // POI is a flat array with no pagination

  const makeNextPage =
    (tabName: string, canFetch: boolean, fetching: boolean) => () => {
      if (!canFetch || fetching) return;
      setTabState((prev) => ({
        ...prev,
        [tabName]: { page: (prev[tabName]?.page ?? 1) + 1 },
      }));
    };

  // const fetchNextPage = () => {
  //   if (!hasMore || isFetching) return;
  //   setPage((prev) => prev + 1);
  // };

  const dataMap: Record<
    string,
    {
      rawData: any;
      fetchNextPage: () => void;
      hasMore: boolean;
      isLoading: boolean;
    }
  > = {
    Businesses: {
      rawData: businessData,
      fetchNextPage: makeNextPage("Businesses", hasMoreBusinesses, isFetching),
      hasMore: hasMoreBusinesses,
      isLoading,
    },
    Products: {
      rawData: productData,
      fetchNextPage: makeNextPage(
        "Products",
        hasMoreProducts,
        isFetchingProduct,
      ),
      hasMore: hasMoreProducts,
      isLoading: isLoadingProduct,
    },
    Trips: {
      rawData: tripData,
      fetchNextPage: makeNextPage("Trips", hasMoreTrips, isFetchingTrip),
      hasMore: hasMoreTrips,
      isLoading: isLoadingTrip,
    },
    Events: {
      rawData: eventData,
      fetchNextPage: makeNextPage("Events", hasMoreEvents, isFetchingEvent),
      hasMore: hasMoreEvents,
      isLoading: isLoadingEvent,
    },
    POI: {
      rawData: poiData,
      fetchNextPage: () => {},
      hasMore: false,
      isLoading: isLoadingPOI,
    },
  };
  const active = dataMap[selected ?? "Businesses"];

  // useEffect(() => {
  //   setPage(1);
  // }, [searchQuery, filters, dmoId, authorityId, startDate, endDate]);

  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const getItems = (rawData: any, selected: string | null) => {
    if (!rawData) return null;
    if (selected === "POI") return rawData; // POI is the array directly
    return rawData?.data ?? null; // everything else has .data
  };
  useEffect(() => {
    const items = getItems(active?.rawData, selected);
    if (!items) return;

    if (page === 1) {
      setCombinedItems(items);
    } else {
      setCombinedItems((prev) => {
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = items.filter((b: any) => !existingIds.has(b._id));
        return [...prev, ...newItems];
      });
    }
  }, [active?.rawData, selected, page]);

  // useEffect(() => {
  //   if (!businessData?.data) return;
  //   if (page === 1) {
  //     setCombinedBusinesses(businessData.data);
  //   } else {
  //     setCombinedBusinesses((prev) => {
  //       const existingIds = new Set(prev.map((b) => b._id));
  //       const newItems = businessData.data.filter(
  //         (b: any) => !existingIds.has(b._id),
  //       );
  //       return [...prev, ...newItems];
  //     });
  //   }
  // }, [businessData?.data, page]);

  const clearFilter = () => {
    setFilters({
      hasProductFilter: "all",
      primaryCategory: "all",
    });
    setSearchQuery("");
    // setPage(1);
  };

  const onStatusChangeHandler = async (status: string) => {
    if (templateContentId)
      try {
        const res = await updateContent({
          contentId: templateContentId,
          body: {
            externalApiId,
            status: status.toUpperCase(),
          },
        }).unwrap();

        refetch();
        toast.success(res.message);
      } catch (error: any) {
        toast.error(error?.message);
      }
  };

  const handleSubmit = async (status: string) => {
    try {
      const payload = {
        header,
        status,
        externalApiId,
        siteTopics: templateContents
          ?.map((template, index) => {
            const filteredCategories = template?.groups
              ?.filter((group) => group?.contents?.length > 0)
              ?.map((group) => ({
                title: group.category,
                isPrimary: group.isPrimary,
                isArchived: group.isHideCategory,
                businessIds: group.contents.map((item) => item._id),
              }));

            if (!filteredCategories || filteredCategories.length === 0) {
              return null;
            }

            return {
              title: template.topic,
              isArchived: template.isHideTopic,
              order: index,
              siteCategories: filteredCategories,
            };
          })
          ?.filter(Boolean),
      };

      if (!payload.siteTopics?.length) {
        toast.error(tt("empty_content_info"));
        return;
      }
      if (!externalApiId) {
        toast.error(tt("website_select_info"));
        return;
      }

      const res = templateContentId
        ? await updateContent({
            body: payload,
            contentId: templateContentId,
          }).unwrap()
        : await createContent(payload).unwrap();

      toast.success(res?.message || "Saved successfully");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.error ||
        "Something went wrong. Please try again.";

      toast.error(errorMessage);
    }
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
        <Spinner isLoading={isTemplateFetching || isTemplateLoading} />
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
              <div className="flex justify-between items-start w-full">
                {/* left section */}
                <div className="flex flex-col">
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
                </div>

                {/* right section */}
                <div className="flex gap-3 mt-4">
                  <DraftButton
                    onClick={() => handleSubmit("DRAFT")}
                    isLoading={isCreating || isUpdating}
                  />
                  <PublishButton
                    onClick={() => handleSubmit("APPROVED")}
                    isLoading={isCreating || isUpdating}
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
                      t={t}
                      isDark={isDark}
                      onToggle={expandLeft}
                      expandLabel={t("expand")}
                      isExpanded={focus === "left"}
                      posClass={isRTL ? "left-0" : "right-0"}
                      collapseIcon={<PanelRightClose className="w-3.5 h-3.5" />}
                    />
                    <Contents
                      selected={selected}
                      setSelected={setSelected}
                      isExpanded={focus === "both"}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      totalData={active?.rawData?.totalData}
                      combinedBusinesses={combinedItems}
                      fetchNextPage={active.fetchNextPage}
                      clearFilter={clearFilter}
                      hasMore={active.hasMore}
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
                      t={t}
                      isDark={isDark}
                      onToggle={expandRight}
                      expandLabel={t("expand")}
                      isExpanded={focus === "right"}
                      posClass={isRTL ? "right-0" : "left-0"}
                      collapseIcon={<PanelLeftClose className="w-3.5 h-3.5" />}
                    />
                    <ContentComposer
                      header={header}
                      setHeader={setHeader}
                      contentStatus={contentStatus}
                      isExpanded={focus === "both"}
                      externalApiId={externalApiId}
                      setExternalApiId={setExternalApiId}
                      templateContents={templateContents}
                      templateContentId={templateContentId}
                      setTemplateContent={setTemplateContent}
                      onStatusChangeHandler={onStatusChangeHandler}
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
