import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { skipToken } from "@reduxjs/toolkit/query";
import { useBlocker } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetContentByExternalIdQuery,
  useGetAllViewsQuery,
} from "@/store/api/contentQueryApi";
import {
  useCreateContentMutation,
  useUpdateContentMutation,
} from "@/store/api/contentMutationApi";
import type { Filters } from "./useContentTabs";

const TYPE_TO_KEY: Record<string, string> = {
  business: "businessIds",
  product: "productIds",
  trip: "tripIds",
  event: "eventIds",
  poi: "poiIds",
};

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

function buildGroups(
  items: any[],
  contentType: IContent["contentType"],
): IContentGroup[] {
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
}

function mapContents(
  arr: IContentFeedItem[],
  type: IContent["contentType"],
): IContent[] {
  return (arr ?? []).map((content) => ({
    _id: content._id,
    name: content.name,
    desc: content.description,
    imageUrl: content?.images[0]?.image,
    primaryCategory: content?.primaryCategoryId?.hebrewName,
    contentType: type,
    title: content.name || "",
    message: content.description || "",
  }));
}

interface UseContentTemplateParams {
  externalApiId: string | null;
  dmoId: string;
  authorityId: string;
  combinedBusinesses: any[];
  combinedProducts: any[];
  selected: string;
  filters: Filters;
  searchQuery: string;
}

export function useContentTemplate({
  externalApiId,
  dmoId,
  authorityId,
  combinedBusinesses,
  combinedProducts,
  selected,
  filters,
  searchQuery,
}: UseContentTemplateParams) {
  const { t: tt } = useTranslation("toast");

  const [header, setHeader] = useState("<p></p>");
  const [contentStatus, setContentStatus] = useState<TStatus>("draft");
  const [templateContentId, setTemplateContentId] = useState<string | null>(
    null,
  );
  const [templateContents, setTemplateContent] = useState<IContentTemplate[]>(
    initialTemplateContent,
  );

  const businessInitializedRef = useRef(false);
  const productInitializedRef = useRef(false);

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

  const {
    data: viewsData,
    isLoading: isLoadingViews,
    refetch: refetchViews,
  } = useGetAllViewsQuery(externalApiId ? { externalApiId } : skipToken);

  const views: IView[] = Array.isArray(viewsData) ? viewsData : [];
  const hasActiveView = views.some((v) => v.isActive);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!externalApiId &&
      views.length > 0 &&
      !hasActiveView &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  // ── Reset on website change ─────────────────────────────────────────────────
  useEffect(() => {
    if (!externalApiId) return;
    businessInitializedRef.current = false;
    productInitializedRef.current = false;
    setHeader("<p></p>");
    setTemplateContentId(null);
    setContentStatus("draft");
    setTemplateContent(initialTemplateContent);
  }, [externalApiId]);

  // ── Reset on auth context change ────────────────────────────────────────────
  useEffect(() => {
    businessInitializedRef.current = false;
    productInitializedRef.current = false;
    setTemplateContent(initialTemplateContent);
  }, [dmoId, authorityId]);

  // ── Reset init refs when tab, filter, or search changes ────────────────────
  useEffect(() => {
    if (templateContentId) return;
    businessInitializedRef.current = false;
    productInitializedRef.current = false;
  }, [filters, searchQuery]);

  useEffect(() => {
    if (templateContentId) return;
    businessInitializedRef.current = false;
    productInitializedRef.current = false;
  }, [selected]);

  // ── Load template from server ───────────────────────────────────────────────
  useEffect(() => {
    if (!templateContentsData || !externalApiId) return;

    if (externalApiId !== templateContentsData?.externalApiId?._id) {
      setHeader("<p></p>");
      setTemplateContentId(null);
      setContentStatus("draft");
      setTemplateContent(initialTemplateContent);
      return;
    }

    const formatted = templateContentsData?.siteTopics?.map((topic) => ({
      topic: topic.title,
      order: topic.order,
      isHideTopic: topic.isArchived,
      isPrimary: topic.isPrimary,
      icon: topic.icon,
      colors: topic.colors ?? [],
      groups: topic.siteCategories?.map((item) => ({
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
      })),
    }));

    setContentStatus(templateContentsData?.status?.toLowerCase() as TStatus);
    setTemplateContent(formatted);
    setHeader(templateContentsData?.header || "");
    setTemplateContentId(templateContentsData._id);
  }, [templateContentsData, externalApiId]);

  // ── Auto-populate businesses → topic[0] ────────────────────────────────────
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

  // ── Auto-populate products → topic[1] ──────────────────────────────────────
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

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleViewSelect = (view: IView | IContentTemplateResponse) => {
    if (!view) return;
    const formattedTopics = (view.siteTopics ?? []).map((topic) => ({
      topic: topic.title,
      order: topic.order,
      isHideTopic: topic.isArchived,
      isPrimary: topic.isPrimary,
      icon: topic.icon,
      colors: topic.colors ?? [],
      groups: (topic.siteCategories ?? []).map((item) => ({
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
      })),
    }));

    setTemplateContent(formattedTopics);
    setTemplateContentId(view._id);
    setContentStatus((view.status?.toLowerCase() ?? "draft") as TStatus);
    if ("header" in view) setHeader(view.header || "<p></p>");
  };

  const onStatusChangeHandler = async (status: string) => {
    if (!templateContentId) return;
    try {
      const res = await updateContent({
        contentId: templateContentId,
        body: { externalApiId, status: status.toUpperCase() },
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
              ?.filter((group) => group?.category?.trim())
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
                  description: group.description,
                  isPrimary: group.isPrimary,
                  isArchived: group.isHideCategory,
                  icon: group.icon,
                  colors: group.colors ?? [],
                  businessIds: idsByType.businessIds ?? [],
                  productIds: idsByType.productIds ?? [],
                  tripIds: idsByType.tripIds ?? [],
                  eventIds: idsByType.eventIds ?? [],
                  poiIds: idsByType.poiIds ?? [],
                  fundayIds: idsByType.fundayIds ?? [],
                  ...idsByType,
                };
              });

            if (!filteredCategories || filteredCategories.length === 0)
              return null;

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
        ? await updateContent({ body: payload, contentId: existingId }).unwrap()
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

  const handleSaveCurrentAsView = async () => {
    await handleSubmit("DRAFT");
    refetchViews();
  };

  const hasUnsavedContent =
    !isLoadingViews &&
    views.length === 0 &&
    !!externalApiId &&
    templateContents.some((t) =>
      t.groups?.some((g) => (g.contents?.length ?? 0) > 0),
    );

  return {
    header,
    setHeader,
    contentStatus,
    templateContentId,
    templateContents,
    setTemplateContent,
    isCreating,
    isUpdating,
    isTemplateLoading,
    isTemplateFetching,
    views,
    isLoadingViews,
    hasActiveView,
    blocker,
    hasUnsavedContent,
    handleViewSelect,
    onStatusChangeHandler,
    handleSubmit,
    handleSaveCurrentAsView,
    refetchViews,
  };
}
