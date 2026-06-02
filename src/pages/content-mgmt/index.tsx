import clsx from "clsx";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { useTranslation } from "react-i18next";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { skipToken } from "@reduxjs/toolkit/query";
import { useBlocker } from "react-router-dom";
import DraftButton from "@/components/btns/DraftButton";
import { useGetAllbusinessesQuery } from "@/store/api/businessQueryApi";
import {
  useGetContentByExternalIdQuery,
  useGetAllViewsQuery,
} from "@/store/api/contentQueryApi";
import {
  useCreateContentMutation,
  useUpdateContentMutation,
} from "@/store/api/contentMutationApi";
import { ConfirmDialog } from "@/components/shared";
import { useGetAllProductsQuery } from "@/store/api/productQueryApi";
import { useGetAllTripsQuery } from "@/store/api/tripsQueryApi";
import { useGetAllEventsQuery } from "@/store/api/eventQueryApi";
import { useGetAllPOIQuery } from "@/store/api/poiQueryApi";

type TabState = {
  searchQuery: string;
  filters: Filters;
};
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
  businessId: string;
  registrationFilter: string;
  eventTypeFilter: string;
  dateRangeFilter: {
    start: string;
    end: string;
  };
  isTrip: string;
  assignmentStatus: string;
  viewCategory: string;
  sortOrder: string;
}

