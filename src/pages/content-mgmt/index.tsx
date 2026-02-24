import React, { useState, useEffect, useMemo } from "react";
import { mockBusinesses } from "@/helpers/mockBusinesses";
import {
  Search,
  Plus,
  X,
  ChevronDown,
  Edit2,
  Check,
  MoreVertical,
  Trash2,
  Send,
  Badge,
  Loader2,
  Loader,
} from "lucide-react";
import FilterChips from "@/components/shared/FilterChips";

import { Button } from "@/components/ui/button";

import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";

import { MessageComposerModal } from "./components/MessageComposerModal";
import { SendResultsModal } from "./components/SendResultsModal";
import { useGetAllbusinessesQuery } from "@/store/api/businessQueryApi";
import { useAppSelector } from "@/hooks/hooks";
import SearchInput from "@/components/shared/SearchInput";
import { ViewModeToggle } from "@/components/shared";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { useCommon } from "@/hooks/useCommon";
import ContentGridView from "./components/sub-components/ContentGridView";
import ContentListView from "./components/sub-components/ContentListView";

// ───────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────

type Language = "en" | "he" | "ar";
type Theme = "light" | "dark" | "system";

interface SendResult {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  emailStatus: "success" | "failed";
  smsStatus: "success" | "failed";
  errorMessage?: string;
}

interface MessageData {
  subject: string;
  emailMessage: string;
  smsMessage: string;
  template?: string;
}

interface ContentMgmtPageProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onNavigate: (item: string) => void;
}

interface Category {
  id: string;
  name: string;
  businessIds: string[];
}

type ViewMode = "grid" | "list";

const ItemTypes = {
  BUSINESS_CARD: "business_card",
};

const STORAGE_KEY = "content-manager-categories";

// ───────────────────────────────────────────────
//  Language hook (placeholder — replace with real one)
// ───────────────────────────────────────────────

const useLanguage = () => ({
  t: {
    contentManager: "Content Manager",
  },
  isRTL: false,
});

// ───────────────────────────────────────────────
//  Draggable Business Card
// ───────────────────────────────────────────────

