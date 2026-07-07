import clsx from "clsx";
import { useState } from "react";
import {
  Wand2,
  Plus,
  Trash2,
  Loader,
  ChevronDown,
  ChevronUp,
  X,
  Languages,
} from "lucide-react";
import { toast } from "sonner";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGenerateCategoriesMutation,
  useTranslateTopicMutation,
} from "@/store/api/contentMutationApi";

const MAX_CATEGORIES = 8;
const LANG_TABS: { key: WizardLang; label: string }[] = [
  { key: "he", label: "עב" },
  { key: "en", label: "EN" },
  { key: "ar", label: "عر" },
];

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

interface Props {
  topics: WizardTopic[];
  setTopics: React.Dispatch<React.SetStateAction<WizardTopic[]>>;
  externalApiId: string;
}

interface CategoryCardProps {
  category: WizardCategory;
  topicId: string;
  activeLang: WizardLang;
  isDark: boolean;
  onChange: (
    topicId: string,
    catId: string,
    field: keyof WizardCategory,
    value: any,
  ) => void;
  onDelete: (topicId: string, catId: string) => void;
  onTranslate: (topicId: string, catId: string) => void;
  isTranslating: boolean;
  translateTopic: any;
}

function CategoryCard({
  category,
  topicId,
  activeLang,
  isDark,
  onChange,
  onDelete,
  // onTranslate,
  // isTranslating,
  translateTopic,
}: CategoryCardProps) {
  const [showMeta, setShowMeta] = useState(false);
  const [newSynonym, setNewSynonym] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState("");

  const titleField =
    activeLang === "en" ? "title" : activeLang === "he" ? "titleHe" : "titleAr";
  const descField =
    activeLang === "en"
      ? "description"
      : activeLang === "he"
        ? "descriptionHe"
        : "descriptionAr";
  const synField: keyof WizardCategory =
    activeLang === "en"
      ? "synonyms"
      : activeLang === "he"
        ? "synonymsHe"
        : "synonymsAr";

  const currentDesc =
    (category[descField as keyof WizardCategory] as string) ?? "";

  const handleAddDesc = async () => {
    const trimmed = tempDesc.trim();
    if (!trimmed) return;

    // Call translate API to get all 3 languages
    try {
      const translated = await translateTopic({
        title: "", // Empty title since we're only translating description
        description: trimmed,
      }).unwrap();

      // Update all 3 description fields with translations
      onChange(
        topicId,
        category.id,
        "description",
        translated.description || trimmed,
      );
      onChange(
        topicId,
        category.id,
        "descriptionHe",
        translated.descriptionHe || trimmed,
      );
      onChange(
        topicId,
        category.id,
        "descriptionAr",
        translated.descriptionAr || trimmed,
      );

      setIsEditingDesc(false);
      setTempDesc("");
      toast.success("Description added with translations");
    } catch {
      // Fallback: Copy same text to all 3 language fields
      onChange(topicId, category.id, "description", trimmed);
      onChange(topicId, category.id, "descriptionHe", trimmed);
      onChange(topicId, category.id, "descriptionAr", trimmed);
      setIsEditingDesc(false);
      setTempDesc("");
      toast.warning("Description added — translation unavailable");
    }
  };

  const handleEditDesc = () => {
    setTempDesc(currentDesc);
    setIsEditingDesc(true);
  };

  const handleCancelDesc = () => {
    setIsEditingDesc(false);
    setTempDesc("");
  };

  const addChip = (
    field: keyof WizardCategory,
    value: string,
    setter: (v: string) => void,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = (category[field] as string[]) ?? [];
    if (current.includes(trimmed)) return;
    onChange(topicId, category.id, field, [...current, trimmed]);
    setter("");
  };

  const removeChip = (field: keyof WizardCategory, chip: string) => {
    const current = (category[field] as string[]) ?? [];
    onChange(
      topicId,
      category.id,
      field,
      current.filter((c) => c !== chip),
    );
  };

  return (
    <div
      className={clsx(
        "rounded-xl border transition-colors",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      {/* Main row */}
      <div className="flex items-start gap-2 p-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <input
            value={
              (category[titleField as keyof WizardCategory] as string) ?? ""
            }
            onChange={(e) =>
              onChange(
                topicId,
                category.id,
                titleField as keyof WizardCategory,
                e.target.value,
              )
            }
            maxLength={50}
            placeholder="Category name"
            className={clsx(
              "w-full text-sm font-semibold bg-transparent border-none outline-none",
              isDark ? "text-gray-200" : "text-gray-800",
            )}
          />

          {/* Short Description - Edit Mode */}
          {isEditingDesc ? (
            <div className="space-y-1">
              <div className="flex gap-1">
                <input
                  autoFocus
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddDesc();
                    if (e.key === "Escape") handleCancelDesc();
                  }}
                  maxLength={150}
                  placeholder="Short description (optional)"
                  className={clsx(
                    "flex-1 px-2 py-1 text-xs rounded-lg border transition-colors",
                    tempDesc.length >= 150 && "border-red-500",
                    isDark
                      ? "bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500 focus:border-teal-500"
                      : "bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:border-teal-500",
                  )}
                />
                <button
                  onClick={handleAddDesc}
                  disabled={!tempDesc.trim()}
                  className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCancelDesc}
                  className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              </div>
              <p
                className={clsx(
                  "text-xs text-right tabular-nums",
                  tempDesc.length >= 150
                    ? "text-red-500 font-medium"
                    : isDark
                      ? "text-gray-600"
                      : "text-gray-400",
                )}
              >
                {tempDesc.length >= 150 && "Max · "}
                {tempDesc.length}/150
              </p>
            </div>
          ) : (
            /* Short Description - View Mode */
            <div
              onClick={handleEditDesc}
              className={clsx(
                "px-2 py-1 text-xs rounded-lg border cursor-pointer transition-colors group",
                currentDesc
                  ? isDark
                    ? "bg-gray-700/50 border-gray-600 text-gray-300 hover:border-teal-500"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:border-teal-500"
                  : isDark
                    ? "bg-gray-700/30 border-gray-700 border-dashed text-gray-600 hover:border-gray-600"
                    : "bg-gray-50/50 border-gray-300 border-dashed text-gray-400 hover:border-gray-400",
              )}
            >
              {currentDesc || (
                <span className="flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  <span>Add short description (optional)</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Metadata toggle */}
        <button
          onClick={() => setShowMeta((v) => !v)}
          title="Edit synonyms & keywords"
          className={clsx(
            "p-1.5 rounded-lg text-xs transition-colors shrink-0",
            showMeta
              ? "bg-teal-600 text-white"
              : isDark
                ? "text-gray-500 hover:bg-gray-700"
                : "text-gray-400 hover:bg-gray-100",
          )}
        >
          {showMeta ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Translate button - COMMENTED OUT: Auto-translates on Add now */}
        {/* <button
          onClick={() => onTranslate(topicId, category.id)}
          disabled={isTranslating}
          title="Translate to all languages using AI"
          className={clsx(
            "p-1.5 rounded-lg transition-colors shrink-0",
            isDark
              ? "text-gray-400 hover:bg-gray-700 hover:text-teal-400"
              : "text-gray-400 hover:bg-gray-100 hover:text-teal-600",
            isTranslating && "opacity-60 cursor-not-allowed",
          )}
        >
          {isTranslating ? (
            <Loader className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Languages className="w-3.5 h-3.5" />
          )}
        </button> */}

        <button
          onClick={() => onDelete(topicId, category.id)}
          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metadata panel */}
      {showMeta && (
        <div
          className={clsx(
            "border-t px-3 pb-3 pt-2 space-y-3",
            isDark ? "border-gray-700" : "border-gray-100",
          )}
        >
          {/* Synonyms */}
          <div>
            <p
              className={clsx(
                "text-xs font-medium mb-1.5",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              Synonyms ({activeLang.toUpperCase()})
            </p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {((category[synField] as string[]) ?? []).map((chip) => (
                <span
                  key={chip}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  {chip}
                  <button
                    onClick={() => removeChip(synField, chip)}
                    className="hover:text-red-400"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                value={newSynonym}
                onChange={(e) => setNewSynonym(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    addChip(synField, newSynonym, setNewSynonym);
                }}
                maxLength={30}
                placeholder="Add synonym…"
                className={clsx(
                  "flex-1 px-2 py-1 rounded-lg border text-xs transition-colors",
                  newSynonym.length >= 30 && "border-red-500",
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-600"
                    : "bg-white border-gray-200 text-gray-700 placeholder-gray-400",
                )}
              />
              <button
                onClick={() => addChip(synField, newSynonym, setNewSynonym)}
                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Search keywords (language-neutral) */}
          <div>
            <p
              className={clsx(
                "text-xs font-medium mb-1.5",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              Search Keywords
            </p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {(category.searchKeywords ?? []).map((chip) => (
                <span
                  key={chip}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                    isDark
                      ? "bg-purple-900/40 text-purple-300"
                      : "bg-purple-50 text-purple-600",
                  )}
                >
                  {chip}
                  <button
                    onClick={() => removeChip("searchKeywords", chip)}
                    className="hover:text-red-400"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    addChip("searchKeywords", newKeyword, setNewKeyword);
                }}
                maxLength={30}
                placeholder="Add keyword…"
                className={clsx(
                  "flex-1 px-2 py-1 rounded-lg border text-xs transition-colors",
                  newKeyword.length >= 30 && "border-red-500",
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-600"
                    : "bg-white border-gray-200 text-gray-700 placeholder-gray-400",
                )}
              />
              <button
                onClick={() =>
                  addChip("searchKeywords", newKeyword, setNewKeyword)
                }
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Step 2 ──────────────────────────────────────────────────────────── */

export default function Step2Categories({
  topics,
  setTopics,
  externalApiId,
}: Props) {
  const { isDark } = useThemeClasses();
  const [generateCategories] = useGenerateCategoriesMutation();
  const [translateTopic] = useTranslateTopicMutation();
  const [activeLang, setActiveLang] = useState<WizardLang>("he");
  const [generatingTopicIds, setGeneratingTopicIds] = useState<Set<string>>(
    new Set(),
  );
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(
    new Set(),
  );
  const [addingForTopic, setAddingForTopic] = useState<string | null>(null);
  const [newCatTitle, setNewCatTitle] = useState("");
  // Tracks which category card is currently translating — key: "topicId-catId"
  const [translatingCatId, setTranslatingCatId] = useState<string | null>(null);
  // Tracks which inline add form is currently translating — key: topicId
  const [translatingAddId, setTranslatingAddId] = useState<string | null>(null);

  const toggleCollapse = (id: string) =>
    setCollapsedTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const makeCategory = (
    data: Partial<WizardCategory> = {},
  ): WizardCategory => ({
    id: makeId(),
    title: data.title ?? "",
    titleHe: data.titleHe ?? data.title ?? "",
    titleAr: data.titleAr ?? data.title ?? "",
    description: data.description ?? "",
    descriptionHe: data.descriptionHe ?? data.description ?? "",
    descriptionAr: data.descriptionAr ?? data.description ?? "",
    synonyms: data.synonyms ?? [],
    synonymsHe: data.synonymsHe ?? [],
    synonymsAr: data.synonymsAr ?? [],
    searchKeywords: data.searchKeywords ?? [],
    assignedBusinesses: [],
    assignedProducts: [],
  });

  const generateForTopic = async (topic: WizardTopic) => {
    setGeneratingTopicIds((prev) => new Set(prev).add(topic.id));
    try {
      const result = await generateCategories({
        topicTitle: topic.title || topic.titleHe,
        topicDescription: topic.description || topic.descriptionHe,
        externalApiId,
        existingCategories: topic.categories.map((c) => c.title),
      }).unwrap();

      const mapped = result
        .slice(0, MAX_CATEGORIES)
        .map((c: any) => makeCategory(c));

      return {
        topicId: topic.id,
        categories: mapped,
        success: true,
        topicLabel: topic.titleHe || topic.title,
        count: mapped.length,
      };
    } catch {
      return {
        topicId: topic.id,
        categories: [],
        success: false,
        topicLabel: topic.titleHe || topic.title,
      };
    } finally {
      setGeneratingTopicIds((prev) => {
        const next = new Set(prev);
        next.delete(topic.id);
        return next;
      });
    }
  };

  const generateAll = async () => {
    setIsGeneratingAll(true);
    const results = await Promise.all(
      topics
        .filter((topic) => topic.categories.length === 0)
        .map((topic) => generateForTopic(topic)),
    );

    // Apply all updates at once to avoid race conditions
    setTopics((prev) => {
      let updated = prev;
      for (const result of results) {
        if (result.success) {
          updated = updated.map((t) =>
            t.id === result.topicId
              ? { ...t, categories: result.categories }
              : t,
          );
        }
      }
      return updated;
    });

    // Show toasts for all results
    for (const result of results) {
      if (result.success) {
        toast.success(
          `Generated ${result.count} categories for "${result.topicLabel}"`,
        );
      } else {
        toast.error(
          `AI not available yet — add categories for "${result.topicLabel}" manually.`,
        );
      }
    }

    setIsGeneratingAll(false);
  };

  const addManualCategory = async (topicId: string) => {
    if (!newCatTitle.trim()) {
      toast.error("Category name is required");
      return;
    }
    const topic = topics.find((t) => t.id === topicId)!;
    if (topic.categories.length >= MAX_CATEGORIES) {
      toast.error(`Maximum ${MAX_CATEGORIES} categories allowed`);
      return;
    }

    setTranslatingAddId(topicId);
    try {
      const translated = await translateTopic({
        title: newCatTitle.trim(),
      }).unwrap();

      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? {
                ...t,
                categories: [
                  ...t.categories,
                  makeCategory({
                    title: translated.title || newCatTitle.trim(),
                    titleHe: translated.titleHe || newCatTitle.trim(),
                    titleAr: translated.titleAr || newCatTitle.trim(),
                  }),
                ],
              }
            : t,
        ),
      );
      setNewCatTitle("");
      setAddingForTopic(null);
      toast.success("Category added with translations");
    } catch {
      // Fallback: save with typed text in all languages
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? {
                ...t,
                categories: [
                  ...t.categories,
                  makeCategory({ title: newCatTitle.trim() }),
                ],
              }
            : t,
        ),
      );
      setNewCatTitle("");
      setAddingForTopic(null);
      toast.warning(
        "Category added — translation unavailable, edit each language manually.",
      );
    } finally {
      setTranslatingAddId(null);
    }
  };

  const handleTranslateCategory = async (topicId: string, catId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    const cat = topic?.categories.find((c) => c.id === catId);
    if (!cat) return;

    // Use the active language as source
    const sourceTitle =
      activeLang === "he"
        ? cat.titleHe
        : activeLang === "en"
          ? cat.title
          : cat.titleAr;
    const sourceDesc =
      activeLang === "he"
        ? cat.descriptionHe
        : activeLang === "en"
          ? cat.description
          : cat.descriptionAr;

    if (!sourceTitle?.trim()) {
      toast.error("Category name is empty — nothing to translate");
      return;
    }

    const key = `${topicId}-${catId}`;
    setTranslatingCatId(key);
    try {
      const translated = await translateTopic({
        title: sourceTitle.trim(),
        description: sourceDesc?.trim() || undefined,
      }).unwrap();

      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? {
                ...t,
                categories: t.categories.map((c) =>
                  c.id === catId
                    ? {
                        ...c,
                        title: translated.title || c.title,
                        titleHe: translated.titleHe || c.titleHe,
                        titleAr: translated.titleAr || c.titleAr,
                        description: translated.description || c.description,
                        descriptionHe:
                          translated.descriptionHe || c.descriptionHe,
                        descriptionAr:
                          translated.descriptionAr || c.descriptionAr,
                      }
                    : c,
                ),
              }
            : t,
        ),
      );
      toast.success("Category translations updated");
    } catch {
      toast.error("Translation failed — please try again");
    } finally {
      setTranslatingCatId(null);
    }
  };

  const handleCategoryChange = (
    topicId: string,
    catId: string,
    field: keyof WizardCategory,
    value: any,
  ) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? {
              ...t,
              categories: t.categories.map((c) =>
                c.id === catId ? { ...c, [field]: value } : c,
              ),
            }
          : t,
      ),
    );
  };

  const handleCategoryDelete = (topicId: string, catId: string) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, categories: t.categories.filter((c) => c.id !== catId) }
          : t,
      ),
    );
  };

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
          For each topic, generate or add up to <strong>8 categories</strong>.
          Each category gets synonyms and search keywords automatically to
          improve search on your website.
        </p>
      </div>

      {/* Language tabs + Generate All */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <button
          onClick={generateAll}
          disabled={isGeneratingAll || topics.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGeneratingAll ? (
            <Loader className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          Generate All
        </button>
      </div>

      {/* Topic accordions */}
      <div className="space-y-3">
        {topics.map((topic) => {
          const isCollapsed = collapsedTopics.has(topic.id);
          const isThisGenerating = generatingTopicIds.has(topic.id);
          const topicLabel =
            activeLang === "he"
              ? topic.titleHe
              : activeLang === "en"
                ? topic.title
                : topic.titleAr;
          const catCount = topic.categories.length;
          const atMax = catCount >= MAX_CATEGORIES;

          return (
            <div
              key={topic.id}
              className={clsx(
                "rounded-xl border",
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200",
              )}
            >
              {/* Topic header */}
              <div
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 cursor-pointer rounded-t-xl",
                  isDark ? "bg-gray-800/60" : "bg-gray-50",
                  !isCollapsed &&
                    (isDark
                      ? "border-b border-gray-700"
                      : "border-b border-gray-200"),
                )}
                onClick={() => toggleCollapse(topic.id)}
              >
                <ChevronDown
                  className={clsx(
                    "w-4 h-4 shrink-0 transition-transform text-gray-400",
                    isCollapsed && "-rotate-90",
                  )}
                />
                <span
                  className={clsx(
                    "font-semibold text-sm flex-1",
                    isDark ? "text-gray-200" : "text-gray-800",
                  )}
                >
                  {topicLabel || "Untitled Topic"}
                </span>
                <span
                  className={clsx(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    atMax
                      ? isDark
                        ? "bg-amber-900/40 text-amber-400"
                        : "bg-amber-50 text-amber-600"
                      : isDark
                        ? "bg-teal-900/40 text-teal-400"
                        : "bg-teal-50 text-teal-600",
                  )}
                >
                  {catCount}/{MAX_CATEGORIES}
                </span>
              </div>

              {/* Categories body */}
              {!isCollapsed && (
                <div className="p-3 space-y-3">
                  {/* Generate + Add buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateForTopic(topic);
                      }}
                      disabled={generatingTopicIds.has(topic.id) || atMax}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isThisGenerating ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      Generate
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingForTopic(topic.id);
                        setNewCatTitle("");
                      }}
                      disabled={atMax}
                      title={atMax ? "Maximum 8 categories reached" : undefined}
                      className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors",
                        atMax
                          ? "opacity-40 cursor-not-allowed"
                          : isDark
                            ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      <Plus className="w-3 h-3" />
                      Add Manually
                    </button>
                  </div>

                  {/* Inline add form */}
                  {addingForTopic === topic.id && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          value={newCatTitle}
                          onChange={(e) => setNewCatTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addManualCategory(topic.id);
                            if (e.key === "Escape") setAddingForTopic(null);
                          }}
                          maxLength={50}
                          placeholder="Category name…"
                          className={clsx(
                            "flex-1 px-3 py-1.5 rounded-lg border text-sm transition-colors",
                            newCatTitle.length >= 50 && "border-red-500",
                            isDark
                              ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                              : "bg-white border-gray-300 text-gray-800",
                          )}
                        />
                        <button
                          onClick={() => addManualCategory(topic.id)}
                          disabled={
                            translatingAddId === topic.id || !newCatTitle.trim()
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {translatingAddId === topic.id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Languages className="w-3 h-3" />
                          )}
                          {translatingAddId === topic.id
                            ? "Translating…"
                            : "Add"}
                        </button>
                        <button
                          onClick={() => setAddingForTopic(null)}
                          disabled={translatingAddId === topic.id}
                          className="px-2 py-1.5 text-gray-400 hover:text-gray-600 text-xs disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                      <p
                        className={clsx(
                          "text-xs text-right tabular-nums",
                          newCatTitle.length >= 50
                            ? "text-red-500 font-medium"
                            : isDark
                              ? "text-gray-600"
                              : "text-gray-400",
                        )}
                      >
                        {newCatTitle.length >= 50 && "Max · "}
                        {newCatTitle.length}/50
                      </p>
                    </div>
                  )}

                  {/* Skeleton while generating */}
                  {isThisGenerating && (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={clsx(
                            "h-12 rounded-xl animate-pulse",
                            isDark ? "bg-gray-800" : "bg-gray-100",
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Category cards */}
                  {!isThisGenerating && topic.categories.length === 0 && (
                    <p
                      className={clsx(
                        "text-xs text-center py-4",
                        isDark ? "text-gray-600" : "text-gray-400",
                      )}
                    >
                      No categories yet — generate or add manually
                    </p>
                  )}

                  {!isThisGenerating &&
                    topic.categories.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        topicId={topic.id}
                        activeLang={activeLang}
                        isDark={isDark}
                        onChange={handleCategoryChange}
                        onDelete={handleCategoryDelete}
                        onTranslate={handleTranslateCategory}
                        isTranslating={
                          translatingCatId === `${topic.id}-${cat.id}`
                        }
                        translateTopic={translateTopic}
                      />
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
