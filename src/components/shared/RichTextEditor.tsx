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

// ─── Pure DOM helpers ────────────────────────────────────────────────────────

/**
 * Walks up to every block ancestor (up to but not including root) and sets its
 * line-height to 1.4× the tallest computed font-size found among all its
 * inline descendants. This ensures the block row height always reflects the
 * actual largest font inside it — including when shrinking from large → small.
 */
function updateBlockLineHeight(node: Node, root: HTMLElement): void {
  let cur: Node | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : node;

  while (cur && cur !== root) {
    if (cur instanceof HTMLElement && BLOCK_TAGS.has(cur.tagName)) {
      let maxPx = 0;

      // Only count descendants with an explicitly set inline font-size.
      // Using computed style here would pick up inherited/default 16px from
      // wrapper spans that have no font-size of their own, causing the
      // block's line-height to stay inflated after shrinking to a small font.
      cur.querySelectorAll<HTMLElement>("*").forEach((el) => {
        if (el.style.fontSize) {
          const fs = parseFloat(el.style.fontSize);
          if (!isNaN(fs) && fs > maxPx) maxPx = fs;
        }
      });

      // Also check an explicit font-size on the block element itself
      if (cur.style.fontSize) {
        const blockFs = parseFloat(cur.style.fontSize);
        if (!isNaN(blockFs) && blockFs > maxPx) maxPx = blockFs;
      }

      // Fall back to computed font-size only when nothing explicit was found
      // (e.g. a block containing unstyled plain text)
      if (maxPx === 0) {
        maxPx = parseFloat(window.getComputedStyle(cur).fontSize) || 16;
      }

      cur.style.lineHeight = `${(maxPx * 1.4).toFixed(1)}px`;
    }
    cur = cur.parentElement;
  }
}

/**
 * Applies a font size to the current selection and then updates the
 * line-height of every block ancestor so row height matches immediately.
 *
 * Key fix: line-height is NOT set on the inner <span> (where it has no
 * effect on block row height) but instead on the block element via
 * updateBlockLineHeight(), which the browser respects for row sizing.
 */
function applyFontSizeDOM(px: number, root?: HTMLElement): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);

  const createStyledSpan = () => {
    const span = document.createElement("span");
    span.style.fontSize = `${px}px`;
    // ❌ Do NOT set line-height here — a unitless ratio on an inline span
    //    does not affect block row height. We handle it at block level below.
    span.style.display = "inline";
    return span;
  };

  if (range.collapsed) {
    const span = createStyledSpan();
    span.appendChild(document.createTextNode("\u200B"));
    range.insertNode(span);

    range.setStart(span.firstChild!, 1);
    range.setEnd(span.firstChild!, 1);
    sel.removeAllRanges();
    sel.addRange(range);

    if (root) updateBlockLineHeight(span, root);
    return;
  }

  let insertedSpan: HTMLElement | null = null;

  try {
    // Simple case: selection is within a single element
    const span = createStyledSpan();
    range.surroundContents(span);
    insertedSpan = span;

    // Strip font-size from any nested spans so the old large font doesn't
    // persist inside the new span and inflate the block's line-height.
    span.querySelectorAll<HTMLElement>("span[style]").forEach((child) => {
      child.style.fontSize = "";
      child.style.lineHeight = "";
    });

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
  } catch {
    // Complex selection fallback (crosses element boundaries)
    const span = createStyledSpan();
    const fragment = range.extractContents();

    // Strip font-size / line-height from nested spans to avoid conflicts
    fragment.querySelectorAll("span[style]").forEach((child) => {
      if (child instanceof HTMLElement) {
        child.style.fontSize = "";
        child.style.lineHeight = "";
      }
    });

    span.appendChild(fragment);
    range.insertNode(span);
    insertedSpan = span;

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
  }

  // ✅ Update line-height on block ancestor so the row height matches the new font size
  if (root && insertedSpan) updateBlockLineHeight(insertedSpan, root);
}

