import clsx from "clsx";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Copy, X, ImageOff } from "lucide-react";

import { getLngWiseStr } from "@/helpers";
import { ImageWithFallback } from "@/components/shared";
import { getPlainText } from "@/components/shared/RichTextEditor";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface MiniSitePreviewProps {
  formData: any;
  logoImagePath: string;
  products: any[];
  selectedProducts: string[];
  removeSelectedProduct: (productId: string) => void;
  miniSiteUrl: string;
  copyMiniSiteUrl: () => void;
  minSelectedProducts?: number;
}

// Carousel tiles shrink gradually the further they sit from the active
// slide, up to this many offset levels away.
const MAX_VISIBLE_OFFSET = 3;
const TILE_SIZES = [256, 208, 176, 144]; // px, indexed by |offset|

export const MiniSitePreview: React.FC<MiniSitePreviewProps> = ({
  formData,
  logoImagePath,
  products,
  selectedProducts,
  removeSelectedProduct,
  miniSiteUrl,
  copyMiniSiteUrl,
  minSelectedProducts = 3,
}) => {
  const { t } = useTranslation("minisites");
  const {
    language,
    isRTL,
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedProductDetails = selectedProducts
    .map((id) => products.find((p) => p._id === id))
    .filter(Boolean);

  const count = selectedProductDetails.length;

  useEffect(() => {
    if (activeIndex >= count) {
      setActiveIndex(Math.max(0, count - 1));
    }
  }, [count, activeIndex]);

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + count) % count);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % count);

  const getOffset = (index: number) => {
    let offset = index - activeIndex;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
    return offset;
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div
        className={clsx(
          "relative rounded-2xl border overflow-hidden",
          borderColor,
        )}
      >
        {/* Background image */}
        {formData.backgroundImage ? (
          <div className="absolute inset-0">
            <img
              src={formData.backgroundImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div
              className={clsx(
                "absolute inset-0",
                isDark ? "bg-black/60" : "bg-white/70",
              )}
            />
          </div>
        ) : (
          <div
            className={clsx(
              "absolute inset-0 bg-linear-to-b",
              isDark ? "from-gray-900 to-gray-950" : "from-white to-gray-50",
            )}
          />
        )}

        <div className="relative p-8 space-y-6">
          {/* Logo */}
          {logoImagePath && (
            <div className="flex justify-center">
              <img
                src={logoImagePath}
                alt="Logo"
                className="h-14 w-auto object-contain"
              />
            </div>
          )}

          {/* Title */}
          <div className="text-center space-y-1">
            {getPlainText(formData.contentTitle ?? "").trim() ? (
              <h1
                className={clsx(
                  "text-2xl font-bold bg-linear-to-r bg-clip-text text-transparent",
                  isDark
                    ? "from-purple-400 via-pink-400 to-orange-300"
                    : "from-purple-600 via-pink-600 to-orange-500",
                )}
                dangerouslySetInnerHTML={{ __html: formData.contentTitle }}
              />
            ) : (
              <h1
                className={clsx(
                  "text-2xl font-bold bg-linear-to-r bg-clip-text text-transparent",
                  isDark
                    ? "from-purple-400 via-pink-400 to-orange-300"
                    : "from-purple-600 via-pink-600 to-orange-500",
                )}
              >
                {formData.campaignName || t("campaign_name")}
              </h1>
            )}
            {getPlainText(formData.contentSubtitle ?? "").trim() && (
              <p
                className={textSecondary}
                dangerouslySetInnerHTML={{ __html: formData.contentSubtitle }}
              />
            )}
          </div>

          {/* Carousel */}
          {count === 0 ? (
            <div
              className={clsx(
                "rounded-xl p-10 text-center border-2 border-dashed",
                borderColor,
              )}
            >
              <ImageOff className={`w-8 h-8 mx-auto mb-3 ${textTertiary}`} />
              <p className={textTertiary}>{t("no_products_selected")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative flex items-center justify-center h-72 select-none">
                <button
                  onClick={goPrev}
                  disabled={count < 2}
                  className={clsx(
                    "absolute left-0 z-20 p-2.5 rounded-full shadow-md transition-all  disabled:cursor-not-allowed",
                    isDark
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-100"
                      : "bg-white hover:bg-gray-50 text-gray-700",
                    "hover:shadow-lg",
                  )}
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative w-full h-full flex items-center justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                  {selectedProductDetails.map((product, index) => {
                    const offset = getOffset(index);
                    const absOffset = Math.abs(offset);
                    const isActive = offset === 0;
                    if (absOffset > MAX_VISIBLE_OFFSET) return null;

                    const tileSize =
                      TILE_SIZES[Math.min(absOffset, TILE_SIZES.length - 1)];
                    const canRemove = count > minSelectedProducts;

                    return (
                      <div
                        key={product._id}
                        className={clsx(
                          "absolute transition-all duration-300 ease-out rounded-2xl overflow-hidden",
                          isActive
                            ? clsx(
                                "z-10 shadow-2xl ring-2",
                                isDark
                                  ? "ring-purple-500/70 shadow-purple-950/50"
                                  : "ring-purple-500 shadow-purple-200/60",
                              )
                            : clsx("shadow-md cursor-pointer"),
                          isDark ? "bg-gray-800" : "bg-white",
                        )}
                        style={{
                          width: tileSize,
                          height: tileSize,
                          transform: `translateX(${offset * 65}%) scale(${isActive ? 1 : 0.85})`,
                          zIndex: isActive ? 10 : 5 - absOffset,
                        }}
                        onClick={() => !isActive && setActiveIndex(index)}
                      >
                        {isActive && canRemove && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSelectedProduct(product._id);
                            }}
                            className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-600 shadow-md transition-colors"
                            aria-label={t("remove")}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="relative w-full h-3/4">
                          <ImageWithFallback
                            src={product.images?.[0]?.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={clsx(
                              "absolute inset-x-0 bottom-0 h-8 bg-linear-to-t to-transparent",
                              isDark ? "from-black/40" : "from-black/10",
                            )}
                          />
                        </div>
                        <div className="p-2">
                          <h4
                            className={`text-sm font-medium truncate ${textPrimary}`}
                          >
                            {getLngWiseStr(
                              language,
                              product?.name,
                              product?.nameHe,
                              product?.nameAr,
                            )}
                          </h4>
                          <p
                            className={clsx(
                              "text-xs truncate",
                              isActive
                                ? "text-purple-600 dark:text-purple-400 font-semibold"
                                : textTertiary,
                            )}
                          >
                            {product?.price?.sellingPrice != null
                              ? `₪${product.price.sellingPrice}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={goNext}
                  disabled={count < 2}
                  className={clsx(
                    "absolute right-0 z-20 p-2.5 rounded-full shadow-md transition-all disabled:cursor-not-allowed",
                    isDark
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-100"
                      : "bg-white hover:bg-gray-50 text-gray-700",
                    "hover:shadow-lg",
                  )}
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dot indicators */}
              {count > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                  {selectedProductDetails.map((product, index) => (
                    <button
                      key={product._id}
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={clsx(
                        "h-1.5 rounded-full transition-all",
                        index === activeIndex
                          ? "w-6 bg-linear-to-r from-purple-500 to-pink-600"
                          : clsx(
                              "w-1.5",
                              isDark ? "bg-gray-700" : "bg-gray-300",
                            ),
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Greeting */}
          {getPlainText(formData.contentGreeting ?? "").trim() && (
            <p
              className={`text-center ${textSecondary}`}
              dangerouslySetInnerHTML={{ __html: formData.contentGreeting }}
            />
          )}
        </div>

        {/* Footer image */}
        {formData.footerImage && (
          <img
            src={formData.footerImage}
            alt=""
            className="relative w-full h-auto object-cover"
          />
        )}
      </div>

      {/* Mini-Site URL */}
      <div className={`${bgSecondary} rounded-lg p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${textTertiary} mb-1`}>
              {t("mini_site_url")}
            </p>
            <p className={`text-sm ${textPrimary} font-mono truncate`}>
              {miniSiteUrl}
            </p>
          </div>
          <button
            onClick={copyMiniSiteUrl}
            className={clsx(
              "px-4 py-2 cursor-pointer rounded-lg border transition-colors flex items-center gap-2 shrink-0",
              borderColor,
              textSecondary,
              isDark
                ? "hover:bg-gray-800 hover:text-gray-100"
                : "hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <Copy className="w-4 h-4" />
            {t("copy")}
          </button>
        </div>
      </div>
    </div>
  );
};
