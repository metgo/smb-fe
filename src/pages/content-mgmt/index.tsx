import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GlobalHeader } from "./components/GlobalHeader";
import { Sidebar } from "./components/Sidebar";
import { Language, Theme } from "./App";
import { useLanguage } from "./contexts/LanguageContext";
import { mockBusinesses, Business } from "./data/mockBusinesses";
import {
  Search,
  Plus,
  Grid3x3,
  List,
  Filter,
  X,
  ChevronDown,
  Edit2,
  Check,
  GripVertical,
  MoreVertical,
  Trash2,
  FolderPlus,
  Send,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./components/ui/context-menu";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner@2.0.3";
import {
  MessageComposerModal,
  MessageData,
} from "./components/MessageComposerModal";
import { SendResultsModal, SendResult } from "./components/SendResultsModal";

interface ContentManagerProps {
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

// Draggable Business Card Component
function DraggableBusinessCard({
  business,
  isSelected,
  onSelect,
  onRemove,
  categories,
  onAddToCategory,
  viewMode,
  isInCategory = false,
  selectedIds,
}: {
  business: Business;
  isSelected: boolean;
  onSelect: (id: string, isMulti: boolean) => void;
  onRemove?: (id: string) => void;
  categories: Category[];
  onAddToCategory: (businessId: string, categoryId: string) => void;
  viewMode: ViewMode;
  isInCategory?: boolean;
  selectedIds: Set<string>;
}) {
  const { isRTL } = useLanguage();
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BUSINESS_CARD,
    item: () => {
      // If this business is selected, drag all selected businesses
      if (isSelected && selectedIds.size > 0) {
        return {
          ids: Array.from(selectedIds),
          isMultiple: true,
          count: selectedIds.size,
        };
      }
      // Otherwise, just drag this single business
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

  const handleContextMenu = (e: React.MouseEvent) => {
    // Select on right-click if not already selected
    if (!isSelected) {
      onSelect(business.id, false);
    }
  };

  const availableCategories = categories.filter(
    (cat) => !cat.businessIds.includes(business.id),
  );

  if (viewMode === "list") {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={drag}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            className={`
              flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all
              ${isDragging ? "opacity-50" : "opacity-100"}
              ${
                isSelected
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/50"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }
            `}
          >
            <div className="flex-shrink-0">
              <img
                src={business.logo}
                alt={business.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {business.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {business.shortDescription}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {business.categories.slice(0, 2).map((cat, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
              {isInCategory && onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(business.id);
                  }}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {availableCategories.length > 0 ? (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <FolderPlus className="w-4 h-4 mr-2" />
                Add to Category
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {availableCategories.map((category) => (
                  <ContextMenuItem
                    key={category.id}
                    onClick={() => onAddToCategory(business.id, category.id)}
                  >
                    {category.name}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          ) : (
            <ContextMenuItem disabled>No available categories</ContextMenuItem>
          )}
          {isInCategory && onRemove && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onRemove(business.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove from Category
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // Grid view
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={drag}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          className={`
            group rounded-lg border overflow-hidden cursor-pointer transition-all
            ${isDragging ? "opacity-50" : "opacity-100"}
            ${
              isSelected
                ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/50"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }
          `}
        >
          <div className="relative aspect-video">
            <img
              src={business.logo}
              alt={business.name}
              className="w-full h-full object-cover"
            />
            {isInCategory && onRemove && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(business.id);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="p-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
              {business.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {business.shortDescription}
            </p>
            <div className="flex flex-wrap gap-1">
              {business.categories.slice(0, 2).map((cat, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {availableCategories.length > 0 ? (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FolderPlus className="w-4 h-4 mr-2" />
              Add to Category
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {availableCategories.map((category) => (
                <ContextMenuItem
                  key={category.id}
                  onClick={() => onAddToCategory(business.id, category.id)}
                >
                  {category.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        ) : (
          <ContextMenuItem disabled>No available categories</ContextMenuItem>
        )}
        {isInCategory && onRemove && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onRemove(business.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from Category
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Category Section Component
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
  viewMode,
  onClearSelection,
}: {
  category: Category;
  businesses: Business[];
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
  const { isRTL } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.name);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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
      // Filter out businesses already in the category
      const newBusinessIds = item.ids.filter(
        (id) => !category.businessIds.includes(id),
      );

      // Add all new businesses to the category
      newBusinessIds.forEach((id) => {
        onAddToCategory(id, category.id);
      });

      // Show appropriate toast message
      if (newBusinessIds.length > 0) {
        if (newBusinessIds.length === 1) {
          toast.success("Business added to category");
        } else {
          toast.success(
            `${newBusinessIds.length} businesses added to category`,
          );
        }
        // Clear selection after successful drop
        onClearSelection?.();
      } else if (item.ids.length > 0) {
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

  const categoryBusinesses = businesses.filter((b) =>
    category.businessIds.includes(b.id),
  );

  return (
    <div
      ref={drop}
      className={`
        rounded-lg border p-4 transition-all
        ${
          isOver
            ? "border-teal-400 dark:border-teal-500 bg-teal-50/50 dark:bg-teal-950/20"
            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
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
              <Input
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {category.name}
              </h3>
              <Badge variant="secondary">{categoryBusinesses.length}</Badge>
            </>
          )}
        </div>
        {!isEditing && (
          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-[9999] min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                <div className="py-1">
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Rename Category
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
          {categoryBusinesses.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-sm">
                Drag businesses here to add them to this category
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-4">
                <div className="flex gap-4 min-w-max">
                  {categoryBusinesses.map((business) => (
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

function ContentManager({
  language,
  setLanguage,
  theme,
  setTheme,
  onNavigate,
}: ContentManagerProps) {
  const { t, isRTL } = useLanguage();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAuthority, setSelectedAuthority] = useState("all");
  const [selectedWebsite, setSelectedWebsite] = useState("all");
  const [dateRange, setDateRange] = useState("last30days");

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDMO, setSelectedDMO] = useState<string[]>([]);
  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Selection state
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<Set<string>>(
    new Set(),
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategoryWebsite, setSelectedCategoryWebsite] = useState("all");

  // Delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    categoryId: string;
    categoryName: string;
    businessCount: number;
  } | null>(null);

  // Messaging state
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showSendResults, setShowSendResults] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);

  // Load categories from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCategories(parsed);
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    } else {
      // Initialize with default categories
      const defaultCategories: Category[] = [
        { id: "featured", name: "Featured Businesses", businessIds: [] },
        { id: "homepage-hero", name: "Homepage Hero Section", businessIds: [] },
        { id: "recommended", name: "Recommended This Week", businessIds: [] },
      ];
      setCategories(defaultCategories);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
    }
  }, []);

  // Save categories to localStorage
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  // Filter backlog businesses (exclude those already in selected categories)
  const backlogBusinesses = useMemo(() => {
    return mockBusinesses.filter((business) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !business.name.toLowerCase().includes(query) &&
          !business.shortDescription.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // DMO filter
      if (selectedDMO.length > 0 && !selectedDMO.includes(business.dmo)) {
        return false;
      }

      // Authority filter
      if (
        selectedAuthorities.length > 0 &&
        !selectedAuthorities.includes(business.authority)
      ) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const hasCategory = business.categories.some((cat) =>
          selectedCategories.includes(cat),
        );
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [searchQuery, selectedDMO, selectedAuthorities, selectedCategories]);

  const handleSelectBacklog = (id: string, isMulti: boolean) => {
    // Always use multi-select mode - toggle on every click
    setSelectedBacklogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddToCategory = (businessId: string, categoryId: string) => {
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
    const categoryToDelete = categories.find((cat) => cat.id === categoryId);

    if (categoryToDelete && categoryToDelete.businessIds.length > 0) {
      // Show custom confirmation modal
      setDeleteConfirmation({
        categoryId: categoryToDelete.id,
        categoryName: categoryToDelete.name,
        businessCount: categoryToDelete.businessIds.length,
      });
    } else {
      // No businesses, delete immediately
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast.success("Category deleted");
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== deleteConfirmation.categoryId),
      );
      toast.success("Category deleted");
      setDeleteConfirmation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      businessIds: [],
    };

    setCategories((prev) => [...prev, newCategory]);
    setNewCategoryName("");
    toast.success("Category created");
  };

  // Get unique values for filters
  const uniqueDMOs = useMemo(
    () => Array.from(new Set(mockBusinesses.map((b) => b.dmo))),
    [],
  );
  const uniqueAuthorities = useMemo(
    () => Array.from(new Set(mockBusinesses.map((b) => b.authority))),
    [],
  );
  const uniqueBusinessCategories = useMemo(
    () => Array.from(new Set(mockBusinesses.flatMap((b) => b.categories))),
    [],
  );

  // Handle message sending
  const handleSendMessage = (data: MessageData) => {
    const selectedBusinesses = mockBusinesses.filter((b) =>
      selectedBacklogIds.has(b.id),
    );

    // Simulate sending messages to customers
    const results: SendResult[] = selectedBusinesses.map((business) => {
      // Replace variables in messages
      const replaceVariables = (text: string) => {
        return text
          .replace(/{customer_name}/g, `Customer of ${business.name}`)
          .replace(/{authority_name}/g, business.authority)
          .replace(/{dmo_name}/g, business.dmo)
          .replace(
            /{campaign_id}/g,
            `CAMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          )
          .replace(/{campaign_slogan}/g, `Discover ${business.authority}`);
      };

      // Simulate success/failure
      const emailSuccess = Math.random() > 0.1; // 90% success rate
      const smsSuccess = Math.random() > 0.15; // 85% success rate

      return {
        customerId: business.id,
        customerName: `Customer of ${business.name}`,
        email: `customer@${business.name.toLowerCase().replace(/\s+/g, "")}.com`,
        phone: `+972-5${Math.floor(Math.random() * 10)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
        emailStatus: emailSuccess ? "success" : "failed",
        smsStatus: smsSuccess ? "success" : "failed",
        errorMessage:
          !emailSuccess || !smsSuccess ? "Network timeout" : undefined,
      };
    });

    // Log the message
    const messageLog = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientCount: results.length,
      subject: data.subject,
      emailMessage: data.emailMessage,
      smsMessage: data.smsMessage,
      template: data.template,
      results,
    };

    // Save to localStorage
    const existingLogs = JSON.parse(
      localStorage.getItem("message-logs") || "[]",
    );
    localStorage.setItem(
      "message-logs",
      JSON.stringify([messageLog, ...existingLogs]),
    );

    // Show results
    setSendResults(results);
    setShowMessageComposer(false);
    setShowSendResults(true);

    // Clear selection
    setSelectedBacklogIds(new Set());

    toast.success(
      `Messages sent to ${results.length} customer${results.length !== 1 ? "s" : ""}`,
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col ${isRTL ? "rtl" : "ltr"}`}
      >
        <GlobalHeader
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          selectedAuthority={selectedAuthority}
          setSelectedAuthority={setSelectedAuthority}
          selectedWebsite={selectedWebsite}
          setSelectedWebsite={setSelectedWebsite}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            theme={theme}
            activeItem="content-manager"
            onItemClick={onNavigate}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={setIsSidebarCollapsed}
          />

          <main className="flex-1 overflow-hidden flex flex-col">
            {/* Fixed Header Section */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t.contentManager || "Content Manager"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize businesses into custom categories for your website
                  sections
                </p>
              </div>

              {/* Bulk Actions */}
              {selectedBacklogIds.size > 0 && (
                <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4 overflow-visible">
                  <div className="flex items-center justify-between overflow-visible">
                    <p className="text-sm font-medium text-teal-900 dark:text-teal-100">
                      {selectedBacklogIds.size} business
                      {selectedBacklogIds.size !== 1 ? "es" : ""} selected
                    </p>
                    <div className="flex items-center gap-2 overflow-visible">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                            Actions
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem
                            onClick={() => setShowMessageComposer(true)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Source Backlog */}
                <div className="overflow-visible">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Source Backlog
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {backlogBusinesses.length} businesses available
                    </p>
                  </div>

                  {/* Search and Controls */}
                  <div className="mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="Search businesses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`${isRTL ? "pr-10" : "pl-10"}`}
                        />
                      </div>
                      <Button
                        variant={showFilters ? "secondary" : "outline"}
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {(selectedDMO.length > 0 ||
                          selectedAuthorities.length > 0 ||
                          selectedCategories.length > 0) && (
                          <Badge variant="destructive" className="ml-2">
                            {selectedDMO.length +
                              selectedAuthorities.length +
                              selectedCategories.length}
                          </Badge>
                        )}
                      </Button>
                      <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                        <Button
                          variant={viewMode === "grid" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                        >
                          <Grid3x3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              DMO
                            </label>
                            <div className="space-y-2">
                              {uniqueDMOs.map((dmo) => (
                                <label
                                  key={dmo}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedDMO.includes(dmo)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedDMO([...selectedDMO, dmo]);
                                      } else {
                                        setSelectedDMO(
                                          selectedDMO.filter((d) => d !== dmo),
                                        );
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {dmo}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Authority
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {uniqueAuthorities.map((auth) => (
                                <label
                                  key={auth}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedAuthorities.includes(auth)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedAuthorities([
                                          ...selectedAuthorities,
                                          auth,
                                        ]);
                                      } else {
                                        setSelectedAuthorities(
                                          selectedAuthorities.filter(
                                            (a) => a !== auth,
                                          ),
                                        );
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {auth}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Business Category
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {uniqueBusinessCategories.map((cat) => (
                                <label
                                  key={cat}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCategories([
                                          ...selectedCategories,
                                          cat,
                                        ]);
                                      } else {
                                        setSelectedCategories(
                                          selectedCategories.filter(
                                            (c) => c !== cat,
                                          ),
                                        );
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {cat}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDMO([]);
                              setSelectedAuthorities([]);
                              setSelectedCategories([]);
                            }}
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Confirmation Modal */}
                  {deleteConfirmation && (
                    <div className="mb-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Delete Category?
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            Delete{" "}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              "{deleteConfirmation.categoryName}"
                            </span>{" "}
                            with{" "}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {deleteConfirmation.businessCount} business
                              {deleteConfirmation.businessCount !== 1
                                ? "es"
                                : ""}
                            </span>
                            ?
                          </p>
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-2 mb-3">
                            <p className="text-xs text-amber-800 dark:text-amber-200">
                              <strong>Warning:</strong> All businesses will be
                              removed from this category.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelDelete}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={confirmDelete}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                        : "space-y-2"
                    }
                  >
                    {backlogBusinesses.map((business) => (
                      <DraggableBusinessCard
                        key={business.id}
                        business={business}
                        isSelected={selectedBacklogIds.has(business.id)}
                        onSelect={handleSelectBacklog}
                        categories={categories}
                        onAddToCategory={handleAddToCategory}
                        viewMode={viewMode}
                        selectedIds={selectedBacklogIds}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Categories */}
                <div className="overflow-visible">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Custom Categories
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Organize content for different sections of your website
                      </p>
                    </div>

                    {/* Website Selection Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="min-w-[200px] justify-between"
                        >
                          <span className="truncate">
                            {selectedCategoryWebsite === "all"
                              ? "All Websites"
                              : selectedCategoryWebsite === "eshmalkol"
                                ? "EshmalKol.co.il"
                                : selectedCategoryWebsite === "visitnegev"
                                  ? "VisitNegev.com"
                                  : selectedCategoryWebsite === "negevtourism"
                                    ? "NegevTourism.org"
                                    : selectedCategoryWebsite ===
                                        "explorenorthnegev"
                                      ? "ExploreNorthNegev.com"
                                      : "All Websites"}
                          </span>
                          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem
                          onClick={() => setSelectedCategoryWebsite("all")}
                          className={
                            selectedCategoryWebsite === "all"
                              ? "bg-gray-100 dark:bg-gray-800"
                              : ""
                          }
                        >
                          All Websites
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            setSelectedCategoryWebsite("eshmalkol")
                          }
                          className={
                            selectedCategoryWebsite === "eshmalkol"
                              ? "bg-gray-100 dark:bg-gray-800"
                              : ""
                          }
                        >
                          EshmalKol.co.il
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setSelectedCategoryWebsite("visitnegev")
                          }
                          className={
                            selectedCategoryWebsite === "visitnegev"
                              ? "bg-gray-100 dark:bg-gray-800"
                              : ""
                          }
                        >
                          VisitNegev.com
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setSelectedCategoryWebsite("negevtourism")
                          }
                          className={
                            selectedCategoryWebsite === "negevtourism"
                              ? "bg-gray-100 dark:bg-gray-800"
                              : ""
                          }
                        >
                          NegevTourism.org
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setSelectedCategoryWebsite("explorenorthnegev")
                          }
                          className={
                            selectedCategoryWebsite === "explorenorthnegev"
                              ? "bg-gray-100 dark:bg-gray-800"
                              : ""
                          }
                        >
                          ExploreNorthNegev.com
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Create Category */}
                  <div className="mb-4 flex gap-2">
                    <Input
                      placeholder="New category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateCategory();
                      }}
                    />
                    <Button
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <CategorySection
                        key={category.id}
                        category={category}
                        businesses={mockBusinesses}
                        selectedIds={new Set()}
                        onSelect={() => {}}
                        onRemove={(businessId) =>
                          handleRemoveFromCategory(category.id, businessId)
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

                    {categories.length === 0 && (
                      <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                        <p className="mb-2">No categories yet</p>
                        <p className="text-sm">
                          Create your first category to get started
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Message Composer Modal */}
        <MessageComposerModal
          isOpen={showMessageComposer}
          onClose={() => setShowMessageComposer(false)}
          recipientCount={selectedBacklogIds.size}
          onSend={handleSendMessage}
          theme={theme}
        />

        {/* Send Results Modal */}
        <SendResultsModal
          isOpen={showSendResults}
          onClose={() => setShowSendResults(false)}
          results={sendResults}
          theme={theme}
        />
      </div>
    </DndProvider>
  );
}

export default ContentManager;