/**
 * Finds nearest block ancestor
 */
// function getNearestBlock(node: Node, root: HTMLElement): Element | null {
//   let cur: Node | null =
//     node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
//   while (cur && cur !== root) {
//     if (cur instanceof Element && BLOCK_TAGS.has(cur.tagName)) return cur;
//     cur = cur.parentElement;
//   }
//   return null;
// }

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

// Allowed inline style properties to preserve when pasting rich content
const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "line-height",
]);

// Tags that are always removed (along with their children)
const DANGEROUS_TAGS = new Set([
  "SCRIPT",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "FORM",
  "INPUT",
  "BUTTON",
  "SELECT",
  "TEXTAREA",
  "STYLE",
  "LINK",
  "META",
  "BASE",
]);

/**
 * Sanitizes pasted HTML:
 * - Removes dangerous tags and their children
 * - Strips all event-handler attributes (on*)
 * - Strips href="javascript:..." links
 * - Keeps only allowed CSS properties in inline styles
 */
function sanitizePastedHTML(html: string): string {
  const root = document.createElement("div");
  root.innerHTML = html;

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;

        if (DANGEROUS_TAGS.has(el.tagName)) {
          node.removeChild(el);
          continue;
        }

        // Strip dangerous attributes
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          if (attr.name.startsWith("on")) {
            el.removeAttribute(attr.name);
          } else if (
            attr.name === "href" ||
            attr.name === "src" ||
            attr.name === "action"
          ) {
            const val = attr.value.trim().toLowerCase().replace(/\s/g, "");
            if (val.startsWith("javascript:") || val.startsWith("data:")) {
              el.removeAttribute(attr.name);
            }
          }
        }

        // Filter inline styles to only allowed properties
        if (el.style.cssText) {
          const kept: string[] = [];
          for (const prop of ALLOWED_STYLE_PROPS) {
            const val = el.style.getPropertyValue(prop);
            if (val) kept.push(`${prop}:${val}`);
          }
          el.style.cssText = kept.join(";");
        }

        walk(el);
      }
    }
  };

  walk(root);
  return root.innerHTML;
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const savedRangeRef = useRef<Range | null>(null);
  const fontSizeDropRef = useRef<HTMLDivElement>(null);
  const textColorDropRef = useRef<HTMLDivElement>(null);
  const bgColorDropRef = useRef<HTMLDivElement>(null);

  // UI State
  const [isFocused, setIsFocused] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [bgColorOpen, setBgColorOpen] = useState(false);
  const [customFontSize, setCustomFontSize] = useState("");
  const [customTextColor, setCustomTextColor] = useState("");
  const [customBgColor, setCustomBgColor] = useState("");
  const [characterCount, setCharacterCount] = useState(0);

  // Active states (updated only in selectionchange)
  const [activeFontSize, setActiveFontSize] = useState("16");
  const [activeTextColor, setActiveTextColor] = useState("#000000");
  const [activeBgColor, setActiveBgColor] = useState("transparent");
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>(
    {},
  );

  const activeBg = isDark ? "bg-gray-700" : "bg-gray-200";
  const dropdownBg = isDark ? "bg-gray-900" : "bg-white";

  // Sync external value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      setCharacterCount(getPlainText(value).length);
    }
  }, [value]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
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

  // Update active states on selection change
  useEffect(() => {
    const onSelectionChange = () => {
      if (!editorRef.current) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
      if (!(node instanceof Element)) return;

      // Font size from computed style
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

      // Command states
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

  // Handlers
  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;

    const plain = getPlainText(el.innerHTML);
    if (maxLength && plain.length > maxLength) {
      el.innerHTML = value;
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
    const htmlData = e.clipboardData.getData("text/html");
    const plainData = e.clipboardData.getData("text/plain");
    const current = getPlainText(editorRef.current?.innerHTML ?? "");

    if (htmlData) {
      // Rich paste: sanitize and insert HTML preserving styles
      const sanitized = sanitizePastedHTML(htmlData);
      if (maxLength) {
        // Rough check: count plain-text length of sanitized content
        const pastedPlain = getPlainText(sanitized);
        const allowed = maxLength - current.length;
        if (allowed <= 0) return;
        if (pastedPlain.length <= allowed) {
          document.execCommand("insertHTML", false, sanitized);
        } else {
          // Fall back to truncated plain text when over limit
          document.execCommand(
            "insertText",
            false,
            plainData.slice(0, allowed),
          );
        }
      } else {
        document.execCommand("insertHTML", false, sanitized);
      }
    } else {
      // Plain-text paste
      if (maxLength) {
        const allowed = maxLength - current.length;
        if (allowed <= 0) return;
        document.execCommand("insertText", false, plainData.slice(0, allowed));
      } else {
        document.execCommand("insertText", false, plainData);
      }
    }
    handleInput();
  };

  const execCmd = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  // Font Size — passes editorRef.current as root so updateBlockLineHeight works
  const applyFontSize = (px: number) => {
    setFontSizeOpen(false);
    restoreSelection();
    applyFontSizeDOM(px, editorRef.current ?? undefined);
    setActiveFontSize(px.toString());
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const applyCustomFontSize = () => {
    const rem = parseFloat(customFontSize.trim());
    if (!isNaN(rem) && rem >= 0.1 && rem <= 62) {
      applyFontSize(rem * 16);
      setCustomFontSize("");
    }
  };

  // Colors
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

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCmd("createLink", url);
  };

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

  // Toolbar config
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

  const isOverLimit = !!maxLength && characterCount > maxLength;
  const isNearLimit =
    !!maxLength && characterCount >= maxLength * 0.9 && !isOverLimit;
  const counterColor = isOverLimit
    ? "text-red-500 font-bold"
    : isNearLimit
      ? "text-amber-500"
      : textTertiary;

  // Sub components
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
            className={`w-7 h-7 rounded border transition-transform hover:scale-110 ${
              activeColor === c
                ? "border-teal-500 ring-2 ring-teal-400/50"
                : "border-gray-300 dark:border-gray-600"
            }`}
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
      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center gap-1 p-2 border-b ${borderColor}`}
      >
        {/* Font Size */}
        <div className="relative" ref={fontSizeDropRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              setFontSizeOpen((o) => !o);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition-colors ${hoverBg} ${textPrimary} min-w-[72px] justify-between`}
          >
            <span className="text-sm">{parseInt(activeFontSize) / 16}rem</span>
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
                  className={`w-full text-left px-3 py-2 text-sm ${hoverBg} ${textPrimary} ${
                    activeFontSize === size.toString() ? activeBg : ""
                  }`}
                >
                  {size / 16}rem
                </button>
              ))}

              <div className={`border-t ${borderColor} p-2`}>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={customFontSize}
                    placeholder="rem"
                    min={0.1}
                    max={62}
                    step={0.1}
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

        {/* Text Color */}
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

        {/* Background Color */}
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
              <div className="p-2 pb-0">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyBgColor("transparent");
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${hoverBg} ${textPrimary} ${
                    activeBgColor === "transparent" ? activeBg : ""
                  }`}
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

        {/* Toolbar Button Groups */}
        {toolbarGroups.map((grp, gi) => (
          <div key={grp.group} className="flex items-center">
            {grp.buttons.map((btn, bi) => {
              const Icon = btn.icon;
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
                    if (btn.onClick) btn.onClick();
                    else execCmd(btn.command, btn.value);
                  }}
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

      {/* Variables */}
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

      {/* Editor Area */}
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
          className={`min-h-37.5 max-h-100 overflow-y-auto p-3 outline-none rte-content ${textPrimary}`}
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

      {/* Character Counter */}
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
