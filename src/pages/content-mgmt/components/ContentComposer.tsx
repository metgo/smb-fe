import { useThemeClasses } from "@/hooks/useThemeClasses";
import { CategoryContentSection, ContentSection } from "./sub-components";
import { CKEditorWrapper } from "@/components/wrapper";
import { toast } from "sonner";
import { useCommon } from "@/hooks/useCommon";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";


interface ContentComposerProps {

}


interface Category {
  id: string;
  name: string;
  businessIds: string[];
  description: string;
}

const STORAGE_KEY = "content-manager-categories";


const ContentComposer = ({ }: ContentComposerProps) => {
  const { t } = useTranslation("businesses");

  const { isDark } = useThemeClasses()
  const { allWebsites } = useCommon();
  const [selectedId, setSelectedId] = useState<"all" | string>("all");
  const [fullDescription, setFullDescription] = useState("<p></p>");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);


  // Load categories
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCategories(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    } else {
      const defaults: Category[] = [
        {
          id: "featured",
          name: t("featured_businesses"),
          businessIds: [],
          description: "",
        },
        {
          id: "homepage-hero",
          name: t("homepage_hero_section"),
          businessIds: [],
          description: "",
        },
        {
          id: "recommended",
          name: t("recommended_this_week"),
          businessIds: [],
          description: "",
        },
      ];
      setCategories(defaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
  }, []);

  // Save categories
  useEffect(() => {
    if (categories?.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);


  const handleAddToCategory = (businessId: string, categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, businessIds: [...cat.businessIds, businessId] }
          : cat,
      ),
    );
    toast.success(t("business_added_to_category"));
  };

  const handleRemoveFromCategory = (categoryId: string, businessId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            businessIds: cat.businessIds.filter((id) => id !== businessId),
          }
          : cat,
      ),
    );
    toast.success(t("business_removed_from_category"));
  };

  const handleRenameCategory = (categoryId: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName } : cat,
      ),
    );
    toast.success(t("rename_category"));
  };

  const handleDeleteCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);

    if (!cat) return;
    if (cat) {
      setDeleteConfirmation({
        categoryId: cat.id,
        categoryName: cat.name,
        businessCount: cat?.businessIds?.length,
      });
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success(t("category_deleted"));
    }
  };



  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      businessIds: [],
      description: fullDescription,
    };
    setCategories((prev) => [...prev, newCat]);

    setNewCategoryName("");
    setFullDescription("");
    toast.success(t("category_created"));
  };

  return (
    <div className="min-w-0 flex-1 p-6">
      {" "}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              className={`${isDark ? "text-gray-400" : "text-gray-700"} text-lg font-semibold `}
            >
              {t("custom_categories_title")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("custom_categories_description")}
            </p>
          </div>
          <select
            value={selectedId ?? "all"}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setSelectedId("");
              } else {
                setSelectedId(value);
              }
            }}
            className={`
                      h-10 px-6 pr-8
                      text-sm font-medium
                      rounded-md
                      shadow-sm
                      appearance-none
                      cursor-pointer
                      transition-colors duration-150
                      border
                      ${isDark
                ? "bg-gray-800 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
              }
                      focus:outline-none focus:ring-2
                      ${isDark
                ? "focus:border-blue-500/70 focus:ring-blue-500/30"
                : "focus:border-blue-500 focus:ring-blue-500/40"
              }
                    `}
          >
            <option value="all">{t("all_websites_option")}</option>

            {allWebsites?.map((site) => (
              <option key={site._id} value={site._id}>
                {site.name}
              </option>
            ))}
          </select>
          {/* Add more */}
        </div>

        <div className="mb-6 flex gap-3">
          <input
            placeholder={t("new_category_name_placeholder")}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleCreateCategory()
            }
            className={`
                        w-full px-3 py-2 rounded-md border 
                        ${isDark
                ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500/70 focus:ring-blue-500/30"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/40"
              }
                        focus:outline-none focus:ring-2 transition-colors duration-150
                      `}
          />
          <Button
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("create")}
          </Button>
        </div>
        <div className="my-4">
          <CKEditorWrapper
            value={fullDescription}
            onChange={setFullDescription}
          />
        </div>

        <div className="space-y-6">
          {categories?.map((category) => (
            <CategoryContentSection
              key={category.id}
              category={category}
              businesses={combinedBusinesses}
              selectedIds={new Set()}
              onSelect={() => { }}
              onRemove={(_id) =>
                handleRemoveFromCategory(category.id, _id)
              }
              categories={categories}
              onAddToCategory={handleAddToCategory}
              onRename={handleRenameCategory}
              onDelete={handleDeleteCategory}
              onClearSelection={() =>
                setSelectedBacklogIds(new Set())
              }
            />
          ))}

          {categories?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No categories yet. Create one to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContentComposer