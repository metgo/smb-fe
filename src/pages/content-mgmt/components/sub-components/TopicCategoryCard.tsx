import clsx from "clsx";
import { useDrop } from "react-dnd";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Edit2, Star, Trash2 } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import ContentCard from "./ContentCard";
import { toast } from "sonner";

const ItemTypes = {
  BUSINESS_CARD: "business_card",
};

interface Props {
  group: IContentGroup;
  topicIndex: number;
  categoryIndex: number;
  templateContents: IContentTemplate[];
  setTemplateContent: (value: IContentTemplate[]) => void;
}

const TopicCategoryCard = ({
  group,
  topicIndex,
  categoryIndex,
  templateContents,
  setTemplateContent,
}: Props) => {
  const { isDark } = useThemeClasses();

  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(group.category);

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.BUSINESS_CARD,

    drop: (item: any) => {
      const updated = [...templateContents];
      const category = updated[topicIndex].groups[categoryIndex];

      const existingIds = new Set(category.contents.map((c: any) => c._id));

      // Iterate over all dragged items (works for both single and multi)
      for (const draggedItem of item.items) {
        if (existingIds.has(draggedItem._id)) {
          toast.info("Already exist in this category");
          continue;
        } // skip duplicates

        category.contents.push({
          _id: draggedItem._id,
          name: draggedItem.name,
          desc: draggedItem.description,
          imageUrl: draggedItem.image,
          category: "",
        });

        existingIds.add(draggedItem._id); // prevent double-add within the same drop
      }

      setTemplateContent(updated);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const deleteCategory = () => {
    const updated = [...templateContents];
    updated[topicIndex].groups.splice(categoryIndex, 1);
    setTemplateContent(updated);
  };

  const renameCategory = () => {
    const updated = [...templateContents];
    updated[topicIndex].groups[categoryIndex].category = editValue;
    setTemplateContent(updated);
    setEditing(false);
  };

  const togglePrimary = () => {
    const updated = [...templateContents];
    updated[topicIndex].groups = updated[topicIndex].groups.map((g, i) => ({
      ...g,
      isPrimary: i === categoryIndex,
    }));
    setTemplateContent(updated);
  };

  const handleRemoveContent = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    const updated = [...templateContents];
    updated[topicIndex].groups[categoryIndex].contents = updated[
      topicIndex
    ].groups[categoryIndex].contents.filter((c: any) => c._id !== contentId);
    setTemplateContent(updated);
  };

  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={(node) => {
        divRef.current = node;
        drop(node);
      }}
      className={clsx(
        "rounded-lg border p-4 transition-all",
        isDark
          ? "border-gray-700 bg-gray-800/50"
          : "border-gray-200 bg-gray-50",
        isOver && "ring-2 ring-blue-400 bg-blue-50/10",
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown
              className={clsx(
                "w-4 h-4 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </Button>

          {editing ? (
            <>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && renameCategory()}
                autoFocus
              />
              <Button size="sm" onClick={renameCategory}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setEditValue(group.category);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <h3
                className={clsx(
                  "text-lg font-semibold flex items-center gap-2",
                  isDark ? "text-gray-100" : "text-gray-900",
                )}
              >
                {group.category}
                {group.isPrimary && (
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                )}
              </h3>
              <Badge>{group.contents.length}</Badge>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(true)}
            title="Rename"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={togglePrimary}
            title="Set primary"
          >
            <Star
              className={clsx(
                "w-4 h-4",
                group.isPrimary
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-400",
              )}
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={deleteCategory}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* CONTENT AREA */}
      {expanded && (
        <div className="mt-4">
          {group?.contents?.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
              {group.contents.map((content) => (
                <div key={content._id} className="w-40 shrink-0">
                  <ContentCard
                    _id={content._id}
                    name={content.name}
                    descripition={content.desc}
                    image={content.imageUrl}
                    categoryName=""
                    isInCategory
                    handleRemove={handleRemoveContent}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className={clsx(
                "w-full text-center py-12 border-2 border-dashed rounded-lg transition-colors",
                isOver
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-700",
                "text-gray-400 dark:text-gray-500",
              )}
            >
              <p className="text-sm">
                Drag businesses here to add them to this category
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicCategoryCard;
