import { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editingLanguage: "en" | "he" | "ar";
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textTertiary: string;
  borderColor: string;
  // Passed so the editor can re-sync when switching articles
  syncKey?: string | number;
}

const RichTextEditor = ({
  content,
  onChange,
  editingLanguage,
  bgPrimary,
  bgSecondary,
  textPrimary,
  textTertiary,
  borderColor,
  syncKey,
}: RichTextEditorProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Sync DOM when the article being edited changes (not on every keystroke)
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncKey]);

  const syncContent = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const insertElementAtCursor = (el: HTMLElement) => {
    const editor = contentRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(el);
      range.setStartAfter(el);
      range.setEndAfter(el);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editor.appendChild(el);
    }
    editor.focus();
    syncContent();
  };

  const insertFormatting = (before: string, after = "") => {
    const editor = contentRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const selected = range.toString();

    const frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(before));
    if (selected) frag.appendChild(document.createTextNode(selected));
    const afterNode = document.createTextNode(after);
    frag.appendChild(afterNode);

    range.deleteContents();
    range.insertNode(frag);
    range.setStartAfter(afterNode);
    range.setEndAfter(afterNode);
    sel.removeAllRanges();
    sel.addRange(range);
    editor.focus();
    syncContent();
  };

  const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const img = Object.assign(document.createElement("img"), { src: url });
      img.style.cssText =
        "max-width:100%;height:auto;display:block;margin:10px 0;border-radius:8px;";
      insertElementAtCursor(img);
      toast.success("Image inserted");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleVideoInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    const video = Object.assign(document.createElement("video"), {
      src: URL.createObjectURL(file),
      controls: true,
    });
    video.style.cssText =
      "max-width:100%;height:auto;display:block;margin:10px 0;border-radius:8px;";
    insertElementAtCursor(video);
    toast.success("Video inserted");
    e.target.value = "";
  };

  const toolbarGroups = [
    [
      {
        icon: <Bold className="w-4 h-4" />,
        action: () => insertFormatting("**", "**"),
        title: "Bold",
      },
      {
        icon: <Italic className="w-4 h-4" />,
        action: () => insertFormatting("*", "*"),
        title: "Italic",
      },
    ],
    [
      {
        icon: <Heading1 className="w-4 h-4" />,
        action: () => insertFormatting("# "),
        title: "H1",
      },
      {
        icon: <Heading2 className="w-4 h-4" />,
        action: () => insertFormatting("## "),
        title: "H2",
      },
      {
        icon: <Heading3 className="w-4 h-4" />,
        action: () => insertFormatting("### "),
        title: "H3",
      },
    ],
    [
      {
        icon: <List className="w-4 h-4" />,
        action: () => insertFormatting("- "),
        title: "Bullet list",
      },
      {
        icon: <ListOrdered className="w-4 h-4" />,
        action: () => insertFormatting("1. "),
        title: "Numbered list",
      },
    ],
    [
      {
        icon: <ImageIcon className="w-4 h-4" />,
        action: () => imageInputRef.current?.click(),
        title: "Insert image",
      },
      {
        icon: <Video className="w-4 h-4" />,
        action: () => videoInputRef.current?.click(),
        title: "Insert video",
      },
      {
        icon: <LinkIcon className="w-4 h-4" />,
        action: () => insertFormatting("[", "](url)"),
        title: "Insert link",
      },
    ],
  ];

  return (
    <div>
      <label className={`block text-sm font-medium ${textTertiary} mb-2`}>
        Content *
      </label>

      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center gap-1 p-2 ${bgSecondary} border ${borderColor} rounded-t-lg`}
      >
        {toolbarGroups.map((group, gi) => (
          <span key={gi} className="contents">
            {gi > 0 && (
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            )}
            {group.map(({ icon, action, title }) => (
              <button
                key={title}
                onClick={action}
                title={title}
                className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`}
              >
                {icon}
              </button>
            ))}
          </span>
        ))}
      </div>

      {/* Editable area */}
      <div
        ref={contentRef}
        contentEditable
        onInput={syncContent}
        className={`w-full min-h-[400px] ${bgSecondary} ${textPrimary} border-x border-b ${borderColor} rounded-b-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto prose prose-sm max-w-none`}
        style={{ direction: editingLanguage !== "en" ? "rtl" : "ltr" }}
        data-placeholder="Write your article content here..."
        suppressContentEditableWarning
      />

      <p className={`text-xs ${textTertiary} mt-1`}>
        {content.length} characters
      </p>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageInsert}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoInsert}
        className="hidden"
      />
    </div>
  );
};

export default RichTextEditor;
