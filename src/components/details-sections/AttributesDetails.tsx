import clsx from "clsx";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import {
  Accessibility,
  Users,
  Tag,
  Grid3x3,
  CheckCircle2,
  TagIcon,
} from "lucide-react";

import { getMatchedItems } from "@/helpers";
import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface AttributesDetailsProps {
  title: string;
  categoriesId?: string[];
  groupTypesId?: string[];
  subCategoriesId?: string[];
  accessibilitiesId?: string[];
  tags?: string[];
}

const AttributesDetails: FC<AttributesDetailsProps> = ({
  // title,
  tags = [],
  categoriesId,
  groupTypesId,
  subCategoriesId,
  accessibilitiesId,
}) => {
  console.log("🚀 ~ AttributesDetails ~ categoriesId:", categoriesId);

  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  const { categories, subCategories, groupTypes, accessibility } = useCommon();

  const filteredCategories = getMatchedItems(categories, categoriesId) || [];
  const filteredSubcategories =
    getMatchedItems(subCategories, subCategoriesId) || [];
  const filteredAccessibilities =
    getMatchedItems(accessibility, accessibilitiesId) || [];
  const filteredGroupTypes = getMatchedItems(groupTypes, groupTypesId) || [];

  const hasAnyData =
    tags?.length > 0 ||
    filteredCategories?.length > 0 ||
    filteredSubcategories?.length > 0 ||
    filteredAccessibilities?.length > 0 ||
    filteredGroupTypes?.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h2
          className={clsx(
            "text-2xl font-bold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {title}
        </h2>
        <p
          className={clsx(
            "text-sm mt-1",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {t("attributes_desc")}
        </p>
      </div> */}

      {/* categories */}
      {categoriesId && categoriesId?.length > 0 && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-green-500/20" : "bg-green-100",
              )}
            >
              <Grid3x3
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-green-400" : "text-green-600",
                )}
              />
            </div>
            <div>
              <h3
                className={clsx(
                  "text-base font-semibold",
                  isDark ? "text-gray-200" : "text-gray-800",
                )}
              >
                {t("categories")}
              </h3>
              <p
                className={clsx(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {filteredCategories.length}{" "}
                {filteredCategories.length === 1 ? "category" : "categories"}{" "}
                selected
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredCategories?.map((item: any, idx: number) => (
              <span
                key={idx}
                className={clsx(
                  "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105",
                  isDark
                    ? "bg-green-500/20 text-green-400 border border-green-800/50 hover:bg-green-500/30"
                    : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300",
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
                {item?.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subcategories */}
      {subCategoriesId && subCategoriesId?.length > 0 && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-green-500/20" : "bg-green-100",
              )}
            >
              <Grid3x3
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-green-400" : "text-green-600",
                )}
              />
            </div>
            <div>
              <h3
                className={clsx(
                  "text-base font-semibold",
                  isDark ? "text-gray-200" : "text-gray-800",
                )}
              >
                {t("subcategories")}
              </h3>
              <p
                className={clsx(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {filteredSubcategories.length}{" "}
                {filteredSubcategories.length === 1
                  ? "sub-category"
                  : "sub-categories"}{" "}
                selected
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {getMatchedItems(subCategories, subCategoriesId).map(
              (item: any, idx: number) => (
                <span
                  key={idx}
                  className={clsx(
                    "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105",
                    isDark
                      ? "bg-green-500/20 text-green-400 border border-green-800/50 hover:bg-green-500/30"
                      : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300",
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {item?.name}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {/* Accessibility Options */}
      {filteredAccessibilities.length > 0 && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-blue-500/20" : "bg-blue-100",
              )}
            >
              <Accessibility
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-blue-400" : "text-blue-600",
                )}
              />
            </div>
            <div>
              <h3
                className={clsx(
                  "text-base font-semibold",
                  isDark ? "text-gray-200" : "text-gray-800",
                )}
              >
                {t("accessiblities")}
              </h3>
              <p
                className={clsx(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {filteredAccessibilities.length}{" "}
                {filteredAccessibilities.length === 1 ? "feature" : "features"}{" "}
                available
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {filteredAccessibilities.map((option: any, idx: number) => (
              <span
                key={option?.id ?? idx}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  isDark
                    ? "bg-blue-900/30 text-blue-400 border border-blue-800"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                <Accessibility className="w-4 h-4" />
                {option?.name ? option.name : "Unnamed Accessibility"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Group Types */}
      {filteredGroupTypes.length > 0 && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-purple-500/20" : "bg-purple-100",
              )}
            >
              <Users
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-purple-400" : "text-purple-600",
                )}
              />
            </div>
            <div>
              <h3
                className={clsx(
                  "text-base font-semibold",
                  isDark ? "text-gray-200" : "text-gray-800",
                )}
              >
                {t("group_types")}
              </h3>
              <p
                className={clsx(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                Suitable for {filteredGroupTypes.length}{" "}
                {filteredGroupTypes.length === 1 ? "group type" : "group types"}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {filteredGroupTypes.map((type: any, idx: number) => (
              <span
                key={type?.id ?? idx}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  isDark
                    ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                    : "bg-purple-100 text-purple-800 border border-purple-300"
                }`}
              >
                <Users className="w-4 h-4" />
                {type?.name ? type.name : "Unnamed Group"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Group Types */}
      {tags.length > 0 && (
        <div
          className={clsx(
            "rounded-xl border p-6 transition-all duration-200",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-orange-500/20" : "bg-orange-100",
              )}
            >
              <TagIcon
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-orange-400" : "text-orange-600",
                )}
              />
            </div>
            <div>
              <h3
                className={clsx(
                  "text-base font-semibold",
                  isDark ? "text-gray-200" : "text-gray-800",
                )}
              >
                {t("tags")}
              </h3>
              <p
                className={clsx(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                Suitable for {tags.length} {tags.length === 1 ? "tag" : "tags"}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  isDark
                    ? "bg-orange-900/30 text-orange-400 border border-orange-800"
                    : "bg-orange-100 text-orange-800 border border-orange-300"
                }`}
              >
                <TagIcon className="w-4 h-4" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasAnyData && (
        <div
          className={clsx(
            "rounded-xl border p-12 text-center",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200",
          )}
        >
          <Tag
            className={clsx(
              "w-12 h-12 mx-auto mb-3",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          />
          <h3
            className={clsx(
              "text-base font-semibold mb-1",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            {t("no_attribute_selected")}
          </h3>
          <p
            className={clsx(
              "text-sm",
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
