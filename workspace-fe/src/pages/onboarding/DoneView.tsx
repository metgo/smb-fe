import clsx from "clsx";
import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Link2,
  Package,
  Trophy,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { routes } from "@/lib/routes";
import { Button } from "./ui";

export type DoneAction = "view" | "products" | "close";

const CONFETTI = [
  { x: -120, y: -70, c: "bg-teal-400", r: 40 },
  { x: -80, y: -110, c: "bg-amber-400", r: -30 },
  { x: -20, y: -125, c: "bg-emerald-400", r: 60 },
  { x: 40, y: -115, c: "bg-sky-400", r: -50 },
  { x: 95, y: -95, c: "bg-rose-400", r: 25 },
  { x: 130, y: -50, c: "bg-amber-300", r: -70 },
  { x: -140, y: -20, c: "bg-sky-300", r: 80 },
  { x: 145, y: -5, c: "bg-teal-300", r: -15 },
];

/**
 * The last screen of onboarding: the page is built. Shows a link to the new
 * business, a button that opens it, and a nudge to add products.
 */
export const DoneView = forwardRef<
  HTMLHeadingElement,
  {
    businessId: string;
    businessName: string;
    productsAdded: number;
    productsFailed: number;
    onAction: (action: DoneAction) => void;
  }
>(function DoneView(
  { businessId, businessName, productsAdded, productsFailed, onAction },
  headingRef,
) {
  const { t } = useTranslation("onboarding");
  const { textPrimary, textTertiary, isDark, isRTL } = useThemeClasses();
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const path = `${routes.businessDetails}?businessId=${encodeURIComponent(businessId)}`;
  const url = `${window.location.origin}${path}`;
  const Forward = isRTL ? ArrowLeft : ArrowRight;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const productsText = productsFailed
    ? t("done_products_failed", { count: productsFailed })
    : productsAdded
      ? t("done_products_some", { count: productsAdded })
      : t("done_products_body");

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 h-20 w-20">
          {!reduceMotion &&
            CONFETTI.map((p, i) => (
              <motion.span
                key={i}
                aria-hidden
                className={clsx(
                  "absolute start-1/2 top-1/2 h-2 w-3 rounded-sm",
                  p.c,
                )}
                initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: [0, p.y, p.y + 60],
                  opacity: [0, 1, 0],
                  rotate: p.r * 4,
                }}
                transition={{ duration: 1.6, delay: 0.15 + i * 0.03 }}
              />
            ))}
          <motion.div
            initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-600/30"
          >
            <Check className="h-10 w-10" strokeWidth={3} aria-hidden />
          </motion.div>
        </div>
        <span
          className={clsx(
            "mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            isDark
              ? "bg-amber-900/40 text-amber-300"
              : "bg-amber-100 text-amber-800",
          )}
        >
          <Trophy className="h-3.5 w-3.5" aria-hidden />
          {t("done_badge")}
        </span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className={clsx(
            "text-2xl font-bold leading-snug outline-none md:text-3xl",
            textPrimary,
          )}
        >
          {t("done_title", { name: businessName })}
        </h2>
        <p className={clsx("mt-2 max-w-md text-sm leading-6", textTertiary)}>
          {t("done_sub")}
        </p>
      </div>

      <div
        className={clsx(
          "rounded-xl border p-4",
          isDark
            ? "border-gray-700 bg-gray-950/50"
            : "border-gray-200 bg-gray-50",
        )}
      >
        <p className={clsx("mb-2 text-xs font-medium", textTertiary)}>
          {t("done_link_label")}
        </p>
        <div className="flex items-center gap-2">
          <Link2
            className={clsx(
              "h-4 w-4 shrink-0",
              isDark ? "text-teal-300" : "text-teal-700",
            )}
            aria-hidden
          />
          <a
            href={path}
            dir="ltr"
            onClick={(e) => {
              e.preventDefault();
              onAction("view");
            }}
            className={clsx(
              "min-w-0 flex-1 truncate text-sm font-medium underline-offset-2 hover:underline",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded",
              isDark ? "text-teal-300" : "text-teal-700",
            )}
          >
            {url}
          </a>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? t("done_copied") : t("done_copy")}
            title={copied ? t("done_copied") : t("done_copy")}
            className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
              isDark
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-200",
            )}
          >
            {copied ? (
              <Check className="h-4 w-4 text-teal-500" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {copied ? t("done_copied") : ""}
        </span>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
        <Button variant="ghost" onClick={() => onAction("close")}>
          {t("done_later")}
        </Button>
        <Button onClick={() => onAction("view")} className="sm:min-w-48">
          {t("done_view")}
          <Forward className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div
        className={clsx(
          "flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center",
          productsFailed
            ? isDark
              ? "border-amber-700/60 bg-amber-900/20"
              : "border-amber-300 bg-amber-50"
            : isDark
              ? "border-teal-700 bg-teal-950/30"
              : "border-teal-300 bg-teal-50/60",
        )}
      >
        <span
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            isDark
              ? "bg-teal-900/60 text-teal-300"
              : "bg-teal-100 text-teal-700",
          )}
        >
          {productsFailed ? (
            <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden />
          ) : (
            <Package className="h-5 w-5" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className={clsx("text-sm font-semibold", textPrimary)}>
            {t("done_products_title")}
          </p>
          <p className={clsx("text-sm leading-6", textTertiary)}>
            {productsText}
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0"
          onClick={() => onAction("products")}
        >
          {t("done_products_cta")}
        </Button>
      </div>
    </div>
  );
});
