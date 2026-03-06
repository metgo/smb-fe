import clsx from "clsx";
import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useTranslation } from "react-i18next";
import { GripVertical, ChevronDown, ChevronRight, Layers } from "lucide-react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import {
  ContentConfigHeader,
  TopicCategoryCard,
  TopicHeader,
} from "./sub-components";
import { toast } from "sonner";
import { StatusChangeBtn } from "@/components/btns";

// ─── DnD type for topic reordering ───────────────────────────────────────────
const TOPIC_TYPE = "TOPIC_ITEM";

interface ContentComposerProps {
  header: string;
  isExpanded: boolean;
  contentStatus: TStatus;
  setHeader: (v: string) => void;
  externalApiId: string;
  templateContentId: string | null;
  setExternalApiId: (v: string) => void;
  onStatusChangeHandler: (v: TStatus) => void;
  templateContents: IContentTemplate[];
  setTemplateContent: React.Dispatch<React.SetStateAction<IContentTemplate[]>>;
}

// ─── Draggable Topic Block ────────────────────────────────────────────────────
interface TopicBlockProps {
  topic: IContentTemplate;
  index: number;
  isDark: boolean;
  templateContents: IContentTemplate[];
  setTemplateContent: React.Dispatch<React.SetStateAction<IContentTemplate[]>>;
  onDelete: (index: number) => void;
  moveItem: (from: number, to: number) => void;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setTopicToDelete: React.Dispatch<React.SetStateAction<number | null>>;
  showDeleteConfirm?: boolean;
  topicToDelete?: number | null;
}

const TopicBlock = ({
  topic,
  index,
  isDark,
  templateContents,
  setTemplateContent,
  onDelete,
  moveItem,
  topicToDelete,
  setTopicToDelete,
  showDeleteConfirm,
  setShowDeleteConfirm,
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
    };

    setTemplateContent(updated);
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
              topic={{ index, name: topic.topic, isHidden: topic.isHideTopic }}
              onDelete={onDelete}
              onRename={renameTopic}
              onToggleVisibility={handleToggleTopic}
              topicToDelete={topicToDelete}
              setTopicToDelete={setTopicToDelete}
              showDeleteConfirm={showDeleteConfirm}
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
              {topic.groups.length} {t("categories")}
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
                      templateContents={templateContents}
                      setTemplateContent={setTemplateContent}
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
}: ContentComposerProps) => {
  const { t } = useTranslation("content");
  const { isDark } = useThemeClasses();
  const { allWebsites } = useCommon();

  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteTopic = (index: number) => {
    if (!topicToDelete) return;

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
    <div className="min-w-0 flex-1 pt-6">
      {/* ── Header ── */}
      <div className="mb-4">
        {/* Second Row - Title + Description + Dropdown */}
        <div className="flex items-center justify-between">
          <div>
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

          <div className="flex items-center gap-2">
            {templateContentId && (
              <StatusChangeBtn
                status={contentStatus}
                handleStatusChange={onStatusChangeHandler}
              />
            )}
            <select
              value={externalApiId}
              onChange={(e) => setExternalApiId(e.target.value)}
              className={clsx(
                "h-10 px-4 pr-8 text-sm font-medium rounded-lg border transition-colors",
                isDark
                  ? "bg-gray-800 border-gray-600 text-gray-100 hover:border-gray-500"
                  : "bg-white border-gray-300 text-gray-900 hover:border-gray-400",
              )}
            >
              <option value="all">{t("select_website")}</option>
              {allWebsites?.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-y-scroll h-[64vh] pb-8">
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
              templateContents={templateContents}
              setTemplateContent={setTemplateContent}
              onDelete={deleteTopic}
              moveItem={moveItem}
              topicToDelete={topicToDelete}
              setTopicToDelete={setTopicToDelete}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
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
    </div>
  );
};

export default ContentComposer;
