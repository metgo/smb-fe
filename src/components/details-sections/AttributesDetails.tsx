import clsx from "clsx";
import type { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Accessibility,
  Users,
  Tag,
  Grid3x3,
  CheckCircle2,
  TagIcon,
  type LucideIcon,
} from "lucide-react";

import { getMatchedItems } from "@/helpers";
import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttributesDetailsProps {
  categoriesId?: string[];
  groupTypesId?: string[];
  subCategoriesId?: string[];
  accessibilitiesId?: string[];
  tags?: ITags[];
}

interface AttributeSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  isDark: boolean;
  colorScheme: ColorScheme;
  children: ReactNode;
}

type ColorScheme = "green" | "blue" | "purple" | "orange";

// ─── Color Maps ───────────────────────────────────────────────────────────────

const COLOR_MAP: Record<
  ColorScheme,
  {
    iconWrap: string;
    iconWrapDark: string;
    icon: string;
    iconDark: string;
    badge: string;
    badgeDark: string;
  }
> = {
  green: {
    iconWrap: "bg-green-100",
    iconWrapDark: "bg-green-500/20",
    icon: "text-green-600",
    iconDark: "text-green-400",
    badge:
      "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300",
    badgeDark:
      "bg-green-500/20 text-green-400 border border-green-800/50 hover:bg-green-500/30",
  },
  blue: {
    iconWrap: "bg-blue-100",
    iconWrapDark: "bg-blue-500/20",
    icon: "text-blue-600",
    iconDark: "text-blue-400",
    badge: "bg-blue-100 text-blue-800 border border-blue-300",
    badgeDark: "bg-blue-900/30 text-blue-400 border border-blue-800",
  },
  purple: {
    iconWrap: "bg-purple-100",
    iconWrapDark: "bg-purple-500/20",
    icon: "text-purple-600",
    iconDark: "text-purple-400",
    badge: "bg-purple-100 text-purple-800 border border-purple-300",
    badgeDark: "bg-purple-900/30 text-purple-400 border border-purple-800",
  },
  orange: {
    iconWrap: "bg-orange-100",
    iconWrapDark: "bg-orange-500/20",
    icon: "text-orange-600",
    iconDark: "text-orange-400",
    badge: "bg-orange-100 text-orange-800 border border-orange-300",
    badgeDark: "bg-orange-900/30 text-orange-400 border border-orange-800",
  },
};

// ─── AttributeSection ─────────────────────────────────────────────────────────

