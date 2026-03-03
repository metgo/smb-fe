import clsx from "clsx";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CKEditorWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface ContentConfigHeaderProps {
  templateContents: IContentTemplate[];
  setTemplateContent: (value: IContentTemplate[]) => void;
}

const ContentConfigHeader = ({
  templateContents,
  setTemplateContent,
}: ContentConfigHeaderProps) => {
  const { isDark } = useThemeClasses();
  const { t } = useTranslation("content");
  const [newHeader, setNewHeader] = useState("<p></p>");
  const [newTopicName, setNewTopicName] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [selectedTopicForNewCategory, setSelectedTopicForNewCategory] =
    useState<string>("");

  const topics = templateContents.map((topic) => ({
    id: topic.topic,
    name: topic.topic,
  }));

  const handleCreateTopic = () => {
    if (!newTopicName.trim()) return;

    const newTopic: IContentTemplate = {
      header: newHeader,
      topic: newTopicName,
      isPrimary: false,
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
  };

  return (
    <div className="mb-4 shrink-0 space-y-2 border p-2 rounded-lg">
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
            className={clsx(isDark ? "bg-gray-900" : "bg-white")}
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
            <label
              className={clsx(
                "block text-xs font-medium mb-2",
                isDark ? "text-teal-200" : "text-teal-800",
              )}
            >
              {t("select_topic_label")}
            </label>

            <select
              value={selectedTopicForNewCategory}
              onChange={(e) => setSelectedTopicForNewCategory(e.target.value)}
              className={clsx(
                "w-full border rounded-lg px-3 py-2 text-sm",
                isDark
                  ? "bg-gray-900 border-teal-700 text-gray-100"
                  : "bg-white border-teal-300 text-gray-900",
              )}
            >
              <option value="">{t("select_topic_placeholder")}</option>

              {topics.map((topic) => (
                <option key={topic.id} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder={t("placeholder_new_category")}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
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
            disabled={!newCategoryName.trim() || !selectedTopicForNewCategory}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="w-4 h-4" />
            {t("button_create")}
          </Button>
        </div>

        {templateContents.length === 0 && (
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

      {/* Header */}
      {selectedTopicForNewCategory && (
        <>
          <div
            className={clsx(
              "font-semibold",
              isDark ? "text-gray-300" : "text-gray-800",
            )}
          >
            {t("feed_header")}
          </div>{" "}
          <CKEditorWrapper value={newHeader} onChange={setNewHeader} />
        </>
      )}
    </div>
  );
};

export default ContentConfigHeader;
