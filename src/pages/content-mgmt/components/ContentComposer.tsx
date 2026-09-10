import clsx from "clsx";
import { useDrag, useDrop } from "react-dnd";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { GripVertical, ChevronDown, ChevronRight, Layers } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

import {
  ContentConfigHeader,
  TopicCategoryCard,
  TopicHeader,
} from "./sub-components";
import { toast } from "sonner";
import { StatusChangeBtn } from "@/components/btns";
import { ConfirmDialog } from "@/components/shared";
import { useAppSelector } from "@/hooks/hooks";
import { ReactSelect } from "@/components/form-fields";
import ViewManagerPanel from "./ViewManagerPanel";

// ─── DnD type for topic reordering ───────────────────────────────────────────
const TOPIC_TYPE = "TOPIC_ITEM";

interface ContentComposerProps {
  header: string;
  isExpanded: boolean;
  contentStatus: TStatus;
  setHeader: (v: string) => void;
  externalApiId: string | null;
  templateContentId: string | null;
  setExternalApiId: (v: string) => void;
  onStatusChangeHandler: (v: TStatus) => void;
  templateContents: IContentTemplate[];
  setTemplateContent: React.Dispatch<React.SetStateAction<IContentTemplate[]>>;
  views?: IView[];
  isLoadingViews?: boolean;
  websiteName?: string;
  onViewSelect?: (view: IView) => void;
  onViewsRefetch?: () => void;
  onRefetchTemplate?: () => void;
  hasUnsavedContent?: boolean;
  onSaveCurrentAsView?: () => void;
  isSavingCurrentAsView?: boolean;
  isMarketplace?: boolean; // Added for TRAVELLER vs MARKETPLACE handling
}

// ─── Draggable Topic Block ────────────────────────────────────────────────────
interface TopicBlockProps {
  topic: IContentTemplate;
  index: number;
  isDark: boolean;
  externalApiId: string | null;
  templateContents: IContentTemplate[];
  setTemplateContent: React.Dispatch<React.SetStateAction<IContentTemplate[]>>;
  moveItem: (from: number, to: number) => void;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setTopicToDelete: React.Dispatch<React.SetStateAction<number | null>>;
  isMarketplace?: boolean; // Added for TRAVELLER vs MARKETPLACE handling
}

