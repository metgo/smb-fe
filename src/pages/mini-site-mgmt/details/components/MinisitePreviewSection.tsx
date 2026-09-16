import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Copy, ImageOff } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const TILE_SIZES = [256, 208, 176, 144]; // px, indexed by |offset|

export default function MinisitePreviewSection({
  code,
  miniSite,
  externalApiId,
  productIds,
  backgroundImage,
  footerImage,
}: Partial<IMinisiteDetailsRes>) {
  const { t } = useTranslation("minisites");
  const { associatedWebsite } = useAppSelector((state) => state.auth);

  const {
    isRTL,
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();
  const [activeIndex, setActiveIndex] = useState(0);

  const products = productIds ?? [];
  const count = products.length;

  useEffect(() => {
    if (activeIndex >= count) {
      setActiveIndex(Math.max(0, count - 1));
    }
  }, [count, activeIndex]);

  const miniSiteUrl = useMemo(() => {
    const website = (associatedWebsite as IWebsite[]).find(
      (w) => w._id === externalApiId,
    );
    const baseUrl = website?.websiteUrl?.replace(/\/+$/, "");
    if (!baseUrl) return "";
    return `${baseUrl}/mini-site?campCode=${code ?? ""}`;
  }, [associatedWebsite, externalApiId, code]);

  const copyMiniSiteUrl = () => {
    navigator.clipboard.writeText(miniSiteUrl);
    toast.success(t("copied") || "Copied");
  };

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
          "rounded-2xl border bg-linear-to-b relative overflow-hidden",
          isDark
            ? "from-gray-900 to-gray-950 border-gray-800"
            : "from-white to-gray-50 border-gray-200",
        )}
      >
        {backgroundImage && (
          <div className="absolute inset-0 ">
            <img
              src={backgroundImage}
              alt="Background image"
              className="w-full h-full object-cover"
            />
            <div
              className={clsx(
                "absolute inset-0",
                isDark ? "bg-black/60" : "bg-white/70",
              )}
            />
          </div>
        )}

        <div className="relative p-8 space-y-6">
          {/* Title */}
          <div className="text-center space-y-1">
            <h1
              className={clsx(
                "text-2xl font-bold bg-linear-to-r bg-clip-text text-transparent",
                isDark
                  ? "from-purple-400 via-pink-400 to-orange-300"
                  : "from-purple-600 via-pink-600 to-orange-500",
              )}
              dangerouslySetInnerHTML={{
                __html: miniSite?.title?.trim() || t("campaign_name"),
              }}
            />
            <p
              className={textSecondary}
              dangerouslySetInnerHTML={{
                __html: miniSite?.subTitle?.trim() || "",
              }}
            />
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
                    "absolute left-0 z-20 p-2.5 rounded-full shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed",
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
                  {products.map((product, index) => {
                    const offset = getOffset(index);
                    const absOffset = Math.abs(offset);
                    const isActive = offset === 0;
                    if (absOffset > 3) return null;

                    const tileSize =
                      TILE_SIZES[Math.min(absOffset, TILE_SIZES.length - 1)];

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
                        <div className="relative w-full h-3/4">
                          <ImageWithFallback
                            src={product?.image}
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
                        <div className="p-3">
                          <h4
                            className={`text-sm font-medium truncate ${textPrimary}`}
                          >
                            {product.name}
                          </h4>
                          <p
                            className={clsx(
                              "text-xs truncate",
                              isActive
                                ? "text-purple-600 dark:text-purple-400 font-semibold"
                                : textTertiary,
                            )}
                          >
                            {product?.price != null ? `₪${product.price}` : ""}
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
                    "absolute right-0 z-20 p-2.5 rounded-full shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed",
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
                  {products.map((product, index) => (
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
          {miniSite?.greeting?.trim() && (
            <p
              className={`text-center ${textSecondary}`}
              dangerouslySetInnerHTML={{ __html: miniSite?.greeting }}
            />
          )}
        </div>

        {/* Footer image */}
        {footerImage && (
          <img
            src={footerImage}
            alt="Footer image"
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
              "px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 shrink-0 cursor-pointer",
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
}
