import clsx from "clsx";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Wand2,
  Loader,
  CheckCircle,
  AlertCircle,
  Users,
  Package,
  ChevronDown,
  ChevronRight,
  X,
  // Plus,        // Used by Unassigned Items (commented out)
  Save,
  // InboxIcon,   // Used by Unassigned Items (commented out)
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useAssignAllEntitiesMutation,
  useUpdateContentMutation,
} from "@/store/api/contentMutationApi";
import { useGetViewByIdQuery } from "@/store/api/contentQueryApi";
import { useGetAllbusinessesQuery } from "@/store/api/businessQueryApi";
import { useGetContentManagementProductsQuery } from "@/store/api/productQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";

interface Props {
  topics: WizardTopic[];
  externalApiId: string;
  viewId: string;
  isMarketplace?: boolean;
  onAssignStart: () => void;
  onAssignEnd: () => void;
}

type AssignState = "idle" | "running" | "done" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function itemLabel(item: any): string {
  return (
    item?.nameHe || item?.name || item?.titleHe || item?.title || "Untitled"
  );
}

function itemImage(item: any): string | null {
  return item?.images?.[0]?.image ?? null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ItemAvatar({ item, size = 7 }: { item: any; size?: number }) {
  const img = itemImage(item);
  const label = itemLabel(item);
  const sizeClass = `w-${size} h-${size}`;
  return img ? (
    <img
      src={img}
      alt={label}
      className={clsx(
        sizeClass,
        "rounded-md object-cover shrink-0 border border-gray-200/30",
      )}
    />
  ) : (
    <div
      className={clsx(
        sizeClass,
        "rounded-md shrink-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-teal-500 to-blue-600 text-white",
      )}
    >
      {label.charAt(0).toUpperCase()}
    </div>
  );
}

function SearchSelect({
  placeholder,
  options,
  onSelect,
  isDark,
}: {
  placeholder: string;
  options: any[];
  onSelect: (item: any) => void;
  isDark: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});

  // Calculate fixed position so dropdown escapes any overflow:hidden parent
  const handleFocus = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropHeight = 208; // max-h-52 = 13rem = ~208px

      if (spaceBelow >= dropHeight) {
        // Open downward
        setDropStyle({
          position: "fixed",
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        });
      } else {
        // Open upward
        setDropStyle({
          position: "fixed",
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        });
      }
    }
    setOpen(true);
  };

  // Show ALL filtered results when typing, first 50 otherwise
  const filtered = useMemo(
    () =>
      query.length >= 1
        ? options.filter((o) =>
            itemLabel(o).toLowerCase().includes(query.toLowerCase()),
          )
        : options.slice(0, 50),
    [options, query],
  );

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={query}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        className={clsx(
          "w-full text-xs px-3 py-2 rounded-lg border outline-none",
          isDark
            ? "bg-gray-700 border-gray-600 text-gray-200 placeholder:text-gray-500 focus:border-teal-500"
            : "bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-teal-500",
        )}
      />
      {open &&
        filtered.length > 0 &&
        createPortal(
          <ul
            style={dropStyle}
            className={clsx(
              "overflow-y-auto rounded-lg border shadow-2xl max-h-52",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            {query.length < 1 && options.length > 50 && (
              <li
                className={clsx(
                  "px-3 py-1.5 text-xs italic border-b sticky top-0",
                  isDark
                    ? "text-gray-500 border-gray-700 bg-gray-800"
                    : "text-gray-400 border-gray-100 bg-white",
                )}
              >
                Showing first 50 — type to search all {options.length}
              </li>
            )}
            {filtered.map((item) => (
              <li
                key={item._id}
                onMouseDown={() => {
                  onSelect(item);
                  setQuery("");
                  setOpen(false);
                }}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer text-xs transition-colors",
                  isDark
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-50 text-gray-700",
                )}
              >
                <ItemAvatar item={item} size={5} />
                <span className="truncate">{itemLabel(item)}</span>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────

interface CategoryRowProps {
  topic: any;
  cat: any;
  topicIdx: number;
  catIdx: number;
  isDark: boolean;
  allBusinesses: any[];
  allProducts: any[];
  isMarketplace?: boolean;
  onRemoveBusiness: (topicIdx: number, catIdx: number, bizId: string) => void;
  onRemoveProduct: (topicIdx: number, catIdx: number, prodId: string) => void;
  onAddBusiness: (topicIdx: number, catIdx: number, item: any) => void;
  onAddProduct: (topicIdx: number, catIdx: number, item: any) => void;
}

function CategoryRow({
  cat,
  topicIdx,
  catIdx,
  isDark,
  allBusinesses,
  allProducts,
  isMarketplace = false,
  onRemoveBusiness,
  onRemoveProduct,
  onAddBusiness,
  onAddProduct,
}: CategoryRowProps) {
  const { t } = useTranslation("content");
  const [expanded, setExpanded] = useState(false);

  const assignedBizIds = new Set(
    (cat.businessIds ?? []).map((b: any) => b._id ?? b),
  );
  const assignedProdIds = new Set(
    (cat.productIds ?? []).map((p: any) => p._id ?? p),
  );

  const availableBiz = allBusinesses.filter((b) => !assignedBizIds.has(b._id));
  const availableProd = allProducts.filter((p) => !assignedProdIds.has(p._id));

  const bCount = cat.businessIds?.length ?? 0;
  const pCount = cat.productIds?.length ?? 0;
  const total = bCount + pCount;

  return (
    <div
      className={clsx(
        "rounded-xl border transition-all",
        // overflow-visible so SearchSelect dropdown isn't clipped
        isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white",
      )}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={clsx(
          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
          isDark ? "hover:bg-gray-750" : "hover:bg-gray-50",
        )}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
        )}
        <span
          className={clsx(
            "text-sm flex-1 truncate font-medium",
            isDark ? "text-gray-200" : "text-gray-800",
          )}
        >
          {cat.titleHe || cat.title || "Untitled"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {/* Businesses — TRAVELING only */}
          {!isMarketplace && bCount > 0 && (
            <span
              className={clsx(
                "flex items-center gap-1 text-xs",
                isDark ? "text-blue-400" : "text-blue-600",
              )}
            >
              <Users className="w-3 h-3" />
              {bCount}
            </span>
          )}
          {/* Products — shown for both, but count display differs */}
          {pCount > 0 && (
            <span
              className={clsx(
                "flex items-center gap-1 text-xs",
                isDark ? "text-purple-400" : "text-purple-600",
              )}
            >
              <Package className="w-3 h-3" />
              {pCount}
            </span>
          )}
          {/* None indicator */}
          {((isMarketplace && pCount === 0) ||
            (!isMarketplace && total === 0)) && (
            <span
              className={clsx(
                "flex items-center gap-1 text-xs",
                isDark ? "text-gray-600" : "text-gray-400",
              )}
            >
              <AlertCircle className="w-3 h-3" />
              None
            </span>
          )}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div
          className={clsx(
            "px-3 pb-3 pt-1 space-y-3 border-t",
            isDark ? "border-gray-700" : "border-gray-100",
          )}
        >
          {/* MARKETPLACE: Only show Products */}
          {isMarketplace ? (
            <div className="space-y-1.5">
              <p
                className={clsx(
                  "text-xs font-semibold flex items-center gap-1",
                  isDark ? "text-purple-400" : "text-purple-600",
                )}
              >
                <Package className="w-3 h-3" /> Products ({pCount})
              </p>
              <div className="space-y-1">
                {(cat.productIds ?? []).map((prod: any) => (
                  <div
                    key={prod._id ?? prod}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 group",
                      isDark
                        ? "bg-gray-750 hover:bg-gray-700"
                        : "bg-gray-50 hover:bg-gray-100",
                    )}
                  >
                    <ItemAvatar item={prod} size={5} />
                    <span
                      className={clsx(
                        "text-xs flex-1 truncate",
                        isDark ? "text-gray-300" : "text-gray-700",
                      )}
                    >
                      {itemLabel(prod)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onRemoveProduct(topicIdx, catIdx, prod._id ?? prod)
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 shrink-0"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {availableProd.length > 0 && (
                <div className="pt-1">
                  <SearchSelect
                    placeholder={t("add_product_placeholder")}
                    options={availableProd}
                    onSelect={(item) => onAddProduct(topicIdx, catIdx, item)}
                    isDark={isDark}
                  />
                </div>
              )}
            </div>
          ) : (
            /* TRAVELING: Show Businesses + Products + Events + POIs */
            <>
              {/* Businesses */}
              <div className="space-y-1.5">
                <p
                  className={clsx(
                    "text-xs font-semibold flex items-center gap-1",
                    isDark ? "text-blue-400" : "text-blue-600",
                  )}
                >
                  <Users className="w-3 h-3" /> Businesses ({bCount})
                </p>
                <div className="space-y-1">
                  {(cat.businessIds ?? []).map((biz: any) => (
                    <div
                      key={biz._id ?? biz}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 group",
                        isDark
                          ? "bg-gray-750 hover:bg-gray-700"
                          : "bg-gray-50 hover:bg-gray-100",
                      )}
                    >
                      <ItemAvatar item={biz} size={5} />
                      <span
                        className={clsx(
                          "text-xs flex-1 truncate",
                          isDark ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        {itemLabel(biz)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveBusiness(topicIdx, catIdx, biz._id ?? biz)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 shrink-0"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                {availableBiz.length > 0 && (
                  <div className="pt-1">
                    <SearchSelect
                      placeholder={t("add_business_placeholder")}
                      options={availableBiz}
                      onSelect={(item) => onAddBusiness(topicIdx, catIdx, item)}
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="space-y-1.5">
                <p
                  className={clsx(
                    "text-xs font-semibold flex items-center gap-1",
                    isDark ? "text-purple-400" : "text-purple-600",
                  )}
                >
                  <Package className="w-3 h-3" /> Products ({pCount})
                </p>
                <div className="space-y-1">
                  {(cat.productIds ?? []).map((prod: any) => (
                    <div
                      key={prod._id ?? prod}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 group",
                        isDark
                          ? "bg-gray-750 hover:bg-gray-700"
                          : "bg-gray-50 hover:bg-gray-100",
                      )}
                    >
                      <ItemAvatar item={prod} size={5} />
                      <span
                        className={clsx(
                          "text-xs flex-1 truncate",
                          isDark ? "text-gray-300" : "text-gray-700",
                        )}
                      >
                        {itemLabel(prod)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveProduct(topicIdx, catIdx, prod._id ?? prod)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 shrink-0"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                {availableProd.length > 0 && (
                  <div className="pt-1">
                    <SearchSelect
                      placeholder={t("add_product_placeholder")}
                      options={availableProd}
                      onSelect={(item) => onAddProduct(topicIdx, catIdx, item)}
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Events — TRAVELING only, AI-assigned read-only display */}
          {!isMarketplace && (cat.eventIds ?? []).length > 0 && (
            <div className="space-y-1.5">
              <p
                className={clsx(
                  "text-xs font-semibold flex items-center gap-1",
                  isDark ? "text-orange-400" : "text-orange-600",
                )}
              >
                <span className="w-3 h-3 inline-block text-center leading-3">
                  🎫
                </span>
                Events ({(cat.eventIds ?? []).length})
              </p>
              <div className="space-y-1">
                {(cat.eventIds ?? []).map((ev: any) => (
                  <div
                    key={ev._id ?? ev}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5",
                      isDark ? "bg-gray-750" : "bg-orange-50",
                    )}
                  >
                    <span
                      className={clsx(
                        "text-xs flex-1 truncate",
                        isDark ? "text-gray-300" : "text-gray-700",
                      )}
                    >
                      {itemLabel(ev)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POIs — TRAVELING only, AI-assigned read-only display */}
          {!isMarketplace && (cat.poiIds ?? []).length > 0 && (
            <div className="space-y-1.5">
              <p
                className={clsx(
                  "text-xs font-semibold flex items-center gap-1",
                  isDark ? "text-green-400" : "text-green-600",
                )}
              >
                <span className="w-3 h-3 inline-block text-center leading-3">
                  📍
                </span>
                Points of Interest ({(cat.poiIds ?? []).length})
              </p>
              <div className="space-y-1">
                {(cat.poiIds ?? []).map((poi: any) => (
                  <div
                    key={poi._id ?? poi}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5",
                      isDark ? "bg-gray-750" : "bg-green-50",
                    )}
                  >
                    <span
                      className={clsx(
                        "text-xs flex-1 truncate",
                        isDark ? "text-gray-300" : "text-gray-700",
                      )}
                    >
                      {itemLabel(poi)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Step3Assign({
  topics,
  externalApiId,
  viewId,
  isMarketplace = false,
  onAssignStart,
  onAssignEnd,
}: Props) {
  const { isDark } = useThemeClasses();
  const { t } = useTranslation("content");
  const [assignAll] = useAssignAllEntitiesMutation();
  const [updateContent, { isLoading: isSaving }] = useUpdateContentMutation();
  const [assignState, setAssignState] = useState<AssignState>("idle");
  const [initialStateSet, setInitialStateSet] = useState(false);

  // ── Editable topics state (mirrors backend data, supports manual changes) ──
  const [localTopics, setLocalTopics] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // const [unassignedOpen, setUnassignedOpen] = useState(false); // Used by Unassigned Items (commented out)
  const allCategories = topics.flatMap((t) => t.categories);
  const totalTopics = topics.length;
  const totalCategories = allCategories.length;

  // ── Populated view (raw: false gives us full objects) ──
  const { data: viewPopulated, refetch: refetchView } = useGetViewByIdQuery(
    viewId ? { viewId, raw: false } : skipToken,
    { skip: !viewId },
  );

  // ── Raw view (for polling progress during assignment) ──
  const { data: viewProgress } = useGetViewByIdQuery(
    { viewId, raw: true },
    {
      skip: !viewId,
      pollingInterval: assignState === "running" ? 3000 : 0,
    },
  );

  // ── All businesses and products for the website (for add/unassigned) ──
  const { data: allBizData } = useGetAllbusinessesQuery(
    externalApiId
      ? { externalApiId, status: "APPROVED", limit: 1000, page: 1 }
      : skipToken,
  );
  const { data: allProdData } = useGetContentManagementProductsQuery(
    externalApiId
      ? { externalApiId, status: "APPROVED", limit: 1000, page: 1 }
      : skipToken,
  );

  const allBusinesses: any[] = allBizData?.data ?? [];
  const allProducts: any[] = allProdData?.data ?? [];

  // ── Sync local topics from populated view ──
  useEffect(() => {
    if (!viewPopulated) return;
    setLocalTopics((viewPopulated as any).siteTopics ?? []);
    setHasUnsavedChanges(false);
  }, [viewPopulated]);

  // ── Initial state detection ──
  useEffect(() => {
    if (!viewProgress || initialStateSet) return;
    const status = (viewProgress as any).assignmentStatus;
    const errorMsg = (viewProgress as any).assignmentError;
    if (status === "done") setAssignState("done");
    else if (status === "running") {
      setAssignState("running");
      onAssignStart();
    } else if (status === "failed") {
      setAssignState("error");
      // Show error message if available from backend
      if (errorMsg) {
        toast.error(`Assignment failed: ${errorMsg}`);
      }
    }
    setInitialStateSet(true);
  }, [viewProgress, initialStateSet, onAssignStart, viewId]);

  // ── Poll: detect done/failed ──
  useEffect(() => {
    if (!viewProgress || !initialStateSet) return;
    const status = (viewProgress as any).assignmentStatus;
    const errorMsg = (viewProgress as any).assignmentError;
    if (status === "done" && assignState === "running") {
      setAssignState("done");
      onAssignEnd();
      void refetchView();
      toast.success(t("toast_assign_complete"));
    } else if (status === "failed" && assignState === "running") {
      setAssignState("error");
      onAssignEnd();
      // Show specific error message from backend if available
      toast.error(
        errorMsg ||
          "AI assignment failed. You can retry or publish without assignment.",
      );
    }
  }, [
    (viewProgress as any)?.assignmentStatus,
    (viewProgress as any)?.assignmentError,
    initialStateSet,
    assignState,
    onAssignEnd,
    refetchView,
    t,
  ]);

  const progressDone: number = (viewProgress as any)?.assignmentDone ?? 0;
  const progressTotal: number =
    (viewProgress as any)?.assignmentTotal ?? totalCategories;
  const progressPercent =
    progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0;

  const totalAssignedFromView = useMemo(
    () =>
      localTopics.reduce(
        (sum, t) =>
          sum +
          (t.siteCategories ?? []).reduce((s: number, c: any) => {
            const bCount = Array.isArray(c.businessIds)
              ? c.businessIds.length
              : 0;
            const pCount = Array.isArray(c.productIds)
              ? c.productIds.length
              : 0;
            return s + bCount + pCount;
          }, 0),
        0,
      ),
    [localTopics],
  );

  // ── Unassigned calculation — COMMENTED OUT (used by Unassigned Items UI) ──
  // const assignedBizIds = useMemo(() => {
  //   const ids = new Set<string>();
  //   localTopics.forEach((t) =>
  //     (t.siteCategories ?? []).forEach((c: any) =>
  //       (c.businessIds ?? []).forEach((b: any) => ids.add(b._id ?? b)),
  //     ),
  //   );
  //   return ids;
  // }, [localTopics]);
  // const assignedProdIds = useMemo(() => {
  //   const ids = new Set<string>();
  //   localTopics.forEach((t) =>
  //     (t.siteCategories ?? []).forEach((c: any) =>
  //       (c.productIds ?? []).forEach((p: any) => ids.add(p._id ?? p)),
  //     ),
  //   );
  //   return ids;
  // }, [localTopics]);
  // const unassignedBusinesses = useMemo(
  //   () => allBusinesses.filter((b) => !assignedBizIds.has(b._id)),
  //   [allBusinesses, assignedBizIds],
  // );
  // const unassignedProducts = useMemo(
  //   () => allProducts.filter((p) => !assignedProdIds.has(p._id)),
  //   [allProducts, assignedProdIds],
  // );
  // const totalUnassigned = unassignedBusinesses.length + unassignedProducts.length;

  // ── Mutation helpers ──
  const markChanged = useCallback(() => setHasUnsavedChanges(true), []);

  const removeBusiness = useCallback(
    (tIdx: number, cIdx: number, bizId: string) => {
      setLocalTopics((prev) => {
        const next = structuredClone(prev);
        next[tIdx].siteCategories[cIdx].businessIds = (
          next[tIdx].siteCategories[cIdx].businessIds ?? []
        ).filter((b: any) => (b._id ?? b) !== bizId);
        return next;
      });
      markChanged();
    },
    [markChanged],
  );

  const removeProduct = useCallback(
    (tIdx: number, cIdx: number, prodId: string) => {
      setLocalTopics((prev) => {
        const next = structuredClone(prev);
        next[tIdx].siteCategories[cIdx].productIds = (
          next[tIdx].siteCategories[cIdx].productIds ?? []
        ).filter((p: any) => (p._id ?? p) !== prodId);
        return next;
      });
      markChanged();
    },
    [markChanged],
  );

  const addBusiness = useCallback(
    (tIdx: number, cIdx: number, item: any) => {
      setLocalTopics((prev) => {
        const next = structuredClone(prev);
        const list = next[tIdx].siteCategories[cIdx].businessIds ?? [];
        if (!list.find((b: any) => (b._id ?? b) === item._id)) {
          list.push(item);
          next[tIdx].siteCategories[cIdx].businessIds = list;
        }
        return next;
      });
      markChanged();
    },
    [markChanged],
  );

  const addProduct = useCallback(
    (tIdx: number, cIdx: number, item: any) => {
      setLocalTopics((prev) => {
        const next = structuredClone(prev);
        const list = next[tIdx].siteCategories[cIdx].productIds ?? [];
        if (!list.find((p: any) => (p._id ?? p) === item._id)) {
          list.push(item);
          next[tIdx].siteCategories[cIdx].productIds = list;
        }
        return next;
      });
      markChanged();
    },
    [markChanged],
  );

  // ── Assign unassigned item to a category — COMMENTED OUT ──
  // const assignUnassignedToCat = useCallback(
  //   (item: any, type: "business" | "product", topicCatKey: string) => {
  //     const [tIdxStr, cIdxStr] = topicCatKey.split("-");
  //     const tIdx = parseInt(tIdxStr, 10);
  //     const cIdx = parseInt(cIdxStr, 10);
  //     if (type === "business") addBusiness(tIdx, cIdx, item);
  //     else addProduct(tIdx, cIdx, item);
  //   },
  //   [addBusiness, addProduct],
  // );

  // ── Save ──
  const saveChanges = useCallback(async () => {
    if (!viewId) return;
    // Build the payload: convert populated objects back to IDs
    const siteTopics = localTopics.map((t) => ({
      ...t,
      siteCategories: (t.siteCategories ?? []).map((c: any) => ({
        ...c,
        businessIds: (c.businessIds ?? []).map((b: any) => b._id ?? b),
        productIds: (c.productIds ?? []).map((p: any) => p._id ?? p),
        eventIds: (c.eventIds ?? []).map((e: any) => e._id ?? e),
        poiIds: (c.poiIds ?? []).map((p: any) => p._id ?? p),
        tripIds: (c.tripIds ?? []).map((tr: any) => tr._id ?? tr),
        fundayIds: (c.fundayIds ?? []).map((f: any) => f._id ?? f),
      })),
    }));
    try {
      await updateContent({ contentId: viewId, body: { siteTopics } }).unwrap();
      setHasUnsavedChanges(false);
      toast.success(t("toast_changes_saved"));
      void refetchView();
    } catch {
      toast.error(t("toast_save_changes_failed"));
    }
  }, [viewId, localTopics, updateContent, refetchView]);

  // ── Run AI assignment ──
  const runAssignment = async (reAssignAll = false) => {
    if (!viewId) {
      toast.error(
        "View is not yet saved — please wait a moment and try again.",
      );
      return;
    }
    setAssignState("running");
    onAssignStart();
    try {
      await assignAll({ viewId, reAssignAll }).unwrap();
      // Success: Server will continue processing in background
      // Frontend will poll and see status change from "processing" → "done" or "failed"
    } catch (error: any) {
      // Network/API error (not backend processing error — that happens in background)
      const errorMessage =
        error?.data?.message || error?.message || "Failed to start assignment";
      setAssignState("error");
      onAssignEnd();
      toast.error(`Assignment failed to start: ${errorMessage}`);
    }
  };

  // ── Build category options for unassigned dropdown — COMMENTED OUT ──
  // const catOptions = useMemo(
  //   () =>
  //     localTopics.flatMap((t, tIdx) =>
  //       (t.siteCategories ?? []).map((c: any, cIdx: number) => ({
  //         key: `${tIdx}-${cIdx}`,
  //         label: `${t.titleHe || t.title} › ${c.titleHe || c.title}`,
  //       })),
  //     ),
  //   [localTopics],
  // );

  // ────────────────────────────────────────────────────────────────────────────

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
          dangerouslySetInnerHTML={{ __html: t("step3_instructions") }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("topics"), value: totalTopics, color: "teal" },
          { label: t("categories"), value: totalCategories, color: "purple" },
          {
            label: t("assigned"),
            value: totalAssignedFromView,
            color: "green",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={clsx(
              "rounded-xl border p-3 text-center",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            <p
              className={clsx(
                "text-2xl font-bold",
                color === "teal"
                  ? "text-teal-500"
                  : color === "purple"
                    ? "text-purple-500"
                    : "text-green-500",
              )}
            >
              {value}
            </p>
            <p
              className={clsx(
                "text-xs mt-0.5",
                isDark ? "text-gray-500" : "text-gray-400",
              )}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Assign buttons */}
      {assignState === "idle" && (
        <div className="space-y-2">
          {totalAssignedFromView > 0 ? (
            <>
              <button
                onClick={() => void runAssignment(false)}
                disabled={totalCategories === 0 || !viewId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" /> {t("continue_assignment")}
              </button>
              <button
                onClick={() => void runAssignment(true)}
                disabled={totalCategories === 0 || !viewId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" /> {t("reassign_all")}
              </button>
            </>
          ) : (
            <button
              onClick={() => void runAssignment(false)}
              disabled={totalCategories === 0 || !viewId}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-5 h-5" /> {t("start_ai_assignment")}
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {assignState === "running" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span
              className={clsx(
                "flex items-center gap-2",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              <Loader className="w-4 h-4 animate-spin text-teal-500" />
              {t("assigning_entities")}
            </span>
            <span
              className={clsx(
                "font-medium tabular-nums",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {progressDone} / {progressTotal}
            </span>
          </div>
          <div
            className={clsx(
              "h-2.5 rounded-full overflow-hidden",
              isDark ? "bg-gray-800" : "bg-gray-100",
            )}
          >
            <div
              className="h-full bg-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p
            className={clsx(
              "text-xs text-center",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          >
            {progressTotal - progressDone > 0
              ? t("categories_remaining", {
                  count: progressTotal - progressDone,
                })
              : t("finalising_results")}
          </p>
        </div>
      )}

      {/* Error state */}
      {assignState === "error" && (
        <div
          className={clsx(
            "flex items-center gap-3 p-3 rounded-xl border",
            isDark
              ? "bg-red-900/20 border-red-800/40"
              : "bg-red-50 border-red-100",
          )}
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p
              className={clsx(
                "text-sm font-medium",
                isDark ? "text-red-300" : "text-red-700",
              )}
            >
              {t("assignment_failed")}
            </p>
            <p
              className={clsx(
                "text-xs",
                isDark ? "text-red-500" : "text-red-600",
              )}
            >
              {t("assignment_failed_desc")}
            </p>
          </div>
          <button
            onClick={() => void runAssignment(false)}
            className="text-xs underline text-red-500 hover:text-red-600 shrink-0"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {/* Done state */}
      {assignState === "done" && (
        <div
          className={clsx(
            "flex items-center gap-3 p-3 rounded-xl border",
            totalAssignedFromView === 0
              ? isDark
                ? "bg-amber-900/20 border-amber-800/40"
                : "bg-amber-50 border-amber-100"
              : isDark
                ? "bg-green-900/20 border-green-800/40"
                : "bg-green-50 border-green-100",
          )}
        >
          {totalAssignedFromView === 0 ? (
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          )}
          <div>
            <p
              className={clsx(
                "text-sm font-medium",
                totalAssignedFromView === 0
                  ? isDark
                    ? "text-amber-300"
                    : "text-amber-700"
                  : isDark
                    ? "text-green-300"
                    : "text-green-700",
              )}
            >
              {totalAssignedFromView === 0
                ? t("no_items_assigned")
                : t("assignment_complete")}
            </p>
            <p
              className={clsx(
                "text-xs",
                totalAssignedFromView === 0
                  ? isDark
                    ? "text-amber-500"
                    : "text-amber-600"
                  : isDark
                    ? "text-green-500"
                    : "text-green-600",
              )}
            >
              {totalAssignedFromView === 0
                ? t("run_ai_assignment_desc")
                : t("items_assigned_desc", {
                    count: totalAssignedFromView,
                    categories: totalCategories,
                  })}
            </p>
          </div>
          <button
            onClick={() =>
              void runAssignment(totalAssignedFromView === 0 ? false : true)
            }
            className={clsx(
              "ms-auto text-xs underline shrink-0",
              totalAssignedFromView === 0
                ? "text-amber-600 hover:text-amber-700"
                : "text-green-600 hover:text-green-700",
            )}
          >
            {totalAssignedFromView === 0 ? t("run_now") : t("rerun")}
          </button>
        </div>
      )}

      {/* ── Manual Category Editing — shown after AI assignment has run ── */}
      {localTopics.length > 0 && assignState === "done" && (
        <div className="space-y-4">
          {/* Header + Save */}
          <div className="flex items-center justify-between">
            <h3
              className={clsx(
                "text-sm font-semibold",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              {t("categories_header")}
            </h3>
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={() => void saveChanges()}
                disabled={isSaving}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                {t("save_changes")}
              </button>
            )}
          </div>

          {localTopics.map((topic, tIdx) => (
            <div
              key={topic.titleHe || topic.title || tIdx}
              className="space-y-2"
            >
              {/* Topic label */}
              <p
                className={clsx(
                  "text-xs font-medium px-1",
                  isDark ? "text-gray-500" : "text-gray-400",
                )}
              >
                {topic.titleHe || topic.title || `Topic ${tIdx + 1}`}
              </p>
              {(topic.siteCategories ?? []).map((cat: any, cIdx: number) => (
                <CategoryRow
                  key={cat.titleHe || cat.title || cIdx}
                  topic={topic}
                  cat={cat}
                  topicIdx={tIdx}
                  catIdx={cIdx}
                  isDark={isDark}
                  allBusinesses={allBusinesses}
                  allProducts={allProducts}
                  isMarketplace={isMarketplace}
                  onRemoveBusiness={removeBusiness}
                  onRemoveProduct={removeProduct}
                  onAddBusiness={addBusiness}
                  onAddProduct={addProduct}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Unassigned Items Queue — TEMPORARILY COMMENTED OUT (uncomment when needed) ── */}
      {/* {localTopics.length > 0 && assignState === "done" && (
        <div
          className={clsx(
            "rounded-xl border overflow-hidden",
            isDark ? "border-gray-700" : "border-gray-200",
          )}
        >
          <button
            type="button"
            onClick={() => setUnassignedOpen((v) => !v)}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
              isDark ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-50 hover:bg-gray-100",
            )}
          >
            {unassignedOpen ? (
              <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
            )}
            <InboxIcon className={clsx("w-4 h-4 shrink-0", totalUnassigned > 0 ? "text-amber-500" : "text-gray-400")} />
            <span className={clsx("text-sm font-medium flex-1", isDark ? "text-gray-200" : "text-gray-700")}>
              Unassigned Items
            </span>
            <span
              className={clsx(
                "text-xs px-2 py-0.5 rounded-full font-semibold",
                totalUnassigned > 0
                  ? "bg-amber-100 text-amber-700"
                  : isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500",
              )}
            >
              {totalUnassigned}
            </span>
          </button>

          {unassignedOpen && (
            <div className={clsx("px-4 pb-4 pt-2 space-y-3", isDark ? "bg-gray-800" : "bg-white")}>
              {totalUnassigned === 0 ? (
                <p className={clsx("text-xs text-center py-4", isDark ? "text-gray-600" : "text-gray-400")}>
                  🎉 All items have been assigned to categories.
                </p>
              ) : (
                <>
                  {unassignedBusinesses.length > 0 && (
                    <div className="space-y-1.5">
                      <p className={clsx("text-xs font-semibold flex items-center gap-1", isDark ? "text-blue-400" : "text-blue-600")}>
                        <Users className="w-3 h-3" /> Unassigned Businesses ({unassignedBusinesses.length})
                      </p>
                      <div className="space-y-1 max-h-52 overflow-y-auto">
                        {unassignedBusinesses.map((biz) => (
                          <UnassignedItemRow
                            key={biz._id}
                            item={biz}
                            type="business"
                            catOptions={catOptions}
                            onAssign={assignUnassignedToCat}
                            isDark={isDark}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {unassignedProducts.length > 0 && (
                    <div className="space-y-1.5">
                      <p className={clsx("text-xs font-semibold flex items-center gap-1", isDark ? "text-purple-400" : "text-purple-600")}>
                        <Package className="w-3 h-3" /> Unassigned Products ({unassignedProducts.length})
                      </p>
                      <div className="space-y-1 max-h-52 overflow-y-auto">
                        {unassignedProducts.map((prod) => (
                          <UnassignedItemRow
                            key={prod._id}
                            item={prod}
                            type="product"
                            catOptions={catOptions}
                            onAssign={assignUnassignedToCat}
                            isDark={isDark}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )} */}

      {/* Skip reminder */}
      {assignState === "idle" && totalCategories > 0 && (
        <p
          className={clsx(
            "text-xs text-center",
            isDark ? "text-gray-600" : "text-gray-400",
          )}
        >
          {t("skip_assignment_reminder")}
        </p>
      )}
    </div>
  );
}

// ─── Unassigned Item Row — TEMPORARILY COMMENTED OUT ────────────────────────
/*
function UnassignedItemRow({
  item,
  type,
  catOptions,
  onAssign,
  isDark,
}: {
  item: any;
  type: "business" | "product";
  catOptions: { key: string; label: string }[];
  onAssign: (item: any, type: "business" | "product", catKey: string) => void;
  isDark: boolean;
}) {
  const [selectedCat, setSelectedCat] = useState("");

  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-lg px-2 py-2",
        isDark ? "bg-gray-750" : "bg-gray-50",
      )}
    >
      <ItemAvatar item={item} size={5} />
      <span className={clsx("text-xs flex-1 truncate", isDark ? "text-gray-300" : "text-gray-700")}>
        {itemLabel(item)}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className={clsx(
            "text-xs rounded-md border px-1.5 py-1 outline-none max-w-[140px]",
            isDark
              ? "bg-gray-700 border-gray-600 text-gray-300"
              : "bg-white border-gray-300 text-gray-700",
          )}
        >
          <option value="">Pick category…</option>
          {catOptions.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selectedCat}
          onClick={() => {
            if (selectedCat) {
              onAssign(item, type, selectedCat);
              setSelectedCat("");
            }
          }}
          className="flex items-center gap-1 text-xs px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-3 h-3" /> Assign
        </button>
      </div>
    </div>
  );
}
*/
