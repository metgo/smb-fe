import { toast } from "sonner";
import { useBlocker } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { skipToken } from "@reduxjs/toolkit/query";

import {
  useGetContentByExternalIdQuery,
  useGetAllViewsQuery,
} from "@/store/api/contentQueryApi";
import {
  useCreateContentMutation,
  useUpdateContentMutation,
  useActivateViewMutation,
} from "@/store/api/contentMutationApi";
import type { Filters } from "./useContentTabs";

const TYPE_TO_KEY: Record<string, string> = {
  business: "businessIds",
  product: "productIds",
};

const initialTemplateContent: IContentTemplate[] = [
  {
    topic: "מה בא לכם לעשות?",
    topicHe: "מה בא לכם לעשות?",
    topicAr: "",
    description: "",
    descriptionHe: "",
    descriptionAr: "",
    isPrimary: false,
    isHideTopic: false,
    groups: [
      {
        isPrimary: false,
        isHideCategory: false,
        category: "",
        categoryHe: "",
        categoryAr: "",
        description: "",
        descriptionHe: "",
        descriptionAr: "",
        synonyms: [],
        synonymsHe: [],
        synonymsAr: [],
        searchKeywords: [],
        searchKeywordsHe: [],
        searchKeywordsAr: [],
        icon: "",
        contents: [],
      },
    ],
  },
  {
    topic: "מוצרים ושירותים",
    topicHe: "מוצרים ושירותים",
    topicAr: "",
    description: "",
    descriptionHe: "",
    descriptionAr: "",
    isPrimary: false,
    isHideTopic: false,
    groups: [
      {
        isPrimary: false,
        isHideCategory: false,
        category: "",
        categoryHe: "",
        categoryAr: "",
        description: "",
        descriptionHe: "",
        descriptionAr: "",
        synonyms: [],
        synonymsHe: [],
        synonymsAr: [],
        searchKeywords: [],
        searchKeywordsHe: [],
        searchKeywordsAr: [],
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
      nameHe: item.nameHe,
      nameAr: item.nameAr,
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
      categoryHe: category,
      categoryAr: category,
      description: "",
      descriptionHe: "",
      descriptionAr: "",
      synonyms: [],
      synonymsHe: [],
      synonymsAr: [],
      searchKeywords: [],
      searchKeywordsHe: [],
      searchKeywordsAr: [],
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
    nameHe: content.nameHe,
    nameAr: content.nameAr,
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
  const [activateView] = useActivateViewMutation();

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

  // const blocker = useBlocker(
  //   ({ currentLocation, nextLocation }) =>
  //     !!externalApiId &&
  //     views.length > 0 &&
  //     !hasActiveView &&
  //     currentLocation.pathname !== nextLocation.pathname,
  // );

  const blocker = useBlocker(() => false);

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
      topicHe: topic.titleHe ?? "",
      topicAr: topic.titleAr ?? "",
      description: topic.description ?? "",
      descriptionHe: topic.descriptionHe ?? "",
      descriptionAr: topic.descriptionAr ?? "",
      order: topic.order,
      isHideTopic: topic.isArchived,
      isPrimary: topic.isPrimary,
      icon: topic.icon,
      colors: topic.colors ?? [],
      groups: topic.siteCategories?.map((item) => ({
        isPrimary: item.isPrimary,
        isHideCategory: item.isArchived,
        category: item.title,
        categoryHe: item.titleHe ?? "",
        categoryAr: item.titleAr ?? "",
        description: item.description ?? "",
        descriptionHe: item.descriptionHe ?? "",
        descriptionAr: item.descriptionAr ?? "",
        icon: item.icon,
        colors: item.colors ?? [],
        synonyms: (item as any).synonyms ?? [],
        synonymsHe: (item as any).synonymsHe ?? [],
        synonymsAr: (item as any).synonymsAr ?? [],
        searchKeywords: (item as any).searchKeywords ?? [],
        searchKeywordsHe: (item as any).searchKeywordsHe ?? [],
        searchKeywordsAr: (item as any).searchKeywordsAr ?? [],
        contents: [
          ...mapContents(item.businessIds, "business"),
          ...mapContents(item.productIds, "product"),
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
      const topic: IContentTemplate = {
        topic: initialTemplateContent[0].topic,
        topicHe: initialTemplateContent[0].topicHe,
        topicAr: initialTemplateContent[0].topicAr,
        description: "",
        descriptionHe: "",
        descriptionAr: "",
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
      const topic: IContentTemplate = {
        topic: initialTemplateContent[1].topic,
        topicHe: initialTemplateContent[1].topicHe,
        topicAr: initialTemplateContent[1].topicAr,
        description: "",
        descriptionHe: "",
        descriptionAr: "",
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
      topicHe: topic.titleHe ?? "",
      topicAr: topic.titleAr ?? "",
      description: topic.description ?? "",
      descriptionHe: topic.descriptionHe ?? "",
      descriptionAr: topic.descriptionAr ?? "",
      order: topic.order,
      isHideTopic: topic.isArchived,
      isPrimary: topic.isPrimary,
      icon: topic.icon,
      colors: topic.colors ?? [],
      groups: (topic.siteCategories ?? []).map((item) => ({
        isPrimary: item.isPrimary,
        isHideCategory: item.isArchived,
        category: item.title,
        categoryHe: item.titleHe ?? "",
        categoryAr: item.titleAr ?? "",
        description: item.description ?? "",
        descriptionHe: item.descriptionHe ?? "",
        descriptionAr: item.descriptionAr ?? "",
        icon: item.icon,
        colors: item.colors ?? [],
        synonyms: (item as any).synonyms ?? [],
        synonymsHe: (item as any).synonymsHe ?? [],
        synonymsAr: (item as any).synonymsAr ?? [],
        searchKeywords: (item as any).searchKeywords ?? [],
        searchKeywordsHe: (item as any).searchKeywordsHe ?? [],
        searchKeywordsAr: (item as any).searchKeywordsAr ?? [],
        contents: [
          ...mapContents(item.businessIds, "business"),
          ...mapContents(item.productIds, "product"),
        ],
      })),
    }));

    setTemplateContent(formattedTopics);
    setTemplateContentId(view._id);
    setContentStatus((view.status?.toLowerCase() ?? "draft") as TStatus);
    if ("header" in view) setHeader(view.header || "<p></p>");

    // Force refetch of the main template query to ensure cache is fresh
    refetch();
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
                  titleHe: group.categoryHe || group.category,
                  titleAr: group.categoryAr || group.category,
                  description: group.description || null,
                  descriptionHe: group.descriptionHe || null,
                  descriptionAr: group.descriptionAr || null,
                  synonyms: group.synonyms ?? [],
                  synonymsHe: group.synonymsHe ?? [],
                  synonymsAr: group.synonymsAr ?? [],
                  searchKeywords: group.searchKeywords ?? [],
                  searchKeywordsHe: group.searchKeywordsHe ?? [],
                  searchKeywordsAr: group.searchKeywordsAr ?? [],
                  isPrimary: group.isPrimary,
                  isArchived: group.isHideCategory,
                  icon: group.icon,
                  colors: group.colors ?? [],
                  businessIds: idsByType.businessIds ?? [],
                  productIds: idsByType.productIds ?? [],
                  ...idsByType,
                };
              });

            if (!filteredCategories || filteredCategories.length === 0)
              return null;

            return {
              title: template.topic,
              titleHe: template.topicHe || template.topic,
              titleAr: template.topicAr || template.topic,
              description: template.description || null,
              descriptionHe: template.descriptionHe || null,
              descriptionAr: template.descriptionAr || null,
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
    // Save as APPROVED and activate immediately — this preserves existing live content
    // that was created before the AI wizard was introduced. The content was already
    // live on the website, so saving it as a view should keep it active.
    if (!externalApiId) return;

    try {
      const payload = {
        header,
        status: "APPROVED",
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
                  titleHe: group.categoryHe || group.category,
                  titleAr: group.categoryAr || group.category,
                  description: group.description || null,
                  descriptionHe: group.descriptionHe || null,
                  descriptionAr: group.descriptionAr || null,
                  synonyms: group.synonyms ?? [],
                  synonymsHe: group.synonymsHe ?? [],
                  synonymsAr: group.synonymsAr ?? [],
                  searchKeywords: group.searchKeywords ?? [],
                  searchKeywordsHe: group.searchKeywordsHe ?? [],
                  searchKeywordsAr: group.searchKeywordsAr ?? [],
                  isPrimary: group.isPrimary,
                  isArchived: group.isHideCategory,
                  icon: group.icon,
                  colors: group.colors ?? [],
                  businessIds: idsByType.businessIds ?? [],
                  productIds: idsByType.productIds ?? [],
                  ...idsByType,
                };
              });
            if (!filteredCategories || filteredCategories.length === 0)
              return null;
            return {
              title: template.topic,
              titleHe: template.topicHe || template.topic,
              titleAr: template.topicAr || template.topic,
              description: template.description || null,
              descriptionHe: template.descriptionHe || null,
              descriptionAr: template.descriptionAr || null,
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

      const existingId =
        templateContentId ??
        (templateContentsData?.externalApiId?._id === externalApiId
          ? templateContentsData._id
          : null);

      const res = existingId
        ? await updateContent({ body: payload, contentId: existingId }).unwrap()
        : await createContent(payload).unwrap();

      const savedId = res?._id || res?.id;
      if (savedId) {
        setTemplateContentId(savedId);
        // Activate so isActive=true and website keeps showing this content
        try {
          await activateView({ viewId: savedId }).unwrap();
        } catch {
          // Activation may fail if content has no assigned items — status is still APPROVED
        }
        refetch();
        refetchViews();
        toast.success("Current layout saved and set as active view.");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save as view.");
    }
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
    refetchTemplate: refetch,
  };
}
