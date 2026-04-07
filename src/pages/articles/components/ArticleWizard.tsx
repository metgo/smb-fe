import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Trash2,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Upload,
  Calendar,
  User,
  Clock,
  Bold,
  Italic,
  List,
  ListOrdered,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import { ModalWrapper } from "@/components/wrapper";
import { WizardFooter } from "@/components/shared";

import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "@/store/api/blogMutationApi";
import { useAppSelector } from "@/hooks/hooks";

interface ArticleWizardProps {
  theme: Theme;
  onClose: () => void;
  existingArticle?: Article;
}

// Mirrors the API payload shape exactly
interface ArticleImage {
  image: string; // base64 or URL
  caption: string;
  alt: string;
  isPrimary: boolean;
  stationId?: string;
  subCoordinates?: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    name: string;
  };
}

interface ArticleFormData {
  externalApiId: string;
  title: string; // single-language string per API schema
  subTitle: string;
  shortDescription: string;
  content: string; // full HTML content
  slug: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  summary: string;
  metaTitle: string;
  metaDescription: string;
  images: ArticleImage[];
}

const DEFAULT_FORM: ArticleFormData = {
  externalApiId: "",
  title: "",
  subTitle: "",
  shortDescription: "",
  content: "",
  slug: "",
  tags: [],
  status: "DRAFT",
  summary: "",
  metaTitle: "",
  metaDescription: "",
  images: [],
};

// Helper: build form from existingArticle (maps your Article type → API shape)
function buildFormFromArticle(article: Article): ArticleFormData {
  const titleStr =
    typeof article.title === "string" ? article.title : article.title?.en || "";

  const shortDesc =
    typeof article.shortDescription === "string"
      ? article.shortDescription
      : article.shortDescription?.en || "";

  const content =
    typeof article.fullDescription === "string"
      ? article.fullDescription
      : article.fullDescription?.en || "";

  const images: ArticleImage[] = article.primaryMedia
    ? [
        {
          image: article.primaryMedia,
          caption: "",
          alt: titleStr,
          isPrimary: true,
        },
      ]
    : [];

  return {
    externalApiId: article.externalApiId || article.id || "",
    title: titleStr,
    subTitle: article.subTitle || "",
    shortDescription: shortDesc,
    content,
    slug: article.slug || "",
    tags: article.tags || [],
    status:
      (article.status?.toUpperCase() as ArticleFormData["status"]) || "DRAFT",
    summary: article.summary || shortDesc,
    metaTitle: article.metaTitle || titleStr,
    metaDescription: article.metaDescription || shortDesc,
    images,
  };
}