const AttributeSection: FC<AttributeSectionProps> = ({
  icon: Icon,
  title,
  subtitle,
  isDark,
  colorScheme,
  children,
}) => {
  const colors = COLOR_MAP[colorScheme];

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 md:p-6 transition-all duration-200",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={clsx(
            "p-2 rounded-lg shrink-0",
            isDark ? colors.iconWrapDark : colors.iconWrap,
          )}
        >
          <Icon
            className={clsx("w-5 h-5", isDark ? colors.iconDark : colors.icon)}
          />
        </div>
        <div className="min-w-0">
          <h3
            className={clsx(
              "text-sm sm:text-base font-semibold truncate",
              isDark ? "text-gray-200" : "text-gray-800",
            )}
          >
            {title}
          </h3>
          <p
            className={clsx(
              "text-xs mt-0.5 truncate",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────

const Badge: FC<{
  icon: LucideIcon;
  label: string;
  isDark: boolean;
  colorScheme: ColorScheme;
  animate?: boolean;
}> = ({ icon: Icon, label, isDark, colorScheme, animate = false }) => {
  const colors = COLOR_MAP[colorScheme];

  return (
    <span
      className={clsx(
        "px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium",
        animate && "transition-transform duration-200 hover:scale-105",
        isDark ? colors.badgeDark : colors.badge,
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate max-w-40 sm:max-w-none">{label}</span>
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AttributesDetails: FC<AttributesDetailsProps> = ({
  tags = [],
  categoriesId,
  groupTypesId,
  subCategoriesId,
  accessibilitiesId,
}) => {
  const { t } = useTranslation("common");
  const { isDark, language } = useThemeClasses();
  const { categories, subCategories, groupTypes, accessibility } = useCommon();

  const filteredCategories = getMatchedItems(categories, categoriesId) ?? [];
  const filteredSubcategories =
    getMatchedItems(subCategories, subCategoriesId) ?? [];
  const filteredAccessibilities =
    getMatchedItems(accessibility, accessibilitiesId) ?? [];
  const filteredGroupTypes = getMatchedItems(groupTypes, groupTypesId) ?? [];
  const filteredTags = tags.filter((tag) => tag?.[language]?.trim());

  const hasAnyData =
    filteredTags.length > 0 ||
    filteredCategories.length > 0 ||
    filteredSubcategories.length > 0 ||
    filteredAccessibilities.length > 0 ||
    filteredGroupTypes.length > 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const pluralise = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural}`;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Categories */}
      {filteredCategories.length > 0 && (
        <AttributeSection
          icon={Grid3x3}
          title={t("categories")}
          subtitle={`${pluralise(filteredCategories.length, "category", "categories")} selected`}
          isDark={isDark}
          colorScheme="green"
        >
          {filteredCategories.map((item: any, idx: number) => (
            <Badge
              key={item?.id ?? idx}
              icon={CheckCircle2}
              label={item?.name ?? "—"}
              isDark={isDark}
              colorScheme="green"
              animate
            />
          ))}
        </AttributeSection>
      )}

      {/* Subcategories */}
      {filteredSubcategories.length > 0 && (
        <AttributeSection
          icon={Grid3x3}
          title={t("subcategories")}
          subtitle={`${pluralise(filteredSubcategories.length, "sub-category", "sub-categories")} selected`}
          isDark={isDark}
          colorScheme="green"
        >
          {filteredSubcategories.map((item: any, idx: number) => (
            <Badge
              key={item?.id ?? idx}
              icon={CheckCircle2}
              label={item?.name ?? "—"}
              isDark={isDark}
              colorScheme="green"
              animate
            />
          ))}
        </AttributeSection>
      )}

      {/* Accessibility */}
      {filteredAccessibilities.length > 0 && (
        <AttributeSection
          icon={Accessibility}
          title={t("accessiblities")}
          subtitle={`${pluralise(filteredAccessibilities.length, "feature", "features")} available`}
          isDark={isDark}
          colorScheme="blue"
        >
          {filteredAccessibilities.map((option: any, idx: number) => (
            <Badge
              key={option?.id ?? idx}
              icon={Accessibility}
              label={option?.name ?? "Unnamed Accessibility"}
              isDark={isDark}
              colorScheme="blue"
            />
          ))}
        </AttributeSection>
      )}

      {/* Group Types */}
      {filteredGroupTypes.length > 0 && (
        <AttributeSection
          icon={Users}
          title={t("group_types")}
          subtitle={`Suitable for ${pluralise(filteredGroupTypes.length, "group type", "group types")}`}
          isDark={isDark}
          colorScheme="purple"
        >
          {filteredGroupTypes.map((type: any, idx: number) => (
            <Badge
              key={type?.id ?? idx}
              icon={Users}
              label={type?.name ?? "Unnamed Group"}
              isDark={isDark}
              colorScheme="purple"
            />
          ))}
        </AttributeSection>
      )}

      {/* Tags */}
      {filteredTags.length > 0 && (
        <AttributeSection
          icon={TagIcon}
          title={t("tags")}
          subtitle={pluralise(filteredTags.length, "tag", "tags")}
          isDark={isDark}
          colorScheme="orange"
        >
          {filteredTags.map((tag, idx) => (
            <Badge
              key={idx}
              icon={TagIcon}
              label={tag[language]}
              isDark={isDark}
              colorScheme="orange"
            />
          ))}
        </AttributeSection>
      )}

      {/* Empty State */}
      {!hasAnyData && (
        <div
          className={clsx(
            "rounded-xl border p-8 sm:p-12 text-center",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200",
          )}
        >
          <Tag
            className={clsx(
              "w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          />
          <h3
            className={clsx(
              "text-sm sm:text-base font-semibold mb-1",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            {t("no_attribute_selected")}
          </h3>
          <p
            className={clsx(
              "text-xs sm:text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {t("no_attribute_selected_info")}
          </p>
        </div>
      )}
    </div>
  );
};

export default AttributesDetails;