function DraggableBusinessCard({
  business,
  isSelected,
  onSelect,
  onRemove,
  // categories,
  viewMode,
  isInCategory = false,
  selectedIds,
  // onAddToCategory,
}: {
  business: any;
  isSelected: boolean;
  onSelect: (id: string, isMulti: boolean) => void;
  onRemove?: (id: string) => void;
  categories: Category[];
  onAddToCategory: (businessId: string, categoryId: string) => void;
  viewMode: ViewMode;
  isInCategory?: boolean;
  selectedIds: Set<string>;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BUSINESS_CARD,
    canDrag: !isInCategory, //  (prevents dragging out from inside category)
    item: () => {
      // When dragging a card that is NOT selected, only drag that one
      if (!isSelected) {
        return {
          ids: [business._id], ///usedrop id not matching
          isMultiple: false,
          count: 1,
        };
      }

      // When the card IS selected drag all currently selected items
      if (selectedIds.size > 0) {
        return {
          ids: Array.from(selectedIds),
          isMultiple: true,
          count: selectedIds.size,
        };
      }

      // fallback (shouldn't happen)
      return {
        ids: [business.id],
        isMultiple: false,
        count: 1,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e: React.MouseEvent) => {
    const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelect(business.id, isMulti);
  };

  const handleContextMenu = () => {
    if (!isSelected) {
      onSelect(business.id, false);
    }
  };

  // const availableCategories = categories.filter(
  //   (cat) => !cat.businessIds.includes(business.id),
  // );

  // ────────────────────────────────────────────────
  // Common shared parts
  // ────────────────────────────────────────────────

  const selectionClasses = isSelected
    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/50"
    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";

  const draggingClasses = isDragging ? "opacity-50" : "opacity-100";

  const baseClasses = `
    cursor-pointer transition-all border
    ${draggingClasses}
    ${selectionClasses}
  `;

  const logoSrc = business?.logo?.image;
  const logoAlt = business?.name;
  const primaryCategory = business?.primaryCategoryId;

  if (viewMode === "list") {
    return (
      <ContentListView
        drag={drag}
        handleClick={handleClick}
        handleContextMenu={handleContextMenu}
        baseClasses={baseClasses}
        logoSrc={logoSrc}
        logoAlt={logoAlt}
        business={business}
        primaryCategory={primaryCategory}
        isInCategory={isInCategory}
        onRemove={onRemove}
      />
    );
  }

  // Default: grid view
  return (
    <ContentGridView
      drag={drag}
      handleClick={handleClick}
      handleContextMenu={handleContextMenu}
      baseClasses={baseClasses}
      logoSrc={logoSrc}
      logoAlt={logoAlt}
      isInCategory={isInCategory}
      onRemove={onRemove}
      business={business}
      primaryCategory={primaryCategory}
    />
  );
}
// ───────────────────────────────────────────────
//  Category Section
// ───────────────────────────────────────────────

function CategorySection({
  category,
  businesses,
  selectedIds,
  onSelect,
  onRemove,
  categories,
  onAddToCategory,
  onRename,
  onDelete,
  onClearSelection,
}: {
  category: Category;
  businesses: any;
  selectedIds: Set<string>;
  onSelect: (id: string, isMulti: boolean) => void;
  onRemove: (businessId: string) => void;
  categories: Category[];
  onAddToCategory: (businessId: string, categoryId: string) => void;
  onRename: (categoryId: string, newName: string) => void;
  onDelete: (categoryId: string) => void;
  viewMode: ViewMode;
  onClearSelection?: () => void;
}) {
  const { isDark } = useThemeClasses();

  const { isRTL } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.name);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.BUSINESS_CARD,
    drop: (item: { ids: string[]; isMultiple: boolean; count: number }) => {
      const newBusinessIds = item?.ids?.filter(
        (id) => !category.businessIds.includes(id),
      );
      newBusinessIds.forEach((id) => {
        onAddToCategory(id, category.id);
      });
      if (newBusinessIds.length > 0) {
        toast.success(
          newBusinessIds?.length === 1
            ? "Business added to category"
            : `${newBusinessIds?.length} businesses added to category`,
        );
        onClearSelection?.();
        console.log("🚀 ~ CategorySection ~ newBusinessIds:", newBusinessIds);
      } else if (item?.ids?.length > 0) {
        toast.info("Businesses already in this category");
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleRename = () => {
    if (editValue.trim() && editValue !== category.name) {
      onRename(category.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const categoryBusinesses = businesses?.filter((b: any) =>
    category?.businessIds?.includes(b._id),
  );

  return (
    <div
      ref={drop}
      className={`
    rounded-lg border p-4 transition-all duration-200
    ${
      isOver
        ? isDark
          ? "border-teal-500 bg-teal-950/30 text-gray-100"
          : "border-teal-400 bg-teal-50/60 text-gray-900"
        : isDark
          ? "border-gray-700 bg-gray-800/50 text-gray-400"
          : "border-gray-200 bg-gray-50 text-gray-700"
    }
  `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "" : isRTL ? "rotate-90" : "-rotate-90"
              }`}
            />
          </Button>

          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setEditValue(category.name);
                    setIsEditing(false);
                  }
                }}
                className="h-8"
                autoFocus
              />
              <Button size="sm" onClick={handleRename}>
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditValue(category.name);
                  setIsEditing(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <h3
                className={`
    text-lg font-semibold
    ${isDark ? "text-gray-400" : "text-gray-900"}
  `}
              >
                {category.name}
              </h3>
              <Badge>{categoryBusinesses?.length}</Badge>
            </>
          )}
        </div>

        {!isEditing && (
          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className={`
    hover:bg-gray-200      ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}
    ${isDark ? "text-gray-300 hover:text-gray-100" : "text-gray-600 hover:text-gray-900"}
    focus-visible:outline-none focus-visible:ring-2 
    ${isDark ? "focus-visible:ring-gray-500/50" : "focus-visible:ring-gray-400/50"}
  `}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {showMenu && (
              <div
                className={`
                    absolute right-0 top-8 z-[9999] 
                    min-w-[180px] 
                    rounded-md shadow-lg
                    border
                    ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                  `}
              >
                <div className="py-1">
                  <button
                    className={`
                      w-full flex items-center px-4 py-2 text-sm
                      cursor-pointer transition-colors duration-150
                      ${
                        isDark
                          ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100 active:bg-gray-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
                      }
                    `}
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    <Edit2
                      className={`w-4 h-4 mr-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    />
                    Rename Category
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(category.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Category
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          {categoryBusinesses?.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-sm">
                Drag businesses here to add them to this category
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto max-w-[98vw]">
                <div className="flex gap-4 ">
                  {categoryBusinesses?.map((business: any) => (
                    <div key={business.id} className="w-64 flex-shrink-0">
                      <DraggableBusinessCard
                        business={business}
                        isSelected={selectedIds.has(business.id)}
                        onSelect={onSelect}
                        onRemove={onRemove}
                        categories={categories}
                        onAddToCategory={onAddToCategory}
                        viewMode="grid"
                        isInCategory={true}
                        selectedIds={selectedIds}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────
//  Main Page Component
// ───────────────────────────────────────────────

export default function ContentMgmtPage({ language }: ContentMgmtPageProps) {
  const { isRTL } = useLanguage();
  const { dmoId, authorityId, startDate, endDate, websiteId } = useAppSelector(
    (state) => state.auth,
  );
  const { t } = useTranslation("businesses");
  const [filters, setFilters] = useState({
    status: "all",
    hasProductFilter: "all",
    primaryCategory: "all",
    accessibility: "all",
    groupTypes: "all",
  });
  const clearFilter = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("businessSearchTerm");

    setFilters({
      status: "all",
      hasProductFilter: "all",
      primaryCategory: "all",
      accessibility: "all",
      groupTypes: "all",
    });
    setSearchQuery("");
    setPage(1);
  };
  const { isDark } = useThemeClasses();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      dmoId,
      startDate,
      endDate,
      authorityId,
      limit: 20,
      locale: language,
      externalApiId: websiteId,
    };

    const finalSearchTerm = searchQuery;
    if (finalSearchTerm) params.search = finalSearchTerm;

    if (filters.status !== "all") {
      params.status = filters.status;
    }

    if (filters.hasProductFilter !== "all") {
      params.hasProductFilter = filters.hasProductFilter === "yes";
    }
    if (filters.primaryCategory !== "all") {
      params.categories = filters.primaryCategory;
    }
    if (filters.accessibility !== "all") {
      params.accessibilityId = filters.accessibility;
    }
    if (filters.groupTypes !== "all") {
      params.groupTypes = filters.groupTypes;
    }
    return params;
  }, [
    page,
    searchQuery,
    language,
    dmoId,
    authorityId,
    startDate,
    endDate,
    websiteId,
    filters,
  ]);
  const {
    data: businessData,
    isLoading: isBusinessLoading,
    // isFetching,
    // refetch,
  } = useGetAllbusinessesQuery(queryParams);
  const [categories, setCategories] = useState<Category[]>([]);

  const { categories: categoryFilter, accessibility, groupTypes } = useCommon();

  const [viewMode, setViewMode] = useState<"list" | "grid">(
    (localStorage.getItem("contentViewMode") as "list" | "grid") ?? "list",
  );
  const [showFilters, setShowFilters] = useState(false);

  const [selectedCategories] = useState<string[]>([]);

  const [selectedBacklogIds, setSelectedBacklogIds] = useState<Set<string>>(
    new Set(),
  );
  const [newCategoryName, setNewCategoryName] = useState("");

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    categoryId: string;
    categoryName: string;
    businessCount: number;
  } | null>(null);

  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showSendResults, setShowSendResults] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);

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
        { id: "featured", name: "Featured Businesses", businessIds: [] },
        { id: "homepage-hero", name: "Homepage Hero Section", businessIds: [] },
        { id: "recommended", name: "Recommended This Week", businessIds: [] },
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

  const backlogBusinesses = useMemo(() => {
    return businessData?.data?.filter((business: any) => {
      if (selectedCategories?.length > 0) {
        const hasCat = business.categories?.some((c: any) =>
          selectedCategories?.includes(c),
        );
        if (!hasCat) return false;
      }
      return true;
    });
  }, [selectedCategories, businessData?.data]);

  const handleSelectBacklog = (id: string) => {
    setSelectedBacklogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddToCategory = (businessId: string, categoryId: string) => {
    console.log("🚀 ~ handleAddToCategory ~ businessId:", businessId);

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, businessIds: [...cat.businessIds, businessId] }
          : cat,
      ),
    );
    toast.success("Business added to category");
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
    toast.success("Business removed from category");
  };

  const handleRenameCategory = (categoryId: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName } : cat,
      ),
    );
    toast.success("Category renamed");
  };

  const handleDeleteCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);

    if (!cat) return;
    if (cat?.businessIds?.length > 0) {
      setDeleteConfirmation({
        categoryId: cat.id,
        categoryName: cat.name,
        businessCount: cat?.businessIds?.length,
      });
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success("Category deleted");
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteConfirmation.categoryId),
      );
      toast.success("Category deleted");
      setDeleteConfirmation(null);
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      businessIds: [],
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName("");
    toast.success("Category created");
  };

  const { allWebsites } = useCommon();
  const [selectedId, setSelectedId] = useState<"all" | string>("all");

  const handleSendMessage = () => {
    const selected = mockBusinesses.filter((b) => selectedBacklogIds.has(b.id));
    const results: SendResult[] = selected.map((business) => {
      const emailSuccess = Math.random() > 0.1;
      const smsSuccess = Math.random() > 0.15;
      return {
        customerId: business.id,
        customerName: `Customer of ${business.name}`,
        email: `customer@${business.name
          .toLowerCase()
          .replace(/\s+/g, "")}.com`,
        phone: `+972-5${Math.floor(Math.random() * 10)}-${Math.floor(
          1000000 + Math.random() * 9000000,
        )}`,
        emailStatus: emailSuccess ? "success" : "failed",
        smsStatus: smsSuccess ? "success" : "failed",
        errorMessage:
          !emailSuccess || !smsSuccess ? "Network timeout" : undefined,
      };
    });

    setSendResults(results);
    setShowMessageComposer(false);
    setShowSendResults(true);
    setSelectedBacklogIds(new Set());

    toast.success(
      `Messages sent to ${results?.length} customer${results?.length !== 1 ? "s" : ""}`,
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen  dark:bg-gray-950 transition-colors flex flex-col ${
          isRTL ? "rtl" : "ltr"
        } ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-hidden flex flex-col">
            {/* Fixed Header Section */}
            <div
              className={`
              shrink-0 
              border-b p-6
              ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}
            `}
            >
              <div className="mb-6">
                <h1
                  className={`
                text-2xl font-bold mb-2
                ${isDark ? "text-gray-400" : "text-gray-900"}
              `}
                >
                  {" "}
                  {"Content Manager"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize businesses into custom categories for your website
                  sections
                </p>
              </div>

              {selectedBacklogIds.size > 0 && (
                <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-teal-900 dark:text-teal-100">
                      {selectedBacklogIds.size} business
                      {selectedBacklogIds.size !== 1 ? "es" : ""} selected
                    </p>
                    <div className="flex items-center gap-2">
                      <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        Actions
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBacklogIds(new Set())}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex">
              {/* Source Backlog */}

              <div className="flex-1 p-6">
                <div className="">
                  <div className="mb-4 shrink-0">
                    <h2
                      className={`${isDark ? "text-gray-400" : "text-gray-700"} text-lg font-semibold `}
                    >
                      Source Backlog
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {backlogBusinesses?.length} businesses available
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <SearchInput
                          placeholder="Search businesses..."
                          searchTerm={searchQuery}
                          setSearchTerm={setSearchQuery}
                          storageKey="contentSearchTerm"
                        />
                      </div>
                      <FilterButton
                        value={showFilters}
                        onChange={setShowFilters}
                      />

                      <ViewModeToggle
                        onChange={setViewMode}
                        value={viewMode}
                        tableName="contentViewMode"
                      />
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                      <div
                        className={` border-t py-2 ${
                          isDark
                            ? "border-gray-800 bg-gray-900/30"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {/* Active Filters Title */}
                        <div className="flex flex-wrap items-start gap-4 ml-4  w-full">
                          <div className="grid grid-cols-3 gap-2">
                            {/* Status Filter */}
                            <div className="flex flex-col min-w-45">
                              <label
                                className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {t("status")}
                              </label>
                              <select
                                value={filters.status}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    status: e.target.value,
                                  })
                                }
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDark
                                    ? "bg-gray-800 border-gray-700 text-gray-200"
                                    : "bg-white border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                              >
                                <option value="all">{t("all")}</option>
                                <option value="DRAFT">{t("draft")}</option>
                                <option value="PENDING">{t("pending")}</option>
                                <option value="APPROVED">
                                  {t("approved")}
                                </option>
                                <option value="REJECTED">
                                  {t("rejected")}
                                </option>
                                <option value="CLOSED">{t("closed")}</option>
                              </select>
                            </div>

                            {/* Has Products Filter */}
                            <div className="flex flex-col min-w-45">
                              <label
                                className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {t("has_products")}
                              </label>
                              <select
                                value={filters.hasProductFilter}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    hasProductFilter: e.target.value,
                                  })
                                }
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDark
                                    ? "bg-gray-800 border-gray-700 text-gray-200"
                                    : "bg-white border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                              >
                                <option value="all">{t("all")}</option>
                                <option value="yes">{t("yes")}</option>
                                <option value="no">{t("no")}</option>
                              </select>
                            </div>

                            {/* Category Filter */}
                            <div className="flex flex-col min-w-45">
                              <label
                                className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {t("primary_category")}
                              </label>
                              <select
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    primaryCategory: e.target.value,
                                  })
                                }
                                value={filters.primaryCategory}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDark
                                    ? "bg-gray-800 border-gray-700 text-gray-200"
                                    : "bg-white border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                              >
                                <option value="">{t("all")}</option>
                                {categoryFilter?.map((cat: any) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Accessibility Filter */}
                            <div className="flex flex-col min-w-45">
                              <label
                                className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {t("accessibility")}
                              </label>
                              <select
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    accessibility: e.target.value,
                                  })
                                }
                                value={filters.accessibility}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDark
                                    ? "bg-gray-800 border-gray-700 text-gray-200"
                                    : "bg-white border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                              >
                                <option value="">{t("all")}</option>
                                {accessibility?.map((cat: any) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Group Types Filter */}
                            <div className="flex flex-col min-w-45">
                              <label
                                className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {t("group_types")}
                              </label>
                              <select
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    groupTypes: e.target.value,
                                  })
                                }
                                value={filters.groupTypes}
                                className={`w-full px-3 py-2 rounded-lg border ${
                                  isDark
                                    ? "bg-gray-800 border-gray-700 text-gray-200"
                                    : "bg-white border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                              >
                                <option value="">{t("all")}</option>
                                {groupTypes?.map((cat: any) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Active Filters Label + Chips */}
                          {(filters?.status !== "all" ||
                            filters?.hasProductFilter !== "all" ||
                            filters?.primaryCategory !== "all" ||
                            filters?.accessibility !== "all" ||
                            filters?.groupTypes !== "all") && (
                            <div className="flex flex-col min-w-45">
                              {/* Label inline with other filter labels */}
                              <label
                                className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {t("active_filters")}
                              </label>
                              <div className="flex gap-2 items-center">
                                {" "}
                                {/* Chips row */}
                                <div className="flex flex-wrap gap-2 mb-2 mt-2">
                                  {Object.entries(filters).map(
                                    ([key, value]) => {
                                      if (!value || value === "all")
                                        return null;

                                      let displayValue = value;
                                      if (key === "status") {
                                        displayValue =
                                          t(value.toLowerCase()) || value;
                                      } else if (key === "hasProductFilter") {
                                        displayValue =
                                          value === "yes" ? t("yes") : t("no");
                                      } else if (key === "accessibility") {
                                        const selectedAccessibility =
                                          accessibility?.find(
                                            (item: any) => item._id === value,
                                          );
                                        displayValue =
                                          selectedAccessibility?.name || value;
                                      } else if (key === "primaryCategory") {
                                        const selectedprimaryCategory =
                                          categoryFilter?.find(
                                            (item: any) => item._id === value,
                                          );
                                        displayValue =
                                          selectedprimaryCategory?.name ||
                                          value;
                                      } else if (key === "groupTypes") {
                                        const selectedgroupTypes =
                                          groupTypes?.find(
                                            (item: any) => item._id === value,
                                          );
                                        displayValue =
                                          selectedgroupTypes?.name || value;
                                      }
                                      return (
                                        <FilterChips
                                          key={key}
                                          label={displayValue}
                                          onRemove={() => {
                                            if (key === "status") {
                                              setFilters((prev) => ({
                                                ...prev,
                                                status: "all",
                                              }));
                                            } else {
                                              setFilters((prev) => ({
                                                ...prev,
                                                [key]: "all",
                                              }));
                                            }
                                          }}
                                        />
                                      );
                                    },
                                  )}
                                </div>
                                {/* Clear All Button */}
                                <button
                                  onClick={clearFilter}
                                  className="px-3 py-1 mb-2 mt-2 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors whitespace-nowrap"
                                >
                                  {t("clear_all")}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {deleteConfirmation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      {/* Backdrop click to close */}
                      <div
                        className="absolute inset-0"
                        onClick={() => setDeleteConfirmation(null)}
                      />

                      {/* Modal content */}
                      <div className="relative w-full max-w-md rounded-lg border bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">
                          Delete "{deleteConfirmation.categoryName}"?
                        </h3>

                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          This category contains{" "}
                          <span className="font-medium text-foreground">
                            {deleteConfirmation.businessCount} business
                            {deleteConfirmation.businessCount !== 1 ? "es" : ""}
                          </span>
                          . This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmation(null)}
                          >
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-h-[96vh] overflow-y-auto"
                        : "space-y-3 max-h-[96vh] overflow-y-auto"
                    }
                  >
                    {isBusinessLoading ? (
                      <Loader className="w-12 h-12 text-teal-500 animate-spin " />
                    ) : (
                      businessData?.data?.map((business: any) => (
                        <DraggableBusinessCard
                          key={business._id}
                          business={business}
                          isSelected={selectedBacklogIds.has(business._id)}
                          onSelect={handleSelectBacklog}
                          categories={categories}
                          onAddToCategory={handleAddToCategory}
                          viewMode={viewMode}
                          selectedIds={selectedBacklogIds}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* Custom Categories */}
              <div className="flex-1 max-h-[96vh] overflow-y-auto p-6">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2
                        className={`${isDark ? "text-gray-400" : "text-gray-700"} text-lg font-semibold `}
                      >
                        Custom Categories
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Organize content for different website sections
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
    ${
      isDark
        ? "bg-gray-800 border-gray-600 text-gray-100"
        : "bg-white border-gray-300 text-gray-900"
    }
    focus:outline-none focus:ring-2
    ${
      isDark
        ? "focus:border-blue-500/70 focus:ring-blue-500/30"
        : "focus:border-blue-500 focus:ring-blue-500/40"
    }
  `}
                    >
                      <option value="all">All Websites</option>

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
                      placeholder="New category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateCategory()
                      }
                      className={`
                        w-full px-3 py-2 rounded-md border 
                        ${
                          isDark
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
                      Create
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {categories.map((category) => (
                      <CategorySection
                        key={category.id}
                        category={category}
                        businesses={businessData?.data}
                        selectedIds={new Set()}
                        onSelect={() => {}}
                        onRemove={(_id) =>
                          handleRemoveFromCategory(category.id, _id)
                        }
                        categories={categories}
                        onAddToCategory={handleAddToCategory}
                        onRename={handleRenameCategory}
                        onDelete={handleDeleteCategory}
                        viewMode={viewMode}
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
            </div>
          </main>
        </div>

        <MessageComposerModal
          isOpen={showMessageComposer}
          onClose={() => setShowMessageComposer(false)}
          recipientCount={selectedBacklogIds.size}
          onSend={handleSendMessage}
        />

        <SendResultsModal
          isOpen={showSendResults}
          onClose={() => setShowSendResults(false)}
          results={sendResults}
        />
      </div>
    </DndProvider>
  );
}
