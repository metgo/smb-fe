import { useState, useRef, useCallback } from "react";
import {
  X,
  Check,
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
  ExternalLink,
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

interface ArticleWizardProps {
  theme: Theme;
  onClose: () => void;
  existingArticle?: Article;
}

interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  isPrimary: boolean;
}

export default function ArticleWizard({
  theme,
  onClose,
  existingArticle,
}: ArticleWizardProps) {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const contentVideoInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLDivElement>(null);

  const [editingLanguage, setEditingLanguage] = useState<"en" | "he" | "ar">("en");

  // Form State
  const [formData, setFormData] = useState({
    websiteId: existingArticle?.websiteId || "visit-negev",
    websiteName: existingArticle?.websiteName || "Visit Negev",
    title: existingArticle?.title || { en: "", he: "", ar: "" },
    shortDescription: existingArticle?.shortDescription || { en: "", he: "", ar: "" },
    fullDescription: existingArticle?.fullDescription || { en: "", he: "", ar: "" },
    slug: existingArticle?.slug || "",
    status:
      existingArticle?.status || ("draft" as "draft" | "published" | "scheduled" | "archived"),
    tags: existingArticle?.tags || [],
    primaryMedia: existingArticle?.primaryMedia || "",
    author: existingArticle?.author || "Current User",
    publishedAt: existingArticle?.publishedAt,
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(
    existingArticle && existingArticle.primaryMedia
      ? [
          {
            id: "1",
            url: existingArticle.primaryMedia,
            type: "image",
            isPrimary: true,
          },
        ]
      : []
  );

  const [seoData, setSeoData] = useState({
    metaTitle: existingArticle?.title?.en || "",
    metaDescription: existingArticle?.shortDescription?.en || "",
    ogImage: existingArticle?.primaryMedia || "",
  });

  const [tagInput, setTagInput] = useState("");

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  const isEditMode = !!existingArticle;
  const isLoading = isCreating || isUpdating;

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

  // Auto-generate slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: { ...prev.title, [editingLanguage]: value },
      slug: editingLanguage === "en" ? generateSlug(value) : prev.slug,
    }));
  };

  // Rich Text Formatting
  const insertFormatting = (before: string, after: string = "") => {
    const editor = contentTextareaRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const beforeNode = document.createTextNode(before);
    const afterNode = document.createTextNode(after);

    if (selectedText) {
      const textNode = document.createTextNode(selectedText);
      const fragment = document.createDocumentFragment();
      fragment.appendChild(beforeNode);
      fragment.appendChild(textNode);
      fragment.appendChild(afterNode);

      range.deleteContents();
      range.insertNode(fragment);
      range.setStartAfter(afterNode);
      range.setEndAfter(afterNode);
    } else {
      const fragment = document.createDocumentFragment();
      fragment.appendChild(beforeNode);
      fragment.appendChild(afterNode);
      range.insertNode(fragment);
      range.setStartAfter(beforeNode);
      range.setEndAfter(beforeNode);
    }

    selection.removeAllRanges();
    selection.addRange(range);
    editor.focus();

    setFormData((prev) => ({
      ...prev,
      fullDescription: {
        ...prev.fullDescription,
        [editingLanguage]: editor.innerHTML,
      },
    }));
  };

  const insertText = (text: string) => {
    const editor = contentTextareaRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(text);
      range.deleteContents();
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editor.appendChild(document.createTextNode(text));
    }
    editor.focus();

    setFormData((prev) => ({
      ...prev,
      fullDescription: {
        ...prev.fullDescription,
        [editingLanguage]: editor.innerHTML,
      },
    }));
  };

  const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const editor = contentTextareaRef.current;
      if (!editor) return;

      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      img.style.margin = "10px 0";
      img.style.borderRadius = "8px";
      img.setAttribute("data-image", "true");

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editor.appendChild(img);
      }

      setFormData((prev) => ({
        ...prev,
        fullDescription: {
          ...prev.fullDescription,
          [editingLanguage]: editor.innerHTML,
        },
      }));

      toast.success("Image inserted into content");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleVideoInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;

    const url = URL.createObjectURL(file);
    const editor = contentTextareaRef.current;
    if (!editor) return;

    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.style.maxWidth = "100%";
    video.style.height = "auto";
    video.style.display = "block";
    video.style.margin = "10px 0";
    video.style.borderRadius = "8px";
    video.setAttribute("data-video", "true");

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(video);
      range.setStartAfter(video);
      range.setEndAfter(video);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editor.appendChild(video);
    }

    setFormData((prev) => ({
      ...prev,
      fullDescription: {
        ...prev.fullDescription,
        [editingLanguage]: editor.innerHTML,
      },
    }));

    toast.success("Video inserted into content");
    e.target.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newMedia: MediaFile = {
        id: Date.now().toString(),
        url,
        type: file.type.startsWith("video/") ? "video" : "image",
        isPrimary: mediaFiles.length === 0,
      };
      setMediaFiles((prev) => [...prev, newMedia]);

      if (mediaFiles.length === 0) {
        setFormData((prev) => ({ ...prev, primaryMedia: url }));
      }
    };
    reader.readAsDataURL(file);
  };

  const setPrimaryMedia = (id: string) => {
    const media = mediaFiles.find((m) => m.id === id);
    if (media) {
      setMediaFiles((prev) =>
        prev.map((m) => ({ ...m, isPrimary: m.id === id }))
      );
      setFormData((prev) => ({ ...prev, primaryMedia: media.url }));
    }
  };

  const deleteMedia = (id: string) => {
    const newMediaFiles = mediaFiles.filter((m) => m.id !== id);
    setMediaFiles(newMediaFiles);

    if (mediaFiles.find((m) => m.id === id)?.isPrimary && newMediaFiles.length > 0) {
      newMediaFiles[0].isPrimary = true;
      setFormData((prev) => ({ ...prev, primaryMedia: newMediaFiles[0].url }));
    } else if (newMediaFiles.length === 0) {
      setFormData((prev) => ({ ...prev, primaryMedia: "" }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const validateArticle = () => {
    const hasTitle = Object.values(formData.title).some((v) => v?.trim());
    const hasDescription = Object.values(formData.shortDescription).some((v) => v?.trim());

    if (!hasTitle) {
      toast.error("Please enter a title in at least one language");
      return false;
    }
    if (!hasDescription) {
      toast.error("Please enter a short description in at least one language");
      return false;
    }
    if (!formData.primaryMedia) {
      toast.error("Please upload at least one image and set it as primary");
      return false;
    }
    return true;
  };

  const saveArticle = useCallback(
    async (isPublish: boolean = false) => {
      if (!validateArticle()) return;

      const payload = {
        websiteId: formData.websiteId,
        websiteName: formData.websiteName,
        title: formData.title,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        slug: formData.slug,
        status: isPublish ? "published" : formData.status,
        tags: formData.tags,
        primaryMedia: formData.primaryMedia,
        author: formData.author,
        publishedAt: isPublish ? new Date().toISOString() : formData.publishedAt,
      };

      try {
        if (isEditMode && existingArticle?.id) {
          await updateBlog({ body: payload, blogId: existingArticle.id }).unwrap();
          toast.success(isPublish ? "Article published successfully!" : "Article updated successfully!");
        } else {
          await createBlog(payload).unwrap();
          toast.success(isPublish ? "Article published successfully!" : "Draft saved successfully!");
        }

        if (isPublish) onClose();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to save article");
      }
    },
    [formData, isEditMode, existingArticle, createBlog, updateBlog, onClose]
  );

  const handleSaveDraft = () => saveArticle(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    await saveArticle(true);
    setIsPublishing(false);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      handlePublish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const totalSteps = 2;

  return (
    <ModalWrapper onClose={onClose} showSpinner={isLoading}>
      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between border-b ${borderColor}`}>
        <div className="flex items-center gap-4">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            {existingArticle ? "Edit Article" : "Create Article"}
          </h2>

          <select
            value={formData.websiteName}
            onChange={(e) =>
              setFormData({
                ...formData,
                websiteName: e.target.value,
                websiteId: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })
            }
            className={`px-4 py-2 ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {websites.map((website) => (
              <option key={website} value={website}>
                {website}
              </option>
            ))}
          </select>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            {(["en", "he", "ar"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setEditingLanguage(lang)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  editingLanguage === lang
                    ? "bg-blue-600 text-white"
                    : `${bgSecondary} ${textSecondary} hover:${bgSecondary}`
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <span
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              formData.status === "published"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
          </span>
        </div>

        <button
          onClick={onClose}
          className={`p-2 rounded-lg hover:${bgSecondary} transition-colors ${textTertiary}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden flex">
          {/* Editor Area */}
          <div
            className={`flex-1 overflow-y-auto p-6 ${showPreview ? "hidden lg:block" : ""}`}
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title[editingLanguage]}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className={`w-full text-3xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  dir={editingLanguage === "he" || editingLanguage === "ar" ? "rtl" : "ltr"}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.title[editingLanguage].length} characters
                </p>
              </div>

              {/* Short Description */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Short Description *
                </label>
                <textarea
                  value={formData.shortDescription[editingLanguage]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: {
                        ...formData.shortDescription,
                        [editingLanguage]: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter a brief description..."
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  rows={3}
                  dir={editingLanguage === "he" || editingLanguage === "ar" ? "rtl" : "ltr"}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.shortDescription[editingLanguage].length} characters
                </p>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Full Description *
                </label>

                {/* Toolbar */}
                <div className={`flex flex-wrap items-center gap-1 p-2 ${bgSecondary} border ${borderColor} rounded-t-lg`}>
                  <button onClick={() => insertFormatting("**", "**")} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Bold">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button onClick={() => insertFormatting("*", "*")} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Italic">
                    <Italic className="w-4 h-4" />
                  </button>
                  <div className={`w-px h-6 ${borderColor} bg-gray-300 dark:bg-gray-600 mx-1`} />
                  <button onClick={() => insertFormatting("# ", "")} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Heading 1">
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button onClick={() => insertFormatting("## ", "")} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Heading 2">
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => insertFormatting("### ", "")} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Heading 3">
                    <Heading3 className="w-4 h-4" />
                  </button>
                  <div className={`w-px h-6 ${borderColor} bg-gray-300 dark:bg-gray-600 mx-1`} />
                  <button onClick={() => insertFormatting("- ", "")} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Bullet List">
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => insertFormatting("1. ", "")} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Numbered List">
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <div className={`w-px h-6 ${borderColor} bg-gray-300 dark:bg-gray-600 mx-1`} />
                  <button onClick={() => contentImageInputRef.current?.click()} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Insert Image">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => contentVideoInputRef.current?.click()} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Insert Video">
                    <Video className="w-4 h-4" />
                  </button>
                  <button onClick={() => insertFormatting("[", "](url)")} className={`p-2 rounded hover:${bgPrimary} ${textTertiary} hover:${textPrimary}`} title="Insert Link">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Editor */}
                <div
                  ref={contentTextareaRef}
                  contentEditable
                  onInput={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      fullDescription: {
                        ...prev.fullDescription,
                        [editingLanguage]: e.currentTarget.innerHTML,
                      },
                    }));
                  }}
                  onPaste={(e) => {
                    // Paste handling for images/videos (your original logic)
                    const items = e.clipboardData?.items;
                    if (!items) return;
                    // ... (you can keep your full paste logic here if needed)
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formData.fullDescription[editingLanguage] || "",
                  }}
                  className={`w-full min-h-[400px] ${bgSecondary} ${textPrimary} border-x border-b ${borderColor} rounded-b-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto prose prose-sm max-w-none`}
                  style={{
                    direction: editingLanguage === "he" || editingLanguage === "ar" ? "rtl" : "ltr",
                  }}
                  data-placeholder="Write your article content here..."
                />

                <p className={`text-xs ${textTertiary} mt-1`}>
                  {(formData.fullDescription[editingLanguage]?.length || 0)} characters
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

              {/* Featured Media */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Featured Media (Up to 5 files) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {mediaFiles.map((media) => (
                    <div
                      key={media.id}
                      className={`relative group ${bgSecondary} rounded-lg border-2 ${
                        media.isPrimary ? "border-blue-500" : borderColor
                      } overflow-hidden`}
                    >
                      {media.type === "image" ? (
                        <img src={media.url} alt="Media" className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center">
                          <Video className={`w-8 h-8 ${textTertiary}`} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!media.isPrimary && (
                          <button
                            onClick={() => setPrimaryMedia(media.id)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => deleteMedia(media.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {media.isPrimary && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}

                  {mediaFiles.length < 5 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-32 ${bgSecondary} border-2 border-dashed ${borderColor} rounded-lg flex flex-col items-center justify-center gap-2 hover:${bgSecondary} ${textTertiary}`}
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Upload</span>
                    </button>
                  )}
                </div>

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

          {/* Settings Sidebar */}
          <div
            className={`w-full lg:w-96 border-l ${borderColor} ${bgSecondary} overflow-y-auto p-6 ${showPreview ? "" : "hidden lg:block"}`}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Settings</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`p-2 rounded-lg hover:${bgSecondary} ${textTertiary} lg:hidden`}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* Publishing, Tags, SEO, Attribution sections - keep your original code here */}
              {/* Publishing */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>Publishing</h4>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className={`w-full px-4 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>Tags</h4>
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
                      <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO & Metadata */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>SEO & Metadata</h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>Meta Title</label>
                    <input
                      type="text"
                      value={seoData.metaTitle}
                      onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>Meta Description</label>
                    <textarea
                      value={seoData.metaDescription}
                      onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Attribution */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>Attribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${textTertiary}`} />
                    <span className={`text-sm ${textSecondary}`}>{formData.author}</span>
                  </div>
                  {existingArticle && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${textTertiary}`} />
                        <span className={`text-sm ${textTertiary}`}>
                          Created {new Date(existingArticle.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${textTertiary}`} />
                        <span className={`text-sm ${textTertiary}`}>
                          Updated {new Date(existingArticle.updatedAt).toLocaleDateString()}
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
        isPublishButton={currentStep === 2}
      />
    </ModalWrapper>
  );
}