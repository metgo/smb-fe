import { CKEditor } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";

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

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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
  toolbar: [
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
  heading: {
    options: [
      { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_paragraph",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_paragraph",
      },
    ],
  },
};

export default function CKEditorWrapper({
  value,
  onChange,
  placeholder = "Write your message here...",
}: CKEditorWrapperProps) {
  return (
    <div className="border rounded-lg">
      <CKEditor
        editor={CustomEditor}
        data={value}
        config={{
          placeholder,
          licenseKey: "GPL",
        }}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
