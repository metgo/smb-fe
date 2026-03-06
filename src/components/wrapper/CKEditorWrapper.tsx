import { CKEditor } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";
import { useEffect, useRef, useState } from "react";

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  BlockQuote,
  HorizontalLine,
  RemoveFormat,
  Code,
} from "ckeditor5";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  height?: number | string;
}

class CustomEditor extends ClassicEditor {}

CustomEditor.builtinPlugins = [
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  BlockQuote,
  HorizontalLine,
  RemoveFormat,
  Code,
];

CustomEditor.defaultConfig = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "code",
      "|",
      "link",
      "bulletedList",
      "numberedList",
      "|",
      "blockQuote",
      "horizontalLine",
      "|",
      "removeFormat",
      "|",
      "undo",
      "redo",
    ],
    shouldNotGroupWhenFull: true,
  },
  heading: {
    options: [
      {
        model: "paragraph",
        title: "Paragraph",
        class: "ck-heading_paragraph",
      },
      {
        model: "heading1",
        view: "h1",
        title: "Heading 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },
      {
        model: "heading4",
        view: "h4",
        title: "Heading 4",
        class: "ck-heading_heading4",
      },
      {
        model: "heading5",
        view: "h5",
        title: "Heading 5",
        class: "ck-heading_heading5",
      },
    ],
  },
  list: {
    properties: {
      styles: true,
      startIndex: true,
      reversed: false,
    },
  },
};

const applyEditorTheme = (editor: any, isDark: boolean) => {
  const root = editor.ui.view.element; // .ck-editor root
  if (!root) return;

  if (isDark) root.classList.add("ck-dark");
  else root.classList.remove("ck-dark");
};