export const ArticleWizard = ({
  theme,
  onClose,
  existingArticle,
}: ArticleWizardProps) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  const { websiteId } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<"en" | "he" | "ar">(
    "en",
  );
  const [tagInput, setTagInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const contentVideoInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ─── Form State (matches API payload) ───────────────────────────────────────
  const [formData, setFormData] = useState<ArticleFormData>(DEFAULT_FORM);

  // ─── Populate from existingArticle via useEffect ─────────────────────────────
  useEffect(() => {
    if (existingArticle) {
      setFormData(buildFormFromArticle(existingArticle));
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [existingArticle]);

  // Sync contentEditable div when existingArticle content loads
  useEffect(() => {
    if (contentRef.current && formData.content !== undefined) {
      // Only sync if the DOM doesn't already match (avoids cursor-reset on typing)
      if (contentRef.current.innerHTML !== formData.content) {
        contentRef.current.innerHTML = formData.content;
      }
    }
  }, [existingArticle]); // Only on article change, not on every keystroke

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  const isEditMode = !!existingArticle;
  const isLoading = isCreating || isUpdating;

  // ─── Theme helpers ────────────────────────────────────────────────────────────
  const bgPrimary = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgSecondary = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  const websites = [
    "Visit Negev",
    "Visit Beersheba",
    "Visit Sderot",
    "Visit Ashkelon",
  ];

  // ─── Slug generation ──────────────────────────────────────────────────────────
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
      metaTitle: prev.metaTitle || value, // auto-fill metaTitle if empty
    }));
  };

  // ─── Rich-text helpers ────────────────────────────────────────────────────────
  const syncContent = () => {
    if (contentRef.current) {
      setFormData((prev) => ({
        ...prev,
        content: contentRef.current!.innerHTML,
      }));
    }
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
      const img = Object.assign(document.createElement("img"), {
        src: url,
      });
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

  // ─── Featured image management ────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const isFirst = formData.images.length === 0;
      const newImage: ArticleImage = {
        image: base64,
        caption: "",
        alt: formData.title,
        isPrimary: isFirst,
      };
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const setPrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index })),
    }));
  };

  const deleteImage = (index: number) => {
    setFormData((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      // If deleted image was primary, promote first remaining
      if (prev.images[index]?.isPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return { ...prev, images: next };
    });
  };

  // const updateImageMeta = (
  //   index: number,
  //   field: keyof Pick<ArticleImage, "caption" | "alt">,
  //   value: string,
  // ) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     images: prev.images.map((img, i) =>
  //       i === index ? { ...img, [field]: value } : img,
  //     ),
  //   }));
  // };

  // ─── Tags ─────────────────────────────────────────────────────────────────────
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validateArticle = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return false;
    }
    if (!formData.shortDescription.trim()) {
      toast.error("Please enter a short description");
      return false;
    }
    if (formData.images.length === 0) {
      toast.error("Please upload at least one image");
      return false;
    }
    return true;
  };

  // ─── Save / Publish ───────────────────────────────────────────────────────────
  const saveArticle = useCallback(
    async (isPublish: boolean = false) => {
      if (!validateArticle()) return;

      // Build exact API payload
      const payload: ArticleFormData = {
        ...formData,
        status: isPublish ? "PUBLISHED" : formData.status,
      };

      try {
        if (isEditMode && existingArticle?.id) {
          await updateBlog({
            body: payload,
            blogId: existingArticle.id,
          }).unwrap();
          toast.success(isPublish ? "Article published!" : "Article updated!");
        } else {
          await createBlog(payload).unwrap();
          toast.success(isPublish ? "Article published!" : "Draft saved!");
        }
        if (isPublish) onClose();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to save article");
      }
    },
    [formData, isEditMode, existingArticle, createBlog, updateBlog, onClose],
  );

  const handleSaveDraft = () => saveArticle(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    await saveArticle(true);
    setIsPublishing(false);
  };

  const handleNext = () =>
    currentStep === 2 ? handlePublish() : setCurrentStep((p) => p + 1);

  const handlePrevious = () => currentStep > 1 && setCurrentStep((p) => p - 1);

  const totalSteps = 1;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <ModalWrapper onClose={onClose} showSpinner={isLoading}>
      {/* Header */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${borderColor}`}
      >
        <div className="flex items-center gap-4">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            {existingArticle ? "Edit Article" : "Create Article"}
          </h2>

          <select
            value={formData.externalApiId || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                externalApiId: e.target.value,
              }))
            }
            className={`px-4 py-2 ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {websites.map((w) => (
              <option key={w} value={w.toLowerCase().replace(/\s+/g, "-")}>
                {w}
              </option>
            ))}
          </select>

          {/* Language selector (UI only — API accepts single lang strings) */}
          <div className="flex items-center gap-2">
            {(["en", "he", "ar"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setEditingLanguage(lang)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  editingLanguage === lang
                    ? "bg-blue-600 text-white"
                    : `${bgSecondary} ${textSecondary}`
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <span
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              formData.status === "PUBLISHED"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {formData.status.charAt(0) + formData.status.slice(1).toLowerCase()}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden flex">
          {/* ── Editor ────────────────────────────────────────────────────── */}
          <div
            className={`flex-1 overflow-y-auto p-6 ${showPreview ? "hidden lg:block" : ""}`}
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Title */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className={`w-full text-3xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  dir={editingLanguage !== "en" ? "rtl" : "ltr"}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.title.length} characters
                </p>
              </div>

              {/* Subtitle */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subTitle: e.target.value,
                    }))
                  }
                  placeholder="Enter subtitle..."
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  dir={editingLanguage !== "en" ? "rtl" : "ltr"}
                />
              </div>

              {/* Short Description */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Short Description *
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="Enter a brief description..."
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  rows={3}
                  dir={editingLanguage !== "en" ? "rtl" : "ltr"}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.shortDescription.length} characters
                </p>
              </div>

              {/* Summary */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Summary
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                  placeholder="Enter article summary..."
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  rows={2}
                  dir={editingLanguage !== "en" ? "rtl" : "ltr"}
                />
              </div>

              {/* Rich Text Content */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Content *
                </label>

                {/* Toolbar */}
                <div
                  className={`flex flex-wrap items-center gap-1 p-2 ${bgSecondary} border ${borderColor} rounded-t-lg`}
                >
                  {[
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
                  ].map(({ icon, action, title }) => (
                    <button
                      key={title}
                      onClick={action}
                      title={title}
                      className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`}
                    >
                      {icon}
                    </button>
                  ))}
                  <div
                    className={`w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1`}
                  />
                  {[
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
                  ].map(({ icon, action, title }) => (
                    <button
                      key={title}
                      onClick={action}
                      title={title}
                      className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`}
                    >
                      {icon}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                  <button
                    onClick={() => insertFormatting("- ")}
                    title="Bullet list"
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("1. ")}
                    title="Numbered list"
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`}
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                  <button
                    onClick={() => contentImageInputRef.current?.click()}
                    title="Insert image"
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => contentVideoInputRef.current?.click()}
                    title="Insert video"
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`}
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertFormatting("[", "](url)")}
                    title="Insert link"
                    className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                <div
                  ref={contentRef}
                  contentEditable
                  onInput={syncContent}
                  className={`w-full min-h-[400px] ${bgSecondary} ${textPrimary} border-x border-b ${borderColor} rounded-b-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto prose prose-sm max-w-none`}
                  style={{
                    direction: editingLanguage !== "en" ? "rtl" : "ltr",
                  }}
                  data-placeholder="Write your article content here..."
                  suppressContentEditableWarning
                />

                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.content.length} characters
                </p>

                <input
                  ref={contentImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageInsert}
                  className="hidden"
                />
                <input
                  ref={contentVideoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoInsert}
                  className="hidden"
                />
              </div>

              {/* ── Images (matches API `images[]`) ──────────────────────── */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Images (up to 5) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative group ${bgSecondary} rounded-lg border-2 ${img.isPrimary ? "border-blue-500" : borderColor} overflow-hidden`}
                    >
                      <img
                        src={img.image}
                        alt={img.alt}
                        className="w-full h-32 object-cover"
                      />

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        {!img.isPrimary && (
                          <button
                            onClick={() => setPrimaryImage(idx)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs w-full text-center"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => deleteImage(idx)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {img.isPrimary && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}

                  {formData.images.length < 5 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-32 ${bgSecondary} border-2 border-dashed ${borderColor} rounded-lg flex flex-col items-center justify-center gap-2 ${textTertiary}`}
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Upload</span>
                    </button>
                  )}
                </div>

                {/* Caption / Alt per image */}
                {formData.images.length > 0 && (
                  <div className="space-y-3">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-2 gap-2 p-3 ${bgSecondary} rounded-lg border ${borderColor}`}
                      >
                        <div>
                          <label
                            className={`block text-xs ${textTertiary} mb-1`}
                          >
                            Caption {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={img.caption}
                            // onChange={(e) =>
                            //   updateImageMeta(idx, "caption", e.target.value)
                            // }
                            placeholder="Image caption..."
                            className={`w-full px-2 py-1 ${bgPrimary} ${textPrimary} border ${borderColor} rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs ${textTertiary} mb-1`}
                          >
                            Alt text {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={img.alt}
                            // onChange={(e) =>
                            //   updateImageMeta(idx, "alt", e.target.value)
                            // }
                            placeholder="Alt text..."
                            className={`w-full px-2 py-1 ${bgPrimary} ${textPrimary} border ${borderColor} rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* ── Settings Sidebar ────────────────────────────────────────────── */}
          <div
            className={`w-full lg:w-96 border-l ${borderColor} ${bgSecondary} overflow-y-auto p-6 ${showPreview ? "" : "hidden lg:block"}`}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>
                  Settings
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`p-2 rounded-lg ${textTertiary} lg:hidden`}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* Status */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>
                  Publishing
                </h4>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as ArticleFormData["status"],
                    }))
                  }
                  className={`w-full px-4 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>
                  Tags
                </h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add tag..."
                    className={`flex-1 px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-3 py-1 ${bgPrimary} ${textSecondary} border ${borderColor} rounded-full text-sm`}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>
                  SEO & Metadata
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaTitle: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }))
                      }
                      rows={2}
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Attribution */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>
                  Attribution
                </h4>
                <div className="space-y-2">
                  {existingArticle && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${textTertiary}`} />
                        <span className={`text-sm ${textTertiary}`}>
                          Created{" "}
                          {new Date(
                            existingArticle.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${textTertiary}`} />
                        <span className={`text-sm ${textTertiary}`}>
                          Updated{" "}
                          {new Date(
                            existingArticle.updatedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={isLoading}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onDone={onClose}
        onPublish={handlePublish}
        isPublishButton={true}
      />
    </ModalWrapper>
  );
};
