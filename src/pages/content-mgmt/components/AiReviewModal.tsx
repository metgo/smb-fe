import clsx from "clsx";
import { useEffect, useState } from "react";
import { X, Sparkles, Building2, ShoppingBag, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div
      onClick={onToggle}
      className={clsx(
        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
        selected
          ? isDark
            ? "border-teal-500 bg-teal-900/20"
            : "border-teal-500 bg-teal-50"
          : isDark
            ? "border-gray-700 bg-gray-800/40 hover:border-gray-500"
            : "border-gray-200 bg-white hover:border-gray-300",
      )}
    >
      {/* Thumbnail */}
      <div
        className={clsx(
          "w-12 h-12 rounded-md shrink-0 overflow-hidden flex items-center justify-center",
          isDark ? "bg-gray-700" : "bg-gray-100",
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={entity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Building2
            className={clsx(
              "w-5 h-5",
              isDark ? "text-gray-500" : "text-gray-400",
            )}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            "font-medium text-sm truncate",
            isDark ? "text-gray-100" : "text-gray-900",
          )}
        >
          {entity.name}
        </p>
        {entity.description && (
          <p
            className={clsx(
              "text-xs mt-0.5 line-clamp-2",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {entity.description}
          </p>
        )}
        {entity.matchReason && (
          <div
            className={clsx(
              "flex items-center gap-1 mt-1.5 text-xs rounded px-1.5 py-0.5 w-fit",
              isDark
                ? "bg-purple-900/40 text-purple-300"
                : "bg-purple-50 text-purple-700",
            )}
          >
            <Info className="w-3 h-3 shrink-0" />
            {entity.matchReason}
          </div>
        )}
      </div>

      {/* Checkbox */}
      <div
        className={clsx(
          "w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
          selected
            ? "bg-teal-500 border-teal-500"
            : isDark
              ? "border-gray-600"
              : "border-gray-300",
        )}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
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
}: AiReviewModalProps) => {
  const { isDark } = useThemeClasses();
  const [activeTab, setActiveTab] = useState<"businesses" | "products">(
    "businesses",
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
          "relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]",
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
              {
                key: "businesses",
                label: "Businesses",
                icon: Building2,
                count: suggestedBusinesses.length,
                selected: selectedBusinessIds.size,
              },
              {
                key: "products",
                label: "Products",
                icon: ShoppingBag,
                count: suggestedProducts.length,
                selected: selectedProductIds.size,
              },
            ] as const
          ).map(({ key, label, icon: Icon, count, selected }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
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
                No matching entities found for this category.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTab === "businesses" &&
                (suggestedBusinesses.length === 0 ? (
                  <p
                    className={clsx(
                      "text-sm text-center py-8",
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
                      "text-sm text-center py-8",
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
            <Button variant="outline" onClick={onClose}>
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
