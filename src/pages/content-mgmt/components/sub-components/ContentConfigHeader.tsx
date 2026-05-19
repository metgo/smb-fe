import clsx from "clsx";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { RichTextEditor } from "@/components/shared";

interface ContentConfigHeaderProps {
  header: string;
  isExpanded: boolean;
  setHeader: (v: string) => void;
  templateContents: IContentTemplate[];
  setTemplateContent: (value: IContentTemplate[]) => void;
}

const ContentConfigHeader = ({
  header,
  setHeader,
  isExpanded,
  templateContents,
  setTemplateContent,
}: ContentConfigHeaderProps) => {
  const { isDark, inputClasses } = useThemeClasses();
  const { t } = useTranslation("content");
  const [newTopicName, setNewTopicName] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newCategoryDescription, setNewCategoryDescription] =
    useState<string>("");
  const [selectedTopicForNewCategory, setSelectedTopicForNewCategory] =
    useState<string>("");

  const topics = templateContents.map((topic) => ({
    id: topic.topic,
    name: topic.topic,
  }));

  const handleCreateTopic = () => {
    if (!newTopicName.trim()) return;

    const newTopic: IContentTemplate = {
      topic: newTopicName,
      groups: [],
    };

    setTemplateContent([...templateContents, newTopic]);
    setNewTopicName("");
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim() || !selectedTopicForNewCategory) return;

    const updated = templateContents.map((topic) => {
      if (topic.topic === selectedTopicForNewCategory) {
        return {
          ...topic,
          groups: [
            ...topic.groups,
            {
              category: newCategoryName,
              description: newCategoryDescription,
              isPrimary: false,
              contents: [],
              isHideCategory: false,
            },
          ],
        };
      }

      return topic;
    });

    setTemplateContent(updated);
    setNewCategoryName("");
    setNewCategoryDescription("");
    setSelectedTopicForNewCategory("");
  };

  return (
    <div className="mb-4 shrink-0 space-y-2 border rounded-lg">
      {/* Header */}
      <div
        className={clsx(
          "font-semibold p-2",
          isDark ? "text-gray-300" : "text-gray-800",
        )}
      >
        {t("feed_header")}
      </div>
      <div
        className={clsx(isExpanded ? "space-y-2" : "grid grid-cols-2 gap-2")}
      >
        <RichTextEditor value={header} onChange={setHeader} />
        <div className="space-y-2">
          {/* Create Topic */}
          <div
            className={clsx(
              "border rounded-lg p-4",
              isDark
                ? "bg-purple-950/20 border-purple-800"
                : "bg-linear-to-r from-purple-50 to-indigo-50 border-purple-200",
            )}
          >
            <label
              className={clsx(
                "block text-sm font-medium mb-2",
                isDark ? "text-purple-100" : "text-purple-900",
              )}
            >
              {t("create_new_topic")}
            </label>

            <div className="flex gap-2">
              <Input
                placeholder={t("placeholder_new_topic")}
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateTopic();
                }}
                className={clsx(inputClasses)}
              />

              <Button
                onClick={handleCreateTopic}
                disabled={!newTopicName.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4" />
                {t("button_create")}
              </Button>
            </div>
          </div>
          {/* Create Category */}
          <div
            className={clsx(
              "border rounded-lg p-4 space-y-3",
              isDark
                ? "bg-teal-950/20 border-teal-800"
                : "bg-linear-to-r from-teal-50 to-cyan-50 border-teal-200",
            )}
          >
            <label
              className={clsx(
                "block text-sm font-medium",
                isDark ? "text-teal-100" : "text-teal-900",
              )}
            >
              {t("create_new_category")}
            </label>

            {topics.length > 0 && (
              <div>
                <select
                  value={selectedTopicForNewCategory}
                  onChange={(e) =>
                    setSelectedTopicForNewCategory(e.target.value)
                  }
                  className={clsx(
                    "w-full border rounded-lg px-3 py-2 text-sm",
                    isDark
                      ? "bg-gray-900 border-teal-700 text-gray-100"
                      : "bg-white border-teal-300 text-gray-900",
                  )}
                >
                  <option value="">{t("select_topic_placeholder")}</option>

                  {topics?.map((topic) => (
                    <option key={topic.id} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Input
                placeholder={t("placeholder_new_category")}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={clsx(
                  "w-full px-3 py-2 rounded-lg outline-none focus:outline-none",
                  isDark
                    ? "bg-gray-900 border-teal-600 text-gray-100 placeholder-gray-200 hover:border-teal-500"
                    : "bg-white border-teal-400 text-gray-900 placeholder-gray-500 hover:border-teal-400",
                )}
              />
              <Input
                placeholder={
                  t("placeholder_new_category_desc") ||
                  "New category description..."
                }
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory();
                }}
                className={clsx(
                  "w-full px-3 py-2 rounded-lg outline-none focus:outline-none",
                  isDark
                    ? "bg-gray-900 border-teal-600 text-gray-100 placeholder-gray-200 hover:border-teal-500"
                    : "bg-white border-teal-400 text-gray-900 placeholder-gray-500 hover:border-teal-400",
                )}
              />

              <Button
                onClick={handleCreateCategory}
                disabled={
                  !newCategoryName.trim() || !selectedTopicForNewCategory
                }
                className="bg-teal-600 hover:bg-teal-700 text-white w-full"
              >
                <Plus className="w-4 h-4" />
                {t("button_create")}
              </Button>
            </div>

            {templateContents?.length === 0 && (
              <p
                className={clsx(
                  "text-xs",
                  isDark ? "text-teal-300" : "text-teal-700",
                )}
              >
                {t("info_create_topic_first")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentConfigHeader;
