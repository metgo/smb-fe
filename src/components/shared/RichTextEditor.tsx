import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  Quote,
  ChevronDown,
  Type,
  Palette,
  Highlighter,
} from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  variables?: { label: string; value: string }[];
  maxLength?: number;
}

type TBtn = {
  icon: React.ComponentType<{ className?: string }>;
  command: string;
  title: string;
  value?: string;
  onClick?: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

const PRESET_COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#808080",
  "#A52A2A",
];

// Commands tracked for active (highlighted) state in the toolbar.
// These are read inside a selectionchange listener — NOT during render —
// so there is no "ref access during render" lint violation.
const TRACKED_COMMANDS = [
  "bold",
  "italic",
  "underline",
  "strikeThrough",
  "insertUnorderedList",
  "insertOrderedList",
  "justifyLeft",
  "justifyCenter",
  "justifyRight",
  "justifyFull",
];

const BLOCK_TAGS = new Set([
  "P",
  "DIV",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
  "LI",
  "TD",
  "TH",
]);

const VARIABLE_COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-green-600 dark:text-green-400",
  "text-purple-600 dark:text-purple-400",
  "text-orange-600 dark:text-orange-400",
  "text-pink-600 dark:text-pink-400",
  "text-teal-600 dark:text-teal-400",
  "text-indigo-600 dark:text-indigo-400",
];

const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)," +
    "linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)",
  backgroundSize: "6px 6px",
  backgroundPosition: "0 0,3px 3px",
};

// ─── Pure DOM helpers (defined outside component — no hooks, no refs) ─────────

/**
 * Applies font size to the current selection using the Range API directly.
 * Never uses execCommand('fontSize') because that only accepts keyword sizes
 * 1–7, where size 7 = "xx-large" = 48px — not an arbitrary px value.
 */
function applyFontSizeDOM(px: number): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);

  if (range.collapsed) {
    // Insert a zero-width span so the next characters typed inherit the size.
    const span = document.createElement("span");
    span.style.fontSize = `${px}px`;
    span.appendChild(document.createTextNode("\u200B"));
    range.insertNode(span);
    range.setStart(span.firstChild!, 1);
    range.setEnd(span.firstChild!, 1);
    sel.removeAllRanges();
    sel.addRange(range);
    return;
  }

  const reselect = (span: HTMLSpanElement) => {
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(span);
    sel.addRange(r);
  };

  try {
    // surroundContents works for simple (single-element) ranges
    const span = document.createElement("span");
    span.style.fontSize = `${px}px`;
    range.surroundContents(span);
    reselect(span);
  } catch {
    // Falls back for cross-element ranges: extract → wrap → reinsert
    const span = document.createElement("span");
    span.style.fontSize = `${px}px`;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    reselect(span);
  }
}

/**
 * Finds the nearest block-level ancestor of `node` inside `root`.
 */
function getNearestBlock(node: Node, root: HTMLElement): Element | null {
  let cur: Node | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (cur && cur !== root) {
    if (cur instanceof Element && BLOCK_TAGS.has(cur.tagName)) return cur;
    cur = cur.parentElement;
  }
  return null;
}

/**
 * Applies a heading tag (h1–h6 or p) to the block containing the selection.
 * Uses direct DOM replacement instead of execCommand('formatBlock') which is
 * deprecated and silently no-ops in many browser contexts.
 */
function applyHeadingDOM(tag: string, root: HTMLElement): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const block = getNearestBlock(range.commonAncestorContainer, root);
  if (!block) return;

  // Toggle: same tag → revert to <p>
  const target = block.tagName.toLowerCase() === tag ? "p" : tag;
  const newEl = document.createElement(target);
  newEl.innerHTML = block.innerHTML;

  // Carry over alignment/other inline styles but drop font-size
  // (headings have their own sizes in the browser default stylesheet)
  if ((block as HTMLElement).style?.cssText) {
    (newEl as HTMLElement).style.cssText = (block as HTMLElement).style.cssText;
    (newEl as HTMLElement).style.fontSize = "";
  }

  block.replaceWith(newEl);

  // Restore cursor at end of new element
  sel.removeAllRanges();
  const r = document.createRange();
  r.selectNodeContents(newEl);
  r.collapse(false);
  sel.addRange(r);
}

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g);
  if (!m) return rgb;
  return (
    "#" +
    m
      .slice(0, 3)
      .map((n) => parseInt(n).toString(16).padStart(2, "0"))
      .join("")
  );
}

