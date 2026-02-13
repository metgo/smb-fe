// ProductSelectionStep.tsx
import React from "react";
import {
  Search,
  Grid,
  List,
  Image as ImageIcon,
  Accessibility,
} from "lucide-react"; // adjust imports based on your icon library

interface Product {
  id: string;
  name: string;
  businessName: string;
  price: number | string;
  category: string;
  accessibility: string[];
  // add any other fields you actually use
}

interface ProductSelectionStepProps {
  t: any; // your translation object
  productSearchQuery: string;
  setProductSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  productViewMode: "grid" | "list";
  setProductViewMode: (mode: "grid" | "list") => void;
  filteredProducts: Product[];
  selectedProducts: string[];
  toggleProductSelection: (productId: string) => void;
  primaryProducts: string[];
  togglePrimaryProduct: (productId: string) => void;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  borderColor: string;
}

export const ProductSelectionStep: React.FC<ProductSelectionStepProps> = ({
  t,
  productSearchQuery,
  setProductSearchQuery,
  selectedCategory,
  setSelectedCategory,
  productViewMode,
  setProductViewMode,
  filteredProducts,
  selectedProducts,
  toggleProductSelection,
  primaryProducts,
  togglePrimaryProduct,
  textPrimary,
  textSecondary,
  textTertiary,
  bgPrimary,
  bgSecondary,
  bgTertiary,
  borderColor,
}) => {
  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${textPrimary} mb-4`}>
        {t.selectProducts || "Select Products"}
      </h3>

      {/* Filters */}
      <div className={`${bgSecondary} rounded-lg p-4 space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t.search || "Search"}
            </label>
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
              />
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder={t.searchProducts || "Search products..."}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t.category || "Category"}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="all">{t.allCategories || "All Categories"}</option>
              <option value="Wellness">Wellness</option>
              <option value="Tours">Tours</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Dining">Dining</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => setProductViewMode("grid")}
              className={`p-2 rounded-lg ${
                productViewMode === "grid"
                  ? "bg-purple-600 text-white"
                  : `${bgPrimary} ${textSecondary}`
              }`}
              title="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setProductViewMode("list")}
              className={`p-2 rounded-lg ${
                productViewMode === "list"
                  ? "bg-purple-600 text-white"
                  : `${bgPrimary} ${textSecondary}`
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      {productViewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`${bgSecondary} rounded-lg p-4 border-2 transition-all cursor-pointer ${
                selectedProducts.includes(product.id)
                  ? "border-purple-500"
                  : borderColor
              }`}
              onClick={() => toggleProductSelection(product.id)}
            >
              <div
                className={`w-full h-32 ${bgTertiary} rounded-lg mb-3 flex items-center justify-center`}
              >
                <ImageIcon className={`w-12 h-12 ${textTertiary}`} />
              </div>
              <h4 className={`${textPrimary} mb-1`}>{product.name}</h4>
              <p className={`text-sm ${textTertiary} mb-2`}>
                {product.businessName}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className={`${textPrimary}`}>₪{product.price}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${bgTertiary} ${textSecondary}`}
                >
                  {product.category}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {product.accessibility.map((acc) => (
                  <Accessibility
                    key={acc}
                    className={`w-4 h-4 ${textTertiary}`}
                  />
                ))}
              </div>

              {selectedProducts.includes(product.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePrimaryProduct(product.id);
                  }}
                  className={`w-full mt-2 px-3 py-1 rounded-lg text-sm ${
                    primaryProducts.includes(product.id)
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                      : `${bgTertiary} ${textSecondary}`
                  }`}
                >
                  {primaryProducts.includes(product.id)
                    ? "★ Primary"
                    : "Mark as Primary"}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`${bgSecondary} rounded-lg p-4 border-2 transition-all cursor-pointer flex items-center gap-4 ${
                selectedProducts.includes(product.id)
                  ? "border-purple-500"
                  : borderColor
              }`}
              onClick={() => toggleProductSelection(product.id)}
            >
              <div
                className={`w-16 h-16 ${bgTertiary} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <ImageIcon className={`w-8 h-8 ${textTertiary}`} />
              </div>
              <div className="flex-1">
                <h4 className={`${textPrimary}`}>{product.name}</h4>
                <p className={`text-sm ${textTertiary}`}>
                  {product.businessName} • {product.category}
                </p>
              </div>
              <div className={`${textPrimary}`}>₪{product.price}</div>

              {selectedProducts.includes(product.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePrimaryProduct(product.id);
                  }}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    primaryProducts.includes(product.id)
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                      : `${bgTertiary} ${textSecondary}`
                  }`}
                >
                  {primaryProducts.includes(product.id)
                    ? "★ Primary"
                    : "Mark Primary"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selection summary */}
      <div className={`${bgSecondary} rounded-lg p-4`}>
        <p className={textSecondary}>
          {selectedProducts.length} {t.productsSelected || "products selected"}
          {primaryProducts.length > 0 &&
            ` • ${primaryProducts.length} ${t.markedAsPrimary || "marked as primary"}`}
        </p>
      </div>
    </div>
  );
};