export default function CKEditorWrapper({
  value = "<p></p>",
  onChange,
  placeholder,
  maxLength = 500,
  height = 200,
}: CKEditorWrapperProps) {
  const { t } = useTranslation("common");
  const { isDark, isRTL } = useThemeClasses();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);
  const [charCount, setCharCount] = useState(0);
  const [isAtLimit, setIsAtLimit] = useState(false);

  // Tracks the last HTML snapshot that was within the limit
  const lastValidHtml = useRef<string>(value);
  // Flag to prevent re-entrant setData calls triggering change:data again
  const isReverting = useRef(false);

  // Convert HTML → plain text length
  const getPlainText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
  };

  // ✅ INIT COUNT FROM INITIAL VALUE
  useEffect(() => {
    const plain = getPlainText(value || "");
    setCharCount(plain.length);
    setIsAtLimit(plain.length >= maxLength);
    lastValidHtml.current = value || "<p></p>";
  }, [value, maxLength]);

  // Apply/remove ck-dark class whenever isDark changes
  useEffect(() => {
    if (!wrapperRef.current) return;

    if (isDark) wrapperRef.current.classList.add("ck-dark");
    else wrapperRef.current.classList.remove("ck-dark");

    // apply to CK root too
    if (editorInstance.current) {
      applyEditorTheme(editorInstance.current, isDark);
    }
  }, [isDark]);

  // Apply RTL/LTR direction whenever isRTL changes
  useEffect(() => {
    if (!wrapperRef.current || !editorInstance.current) return;

    const editor = editorInstance.current;

    // Set the language direction in the config
    editor.config.set("language", {
      textDirection: isRTL ? "rtl" : "ltr",
    });

    // Apply direction to the editable area
    const editingView = editor.editing.view;
    const editingRoot = editingView.document.getRoot();

    if (editingRoot) {
      editingView.change((writer: any) => {
        writer.setAttribute("dir", isRTL ? "rtl" : "ltr", editingRoot);
      });
    }

    // Update wrapper class for RTL-specific styles
    if (isRTL) {
      wrapperRef.current.classList.add("ck-rtl");
      wrapperRef.current.classList.remove("ck-ltr");
    } else {
      wrapperRef.current.classList.add("ck-ltr");
      wrapperRef.current.classList.remove("ck-rtl");
    }
  }, [isRTL]);

  return (
    <div
      ref={wrapperRef}
      className={`ckeditor-wrapper border rounded-lg transition-colors duration-200 ${
        isAtLimit
          ? "border-red-500 border-2"
          : "border-gray-300 dark:border-gray-600"
      } ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <CKEditor
        editor={CustomEditor}
        data={value}
        config={{
          placeholder,
          licenseKey: "GPL",
        }}
        onReady={(editor) => {
          // Store editor instance
          editorInstance.current = editor;
          applyEditorTheme(editor, isDark);

          // Disable sticky toolbar
          const toolbarEl = editor.ui.view.toolbar.element;
          if (toolbarEl) {
            toolbarEl.style.position = "relative";
            toolbarEl.style.top = "auto";
            toolbarEl.style.zIndex = "30";
          }

          // Set initial direction
          const editingView = editor.editing.view;
          const editingRoot = editingView.document.getRoot();

          if (editingRoot) {
            editingView.change((writer) => {
              writer.setAttribute("dir", isRTL ? "rtl" : "ltr", editingRoot);
            });
          }

          editor.model.document.on("change:data", () => {
            // Skip if we triggered this setData ourselves during a revert
            if (isReverting.current) return;

            const data = editor.getData();
            const plain = getPlainText(data);

            if (plain.length > maxLength) {
              // Revert to last valid HTML — preserves all formatting/structure
              isReverting.current = true;
              editor.setData(lastValidHtml.current);
              applyEditorTheme(editor, isDark);

              isReverting.current = false;

              setCharCount(maxLength);
              setIsAtLimit(true);
            } else {
              // Valid — save snapshot
              lastValidHtml.current = data;
              setCharCount(plain.length);
              setIsAtLimit(plain.length >= maxLength);
              onChange(data);
            }
          });

          // Block keydown when at limit (allow only navigation/delete keys)
          editor.editing.view.document.on(
            "keydown",
            (evt, data) => {
              const plain = getPlainText(editor.getData());
              const allowedKeys = [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
                "Tab",
                "Control",
                "Alt",
                "Meta",
                "Shift",
                "Escape",
              ];
              if (
                plain.length >= maxLength &&
                !allowedKeys.includes(data.domEvent.key)
              ) {
                data.domEvent.preventDefault();
                evt.stop();
              }
            },
            { priority: "high" },
          );

          // Block paste when at/over limit
          editor.editing.view.document.on(
            "clipboardInput",
            (evt) => {
              const plain = getPlainText(editor.getData());
              if (plain.length >= maxLength) {
                evt.stop();
              }
            },
            { priority: "high" },
          );
        }}
      />

      {/* Counter - with RTL support */}
      <div
        className={`text-xs mt-1 pr-2 pb-1 font-medium transition-colors duration-200 ${
          isAtLimit ? "text-red-500" : "text-gray-500"
        } ${isRTL ? "text-left" : "text-right"}`}
      >
        {isAtLimit && (
          <span className={`${isRTL ? "ml-1" : "mr-1"}`}>
            {t("max_length_reached")}
          </span>
        )}
        {charCount} / {maxLength}
      </div>

      {/* Styles */}
      <style>{`
        .ckeditor-wrapper .ck-editor__editable {
          min-height: ${typeof height === "number" ? `${height}px` : height} !important;
          max-height: ${typeof height === "number" ? `${height}px` : height} !important;
          overflow-y: auto !important;
        }
          
        /* ===== Disable CK sticky ===== */
        .ckeditor-wrapper .ck-sticky-panel,
        .ckeditor-wrapper .ck-sticky-panel__content {
          position: relative !important;
          top: auto !important;
        }

        /* ===== RTL Support ===== */
        .ck-rtl .ck.ck-editor {
          direction: rtl;
        }
        
        .ck-rtl .ck.ck-toolbar {
          direction: rtl;
        }
        
        .ck-rtl .ck.ck-toolbar .ck-toolbar__items {
          flex-direction: row-reverse;
        }
        
        .ck-rtl .ck.ck-dropdown .ck-dropdown__arrow {
          margin-left: 0;
          margin-right: var(--ck-spacing-standard);
        }
        
        .ck-rtl .ck.ck-list {
          direction: rtl;
        }
        
        .ck-rtl .ck.ck-list__item {
          text-align: right;
        }
        
        .ck-rtl .ck.ck-button {
          justify-content: flex-end;
        }
        
        .ck-rtl .ck.ck-button .ck-button__label {
          margin-right: var(--ck-spacing-standard);
        }
        
        .ck-rtl .ck.ck-heading-dropdown .ck-list__item .ck-button {
          text-align: right;
        }
        
        .ck-rtl .ck-editor__editable {
          direction: rtl;
          text-align: right;
        }
        
        /* ===== LTR Support ===== */
        .ck-ltr .ck-editor__editable {
          direction: ltr;
          text-align: left;
        }

        /* ===== Heading styles inside editor (light) ===== */
        .ckeditor-wrapper .ck-editor__editable h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; }
        .ckeditor-wrapper .ck-editor__editable h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0; }
        .ckeditor-wrapper .ck-editor__editable h3 { font-size: 1.17em; font-weight: 700; margin: 0.83em 0; }
        .ckeditor-wrapper .ck-editor__editable h4 { font-size: 1em; font-weight: 700; margin: 1em 0; }
        .ckeditor-wrapper .ck-editor__editable h5 { font-size: 0.83em; font-weight: 700; margin: 1.5em 0; }

        /* ===== List styles inside editor ===== */
        .ckeditor-wrapper .ck-editor__editable ul {
          list-style-type: disc;
          padding-${isRTL ? "right" : "left"}: 2em;
          margin: 0.5em 0;
        }
        .ckeditor-wrapper .ck-editor__editable ol {
          list-style-type: decimal;
          padding-${isRTL ? "right" : "left"}: 2em;
          margin: 0.5em 0;
        }
        .ckeditor-wrapper .ck-editor__editable ul ul { list-style-type: circle; }
        .ckeditor-wrapper .ck-editor__editable ul ul ul { list-style-type: square; }

        /* ===== RTL list styles ===== */
        .ck-rtl .ck-editor__editable ul {
          padding-right: 2em;
          padding-left: 0;
        }
        .ck-rtl .ck-editor__editable ol {
          padding-right: 2em;
          padding-left: 0;
        }

        /* ===== Dark mode ===== */
        .ck-dark .ck {
          --ck-color-base-background: #1f2937;
          --ck-color-base-border: #4b5563;
          --ck-color-base-text: #f3f4f6;
          --ck-color-toolbar-background: #111827;
          --ck-color-toolbar-border: #4b5563;
          --ck-color-button-default-hover-background: #374151;
          --ck-color-button-on-background: #374151;
          --ck-color-panel-background: #1f2937;
        }

        .ck-dark .ck-editor__editable {
          background: #1f2937 !important;
          color: #f3f4f6 !important;
          border-color: #4b5563 !important;
        }

        .ck-dark .ck-editor__editable h1,
        .ck-dark .ck-editor__editable h2,
        .ck-dark .ck-editor__editable h3,
        .ck-dark .ck-editor__editable h4,
        .ck-dark .ck-editor__editable h5 {
          color: #f9fafb !important;
        }

        .ck-dark .ck-editor__editable ul,
        .ck-dark .ck-editor__editable ol {
          color: #f3f4f6 !important;
        }

        .ck-dark .ck-toolbar {
          background: #111827 !important;
          border-color: #4b5563 !important;
        }

        .ck-dark .ck-button {
          color: #f3f4f6 !important;
        }

        .ck-dark .ck-button:hover {
          background: #374151 !important;
        }

        .ck-dark .ck-dropdown__panel {
          background: #1f2937 !important;
          border-color: #4b5563 !important;
        }

        .ck-dark .ck-list__item .ck-button {
          color: #f3f4f6 !important;
        }

        .ck-dark .ck-list__item .ck-button:hover {
          background: #374151 !important;
        }

        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button.ck-heading_heading1 { font-size: 1.4em; font-weight: 700; }
        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button.ck-heading_heading2 { font-size: 1.2em; font-weight: 700; }
        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button.ck-heading_heading3 { font-size: 1.1em; font-weight: 700; }
        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button.ck-heading_heading4 { font-size: 1em; font-weight: 700; }
        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button.ck-heading_heading5 { font-size: 0.9em; font-weight: 700; }

        /* ===== Heading dropdown panel dark mode ===== */
        .ck-dark .ck-heading-dropdown .ck-dropdown__panel {
          background: #1f2937 !important;
          border-color: #4b5563 !important;
        }

        .ck-dark .ck-heading-dropdown .ck-list {
          background: #1f2937 !important;
        }

        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button {
          color: #f3f4f6 !important;
          background: transparent !important;
        }

        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button:hover,
        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button.ck-on {
          background: #374151 !important;
          color: #f9fafb !important;
        }

        /* ===== Paragraph & heading label styles in dropdown ===== */
        .ck-dark .ck-heading-dropdown .ck-list__item .ck-button.ck-heading_paragraph {
          font-size: 1em;
          font-weight: 400;
          color: #d1d5db !important;
        }

        /* ===== Red border override for dark mode ===== */
        .ck-dark.ckeditor-wrapper.border-red-500 .ck-editor__editable {
          border-color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