function getPlainText(html: string): string {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent ?? d.innerText ?? "";
}

// ─── Component ────────────────────────────────────────────────────────────────

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  variables = [],
  maxLength,
}: RichTextEditorProps) => {
  const {
    isDark,
    isRTL,
    bgPrimary,
    borderColor,
    textPrimary,
    textTertiary,
    hoverBg,
  } = useThemeClasses();

  const editorRef = useRef<HTMLDivElement>(null);
  const headingDropRef = useRef<HTMLDivElement>(null);
  const fontSizeDropRef = useRef<HTMLDivElement>(null);
  const textColorDropRef = useRef<HTMLDivElement>(null);
  const bgColorDropRef = useRef<HTMLDivElement>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isFocused, setIsFocused] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [bgColorOpen, setBgColorOpen] = useState(false);
  const [customFontSize, setCustomFontSize] = useState("");
  const [customTextColor, setCustomTextColor] = useState("");
  const [customBgColor, setCustomBgColor] = useState("");
  const [characterCount, setCharacterCount] = useState(0);

  // ── Active-state indicators (updated in selectionchange, never in render) ─
  const [activeHeading, setActiveHeading] = useState("p");
  const [activeFontSize, setActiveFontSize] = useState("16");
  const [activeTextColor, setActiveTextColor] = useState("#000000");
  const [activeBgColor, setActiveBgColor] = useState("transparent");
  // FIX: store queryCommandState results in state so we never call
  // document.queryCommandState() during render (lint: react-hooks/refs)
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>(
    {},
  );

  const activeBg = isDark ? "bg-gray-700" : "bg-gray-200";
  const dropdownBg = isDark ? "bg-gray-900" : "bg-white";

  // ── Sync external value into editor ──────────────────────────────────────
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      setCharacterCount(getPlainText(value).length);
    }
  }, [value]);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        headingDropRef.current &&
        !headingDropRef.current.contains(e.target as Node)
      )
        setHeadingOpen(false);
      if (
        fontSizeDropRef.current &&
        !fontSizeDropRef.current.contains(e.target as Node)
      )
        setFontSizeOpen(false);
      if (
        textColorDropRef.current &&
        !textColorDropRef.current.contains(e.target as Node)
      )
        setTextColorOpen(false);
      if (
        bgColorDropRef.current &&
        !bgColorDropRef.current.contains(e.target as Node)
      )
        setBgColorOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── selectionchange: update ALL active state in one listener ──────────────
  // This is the only place we read the DOM / queryCommandState.
  // We store results in useState so render only reads state, never the DOM.
  useEffect(() => {
    const onSelectionChange = () => {
      if (!editorRef.current) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
      if (!(node instanceof Element)) return;

      // Heading
      const hEl = node.closest("h1,h2,h3,h4,h5,h6");
      setActiveHeading(hEl ? hEl.tagName.toLowerCase() : "p");

      // Font size via computed style (always accurate, ignores keyword mapping)
      const cs = window.getComputedStyle(node);
      const fsPx = parseFloat(cs.fontSize);
      if (!isNaN(fsPx)) setActiveFontSize(Math.round(fsPx).toString());

      // Text color
      const tc = cs.color;
      setActiveTextColor(tc.startsWith("rgb") ? rgbToHex(tc) : tc);

      // Background color
      const bg = cs.backgroundColor;
      setActiveBgColor(
        !bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent"
          ? "transparent"
          : bg.startsWith("rgb")
            ? rgbToHex(bg)
            : bg,
      );

      // FIX: Read queryCommandState here (in an effect/listener) not in render.
      // Store results in a plain state object keyed by command name.
      const states: Record<string, boolean> = {};
      for (const cmd of TRACKED_COMMANDS) {
        try {
          states[cmd] = document.queryCommandState(cmd);
        } catch {
          states[cmd] = false;
        }
      }
      setActiveCommands(states);
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    const plain = getPlainText(el.innerHTML);
    if (maxLength && plain.length > maxLength) {
      el.innerHTML = value; // revert to last valid value
      return;
    }
    setCharacterCount(plain.length);
    onChange(el.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!maxLength) return;
    const len = getPlainText(editorRef.current?.innerHTML ?? "").length;
    if (
      len >= maxLength &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain");
    const current = getPlainText(editorRef.current?.innerHTML ?? "");
    if (maxLength) {
      const allowed = maxLength - current.length;
      if (allowed <= 0) return;
      document.execCommand("insertText", false, pasted.slice(0, allowed));
    } else {
      document.execCommand("insertText", false, pasted);
    }
    handleInput();
  };

  // execCommand wrapper — still fine for bold/italic/color/lists/align
  const execCmd = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
  };

  // ── Heading ───────────────────────────────────────────────────────────────
  const applyHeading = (tag: string) => {
    setHeadingOpen(false);
    if (!editorRef.current) return;
    applyHeadingDOM(tag, editorRef.current);
    setActiveHeading(tag === activeHeading ? "p" : tag);
    onChange(editorRef.current.innerHTML);
  };

  // ── Font size ─────────────────────────────────────────────────────────────
  const applyFontSize = (px: number) => {
    setFontSizeOpen(false);
    applyFontSizeDOM(px); // pure DOM — no execCommand
    setActiveFontSize(px.toString());
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const applyCustomFontSize = () => {
    const n = parseInt(customFontSize, 10);
    if (!isNaN(n) && n > 0 && n <= 999) {
      applyFontSize(n);
      setCustomFontSize("");
    }
  };

  // ── Colors ────────────────────────────────────────────────────────────────
  const applyTextColor = (color: string) => {
    execCmd("foreColor", color);
    setActiveTextColor(color);
    setTextColorOpen(false);
  };
  const applyCustomTextColor = () => {
    if (customTextColor) {
      applyTextColor(customTextColor);
      setCustomTextColor("");
    }
  };

  const applyBgColor = (color: string) => {
    execCmd("backColor", color === "transparent" ? "rgba(0,0,0,0)" : color);
    setActiveBgColor(color);
    setBgColorOpen(false);
  };
  const applyCustomBgColor = () => {
    if (customBgColor) {
      applyBgColor(customBgColor);
      setCustomBgColor("");
    }
  };

  // ── Link ──────────────────────────────────────────────────────────────────
  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCmd("createLink", url);
  };

  // ── Variable insertion ────────────────────────────────────────────────────
  const insertVariable = (val: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      r.deleteContents();
      const tn = document.createTextNode(val);
      r.insertNode(tn);
      r.setStartAfter(tn);
      r.setEndAfter(tn);
      sel.removeAllRanges();
      sel.addRange(r);
    } else {
      editorRef.current.innerHTML += val;
    }
    handleInput();
  };

  // ── Toolbar groups config ─────────────────────────────────────────────────
  const toolbarGroups: { group: string; buttons: TBtn[] }[] = [
    {
      group: "fmt",
      buttons: [
        { icon: Bold, command: "bold", title: "Bold (Ctrl+B)" },
        { icon: Italic, command: "italic", title: "Italic (Ctrl+I)" },
        { icon: Underline, command: "underline", title: "Underline (Ctrl+U)" },
        {
          icon: Strikethrough,
          command: "strikeThrough",
          title: "Strikethrough",
        },
      ],
    },
    {
      group: "lists",
      buttons: [
        { icon: List, command: "insertUnorderedList", title: "Bullet List" },
        {
          icon: ListOrdered,
          command: "insertOrderedList",
          title: "Numbered List",
        },
      ],
    },
    {
      group: "align",
      buttons: [
        { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
        { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
        { icon: AlignRight, command: "justifyRight", title: "Align Right" },
        { icon: AlignJustify, command: "justifyFull", title: "Justify" },
      ],
    },
    {
      group: "insert",
      buttons: [
        {
          icon: LinkIcon,
          command: "link",
          title: "Insert Link",
          onClick: insertLink,
        },
        {
          icon: Quote,
          command: "formatBlock",
          title: "Quote",
          value: "blockquote",
        },
        {
          icon: Code,
          command: "formatBlock",
          title: "Code Block",
          value: "pre",
        },
      ],
    },
  ];

  // ── Derived display values ────────────────────────────────────────────────
  const isOverLimit = !!maxLength && characterCount > maxLength;
  const isNearLimit =
    !!maxLength && characterCount >= maxLength * 0.9 && !isOverLimit;
  const counterColor = isOverLimit
    ? "text-red-500 font-bold"
    : isNearLimit
      ? "text-amber-500"
      : textTertiary;

  // ── Shared sub-components (defined inside render so they close over theme) ─

  const Divider = () => (
    <div
      className={`w-px h-6 mx-1 ${isDark ? "bg-gray-700" : "bg-gray-300"}`}
    />
  );

  const ColorSwatchGrid = ({
    onSelect,
    activeColor,
    customVal,
    onCustomChange,
    onCustomApply,
  }: {
    onSelect: (c: string) => void;
    activeColor: string;
    customVal: string;
    onCustomChange: (v: string) => void;
    onCustomApply: () => void;
  }) => (
    <>
      <div className="grid grid-cols-4 gap-1.5 p-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(c);
            }}
            style={{ backgroundColor: c }}
            className={[
              "w-7 h-7 rounded border transition-transform hover:scale-110",
              activeColor === c
                ? "border-teal-500 ring-2 ring-teal-400/50"
                : "border-gray-300 dark:border-gray-600",
            ].join(" ")}
          />
        ))}
      </div>
      <div className={`border-t ${borderColor} p-2`}>
        <div className="flex gap-1">
          <input
            type="text"
            value={customVal}
            placeholder="#RRGGBB"
            onChange={(e) => onCustomChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCustomApply();
              }
            }}
            className={`flex-1 w-0 px-2 py-1 text-xs border ${borderColor} rounded ${bgPrimary} ${textPrimary}`}
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onCustomApply();
            }}
            className={`px-2 py-1 text-xs ${hoverBg} ${textPrimary} rounded shrink-0`}
          >
            OK
          </button>
        </div>
      </div>
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`rounded-lg border ${borderColor} ${bgPrimary} ${className}`}
    >
      {/* ══ Toolbar ══════════════════════════════════════════════════════════ */}
      <div
        className={`flex flex-wrap items-center gap-1 p-2 border-b ${borderColor}`}
      >
        {/* Heading dropdown */}
        <div className="relative" ref={headingDropRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setHeadingOpen((o) => !o);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors ${hoverBg} ${textPrimary} min-w-[110px] justify-between`}
          >
            <div className="flex items-center gap-1.5">
              <Type className="w-4 h-4 shrink-0" />
              <span className="text-sm">
                {activeHeading === "p"
                  ? "Paragraph"
                  : activeHeading.toUpperCase()}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 shrink-0" />
          </button>
          {headingOpen && (
            <div
              className={`absolute top-full left-0 mt-1 ${dropdownBg} border ${borderColor} rounded-lg shadow-lg z-20 min-w-[130px]`}
            >
              {(["p", "h1", "h2", "h3", "h4", "h5", "h6"] as const).map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyHeading(tag);
                    }}
                    className={[
                      `w-full text-left px-3 py-2 text-sm`,
                      `first:rounded-t-lg last:rounded-b-lg`,
                      `${hoverBg} ${textPrimary}`,
                      activeHeading === tag ? activeBg : "",
                    ].join(" ")}
                  >
                    {tag === "p" ? "Paragraph" : tag.toUpperCase()}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Font size dropdown */}
        <div className="relative" ref={fontSizeDropRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setFontSizeOpen((o) => !o);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition-colors ${hoverBg} ${textPrimary} min-w-[72px] justify-between`}
          >
            <span className="text-sm">{activeFontSize}px</span>
            <ChevronDown className="w-3 h-3 shrink-0" />
          </button>
          {fontSizeOpen && (
            <div
              className={`absolute top-full left-0 mt-1 ${dropdownBg} border ${borderColor} rounded-lg shadow-lg z-20 min-w-[110px] max-h-60 overflow-y-auto`}
            >
              {DEFAULT_FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFontSize(size);
                  }}
                  className={[
                    `w-full text-left px-3 py-2 text-sm`,
                    `${hoverBg} ${textPrimary}`,
                    activeFontSize === size.toString() ? activeBg : "",
                  ].join(" ")}
                >
                  {size}px
                </button>
              ))}
              <div className={`border-t ${borderColor} p-2`}>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={customFontSize}
                    placeholder="Custom"
                    min={1}
                    max={999}
                    onChange={(e) => setCustomFontSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCustomFontSize();
                      }
                    }}
                    className={`flex-1 w-0 px-2 py-1 text-sm border ${borderColor} rounded ${bgPrimary} ${textPrimary}`}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyCustomFontSize();
                    }}
                    className={`px-2 py-1 text-sm ${hoverBg} ${textPrimary} rounded shrink-0`}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text color */}
        <div className="relative" ref={textColorDropRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setTextColorOpen((o) => !o);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors ${hoverBg} ${textPrimary}`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <div
              className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 shrink-0"
              style={{ backgroundColor: activeTextColor }}
            />
            <ChevronDown className="w-3 h-3 shrink-0" />
          </button>
          {textColorOpen && (
            <div
              className={`absolute top-full left-0 mt-1 ${dropdownBg} border ${borderColor} rounded-lg shadow-lg z-20 w-40`}
            >
              <ColorSwatchGrid
                onSelect={applyTextColor}
                activeColor={activeTextColor}
                customVal={customTextColor}
                onCustomChange={setCustomTextColor}
                onCustomApply={applyCustomTextColor}
              />
            </div>
          )}
        </div>

        {/* Background / highlight color */}
        <div className="relative" ref={bgColorDropRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setBgColorOpen((o) => !o);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors ${hoverBg} ${textPrimary}`}
          >
            <Highlighter className="w-4 h-4 shrink-0" />
            <div
              className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 shrink-0"
              style={
                activeBgColor !== "transparent"
                  ? { backgroundColor: activeBgColor }
                  : CHECKERBOARD
              }
            />
            <ChevronDown className="w-3 h-3 shrink-0" />
          </button>
          {bgColorOpen && (
            <div
              className={`absolute top-full left-0 mt-1 ${dropdownBg} border ${borderColor} rounded-lg shadow-lg z-20 w-40`}
            >
              {/* None / transparent */}
              <div className="p-2 pb-0">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyBgColor("transparent");
                  }}
                  className={[
                    `w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm`,
                    `${hoverBg} ${textPrimary}`,
                    activeBgColor === "transparent" ? activeBg : "",
                  ].join(" ")}
                >
                  <div
                    className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 shrink-0"
                    style={CHECKERBOARD}
                  />
                  None
                </button>
              </div>
              <ColorSwatchGrid
                onSelect={applyBgColor}
                activeColor={activeBgColor}
                customVal={customBgColor}
                onCustomChange={setCustomBgColor}
                onCustomApply={applyCustomBgColor}
              />
            </div>
          )}
        </div>

        <Divider />

        {/* Bold / italic / lists / align / insert button groups */}
        {toolbarGroups.map((grp, gi) => (
          <div key={grp.group} className="flex items-center">
            {grp.buttons.map((btn, bi) => {
              const Icon = btn.icon;
              // FIX: Read from activeCommands state (set in selectionchange listener),
              // NOT from document.queryCommandState() directly during render.
              // This eliminates the "cannot access ref during render" lint error.
              const isActive =
                btn.command !== "link" &&
                btn.command !== "formatBlock" &&
                !!activeCommands[btn.command];

              return (
                <button
                  key={bi}
                  type="button"
                  title={btn.title}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (btn.onClick) {
                      btn.onClick();
                    } else {
                      execCmd(btn.command, btn.value);
                    }
                  }}
                  // FIX: use ternary, not &&, to avoid "no-unused-expressions"
                  className={`p-2 rounded transition-colors ${isActive ? activeBg : hoverBg} ${textPrimary}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            {gi < toolbarGroups.length - 1 && <Divider />}
          </div>
        ))}
      </div>

      {/* ══ Variables ════════════════════════════════════════════════════════ */}
      {variables.length > 0 && (
        <div className={`p-3 border-b ${borderColor}`}>
          <div className="flex flex-wrap gap-2">
            {variables.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => insertVariable(v.value)}
                title={`Insert ${v.label}`}
                className={`px-3 py-1.5 text-sm rounded border ${borderColor} ${hoverBg} ${VARIABLE_COLORS[i % VARIABLE_COLORS.length]} transition-colors font-medium`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ Editor area ══════════════════════════════════════════════════════ */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          // rte-content class restores heading/list/blockquote styles that
          // Tailwind preflight resets. See rte-content.css.
          className={`min-h-[150px] max-h-[400px] overflow-y-auto p-3 outline-none rte-content ${textPrimary}`}
          style={{ wordBreak: "break-word" }}
        />
        {!value && !isFocused && (
          <div
            className={`absolute top-3 pointer-events-none ${isRTL ? "right-3" : "left-3"} ${textTertiary}`}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* ══ Character counter ════════════════════════════════════════════════ */}
      {maxLength !== undefined && (
        <div className={`flex justify-end px-3 py-2 border-t ${borderColor}`}>
          <span
            className={`text-xs tabular-nums transition-colors ${counterColor}`}
          >
            {characterCount} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
