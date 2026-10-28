import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, Store } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Badge } from "@/components/ui/badge";
import type { Business } from "../types/dashboard.types";

interface BusinessSwitcherProps {
  businesses: Business[];
  selectedBusinessId: string;
  onSelect: (businessId: string) => void;
}

export default function BusinessSwitcher({
  businesses,
  selectedBusinessId,
  onSelect,
}: BusinessSwitcherProps) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected =
    businesses.find((b) => b.id === selectedBusinessId) ?? businesses[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!selected) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm border min-w-56 cursor-pointer",
          isDark
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-300 text-gray-900",
        )}
      >
        <div
          className={clsx(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
            isDark ? "bg-teal-900 text-teal-300" : "bg-teal-100 text-teal-700",
          )}
          aria-hidden="true"
        >
          {selected.name.charAt(0)}
        </div>
        <span className="flex-1 text-left truncate">{selected.name}</span>
        <Badge variant={selected.status === "active" ? "default" : "secondary"}>
          {t(`status_${selected.status}`)}
        </Badge>
        <ChevronDown
          className={clsx("w-4 h-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={clsx(
            "absolute top-full left-0 mt-1 z-50 rounded-lg border shadow-lg min-w-full overflow-hidden",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          {businesses.map((business) => (
            <button
              key={business.id}
              type="button"
              role="option"
              aria-selected={business.id === selectedBusinessId}
              onClick={() => {
                onSelect(business.id);
                setOpen(false);
              }}
              className={clsx(
                "w-full flex items-center gap-2 text-left px-3 py-2 text-sm transition-colors cursor-pointer",
                business.id === selectedBusinessId
                  ? isDark
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-900"
                  : isDark
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <Store className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate">{business.name}</span>
              <Badge
                variant={business.status === "active" ? "default" : "secondary"}
              >
                {t(`status_${business.status}`)}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
