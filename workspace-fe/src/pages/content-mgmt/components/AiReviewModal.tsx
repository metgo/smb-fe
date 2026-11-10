import clsx from "clsx";
import { useEffect, useState } from "react";
import { X, Sparkles, Building2, ShoppingBag, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlainTextFromRichText } from "@/helpers";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IAiSuggestedEntity } from "@/store/api/contentMutationApi";

interface AiReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  suggestedBusinesses: IAiSuggestedEntity[];
  suggestedProducts: IAiSuggestedEntity[];
  onConfirm: (
    selectedBusinesses: IAiSuggestedEntity[],
    selectedProducts: IAiSuggestedEntity[],
  ) => void;
  isMarketplace?: boolean; // Added for TRAVELLER vs MARKETPLACE handling
}

const EntityCard = ({
  entity,
  selected,
  onToggle,
  isDark,
}: {
  entity: IAiSuggestedEntity;
  selected: boolean;
  onToggle: () => void;
  isDark: boolean;
}) => {
  const imageUrl = entity.images?.[0]?.image;
  const plainDescription = getPlainTextFromRichText(entity.description || "");

  return (
    <div
      onClick={onToggle}
      className={clsx(
        "group relative overflow-hidden rounded-lg border cursor-pointer transition-all",
        selected
          ? isDark
            ? "border-teal-500 bg-gray-900 ring-1 ring-teal-400/40"
            : "border-teal-500 bg-white ring-1 ring-teal-400/40"
          : isDark
            ? "border-gray-600 bg-gray-900/80 opacity-70 hover:opacity-100 hover:border-gray-400"
            : "border-gray-300 bg-white opacity-70 hover:opacity-100 hover:border-gray-400",
      )}
    >
      <div className="relative aspect-video">
        {imageUrl ? (
          <ImageWithFallback
            src={imageUrl}
            alt={entity.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={clsx(
              "flex h-full w-full items-center justify-center",
              isDark ? "bg-gray-800" : "bg-gray-100",
            )}
          >
            <Building2
              className={clsx(
                "h-10 w-10",
                isDark ? "text-gray-600" : "text-gray-400",
              )}
            />
          </div>
        )}

        <div
          className={clsx(
            "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md shadow transition-colors",
            selected ? "bg-teal-500 text-white" : "bg-red-500/90 text-white",
          )}
        >
          {selected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </div>
      </div>

      <div
        className={clsx(
          "min-h-24 px-3 py-2.5",
          isDark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800",
        )}
      >
        <h4
          className={clsx(
            "truncate text-sm font-semibold leading-tight",
            isDark ? "text-gray-100" : "text-gray-900",
          )}
        >
          {entity.name || "-"}
        </h4>
        {plainDescription && (
          <p
            className={clsx(
              "mt-1 line-clamp-2 text-xs leading-snug",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {plainDescription}
          </p>
        )}
        {entity.matchReason && (
          <div
            className={clsx(
              "mt-2 flex w-fit max-w-full items-center gap-1 rounded px-1.5 py-0.5 text-[11px]",
              isDark
                ? "bg-purple-900/50 text-purple-200"
                : "bg-purple-50 text-purple-700",
            )}
          >
            <Info className="h-3 w-3 shrink-0" />
            <span className="truncate">{entity.matchReason}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AiReviewModal = ({
  isOpen,
  onClose,
  categoryName,
  suggestedBusinesses,
  suggestedProducts,
  onConfirm,
  isMarketplace = false,
}: AiReviewModalProps) => {
  const { isDark } = useThemeClasses();
  // For TRAVELLER, show businesses tab. For MARKETPLACE, show only products tab.
  const [activeTab, setActiveTab] = useState<"businesses" | "products">(
    isMarketplace ? "products" : "businesses",
  );
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<Set<string>>(
    () => new Set(suggestedBusinesses.map((b) => b._id)),
  );
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    () => new Set(suggestedProducts.map((p) => p._id)),
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedBusinessIds(new Set(suggestedBusinesses.map((b) => b._id)));
    setSelectedProductIds(new Set(suggestedProducts.map((p) => p._id)));
  }, [isOpen, suggestedBusinesses, suggestedProducts]);

  if (!isOpen) return null;

  const toggleBusiness = (id: string) =>
    setSelectedBusinessIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleProduct = (id: string) =>
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleConfirm = () => {
    const selectedBiz = suggestedBusinesses.filter((b) =>
      selectedBusinessIds.has(b._id),
    );
    const selectedProd = suggestedProducts.filter((p) =>
      selectedProductIds.has(p._id),
    );
    onConfirm(selectedBiz, selectedProd);
  };

  const totalSelected = selectedBusinessIds.size + selectedProductIds.size;
  const hasResults =
    suggestedBusinesses.length > 0 || suggestedProducts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          "relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl shadow-2xl",
          isDark ? "bg-gray-900 border border-gray-700" : "bg-white",
        )}
      >
        {/* Header */}
        <div
          className={clsx(
            "flex items-start justify-between p-5 border-b",
            isDark ? "border-gray-700" : "border-gray-200",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                isDark ? "bg-purple-900/50" : "bg-purple-100",
              )}
            >
              <Sparkles
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-purple-300" : "text-purple-600",
                )}
              />
            </div>
            <div>
              <h2
                className={clsx(
                  "text-base font-semibold",
                  isDark ? "text-gray-100" : "text-gray-900",
                )}
              >
                AI Suggestions for "{categoryName}"
              </h2>
              <p
                className={clsx(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                We found these businesses/products that seem relevant. Review
                and adjust before adding to the category.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              isDark
                ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={clsx(
            "flex border-b px-5",
            isDark ? "border-gray-700" : "border-gray-200",
          )}
        >
          {(
            [
              isMarketplace
                ? {
                    key: "products",
                    label: "Products",
                    icon: ShoppingBag,
                    count: suggestedProducts.length,
                    selected: selectedProductIds.size,
                  }
                : {
                    key: "businesses",
                    label: "Businesses",
                    icon: Building2,
                    count: suggestedBusinesses.length,
                    selected: selectedBusinessIds.size,
                  },
            ] as const
          ).map(({ key, label, icon: Icon, count, selected }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "businesses" | "products")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === key
                  ? "border-teal-500 text-teal-600"
                  : isDark
                    ? "border-transparent text-gray-400 hover:text-gray-200"
                    : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span
                className={clsx(
                  "ml-0.5 px-1.5 py-0.5 rounded-full text-xs",
                  activeTab === key
                    ? "bg-teal-100 text-teal-700"
                    : isDark
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-100 text-gray-500",
                )}
              >
                {selected}/{count}
              </span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {!hasResults ? (
            <div
              className={clsx(
                "text-center py-12",
                isDark ? "text-gray-500" : "text-gray-400",
              )}
            >
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                No matching {isMarketplace ? "products" : "businesses"} found
                for this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeTab === "businesses" &&
                (suggestedBusinesses.length === 0 ? (
                  <p
                    className={clsx(
                      "col-span-full py-8 text-center text-sm",
                      isDark ? "text-gray-500" : "text-gray-400",
                    )}
                  >
                    No matching businesses found.
                  </p>
                ) : (
                  suggestedBusinesses.map((b) => (
                    <EntityCard
                      key={b._id}
                      entity={b}
                      selected={selectedBusinessIds.has(b._id)}
                      onToggle={() => toggleBusiness(b._id)}
                      isDark={isDark}
                    />
                  ))
                ))}

              {activeTab === "products" &&
                (suggestedProducts.length === 0 ? (
                  <p
                    className={clsx(
                      "col-span-full py-8 text-center text-sm",
                      isDark ? "text-gray-500" : "text-gray-400",
                    )}
                  >
                    No matching products found.
                  </p>
                ) : (
                  suggestedProducts.map((p) => (
                    <EntityCard
                      key={p._id}
                      entity={p}
                      selected={selectedProductIds.has(p._id)}
                      onToggle={() => toggleProduct(p._id)}
                      isDark={isDark}
                    />
                  ))
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={clsx(
            "flex items-center justify-between p-5 border-t",
            isDark ? "border-gray-700" : "border-gray-200",
          )}
        >
          <p
            className={clsx(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {totalSelected} item{totalSelected !== 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className={clsx(
                "border-gray-300 text-gray-700 hover:bg-gray-100",
                isDark
                  ? "!border-gray-600 !text-gray-300 !hover:bg-gray-800"
                  : "",
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Add to Category
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiReviewModal;
