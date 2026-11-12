import clsx from "clsx";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Info, Plus, Search, Sparkles, Star, X } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  BUSINESS_TAXONOMY,
  MAX_CATEGORY_GROUPS,
  findGroup,
  findSubcategory,
  groupExamples,
  groupOfSubcategory,
  searchTaxonomy,
  taxonomyLabel,
} from "@/lib/businessTaxonomy";
import {
  addCustom,
  customKey,
  removeKey,
  selectedKeys,
  setMain,
  toggleGroup,
  toggleSubcategory,
  type CategorySelection,
} from "./categorySelection";

interface StepProps {
  selection: CategorySelection;
  onChange: (next: CategorySelection) => void;
  error?: string;
  /** The note about passing the choice to the AI (onboarding only). */
  showAiNote?: boolean;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2";

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-3 text-sm text-red-500">
      {error}
    </p>
  );
}

/* --------------------------------------------------------- step 1 --- */

/** "Which area is your business in?": up to three area cards, plus search. */
export function CategoryGroupsStep({ selection, onChange, error }: StepProps) {
  const { t, i18n } = useTranslation("onboarding");
  // Static labels follow the UI language (not the API language setting).
  const language = i18n.resolvedLanguage ?? i18n.language;
  const { isDark, textPrimary, textTertiary } = useThemeClasses();
  const [query, setQuery] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const hits = useMemo(() => searchTaxonomy(query), [query]);
  const full = selection.categoryGroups.length >= MAX_CATEGORY_GROUPS;

  const apply = (next: CategorySelection) => {
    setLimitHit(next === selection && full);
    onChange(next);
  };

  return (
    <div>
      <div className="relative">
        <Search
          className={clsx(
            "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 start-3.5",
            textTertiary,
          )}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("cat_search_placeholder")}
          aria-label={t("cat_search_label")}
          className={clsx(
            "w-full rounded-xl border py-3 ps-10 pe-3 text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-teal-500/60",
            isDark
              ? "border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500"
              : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400",
          )}
        />
      </div>

      {query.trim().length >= 2 && (
        <div className="mt-3" aria-live="polite">
          {hits.length ? (
            <ul className="flex flex-wrap gap-2">
              {hits.map(({ group, sub }) => {
                const on = selection.subcategories.includes(sub.en);
                return (
                  <li key={sub.en}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        apply(toggleSubcategory(selection, sub.en))
                      }
                      className={clsx(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                        focusRing,
                        isDark
                          ? "focus-visible:ring-offset-gray-900"
                          : "focus-visible:ring-offset-white",
                        on
                          ? "border-teal-600 bg-teal-600 text-white"
                          : isDark
                            ? "border-gray-700 text-gray-200 hover:border-teal-500"
                            : "border-gray-300 text-gray-800 hover:border-teal-500",
                      )}
                    >
                      {on ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {taxonomyLabel(sub, language)}
                      <span className={clsx("text-xs", !on && textTertiary)}>
                        · {taxonomyLabel(group, language)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={clsx("text-sm", textTertiary)}>
              {t("cat_search_empty")}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3">
        {BUSINESS_TAXONOMY.map((g) => {
          const on = selection.categoryGroups.includes(g.en);
          const picked = selection.subcategories.filter(
            (s) => groupOfSubcategory(s)?.en === g.en,
          ).length;
          const Icon = g.icon;
          const blocked = full && !on;
          return (
            <button
              key={g.en}
              type="button"
              aria-pressed={on}
              aria-disabled={blocked || undefined}
              onClick={() => apply(toggleGroup(selection, g.en))}
              className={clsx(
                "relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-4 text-center transition-colors",
                focusRing,
                isDark
                  ? "focus-visible:ring-offset-gray-900"
                  : "focus-visible:ring-offset-white",
                on
                  ? isDark
                    ? "border-teal-500 bg-teal-900/25 ring-1 ring-teal-500"
                    : "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
                  : isDark
                    ? "border-gray-700 bg-gray-800/60 hover:border-teal-500"
                    : "border-gray-200 bg-white hover:border-teal-500",
                blocked && "opacity-50",
              )}
            >
              {on && (
                <span className="absolute top-2 start-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
              )}
              {picked > 0 && (
                <span
                  className={clsx(
                    "absolute top-2 end-2 rounded-full px-1.5 text-[11px] font-medium leading-5",
                    isDark
                      ? "bg-teal-900/60 text-teal-200"
                      : "bg-teal-100 text-teal-800",
                  )}
                >
                  {picked}
                </span>
              )}
              <Icon
                className={clsx(
                  "h-7 w-7",
                  on
                    ? isDark
                      ? "text-teal-300"
                      : "text-teal-700"
                    : textTertiary,
                )}
                strokeWidth={1.6}
                aria-hidden
              />
              <span
                className={clsx(
                  "text-sm font-medium leading-snug",
                  on
                    ? isDark
                      ? "text-teal-200"
                      : "text-teal-800"
                    : textPrimary,
                )}
              >
                {taxonomyLabel(g, language)}
              </span>
              <span
                className={clsx(
                  "hidden text-xs leading-snug sm:block",
                  textTertiary,
                )}
              >
                {groupExamples(g, language)}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={clsx("mt-4 flex items-center gap-2 text-sm", textTertiary)}
        aria-live="polite"
      >
        <Info className="h-4 w-4 shrink-0" aria-hidden />
        {limitHit
          ? t("cat_max_groups", { max: MAX_CATEGORY_GROUPS })
          : t("cat_groups_hint")}
      </div>
      <ErrorText error={error} />
    </div>
  );
}

/* --------------------------------------------------------- step 2 --- */

/** "What exactly do you offer?": subcategory chips per area, one starred. */
export function SubcategoriesStep({
  selection,
  onChange,
  error,
  showAiNote = true,
}: StepProps) {
  const { t, i18n } = useTranslation("onboarding");
  // Static labels follow the UI language (not the API language setting).
  const language = i18n.resolvedLanguage ?? i18n.language;
  const { isDark, textPrimary, textTertiary } = useThemeClasses();
  const [adding, setAdding] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const keys = selectedKeys(selection);

  const labelOf = (key: string) =>
    key.startsWith("custom:")
      ? key.slice(7)
      : taxonomyLabel(
          findSubcategory(key) ?? { en: key, he: key, ar: key },
          language,
        );

  const submitCustom = (group: string) => {
    onChange(addCustom(selection, group, customText));
    setCustomText("");
    setAdding(null);
  };

  const ringOffset = isDark
    ? "focus-visible:ring-offset-gray-900"
    : "focus-visible:ring-offset-white";

  return (
    <div>
      {/* Picked items, with the star for the main one */}
      <section
        aria-label={t("cat_your_picks")}
        className={clsx(
          "mb-6 rounded-xl border p-4",
          isDark
            ? "border-gray-700 bg-gray-800/60"
            : "border-gray-200 bg-gray-50",
        )}
      >
        <h3 className={clsx("mb-3 text-xs font-semibold", textTertiary)}>
          {t("cat_your_picks")}
        </h3>
        {keys.length ? (
          <ul className="flex flex-wrap gap-2">
            {keys.map((key) => {
              const main = key === selection.mainCategory;
              const label = labelOf(key);
              return (
                <li
                  key={key}
                  className={clsx(
                    "flex items-center gap-1 rounded-full border py-1 ps-1 pe-1 text-sm",
                    main
                      ? isDark
                        ? "border-amber-500/60 bg-amber-900/25 text-amber-100"
                        : "border-amber-400 bg-amber-50 text-amber-900"
                      : isDark
                        ? "border-teal-600/50 bg-teal-900/25 text-teal-100"
                        : "border-teal-300 bg-teal-50 text-teal-900",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={main}
                    aria-label={t("cat_set_main", { label })}
                    title={t("cat_set_main", { label })}
                    onClick={() => onChange(setMain(selection, key))}
                    className={clsx(
                      "flex h-7 w-7 items-center justify-center rounded-full",
                      focusRing,
                      ringOffset,
                    )}
                  >
                    <Star
                      className={clsx(
                        "h-4 w-4",
                        main ? "fill-amber-500 text-amber-500" : textTertiary,
                      )}
                      aria-hidden
                    />
                  </button>
                  <span>{label}</span>
                  {main && (
                    <span className="rounded-full bg-amber-500 px-2 text-[11px] font-semibold leading-5 text-amber-950">
                      {t("cat_main")}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={t("cat_remove", { label })}
                    onClick={() => onChange(removeKey(selection, key))}
                    className={clsx(
                      "flex h-7 w-7 items-center justify-center rounded-full",
                      focusRing,
                      ringOffset,
                    )}
                  >
                    <X
                      className={clsx("h-3.5 w-3.5", textTertiary)}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={clsx("text-sm", textTertiary)}>{t("cat_none_yet")}</p>
        )}
        {keys.length > 1 && (
          <p
            className={clsx(
              "mt-3 flex items-center gap-1.5 text-xs",
              textTertiary,
            )}
          >
            <Star className="h-3.5 w-3.5" aria-hidden />
            {t("cat_star_hint")}
          </p>
        )}
      </section>

      {/* Subcategories of each chosen area */}
      {selection.categoryGroups.map((groupEn) => {
        const g = findGroup(groupEn);
        if (!g) return null;
        const Icon = g.icon;
        const count =
          g.subcategories.filter((s) => selection.subcategories.includes(s.en))
            .length +
          selection.customCategories.filter((c) => c.group === g.en).length;
        const headingId = `cat-group-${g.en.replace(/\W+/g, "-")}`;
        return (
          <section key={g.en} className="mb-6" aria-labelledby={headingId}>
            <div className="mb-3 flex items-center gap-2">
              <Icon
                className={clsx(
                  "h-5 w-5",
                  isDark ? "text-teal-300" : "text-teal-700",
                )}
                aria-hidden
              />
              <h3
                id={headingId}
                className={clsx("text-base font-semibold", textPrimary)}
              >
                {taxonomyLabel(g, language)}
              </h3>
              {count > 0 && (
                <span className={clsx("ms-auto text-xs", textTertiary)}>
                  {t("cat_n_picked", { count })}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {g.subcategories.map((sub) => {
                const on = selection.subcategories.includes(sub.en);
                return (
                  <button
                    key={sub.en}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      onChange(toggleSubcategory(selection, sub.en))
                    }
                    className={clsx(
                      "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors",
                      focusRing,
                      ringOffset,
                      on
                        ? "border-teal-600 bg-teal-600 text-white"
                        : isDark
                          ? "border-gray-700 bg-gray-800/60 text-gray-200 hover:border-teal-500"
                          : "border-gray-300 bg-white text-gray-800 hover:border-teal-500",
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                    {taxonomyLabel(sub, language)}
                  </button>
                );
              })}
              {selection.customCategories
                .filter((c) => c.group === g.en)
                .map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    aria-pressed
                    onClick={() =>
                      onChange(removeKey(selection, customKey(c.label)))
                    }
                    className={clsx(
                      "flex items-center gap-1.5 rounded-full border border-teal-600 bg-teal-600 px-3.5 py-2 text-sm text-white",
                      focusRing,
                      ringOffset,
                    )}
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {c.label}
                  </button>
                ))}
              {adding === g.en ? (
                <form
                  className="flex items-center gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitCustom(g.en);
                  }}
                >
                  <input
                    autoFocus
                    value={customText}
                    maxLength={40}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.stopPropagation();
                        setAdding(null);
                      }
                    }}
                    aria-label={t("cat_custom_label")}
                    placeholder={t("cat_custom_placeholder")}
                    className={clsx(
                      "w-44 rounded-full border px-3.5 py-2 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-teal-500/60",
                      isDark
                        ? "border-gray-600 bg-gray-800 text-gray-100"
                        : "border-gray-300 bg-white text-gray-900",
                    )}
                  />
                  <button
                    type="submit"
                    className={clsx(
                      "rounded-full bg-teal-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-700",
                      focusRing,
                      ringOffset,
                    )}
                  >
                    {t("cat_custom_add")}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCustomText("");
                    setAdding(g.en);
                  }}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-full border border-dashed px-3.5 py-2 text-sm",
                    focusRing,
                    ringOffset,
                    isDark
                      ? "border-gray-600 text-gray-400 hover:border-teal-500"
                      : "border-gray-300 text-gray-500 hover:border-teal-500",
                  )}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  {t("cat_something_else")}
                </button>
              )}
            </div>
          </section>
        );
      })}

      {showAiNote && (
        <div
          className={clsx(
            "flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-6",
            isDark
              ? "bg-violet-900/25 text-violet-200"
              : "bg-violet-50 text-violet-900",
          )}
        >
          <Sparkles className="mt-1 h-4 w-4 shrink-0" aria-hidden />
          {t("cat_ai_note")}
        </div>
      )}
      <ErrorText error={error} />
    </div>
  );
}

/* ------------------------------------------- business wizard --- */

/**
 * Both category steps on one screen, for the Add / Edit business wizard:
 * areas first, then the subcategories of the chosen areas.
 */
export function CategoryPicker({ selection, onChange, error }: StepProps) {
  const { t } = useTranslation("onboarding");
  const { textPrimary, textTertiary } = useThemeClasses();
  return (
    <div className="space-y-8">
      <section aria-labelledby="cat-picker-areas">
        <h3
          id="cat-picker-areas"
          className={clsx("text-base font-semibold", textPrimary)}
        >
          {t("cat_groups_title")}
        </h3>
        <p className={clsx("mb-4 mt-1 text-sm", textTertiary)}>
          {t("cat_groups_sub")}
        </p>
        <CategoryGroupsStep selection={selection} onChange={onChange} />
      </section>
      {selection.categoryGroups.length > 0 && (
        <section aria-labelledby="cat-picker-subs">
          <h3
            id="cat-picker-subs"
            className={clsx("text-base font-semibold", textPrimary)}
          >
            {t("cat_subs_title")}
          </h3>
          <p className={clsx("mb-4 mt-1 text-sm", textTertiary)}>
            {t("cat_subs_sub")}
          </p>
          <SubcategoriesStep
            selection={selection}
            onChange={onChange}
            error={error}
            showAiNote={false}
          />
        </section>
      )}
    </div>
  );
}
