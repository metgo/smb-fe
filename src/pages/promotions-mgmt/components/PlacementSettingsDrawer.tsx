import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { X, Clock, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

type TPlacementConfig = {
  rotationType: "automatic" | "manual";
  timeInterval: number;
};

interface PlacementSettingsDrawerProps {
  selectedPlacement: string | null;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  placementSettings: Record<string, TPlacementConfig>;
  setPlacementSettings: React.Dispatch<
    React.SetStateAction<Record<string, TPlacementConfig>>
  >;
  defaultPlacementConfig: () => TPlacementConfig;
}

interface CustomSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function CustomSelect({ value, options, onChange }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { isDark, bgPrimary, borderColor, textPrimary, textSecondary } =
    useThemeClasses();

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-colors",
          borderColor,
          bgPrimary,
          textPrimary,
          open
            ? "ring-2 ring-green-500"
            : isDark
              ? "hover:border-gray-600"
              : "hover:border-gray-400",
        )}
      >
        <span>{selected?.label}</span>
        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border shadow-lg overflow-hidden",
            bgPrimary,
            borderColor,
          )}
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors",
                  isActive
                    ? isDark
                      ? "bg-green-900/30 text-green-400"
                      : "bg-green-50 text-green-700"
                    : clsx(
                        textSecondary,
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-50",
                      ),
                )}
              >
                <span>{option.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PlacementSettingsDrawer({
  selectedPlacement,
  setSettingsOpen,
  placementSettings,
  setPlacementSettings,
  defaultPlacementConfig,
}: PlacementSettingsDrawerProps) {
  const { t } = useTranslation("promotions");
  const { isDark, isRTL, bgPrimary, borderColor, textPrimary } =
    useThemeClasses();

  if (!selectedPlacement) return null;

  const cfg = placementSettings[selectedPlacement] ?? defaultPlacementConfig();

  return (
    <div
      className={clsx(
        "absolute top-full mt-1 z-50 w-72",
        isRTL ? "left-0" : "right-0",
      )}
    >
      <div
        className={clsx(
          "rounded-2xl border shadow-2xl px-5 pt-4 pb-6",
          bgPrimary,
          borderColor,
        )}
      >
        {/* Handle */}
        <div className="flex justify-center mb-3">
          <div
            className={clsx(
              "w-8 h-1 rounded-full",
              isDark ? "bg-gray-600" : "bg-gray-300",
            )}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className={clsx(
                "w-4 h-4",
                isDark ? "text-green-400" : "text-green-600",
              )}
            />
            <span className={`text-sm font-semibold ${textPrimary}`}>
              {t(selectedPlacement)}
            </span>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className={clsx(
              "p-1 rounded-lg transition-colors",
              isDark
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-500",
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className={`block text-xs font-medium ${textPrimary}`}>
              {t("rotation_type")}
            </label>
            <CustomSelect
              value={cfg.rotationType}
              options={[
                { value: "automatic", label: t("automatic") },
                { value: "manual", label: t("manual") },
              ]}
              onChange={(val) =>
                setPlacementSettings((prev) => ({
                  ...prev,
                  [selectedPlacement]: {
                    ...cfg,
                    rotationType: val as "automatic" | "manual",
                  },
                }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <label
              className={`flex items-center gap-1.5 text-xs font-medium ${textPrimary}`}
            >
              <Clock className="w-3.5 h-3.5" />
              {t("time_interval_seconds")}
            </label>
            <input
              type="number"
              value={cfg.timeInterval}
              onChange={(e) =>
                setPlacementSettings((prev) => ({
                  ...prev,
                  [selectedPlacement]: {
                    ...cfg,
                    timeInterval: parseInt(e.target.value),
                  },
                }))
              }
              min="1"
              max="60"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:outline-none`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