const TopicBlock = ({
  topic,
  index,
  isDark,
  externalApiId,
  templateContents,
  setTemplateContent,
  moveItem,
  setTopicToDelete,
  setShowDeleteConfirm,
  isMarketplace = false,
}: TopicBlockProps) => {
  const { t } = useTranslation("content");
  const ref = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  // ── drag this topic ──
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: TOPIC_TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  // ── drop another topic onto this position ──
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: TOPIC_TYPE,
    hover: (draggedItem: { index: number }, monitor) => {
      if (!ref.current) return;
      const from = draggedItem.index;
      const to = index;
      if (from === to) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only move when cursor has crossed 30% of the item
      if (from < to && hoverClientY < hoverMiddleY * 0.6) return;
      if (from > to && hoverClientY > hoverMiddleY * 1.4) return;

      moveItem(from, to);
      draggedItem.index = to;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Attach dragPreview and drop after render to avoid accessing ref during render
  const setRefs = (node: HTMLDivElement | null) => {
    ref.current = node;
    dragPreview(drop(node));
  };

  const hasMultipleCategories = topic.groups.length > 1;

  const renameTopic = (topicIndex: number, newName: string) => {
    const updated = [...templateContents];

    updated[topicIndex] = {
      ...updated[topicIndex],
      topic: newName,
      // Keep existing He/Ar translations; only fall back to new name if they were empty
      topicHe: updated[topicIndex].topicHe || newName,
      topicAr: updated[topicIndex].topicAr || newName,
    };

    setTemplateContent(updated);
  };

  const handleColorChange = (topicIndex: number, colors: string[]) => {
    setTemplateContent((prev) =>
      prev.map((t, i) => (i === topicIndex ? { ...t, colors } : t)),
    );
  };

  const handleApplyColorToChildren = (topicIndex: number, colors: string[]) => {
    setTemplateContent((prev) =>
      prev.map((t, i) =>
        i === topicIndex
          ? { ...t, groups: t.groups.map((g) => ({ ...g, colors })) }
          : t,
      ),
    );
  };

  const handleIconChange = (topicIndex: number, icon: string) => {
    setTemplateContent((prev) =>
      prev.map((t, i) => (i === topicIndex ? { ...t, icon } : t)),
    );
  };

  const handleToggleTopic = (templateIndex: number) => {
    setTemplateContent((prev) =>
      prev.map((template, tIndex) =>
        tIndex === templateIndex
          ? { ...template, isHideTopic: !template.isHideTopic }
          : template,
      ),
    );
  };

  const handleTogglePrimary = (templateIndex: number) => {
    setTemplateContent((prev) =>
      prev.map((template, tIndex) => ({
        ...template,
        isPrimary: tIndex === templateIndex,
      })),
    );
  };

  return (
    <div
      ref={setRefs}
      className={clsx(
        "transition-all duration-200",
        isDragging && "opacity-40 scale-[0.98]",
        isOver && canDrop && "translate-y-0.5",
      )}
    >
      {/* ── Drop indicator line above ── */}
      <div
        className={clsx(
          "h-0.5 rounded-full mb-1 transition-all duration-150",
          isOver && canDrop
            ? "bg-teal-400 opacity-100 scale-x-100"
            : "opacity-0 scale-x-0",
        )}
      />

      {/* ── Topic Group Card ── */}
      <div
        className={clsx(
          "rounded-xl border border-r-2 transition-all duration-200",
          isDark
            ? "bg-gray-900 border-gray-700/60 border-r-teal-500/70"
            : "bg-white border-gray-200 border-r-teal-500",
        )}
      >
        {/* ── Topic Header Row ── */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-t-xl",
            isDark ? "bg-gray-800/60" : "bg-gray-50",
            hasMultipleCategories
              ? isDark
                ? "border-b border-gray-700"
                : "border-b border-gray-200"
              : collapsed
                ? ""
                : isDark
                  ? "border-b border-gray-700/40"
                  : "border-b border-gray-100",
          )}
        >
          {/* Drag handle */}
          <div
            ref={(node) => {
              drag(node);
            }}
            className={clsx(
              "cursor-grab active:cursor-grabbing p-1 rounded transition-colors",
              isDark
                ? "text-gray-600 hover:text-gray-400 hover:bg-gray-700"
                : "text-gray-300 hover:text-gray-500 hover:bg-gray-100",
            )}
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={clsx(
              "p-1 rounded transition-colors",
              isDark
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-500 hover:bg-gray-100",
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Topic name + meta */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TopicHeader
              topic={{
                index,
                name: topic.topic,
                isHidden: topic.isHideTopic,
                isPrimary: topic.isPrimary,
                colors: topic.colors,
                icon: topic.icon,
              }}
              onRename={renameTopic}
              onToggleVisibility={handleToggleTopic}
              onTogglePrimary={handleTogglePrimary}
              onColorChange={handleColorChange}
              onApplyColorToChildren={handleApplyColorToChildren}
              onIconChange={handleIconChange}
              setTopicToDelete={setTopicToDelete}
              setShowDeleteConfirm={setShowDeleteConfirm}
            />
          </div>

          {/* Right badges */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={clsx(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                isDark
                  ? "bg-teal-900/50 text-teal-300 border border-teal-700/50"
                  : "bg-teal-50 text-teal-700 border border-teal-200",
              )}
            >
              <Layers className="w-3 h-3" />
              {topic.groups.length}
            </span>
          </div>
        </div>

        {/* ── Categories inside this topic ── */}
        {!collapsed && (
          <div className="p-3">
            {topic.groups.length === 0 ? (
              <div
                className={clsx(
                  "text-center py-8 rounded-lg border-2 border-dashed text-sm",
                  isDark
                    ? "border-gray-700 text-gray-500"
                    : "border-gray-200 text-gray-400",
                )}
              >
                {t("no_categories_yet")}{" "}
              </div>
            ) : (
              <div className={clsx("space-y-2")}>
                {topic.groups.map((group, categoryIndex) => (
                  <div key={categoryIndex} className="relative">
                    <TopicCategoryCard
                      group={group}
                      topicIndex={index}
                      categoryIndex={categoryIndex}
                      externalApiId={externalApiId}
                      templateContents={templateContents}
                      setTemplateContent={setTemplateContent}
                      isMarketplace={isMarketplace}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main ContentComposer ─────────────────────────────────────────────────────
const ContentComposer = ({
  header,
  setHeader,
  isExpanded,
  contentStatus,
  externalApiId,
  setExternalApiId,
  templateContents,
  templateContentId,
  setTemplateContent,
  onStatusChangeHandler,
  views = [],
  isLoadingViews = false,
  websiteName = "",
  onViewSelect,
  onViewsRefetch,
  onRefetchTemplate,
  hasUnsavedContent = false,
  onSaveCurrentAsView,
  isSavingCurrentAsView = false,
}: ContentComposerProps) => {
  const { t } = useTranslation("content");
  const { isDark } = useThemeClasses();
  const { associatedWebsite } = useAppSelector((state) => state.auth);
  const selectedWebsite = ((associatedWebsite as any[]) || []).find(
    (w) => w._id === externalApiId,
  );
  const isMarketplace = selectedWebsite?.purpose === "MARKETPLACE";

  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-set the only topic as primary; clear isPrimary when multiple topics exist
  useEffect(() => {
    if (templateContents.length === 1 && !templateContents[0].isPrimary) {
      setTemplateContent((prev) =>
        prev.map((t, i) => ({ ...t, isPrimary: i === 0 })),
      );
    } else if (templateContents.length > 1) {
      const hasPrimary = templateContents.some((t) => t.isPrimary);
      if (!hasPrimary) {
        // no-op: keep all false until user picks one
      }
    }
  }, [templateContents.length]);

  const deleteTopic = (index: number) => {
    if (topicToDelete === null) return;

    const updated = [...templateContents];
    updated.splice(index, 1);
    setTemplateContent(updated);
    toast.success(t("topic_deleted"));

    setTopicToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Reorder topics by swapping indices
  const moveItem = (from: number, to: number) => {
    const updated = [...templateContents];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setTemplateContent(updated);
  };

  return (
    <div className="min-w-0 flex-1 pt-6 overflow-x-hidden px-1">
      {/* ── Header ── */}
      <div className="mb-4">
        {/* Second Row - Title + Description + Dropdown */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="min-w-0">
            <h2
              className={clsx(
                "text-lg font-semibold",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              {t("custom_categories_title")}
            </h2>
            <p
              className={clsx(
                "text-sm",
                isDark ? "text-gray-500" : "text-gray-500",
              )}
            >
              {t("custom_categories_description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0 lg:shrink-0">
            {templateContentId && (
              <StatusChangeBtn
                status={contentStatus}
                handleStatusChange={onStatusChangeHandler}
              />
            )}
            <div className="flex-1 min-w-48 lg:flex-initial">
              <ReactSelect
                value={externalApiId}
                items={associatedWebsite}
                onChange={(value) => setExternalApiId(value)}
                placeholder={t("select_website")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* View Manager — shown only when a website is selected */}
      {externalApiId && (
        <ViewManagerPanel
          views={views}
          isLoading={isLoadingViews}
          externalApiId={externalApiId}
          websiteName={websiteName}
          onViewSelect={(view) => onViewSelect?.(view)}
          onRefetch={() => onViewsRefetch?.()}
          onRefetchTemplate={() => onRefetchTemplate?.()}
          hasUnsavedContent={hasUnsavedContent}
          onSaveCurrentAsView={onSaveCurrentAsView}
          isSavingCurrentAsView={isSavingCurrentAsView}
          isMarketplace={isMarketplace}
        />
      )}

      <div className="overflow-y-scroll h-[58vh] pb-8">
        <ContentConfigHeader
          header={header}
          setHeader={setHeader}
          isExpanded={isExpanded}
          templateContents={templateContents}
          setTemplateContent={setTemplateContent}
        />

        {/* Drag hint */}
        {templateContents?.length > 1 && (
          <p
            className={clsx(
              "text-xs font-bold italic mb-2 flex items-center gap-1",
              isDark ? "text-gray-300" : "text-gray-600",
            )}
          >
            <GripVertical className="w-3 h-3" />
            {t("drag_handle_instruction")}
          </p>
        )}

        {/* Topic list */}
        <div className="space-y-3">
          {templateContents?.map((topic, index) => (
            <TopicBlock
              key={index}
              topic={topic}
              index={index}
              isDark={isDark}
              externalApiId={externalApiId}
              templateContents={templateContents}
              setTemplateContent={setTemplateContent}
              moveItem={moveItem}
              setTopicToDelete={setTopicToDelete}
              setShowDeleteConfirm={setShowDeleteConfirm}
              isMarketplace={isMarketplace}
            />
          ))}

          {templateContents.length === 0 && (
            <div
              className={clsx(
                "text-center py-16 rounded-xl border-2 border-dashed",
                isDark
                  ? "border-gray-700 text-gray-500"
                  : "border-gray-200 text-gray-400",
              )}
            >
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t("no_topics_yet")}</p>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && topicToDelete !== null && (
        <ConfirmDialog
          open={showDeleteConfirm}
          title={t("delete_topic")}
          message={t("delete_topic_confirm")}
          confirmText={t("delete")}
          variant="danger"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            if (topicToDelete !== null) {
              deleteTopic(topicToDelete);
            }
            setShowDeleteConfirm(false);
          }}
        />
      )}
    </div>
  );
};

export default ContentComposer;
