import clsx from "clsx";
import { useState } from "react";
import { Wand2, Plus, Trash2, Loader, Languages } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGenerateUnifiedMutation,
  useTranslateTopicMutation,
} from "@/store/api/contentMutationApi";

const MAX_TOPICS = 8;
const LANG_TABS: { key: WizardLang; label: string }[] = [
  { key: "he", label: "עב" },
  { key: "en", label: "EN" },
  { key: "ar", label: "عر" },
];

interface Props {
  topics: WizardTopic[];
  setTopics: React.Dispatch<React.SetStateAction<WizardTopic[]>>;
  externalApiId: string;
  themeContext: string;
  setThemeContext: React.Dispatch<React.SetStateAction<string>>;
  onUnifiedGenerated?: (topics: WizardTopic[]) => void; // Callback for when unified generation completes
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function Step1Topics({
  topics,
  setTopics,
  externalApiId,
  themeContext,
  setThemeContext,
  onUnifiedGenerated,
}: Props) {
  const { t } = useTranslation("content");
  const { isDark } = useThemeClasses();
  const [generateUnified, { isLoading }] = useGenerateUnifiedMutation();
  const [translateTopic] = useTranslateTopicMutation();
  const [activeLang, setActiveLang] = useState<WizardLang>("he");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  // const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [isTranslatingNew, setIsTranslatingNew] = useState(false);

  const handleGenerate = async () => {
    try {
      // Use unified generation for optimized token usage
      const result = await generateUnified({
        externalApiId,
        themeContext: themeContext.trim() || undefined,
      }).unwrap();

      // Map the unified result to WizardTopic format
      const mapped = result.topics.slice(0, MAX_TOPICS).map((t: any) => ({
        id: makeId(),
        title: t.title ?? "",
        titleHe: t.titleHe ?? t.title ?? "",
        titleAr: t.titleAr ?? t.title ?? "",
        description: t.description ?? "",
        descriptionHe: t.descriptionHe ?? t.description ?? "",
        descriptionAr: t.descriptionAr ?? t.description ?? "",
        categories: (t.categories || []).map((c: any) => ({
          id: makeId(),
          title: c.title ?? "",
          titleHe: c.titleHe ?? c.title ?? "",
          titleAr: c.titleAr ?? c.title ?? "",
          description: c.description ?? "",
          descriptionHe: c.descriptionHe ?? c.description ?? "",
          descriptionAr: c.descriptionAr ?? c.description ?? "",
          synonyms: c.synonyms ?? [],
          synonymsHe: c.synonymsHe ?? [],
          synonymsAr: c.synonymsAr ?? [],
          searchKeywords: c.searchKeywords ?? [],
          searchKeywordsHe: c.searchKeywordsHe ?? [],
          searchKeywordsAr: c.searchKeywordsAr ?? [],
        })),
      }));

      setTopics(mapped);
      const topicCount = mapped.length;
      const categoryCount = mapped.reduce(
        (sum, t) => sum + t.categories.length,
        0,
      );
      const message =
        categoryCount > 0
          ? `Generated ${topicCount} topic${topicCount !== 1 ? "s" : ""} with ${categoryCount} categor${categoryCount !== 1 ? "ies" : "y"}`
          : t("toast_generated_topics_other", { count: topicCount });
      toast.success(message);

      // Notify parent component that unified generation completed with topics and categories
      if (onUnifiedGenerated) {
        onUnifiedGenerated(mapped);
      }
    } catch (error: any) {
      // Extract meaningful error message from backend
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        t("toast_ai_generation_unavailable");
      console.error("[Step1Topics] Unified generation error:", errorMsg);
      toast.error(errorMsg);
    }
  };

  // Called when user clicks "Add Topic" — translates before saving
  const handleAddManual = async () => {
    if (!newTitle.trim()) {
      toast.error(t("toast_topic_name_required"));
      return;
    }
    if (topics.length >= MAX_TOPICS) {
      toast.error(t("max_topics_reached"));
      return;
    }

    setIsTranslatingNew(true);
    try {
      const translated = await translateTopic({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
      }).unwrap();

      setTopics((prev) => [
        ...prev,
        {
          id: makeId(),
          title: translated.title || newTitle.trim(),
          titleHe: translated.titleHe || newTitle.trim(),
          titleAr: translated.titleAr || newTitle.trim(),
          description: translated.description || newDesc.trim(),
          descriptionHe: translated.descriptionHe || newDesc.trim(),
          descriptionAr: translated.descriptionAr || newDesc.trim(),
          categories: [],
        },
      ]);
      setNewTitle("");
      setNewDesc("");
      setShowAddForm(false);
      toast.success(t("toast_topic_added_translations"));
    } catch (error: any) {
      // Extract meaningful error message from backend
      const errorMsg = error?.data?.message || error?.message;

      if (errorMsg) {
        // Show the detailed error message from backend
        toast.error(errorMsg);
      }

      // If translation fails, still save with the typed text in all languages
      setTopics((prev) => [
        ...prev,
        {
          id: makeId(),
          title: newTitle.trim(),
          titleHe: newTitle.trim(),
          titleAr: newTitle.trim(),
          description: newDesc.trim(),
          descriptionHe: newDesc.trim(),
          descriptionAr: newDesc.trim(),
          categories: [],
        },
      ]);
      setNewTitle("");
      setNewDesc("");
      setShowAddForm(false);
      toast.warning(t("toast_topic_added_no_translation"));
    } finally {
      setIsTranslatingNew(false);
    }
  };

  // Called when user clicks the translate icon on an existing topic card
  // COMMENTED OUT: Auto-translates on Add now
  /* const handleTranslateTopic = async (topic: WizardTopic) => {
    // Use the currently active language's text as the source
    const sourceTitle =
      activeLang === "he"
        ? topic.titleHe
        : activeLang === "en"
          ? topic.title
          : topic.titleAr;
    const sourceDesc =
      activeLang === "he"
        ? topic.descriptionHe
        : activeLang === "en"
          ? topic.description
          : topic.descriptionAr;

    if (!sourceTitle?.trim()) {
      toast.error("Topic name is empty — nothing to translate");
      return;
    }

    setTranslatingId(topic.id);
    try {
      const translated = await translateTopic({
        title: sourceTitle.trim(),
        description: sourceDesc?.trim() || undefined,
      }).unwrap();

      setTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id
            ? {
                ...t,
                title: translated.title || t.title,
                titleHe: translated.titleHe || t.titleHe,
                titleAr: translated.titleAr || t.titleAr,
                description: translated.description || t.description,
                descriptionHe: translated.descriptionHe || t.descriptionHe,
                descriptionAr: translated.descriptionAr || t.descriptionAr,
              }
            : t,
        ),
      );
      toast.success("Translations updated");
    } catch {
      toast.error("Translation failed — please try again");
    } finally {
      setTranslatingId(null);
    }
  }; */

  const handleDelete = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const handleChange = (
    id: string,
    field: keyof WizardTopic,
    value: string,
  ) => {
    console.log("[Step1Topics] Changed field:", {
      id,
      field,
      value,
      activeLang,
    });
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const titleField = (lang: WizardLang): keyof WizardTopic =>
    lang === "en" ? "title" : lang === "he" ? "titleHe" : "titleAr";

  const descField = (lang: WizardLang): keyof WizardTopic =>
    lang === "en"
      ? "description"
      : lang === "he"
        ? "descriptionHe"
        : "descriptionAr";

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div
        className={clsx(
          "rounded-xl p-4 border",
          isDark
            ? "bg-teal-900/20 border-teal-800/40"
            : "bg-teal-50 border-teal-100",
        )}
      >
        <p
          className={clsx(
            "text-sm",
            isDark ? "text-teal-300" : "text-teal-700",
          )}
        >
          {t("wizard_step1_instructions")}
        </p>
      </div>

      {/* Optional theme input */}
      <div className="space-y-1">
        <label
          className={clsx(
            "text-xs font-medium",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          {t("theme_context")}{" "}
          <span
            className={clsx(
              "font-normal",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          >
            ({t("optional")})
          </span>
        </label>
        <input
          value={themeContext}
          onChange={(e) => setThemeContext(e.target.value)}
          maxLength={200}
          placeholder={t("theme_context_examples")}
          className={clsx(
            "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
            themeContext.length >= 200 && "border-red-500",
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600"
              : "bg-white border-gray-200 text-gray-800 placeholder-gray-400",
          )}
        />
        <div className="flex items-center justify-between">
          <p
            className={clsx(
              "text-xs",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          >
            {t("theme_context_helper")}
          </p>
          <p
            className={clsx(
              "text-xs tabular-nums shrink-0 ml-3",
              themeContext.length >= 200
                ? "text-red-500 font-medium"
                : isDark
                  ? "text-gray-600"
                  : "text-gray-400",
            )}
          >
            {themeContext.length >= 200 && "Max · "}
            {themeContext.length}/200
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          {isLoading ? t("generating") : t("generate_with_ai")}
        </button>

        <button
          onClick={() => setShowAddForm((v) => !v)}
          disabled={topics.length >= MAX_TOPICS}
          title={
            topics.length >= MAX_TOPICS ? t("max_topics_reached") : undefined
          }
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
            topics.length >= MAX_TOPICS
              ? "opacity-40 cursor-not-allowed"
              : isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50",
          )}
        >
          <Plus className="w-4 h-4" />
          {t("add_manually")}
        </button>

        <span
          className={clsx(
            "ms-auto text-xs tabular-nums",
            isDark ? "text-gray-500" : "text-gray-400",
          )}
        >
          {topics.length} / {MAX_TOPICS}
        </span>
      </div>

      {/* Manual add form */}
      {showAddForm && (
        <div
          className={clsx(
            "rounded-xl border p-4 space-y-3",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200",
          )}
        >
          <div>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isTranslatingNew && handleAddManual()
              }
              maxLength={50}
              placeholder={t("topic_name_placeholder")}
              className={clsx(
                "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
                newTitle.length >= 50 && "border-red-500",
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-400",
              )}
            />
            <p
              className={clsx(
                "text-xs mt-1 text-right tabular-nums",
                newTitle.length >= 50
                  ? "text-red-500 font-medium"
                  : isDark
                    ? "text-gray-600"
                    : "text-gray-400",
              )}
            >
              {newTitle.length >= 50 && "Max · "}
              {newTitle.length}/50
            </p>
          </div>
          <div>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isTranslatingNew && handleAddManual()
              }
              maxLength={150}
              placeholder={t("short_desc_placeholder")}
              className={clsx(
                "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
                newDesc.length >= 150 && "border-red-500",
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-400",
              )}
            />
            <p
              className={clsx(
                "text-xs mt-1 text-right tabular-nums",
                newDesc.length >= 150
                  ? "text-red-500 font-medium"
                  : isDark
                    ? "text-gray-600"
                    : "text-gray-400",
              )}
            >
              {newDesc.length >= 150 && "Max · "}
              {newDesc.length}/150
            </p>
          </div>
          {/* Translation note */}
          <p
            className={clsx(
              "text-xs flex items-center gap-1",
              isDark ? "text-gray-500" : "text-gray-400",
            )}
          >
            <Languages className="w-3 h-3 shrink-0" />
            {t("ai_translation_note")}
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              disabled={isTranslatingNew}
              className={clsx(
                "px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-50",
                isDark
                  ? "border-gray-600 text-gray-400 hover:bg-gray-700"
                  : "border-gray-300 text-gray-500 hover:bg-gray-100",
              )}
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleAddManual}
              disabled={isTranslatingNew || !newTitle.trim()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isTranslatingNew ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Languages className="w-3.5 h-3.5" />
              )}
              {isTranslatingNew ? t("translating") : t("add_topic")}
            </button>
          </div>
        </div>
      )}

      {/* Language tabs — only show when there are topics */}
      {topics.length > 0 && (
        <div className="flex gap-1">
          {LANG_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveLang(key)}
              className={clsx(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                activeLang === key
                  ? "bg-teal-600 text-white"
                  : isDark
                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Skeleton while loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-14 rounded-xl animate-pulse",
                isDark ? "bg-gray-800" : "bg-gray-100",
              )}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && topics.length === 0 && (
        <div
          className={clsx(
            "text-center py-14 rounded-xl border-2 border-dashed",
            isDark
              ? "border-gray-700 text-gray-500"
              : "border-gray-200 text-gray-400",
          )}
        >
          <Wand2 className="w-8 h-8 mx-auto mb-3 opacity-25" />
          <p className="text-sm font-medium">{t("wizard_no_topics_yet")}</p>
          <p className="text-xs mt-1 opacity-70">
            {t("generate_with_ai_or_add_manually")}
          </p>
        </div>
      )}

      {/* Topics list */}
      {!isLoading && (
        <div className="space-y-2">
          {topics.map((topic, i) => (
            <div
              key={topic.id}
              className={clsx(
                "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                isDark
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-gray-300",
              )}
            >
              {/* Index badge */}
              <span
                className={clsx(
                  "w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-1",
                  isDark
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {i + 1}
              </span>

              {/* Editable fields */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <input
                  value={(topic[titleField(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    handleChange(
                      topic.id,
                      titleField(activeLang),
                      e.target.value,
                    )
                  }
                  maxLength={50}
                  placeholder={t("topic_name_placeholder")}
                  className={clsx(
                    "w-full text-sm font-semibold bg-transparent border-none outline-none",
                    isDark ? "text-gray-200" : "text-gray-800",
                  )}
                />
                <input
                  value={(topic[descField(activeLang)] as string) ?? ""}
                  onChange={(e) =>
                    handleChange(
                      topic.id,
                      descField(activeLang),
                      e.target.value,
                    )
                  }
                  maxLength={150}
                  placeholder={t("short_desc_placeholder")}
                  className={clsx(
                    "w-full text-xs bg-transparent border-none outline-none",
                    isDark ? "text-gray-500" : "text-gray-400",
                  )}
                />
              </div>

              {/* Translate button - COMMENTED OUT: Auto-translates on Add now */}
              {/* <button
                onClick={() => handleTranslateTopic(topic)}
                disabled={translatingId === topic.id}
                title="Translate to all languages using AI"
                className={clsx(
                  "p-1.5 rounded-lg transition-colors shrink-0",
                  isDark
                    ? "text-gray-400 hover:bg-gray-700 hover:text-teal-400"
                    : "text-gray-400 hover:bg-gray-100 hover:text-teal-600",
                  translatingId === topic.id && "opacity-60 cursor-not-allowed",
                )}
              >
                {translatingId === topic.id ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Languages className="w-3.5 h-3.5" />
                )}
              </button> */}

              {/* Delete */}
              <button
                onClick={() => handleDelete(topic.id)}
                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