const BUSINESS_PAGE_LIMIT = 20;
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentMgmtPage() {
  const { t } = useTranslation("content");
  const { t: tt } = useTranslation("toast");
  const [selected, setSelected] = useState<string>("Businesses");

  const { isDark, language, isRTL } = useThemeClasses();

  const { dmoId, authorityId, associatedWebsite } = useAppSelector(
    (state) => state.auth,
  );

  const [viewMode, setViewMode] = useState<TViewMode>(
    (localStorage.getItem("contentViewMode") as TViewMode) ?? "grid",
  );
  const [header, setHeader] = useState("<p></p>");
  const [externalApiId, setExternalApiId] = useState<string | null>(null);
  const [contentStatus, setContentStatus] = useState<TStatus>("draft");
  const [templateContentId, setTemplateContentId] = useState<string | null>(
    null,
  );

  const [isApiIdChanging, setIsApiIdChanging] = useState(false);

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();

  // ── Views (multi-view system) ──────────────────────────────────────────────
  const {
    data: viewsData,
    isLoading: isLoadingViews,
    refetch: refetchViews,
  } = useGetAllViewsQuery(externalApiId ? { externalApiId } : skipToken);

  const views: IView[] = Array.isArray(viewsData) ? viewsData : [];
  const hasActiveView = views.some((v) => v.isActive);

  // Navigation guard: warn when leaving without an active view
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!externalApiId &&
      views.length > 0 &&
      !hasActiveView &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  const selectedWebsiteName =
    (associatedWebsite as any[])?.find?.((w: any) => w.value === externalApiId)
      ?.label ?? "";

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
      topic: "מה בא לכם לעשות?",
      isPrimary: false,
      isHideTopic: false,
      groups: [
        {
          isPrimary: false,
          isHideCategory: false,
          category: "",
          icon: "",
          contents: [],
        },
      ],
    },
    {
      topic: "מוצרים ושירותים",
      isPrimary: false,
      isHideTopic: false,
      groups: [
        {
          isPrimary: false,
          isHideCategory: false,
          category: "",
          icon: "",
          contents: [],
        },
      ],
    },
  ];

  const [templateContents, setTemplateContent] = useState<IContentTemplate[]>(
    initialTemplateContent,
  );

  const hasUnsavedContent =
    !isLoadingViews &&
    views.length === 0 &&
    !!externalApiId &&
    templateContents.some((t) =>
      t.groups?.some((g) => (g.contents?.length ?? 0) > 0),
    );

  const handleSaveCurrentAsView = async () => {
    await handleSubmit("DRAFT");
    refetchViews();
  };

  const [selectedBacklogIds, setSelectedBacklogIds] = useState<Set<string>>(
    new Set(),
  );
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showSendResults, setShowSendResults] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [focus, setFocus] = useState<PanelFocus>("both");
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const [mobilePanel, setMobilePanel] = useState<"left" | "right">("left");
  const [page, setPage] = useState(1);

  const [productPage, setProductPage] = useState(1);
  const [combinedBusinesses, setCombinedBusinesses] = useState<any[]>([]);
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);

  const defaultTabState: TabState = {
    searchQuery: "",
    filters: {
      hasProductFilter: "all",
      primaryCategory: "all",
      businessId: "",
      registrationFilter: "",
      eventTypeFilter: "",
      dateRangeFilter: {
        start: "",
        end: "",
      },
      isTrip: "all",
      assignmentStatus: "all",
      viewCategory: "all",
      sortOrder: "recent",
    },
  };

  // Replace the single page/search state with per-tab state
  const [tabState, setTabState] = useState<Record<string, TabState>>({
    Businesses: { ...defaultTabState },
    Products: { ...defaultTabState },
    Trips: { ...defaultTabState },
    Events: { ...defaultTabState },
    POI: { ...defaultTabState },
  });

  const initializedRef = useRef(false);
  const businessInitializedRef = useRef(false);
  const productInitializedRef = useRef(false);

  // Reset all state when externalApiId changes (new site selection = clean slate)
  useEffect(() => {
    if (!externalApiId) return;
    setIsApiIdChanging(true);
    if (selected === "Products") setSelected("Businesses");
    initializedRef.current = false;
    businessInitializedRef.current = false;
    productInitializedRef.current = false;
    setHeader("<p></p>");
    setTemplateContentId(null);
    setContentStatus("draft");
    setTemplateContent(initialTemplateContent);
    setSelectedBacklogIds(new Set());
    setPage(1);
    setProductPage(1);
    setCombinedBusinesses([]);
    setCombinedProducts([]);
    setTabState({
      Businesses: { ...defaultTabState },
      Products: { ...defaultTabState },
      Trips: { ...defaultTabState },
      Events: { ...defaultTabState },
      POI: { ...defaultTabState },
    });
  }, [externalApiId]);

  // Recreate initialTemplateContent when dmoId or authorityId changes
  useEffect(() => {
    initializedRef.current = false;
    businessInitializedRef.current = false;
    productInitializedRef.current = false;
    setTemplateContent(initialTemplateContent);
  }, [dmoId, authorityId]);

  useEffect(() => {
    if (templateContentsData && externalApiId) {
      if (externalApiId === templateContentsData?.externalApiId?._id) {
        const formattedTemplateContents = templateContentsData?.siteTopics?.map(
          (topic) => ({
            topic: topic.title,
            order: topic.order,
            isHideTopic: topic.isArchived,
            groups: topic.siteCategories?.map((item) => {
              const mapContents = (
                arr: IContentFeedItem[],
                type: IContent["contentType"],
              ) =>
                (arr ?? []).map((content) => ({
                  _id: content._id,
                  name: content.name,
                  desc: content.description,
                  imageUrl: content?.images[0]?.image,
                  primaryCategory: content?.primaryCategoryId?.hebrewName,
                  contentType: type,
                  title: content.name || "",
                  message: content.description || "",
                }));

              return {
                isPrimary: item.isPrimary,
                isHideCategory: item.isArchived,
                category: item.title,
                icon: item.icon,
                colors: item.colors ?? [],
                contents: [
                  ...mapContents(item.businessIds, "business"),
                  ...mapContents(item.productIds, "product"),
                  ...mapContents(item.tripIds, "trip"),
                  ...mapContents(item.eventIds, "event"),
                  ...mapContents(item.poiIds, "poi"),
                ],
              };
            }),
            isPrimary: topic.isPrimary,
            icon: topic.icon,
            colors: topic.colors ?? [],
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

  const businessTab = tabState["Businesses"];
  const productTab = tabState["Products"];
  const tripTab = tabState["Trips"];
  const eventTab = tabState["Events"];
  const poiTab = tabState["POI"];

  const businessParams = useMemo(() => {
    const { searchQuery, filters } = tabState["Businesses"];
    const params: any = {
      dmoId,
      authorityId,
      locale: language,
      status: "APPROVED",
      page,
      externalApiId,
      limit: BUSINESS_PAGE_LIMIT,
    };
    if (searchQuery) params.search = searchQuery;
    if (filters.hasProductFilter !== "all")
      params.hasProductFilter = filters.hasProductFilter === "yes";
    if (filters.primaryCategory !== "all")
      params.primaryCategory = filters.primaryCategory;
    return params;
  }, [businessTab, dmoId, authorityId, language, page, externalApiId]);

  const productParams = useMemo(() => {
    const { searchQuery, filters } = tabState["Products"];
    const params: any = {
      status: "APPROVED",
      dmoId,
      authorityId,
      externalApiId,
      limit: BUSINESS_PAGE_LIMIT,
      page: productPage,
    };
    if (filters.businessId) {
      params.businessId = filters.businessId;
    }
    if (searchQuery) params.search = searchQuery;
    return params;
  }, [productTab, language, dmoId, authorityId, externalApiId, productPage]);

  const tripParams = useMemo(() => {
    const { searchQuery, filters } = tabState["Trips"];
    const params: any = {
      dmoId,
      authorityId,
      limit: BUSINESS_PAGE_LIMIT,
    };

    if (filters.isTrip !== "all") {
      params.isTrip = filters.isTrip;
    }
    if (searchQuery) params.search = searchQuery;

    return params;
  }, [tripTab, language, authorityId, dmoId]);

  const eventParams = useMemo(() => {
    const { searchQuery, filters } = tabState["Events"];
    const params: any = { status: "APPROVED", limit: BUSINESS_PAGE_LIMIT };
    if (searchQuery) params.search = searchQuery;
    if (filters.registrationFilter !== "all") {
      params.isRegistration = filters.registrationFilter;
    }
    if (filters.eventTypeFilter !== "all") {
      params.isRegistration = filters.eventTypeFilter;
    }

    if (filters.dateRangeFilter.start) {
      params.startDate = filters.dateRangeFilter.start;
    }

    if (filters.dateRangeFilter.end) {
      params.endDate = filters.dateRangeFilter.end;
    }
    return params;
  }, [eventTab, language]);

  const poiParams = useMemo(() => {
    const params: any = {
      dmoId,
      authorityId,
      limit: BUSINESS_PAGE_LIMIT,
    };
    return params;
  }, [poiTab, language, dmoId, authorityId]);

  const {
    data: businessData,
    isLoading,
    isFetching,
  } = useGetAllbusinessesQuery(externalApiId ? businessParams : skipToken);

  const businessHasMore = businessData?.meta?.hasNextPage;

  useEffect(() => {
    setPage(1);
    setCombinedBusinesses([]);
  }, [
    businessTab.searchQuery,
    businessTab.filters,
    dmoId,
    authorityId,
    externalApiId,
  ]);

  useEffect(() => {
    if (!businessData?.data) return;
    if (page === 1) {
      setIsApiIdChanging(false);
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
    if (!businessHasMore || isFetching) return;
    setPage((prev) => prev + 1);
  };

  const {
    data: productData,
    isLoading: isLoadingProduct,
    isFetching: isFetchingProduct,
  } = useGetAllProductsQuery(
    selected === "Products" && externalApiId ? productParams : skipToken,
  );

  const productHasMore = productData?.meta?.hasNextPage;

  useEffect(() => {
    setProductPage(1);
    setCombinedProducts([]);
  }, [productTab.searchQuery, productTab.filters, dmoId, authorityId]);

  useEffect(() => {
    if (!productData?.data) return;
    if (productPage === 1) {
      setCombinedProducts(productData.data);
    } else {
      setCombinedProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newItems = productData.data.filter(
          (p: any) => !existingIds.has(p._id),
        );
        return [...prev, ...newItems];
      });
    }
  }, [productData?.data, productPage]);

  const fetchNextProductPage = () => {
    if (!productHasMore || isFetchingProduct) return;
    setProductPage((prev) => prev + 1);
  };

  const { data: tripData, isLoading: isLoadingTrip } = useGetAllTripsQuery(
    selected === "Trips" ? tripParams : skipToken,
  );

  const { data: eventData, isLoading: isLoadingEvent } = useGetAllEventsQuery(
    selected === "Events" ? eventParams : skipToken,
  );

  const { data: poiData, isLoading: isLoadingPOI } = useGetAllPOIQuery(
    selected === "POI" ? poiParams : skipToken,
  );

  const currentTab = selected ?? "Businesses";
  const { searchQuery, filters } = tabState[currentTab];

  const setSearchQuery = useCallback(
    (value: string) =>
      setTabState((prev) => ({
        ...prev,
        [currentTab]: { ...prev[currentTab], searchQuery: value },
      })),
    [currentTab],
  );

  const setFilters = (value: Filters | ((prev: Filters) => Filters)) =>
    setTabState((prev) => {
      const next =
        typeof value === "function" ? value(prev[currentTab].filters) : value;
      return {
        ...prev,
        [currentTab]: { ...prev[currentTab], filters: next },
      };
    });

  const clearFilter = () => {
    setTabState((prev) => ({
      ...prev,
      [currentTab]: { ...defaultTabState },
    }));
  };

  useEffect(() => {
    if (templateContentId) return;
    initializedRef.current = false;
    businessInitializedRef.current = false;
    productInitializedRef.current = false;
  }, [filters, searchQuery]);

  useEffect(() => {
    if (templateContentId) return;
    initializedRef.current = false;
    businessInitializedRef.current = false;
    productInitializedRef.current = false;
  }, [selected]);

  const dataMap: Record<
    string,
    {
      rawData: any;
      isLoading: boolean;
      loadMore?: () => void;
      hasMore?: boolean;
    }
  > = {
    Businesses: {
      rawData: combinedBusinesses,
      isLoading,
      loadMore: fetchNextPage,
      hasMore: businessHasMore,
    },
    Products: {
      rawData: combinedProducts,
      isLoading: isLoadingProduct,
      loadMore: fetchNextProductPage,
      hasMore: productHasMore,
    },
    Trips: { rawData: tripData, isLoading: isLoadingTrip },
    Events: { rawData: eventData, isLoading: isLoadingEvent },
    POI: { rawData: poiData, isLoading: isLoadingPOI },
  };
  const active = dataMap[selected ?? "Businesses"];

  const getItems = (rawData: any, tab: string | null) => {
    if (!rawData) return [];
    if (tab === "POI" || tab === "Businesses" || tab === "Products")
      return rawData;
    return rawData?.data ?? [];
  };
  const combinedItems: any[] = getItems(active?.rawData, selected);

  const buildGroups = (
    items: any[],
    contentType: IContent["contentType"],
  ): IContentGroup[] => {
    const grouped = items.reduce<Record<string, IContent[]>>((acc, item) => {
      const categoryName = item?.primaryCategoryId?.hebrewName;
      if (!categoryName) return acc;
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push({
        _id: item._id,
        name: item.name,
        desc: item.shortDescription || item.description || "",
        imageUrl: item?.images?.[0]?.image || "",
        primaryCategory: categoryName,
        contentType,
        title: item.name || "",
        message: item.shortDescription || item.description || "",
      });
      return acc;
    }, {});

    return (Object.entries(grouped) as [string, IContent[]][]).map(
      ([category, contents]) => ({
        category,
        isPrimary: false,
        isHideCategory: false,
        contents,
      }),
    );
  };

  // ── Businesses → topic[0] ──────────────────────────────────────────────────
  useEffect(() => {
    if (businessInitializedRef.current) return;
    if (templateContentId) return;
    if (externalApiId && (isTemplateFetching || isTemplateLoading)) return;
    if (
      externalApiId &&
      templateContentsData?.externalApiId?._id === externalApiId
    )
      return;
    if (!combinedBusinesses.length) return;

    const groups = buildGroups(combinedBusinesses, "business");
    if (!groups.length) return;

    businessInitializedRef.current = true;
    setTemplateContent((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex(
        (t) => t.topic === initialTemplateContent[0].topic,
      );
      const topic = {
        topic: initialTemplateContent[0].topic,
        isHideTopic: false,
        groups,
      };
      if (idx !== -1) updated[idx] = topic;
      else updated.unshift(topic);
      return updated;
    });
  }, [
    combinedBusinesses,
    templateContentId,
    externalApiId,
    isTemplateFetching,
    isTemplateLoading,
    templateContentsData,
  ]);

  // ── Products → topic[1] ───────────────────────────────────────────────────
  useEffect(() => {
    if (productInitializedRef.current) return;
    if (templateContentId) return;
    if (externalApiId && (isTemplateFetching || isTemplateLoading)) return;
    if (
      externalApiId &&
      templateContentsData?.externalApiId?._id === externalApiId
    )
      return;
    if (!combinedProducts.length) return;

    const groups = buildGroups(combinedProducts, "product");
    if (!groups.length) return;

    productInitializedRef.current = true;
    setTemplateContent((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex(
        (t) => t.topic === initialTemplateContent[1].topic,
      );
      const topic = {
        topic: initialTemplateContent[1].topic,
        isHideTopic: false,
        groups,
      };
      if (idx !== -1) updated[idx] = topic;
      else updated.push(topic);
      return updated;
    });
  }, [
    combinedProducts,
    templateContentId,
    externalApiId,
    isTemplateFetching,
    isTemplateLoading,
    templateContentsData,
  ]);

  // ── Load a selected view into the composer ────────────────────────────────
  const handleViewSelect = (view: IView) => {
    const formattedTopics = (view.siteTopics ?? []).map((topic) => ({
      topic: topic.title,
      order: topic.order,
      isHideTopic: topic.isArchived,
      isPrimary: topic.isPrimary,
      icon: topic.icon,
      colors: topic.colors ?? [],
      groups: (topic.siteCategories ?? []).map((item) => {
        const mapContents = (
          arr: IContentFeedItem[],
          type: IContent["contentType"],
        ) =>
          (arr ?? []).map((content) => ({
            _id: content._id,
            name: content.name,
            desc: content.description,
            imageUrl: content?.images[0]?.image,
            primaryCategory: content?.primaryCategoryId?.hebrewName,
            contentType: type,
            title: content.name || "",
            message: content.description || "",
          }));

        return {
          isPrimary: item.isPrimary,
          isHideCategory: item.isArchived,
          category: item.title,
          icon: item.icon,
          colors: item.colors ?? [],
          contents: [
            ...mapContents(item.businessIds, "business"),
            ...mapContents(item.productIds, "product"),
            ...mapContents(item.tripIds, "trip"),
            ...mapContents(item.eventIds, "event"),
            ...mapContents(item.poiIds, "poi"),
          ],
        };
      }),
    }));

    setTemplateContent(formattedTopics);
    setTemplateContentId(view._id);
    setContentStatus((view.status?.toLowerCase() ?? "draft") as TStatus);
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
            const TYPE_TO_KEY: Record<string, string> = {
              business: "businessIds",
              product: "productIds",
              trip: "tripIds",
              event: "eventIds",
              poi: "poiIds",
            };

            const filteredCategories = template?.groups
              ?.filter((group) => group?.contents?.length > 0)
              ?.map((group) => {
                const idsByType = group.contents.reduce<
                  Record<string, string[]>
                >((acc, item) => {
                  const key =
                    TYPE_TO_KEY[item.contentType ?? "business"] ??
                    "businessIds";
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(item._id);
                  return acc;
                }, {});

                return {
                  title: group.category,
                  isPrimary: group.isPrimary,
                  isArchived: group.isHideCategory,
                  icon: group.icon,
                  colors: group.colors ?? [],
                  ...idsByType,
                };
              });

            if (!filteredCategories || filteredCategories.length === 0) {
              return null;
            }

            return {
              title: template.topic,
              isPrimary: template.isPrimary,
              isArchived: template.isHideTopic,
              order: index,
              icon: template.icon ?? "",
              colors: template.colors ?? [],
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

      const existingId =
        templateContentId ??
        (templateContentsData?.externalApiId?._id === externalApiId
          ? templateContentsData._id
          : null);

      const res = existingId
        ? await updateContent({
            body: payload,
            contentId: existingId,
          }).unwrap()
        : await createContent(payload).unwrap();

      if (res) {
        setTemplateContentId(res._id || res.id);
        refetch();
        toast.success(res?.message || "Saved successfully");
      }
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const effectiveFocus: PanelFocus = isMobile ? mobilePanel : focus;

  const expandLeft = () => setFocus((p) => (p === "left" ? "both" : "left"));
  const expandRight = () => setFocus((p) => (p === "right" ? "both" : "right"));

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={clsx(
          "h-[86vh] transition-colors flex flex-col p-2 rounded-2xl",
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
              <div className="flex flex-col sm:flex-row justify-between items-start w-full gap-3">
                {/* left section */}
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

                {/* right section */}
                <div className="flex gap-2 sm:gap-3 sm:mt-4 shrink-0">
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

            {/* ── Mobile panel switcher ── */}
            <div
              className={clsx(
                "md:hidden flex border-b shrink-0 mt-2",
                isDark ? "border-gray-700" : "border-gray-200",
              )}
            >
              <button
                onClick={() => setMobilePanel("left")}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  mobilePanel === "left"
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
                onClick={() => setMobilePanel("right")}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  mobilePanel === "right"
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
                {effectiveFocus !== "right" && (
                  <motion.div
                    key="left-panel"
                    className="group relative flex flex-col min-w-0 overflow-hidden"
                    variants={panelVariants}
                    initial="hidden"
                    animate={effectiveFocus === "left" ? "expanded" : "half"}
                    exit="hidden"
                    transition={SPRING}
                    style={{ minWidth: 0 }}
                  >
                    <PanelExpandButton
                      t={t}
                      isDark={isDark}
                      onToggle={expandLeft}
                      expandLabel={t("expand")}
                      isExpanded={effectiveFocus === "left"}
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
                        currentTab={currentTab}
                        selected={selected}
                        setSelected={setSelected}
                        isExpanded={effectiveFocus === "both"}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        totalData={
                          selected === "Products"
                            ? productData?.totalData
                            : active?.rawData?.totalData
                        }
                        tabCounts={{
                          Businesses: businessData?.totalData ?? 0,
                          Products: productData?.totalData ?? 0,
                          Trips: tripData?.totalData ?? 0,
                          Events: eventData?.totalData ?? 0,
                          POI: Array.isArray(poiData)
                            ? poiData.length
                            : (poiData?.totalData ?? 0),
                        }}
                        tabLoadings={{
                          Businesses: isLoading || isApiIdChanging,
                          Products: isLoadingProduct || isApiIdChanging,
                          Trips: isLoadingTrip,
                          Events: isLoadingEvent,
                          POI: isLoadingPOI,
                        }}
                        combinedBusinesses={combinedItems}
                        clearFilter={clearFilter}
                        filters={filters}
                        setFilters={setFilters}
                        searchQuery={searchQuery} //  per-tab
                        setSearchQuery={setSearchQuery} //  per-tab
                        isLoading={active.isLoading}
                        loadMore={active?.loadMore}
                        hasMore={active?.hasMore}
                        templateContents={templateContents}
                        setTemplateContent={setTemplateContent}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Animated divider ── */}
              <AnimatePresence>
                {effectiveFocus === "both" && (
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
                {effectiveFocus !== "left" && (
                  <motion.div
                    key="right-panel"
                    className="group relative flex flex-col min-w-0 overflow-hidden"
                    variants={panelVariants}
                    initial="hidden"
                    animate={effectiveFocus === "right" ? "expanded" : "half"}
                    exit="hidden"
                    transition={SPRING}
                    style={{ minWidth: 0 }}
                  >
                    <PanelExpandButton
                      t={t}
                      isDark={isDark}
                      onToggle={expandRight}
                      expandLabel={t("expand")}
                      isExpanded={effectiveFocus === "right"}
                      posClass={isRTL ? "right-0" : "left-0"}
                      collapseIcon={<PanelLeftClose className="w-3.5 h-3.5" />}
                    />
                    <ContentComposer
                      header={header}
                      setHeader={setHeader}
                      contentStatus={contentStatus}
                      isExpanded={effectiveFocus === "both"}
                      externalApiId={externalApiId}
                      setExternalApiId={setExternalApiId}
                      templateContents={templateContents}
                      templateContentId={templateContentId}
                      setTemplateContent={setTemplateContent}
                      onStatusChangeHandler={onStatusChangeHandler}
                      views={views}
                      isLoadingViews={isLoadingViews}
                      websiteName={selectedWebsiteName}
                      onViewSelect={handleViewSelect}
                      onViewsRefetch={refetchViews}
                      hasUnsavedContent={hasUnsavedContent}
                      onSaveCurrentAsView={handleSaveCurrentAsView}
                      isSavingCurrentAsView={isCreating || isUpdating}
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

        {blocker.state === "blocked" && (
          <ConfirmDialog
            open
            title="No Active View"
            message="This website has no active view — content will not appear on the site. Are you sure you want to leave?"
            confirmText="Leave Anyway"
            cancelText="Stay"
            variant="warning"
            onConfirm={() => blocker.proceed?.()}
            onCancel={() => blocker.reset?.()}
          />
        )}
      </div>
    </DndProvider>
  );
}
