import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface EmailHtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

const EDITOR_EXTENSIONS = [html(), EditorView.lineWrapping];

export function EmailHtmlEditor({
  value,
  onChange,
  height = "h-72",
}: EmailHtmlEditorProps) {
  const { isDark, borderColor } = useThemeClasses();

  return (
    <div
      className={`border ${borderColor} rounded-lg overflow-hidden shadow-sm ${height}`}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        height="100%"
        theme={isDark ? oneDark : "light"}
        extensions={EDITOR_EXTENSIONS}
        placeholder="<html>...</html>"
        basicSetup={{
          tabSize: 2,
          autocompletion: true,
          bracketMatching: true,
          closeBrackets: true,
          highlightActiveLine: true,
        }}
        className="h-full text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
      />
    </div>
  );
}

interface EmailHtmlPreviewProps {
  value: string;
  previewData: Record<string, string>;
  isRTL?: boolean;
  height?: string;
}

export function EmailHtmlPreview({
  value,
  previewData,
  isRTL = false,
  height = "h-72",
}: EmailHtmlPreviewProps) {
  const { isDark, borderColor, textTertiary } = useThemeClasses();

  const previewHTML = useMemo(
    () =>
      value?.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
        const trimmedKey = key.trim();
        return previewData[trimmedKey] ?? `{{ ${trimmedKey} }}`;
      }) ?? "",
    [value, previewData],
  );

  const themedPreviewHTML = useMemo(
    () =>
      isDark
        ? `<style>html{color-scheme:dark;background:#0a0a0a;color:#e5e7eb}</style>${previewHTML}`
        : previewHTML,
    [previewHTML, isDark],
  );

  return (
    <div
      className={`border ${borderColor} rounded-lg overflow-hidden shadow-sm ${
        isRTL ? "rtl text-right" : ""
      }`}
    >
      <div className={`text-sm font-medium px-4 pt-3 ${textTertiary}`}>
        Live Preview
      </div>
      <iframe
        title="email-html-preview"
        srcDoc={themedPreviewHTML}
        sandbox=""
        className={`w-full ${height} ${isDark ? "bg-gray-950" : "bg-white"}`}
      />
    </div>
  );
}

interface EmailHtmlEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  previewData: Record<string, string>;
  isRTL?: boolean;
}

export default function EmailHtmlEditorWrapper({
  value,
  onChange,
  previewData,
  isRTL = false,
}: EmailHtmlEditorWrapperProps) {
  return (
    <div className="space-y-2">
      <EmailHtmlEditor value={value} onChange={onChange} />
      <EmailHtmlPreview value={value} previewData={previewData} isRTL={isRTL} />
    </div>
  );
}
