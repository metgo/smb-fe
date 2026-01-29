import { CKEditor } from "@ckeditor/ckeditor5-react";
import DOMPurify from "dompurify";
import { Plugin } from "ckeditor5";
import { ButtonView } from "ckeditor5";
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
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const EMAIL_VARIABLES = [
  "Event Name",
  "Event Date",
  "Event Time",
  "Venue",
  "First Name",
  "Ticket QR",
] as const;

// Helper to convert variable name to button ID (e.g., "Event Name" → "var_Event_Name")
const getVariableButtonId = (variable: string) =>
  `var_${variable.replace(/\s+/g, "_")}`;

// ─────────────────────────────────────────────────────────────────────────────
// Custom Plugin: Insert Variables
// ─────────────────────────────────────────────────────────────────────────────

class VariablesPlugin extends Plugin {
  init() {
    const editor = this.editor;

    EMAIL_VARIABLES.forEach((variable) => {
      const buttonId = getVariableButtonId(variable);

      editor.ui.componentFactory.add(buttonId, (locale) => {
        const button = new ButtonView(locale);

        button.set({
          label: `{{ ${variable} }}`,
          withText: true,
          tooltip: true,
        });

        button.on("execute", () => {
          editor.model.change((writer) => {
            const text = writer.createText(`{{ ${variable} }}`);
            editor.model.insertContent(text);
          });
        });

        return button;
      });
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Email Editor Class
// ─────────────────────────────────────────────────────────────────────────────

class EmailEditor extends ClassicEditor {}

EmailEditor.builtinPlugins = [
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
  VariablesPlugin,
];

EmailEditor.defaultConfig = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
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
      "|",
      ...EMAIL_VARIABLES.map(getVariableButtonId),
    ],
    shouldNotGroupWhenFull: true,
  },

  heading: {
    options: [
      { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
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
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HTML Sanitization
// ─────────────────────────────────────────────────────────────────────────────

export function sanitizeEmailHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h2",
      "h3",
      "hr",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────────────────────

interface EmailEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  previewData: Record<string, string>;
  isRTL?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function EmailEditorWrapper({
  value,
  onChange,
  previewData,
  isRTL = false,
}: EmailEditorWrapperProps) {
  const sanitizedHTML = sanitizeEmailHTML(value);

  // Replace variables with preview values (fallback to original placeholder)
  const previewHTML = sanitizedHTML?.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const trimmedKey = key.trim();
    return previewData[trimmedKey] ?? `{{ ${trimmedKey} }}`;
  });

  return (
    <div className="space-y-2">
      {/* Editor Section */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <CKEditor
          editor={EmailEditor}
          data={value}
          config={{
            licenseKey: "GPL",
          }}
          onChange={(_, editor) => {
            const data = editor.getData();
            onChange(data);
          }}
        />
      </div>

      {/* Live Preview Section */}
      <div
        className={`border border-gray-300 rounded-lg px-4 py-4 bg-white min-h-60 shadow-sm ${
          isRTL ? "rtl text-right" : ""
        }`}
      >
        <div className="text-sm text-gray-500 font-medium mb-3">
          Live Preview
        </div>
        <div
          className="prose prose-sm sm:prose max-w-none"
          dangerouslySetInnerHTML={{ __html: previewHTML }}
        />
      </div>
    </div>
  );
}
