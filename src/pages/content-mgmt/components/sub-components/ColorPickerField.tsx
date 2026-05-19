import clsx from "clsx";
import { Palette, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ColorPickerFieldProps {
  colors: string[];
  title: string;
  onChange: (colors: string[]) => void;
}

const DEFAULT_1 = "#6366f1";
const DEFAULT_2 = "#ec4899";
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const ColorPickerField = ({
  colors,
  onChange,
  title,
}: ColorPickerFieldProps) => {
  const { t } = useTranslation("content");

  const { isDark } = useThemeClasses();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"solid" | "gradient">(
    colors.length >= 2 ? "gradient" : "solid",
  );
  const [c1, setC1] = useState(colors[0] ?? DEFAULT_1);
  const [c2, setC2] = useState(colors[1] ?? DEFAULT_2);
  const ref = useRef<HTMLDivElement>(null);
  const popupId = useRef(Math.random().toString(36));

  // Sync local state when prop changes externally
  useEffect(() => {
    setMode(colors.length >= 2 ? "gradient" : "solid");
    if (colors[0]) setC1(colors[0]);
    if (colors[1]) setC2(colors[1]);
  }, [colors.join(",")]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close when another popup opens elsewhere
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail.id !== popupId.current) setOpen(false);
    };
    document.addEventListener("popup-opened", handler);
    return () => document.removeEventListener("popup-opened", handler);
  }, []);

  const handleToggleOpen = () => {
    setOpen((v) => {
      if (!v)
        document.dispatchEvent(
          new CustomEvent("popup-opened", { detail: { id: popupId.current } }),
        );
      return !v;
    });
  };

  const emit = (
    newC1: string,
    newC2: string,
    newMode: "solid" | "gradient",
  ) => {
    if (newMode === "solid") onChange([newC1]);
    else onChange([newC1, newC2]);
  };

  const handleWheelC1 = (val: string) => {
    setC1(val);
    emit(val, c2, mode);
  };
  const handleWheelC2 = (val: string) => {
    setC2(val);
    emit(c1, val, mode);
  };
  const handleHexC1 = (val: string) => {
    setC1(val);
    if (HEX_RE.test(val)) emit(val, c2, mode);
  };
  const handleHexC2 = (val: string) => {
    setC2(val);
    if (HEX_RE.test(val)) emit(c1, val, mode);
  };
  const handleMode = (m: "solid" | "gradient") => {
    setMode(m);
    emit(c1, c2, m);
  };

  const previewBg: React.CSSProperties =
    mode === "gradient"
      ? { background: `linear-gradient(135deg, ${c1}, ${c2})` }
      : { background: c1 };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={handleToggleOpen}
        title="Pick background color"
        className={clsx(
          "w-7 h-7 rounded border transition-all hover:scale-110 shrink-0 flex items-center justify-center",
          colors.length > 0
            ? "border-white/60 shadow-sm"
            : isDark
              ? "border-gray-300"
              : "border-gray-400",
          open &&
            (isDark
              ? "ring-2 ring-offset-1 ring-offset-gray-800 ring-indigo-400"
              : "ring-2 ring-offset-1 ring-offset-white ring-indigo-400"),
        )}
      >
        {colors.length === 0 && (
          <Palette
            className={clsx(
              "w-3.5 h-3.5",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          />
        )}
      </button>

      {open && (
        <>
          <div
            className={clsx(
              "absolute left-0 top-7 z-50 rounded-xl border shadow-xl w-52 p-3 space-y-3",
              isDark
                ? "bg-gray-900 border-gray-700 shadow-black/60"
                : "bg-white border-gray-200 shadow-gray-300/40",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span
                className={clsx(
                  "text-[10px] font-semibold uppercase tracking-wide",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                {t("background_color")}
              </span>
              <button
                onClick={() => setOpen(false)}
                className={clsx(
                  "p-0.5 rounded transition-colors",
                  isDark
                    ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Mode toggle */}
            <div
              className={clsx(
                "flex rounded-lg p-0.5",
                isDark ? "bg-gray-800" : "bg-gray-100",
              )}
            >
              {(["solid", "gradient"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleMode(m)}
                  className={clsx(
                    "flex-1 text-xs py-1 rounded-md transition-all font-medium capitalize",
                    mode === m
                      ? isDark
                        ? "bg-gray-700 text-white shadow"
                        : "bg-white text-gray-800 shadow"
                      : isDark
                        ? "text-gray-500 hover:text-gray-300"
                        : "text-gray-400 hover:text-gray-600",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Color 1 */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 items-center w-full">
                <input
                  type="color"
                  value={HEX_RE.test(c1) ? c1 : DEFAULT_1}
                  onChange={(e) => handleWheelC1(e.target.value)}
                  className=" col-span-2 h-8 w-8 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  value={c1}
                  onChange={(e) => handleHexC1(e.target.value)}
                  className={clsx(
                    "col-span-10 text-xs px-2 py-1 ms-2 rounded border font-mono",
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-gray-50 border-gray-200 text-gray-800",
                  )}
                  maxLength={7}
                  placeholder="#000000"
                />
              </div>

              {/* Color 2 (gradient only) */}
              {mode === "gradient" && (
                <div className="grid grid-cols-12 items-center w-full">
                  <input
                    type="color"
                    value={HEX_RE.test(c2) ? c2 : DEFAULT_2}
                    onChange={(e) => handleWheelC2(e.target.value)}
                    className="col-span-2 h-8 w-8 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <input
                    value={c2}
                    onChange={(e) => handleHexC2(e.target.value)}
                    className={clsx(
                      "col-span-10 ms-2 text-xs px-2 py-1 rounded border font-mono",
                      isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200"
                        : "bg-gray-50 border-gray-200 text-gray-800",
                    )}
                    maxLength={7}
                    placeholder="#000000"
                  />
                </div>
              )}
            </div>

            {/* Preview bar */}
            <div
              className="h-7 rounded-lg border text-center text-white font-bold text-sm"
              style={{
                ...previewBg,
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            >
              <span>{title}</span>
            </div>

            {/* Clear */}
            <button
              onClick={() => {
                onChange([]);
                setOpen(false);
              }}
              className={clsx(
                "w-full text-xs py-1.5 rounded-lg border transition-colors",
                isDark
                  ? "border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
                  : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700",
              )}
            >
              {t("remove_color")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPickerField;
