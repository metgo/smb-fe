import { useState, useRef } from "react";
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Eye,
  Upload,
  Link as LinkIcon,
  Globe,
  Video,
  Monitor,
  Smartphone,
  Layers,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface CreatePromotionWizardProps {
  onClose: () => void;
  onSave: (
    promotion: Omit<
      IPromotion,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "views" | "clicks"
    >,
  ) => void;
  existingPromotion?: IPromotion;
  websiteId: string;
  websiteName: string;
  availablePlacements: string[];
}

const STEPS = [
  {
    key: "placement",
    label: "Placement",
    sublabel: "Where & status",
    icon: Layers,
  },
  {
    key: "media",
    label: "Media",
    sublabel: "Images & videos",
    icon: ImageIcon,
  },
  {
    key: "content",
    label: "Content",
    sublabel: "Text & links",
    icon: FileText,
  },
  { key: "review", label: "Review", sublabel: "Confirm & save", icon: Eye },
];

const LANG_META = {
  en: { label: "English", native: "EN", dir: "ltr" as const, flag: "🇺🇸" },
  he: { label: "Hebrew", native: "עב", dir: "rtl" as const, flag: "🇮🇱" },
  ar: { label: "Arabic", native: "عر", dir: "rtl" as const, flag: "🇸🇦" },
};

type Lang = "en" | "he" | "ar";
type MediaSource = "upload" | "url";

export default function CreatePromotionWizard({
  onClose,
  onSave,
  existingPromotion,
  websiteId,
  websiteName,
  availablePlacements,
}: CreatePromotionWizardProps) {
  const { t } = useTranslation("promotion");
  const {
    isRTL,
    bgPrimary,
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(0);
  const [editingLang, setEditingLang] = useState<Lang>("en");
  const [desktopSource, setDesktopSource] = useState<MediaSource>("upload");
  const [mobileSource, setMobileSource] = useState<MediaSource>("upload");
  const [desktopDragOver, setDesktopDragOver] = useState(false);
  const [mobileDragOver, setMobileDragOver] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    placement: existingPromotion?.placement || availablePlacements[0] || "",
    active: existingPromotion?.active ?? true,
    mediaType: (existingPromotion?.mediaType || "image") as "image" | "video",
    desktopMedia: existingPromotion?.desktopMedia || { url: "" },
    mobileMedia: existingPromotion?.mobileMedia || { url: "" },
    title: existingPromotion?.title || { en: "", he: "", ar: "" },
    content: existingPromotion?.content || { en: "", he: "", ar: "" },
    linkUrl: existingPromotion?.linkUrl || "",
    order: existingPromotion?.order || 999,
  });

  // ── helpers ─────────────────────────────────────────────────────────────
  const patch = (fields: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...fields }));

  const readFile = (file: File): Promise<string> =>
    new Promise((res) => {
      const r = new FileReader();
      r.onloadend = () => res(r.result as string);
      r.readAsDataURL(file);
    });

  const handleDrop = async (e: React.DragEvent, side: "desktop" | "mobile") => {
    e.preventDefault();
    side === "desktop" ? setDesktopDragOver(false) : setMobileDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const url = await readFile(file);
    side === "desktop"
      ? patch({ desktopMedia: { url } })
      : patch({ mobileMedia: { url } });
  };

  const handleFileInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "desktop" | "mobile",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFile(file);
    side === "desktop"
      ? patch({ desktopMedia: { url } })
      : patch({ mobileMedia: { url } });
  };

  const isStepValid = (idx = currentStep) => {
    switch (STEPS[idx].key) {
      case "placement":
        return formData.placement.length > 0;
      case "media":
        return !!(formData.desktopMedia.url && formData.mobileMedia.url);
      case "content":
        return formData.title.en.length > 0 && formData.content.en.length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const langComplete = (lang: Lang) =>
    formData.title[lang].length > 0 && formData.content[lang].length > 0;

  // ── step indicator ───────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center px-6 py-5">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = idx < currentStep;
        const active = idx === currentStep;
        const future = idx > currentStep;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            {/* Node */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
                    : active
                      ? "bg-white dark:bg-gray-900 border-blue-600 text-blue-600 shadow-md shadow-blue-100 dark:shadow-blue-900/40"
                      : `border-gray-200 dark:border-gray-700 ${textTertiary} bg-transparent`
                }`}
              >
                {done ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="mt-1.5 text-center">
                <p
                  className={`text-xs font-semibold leading-tight ${active ? "text-blue-600" : done ? textPrimary : textTertiary}`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-[10px] leading-tight hidden sm:block ${future ? textTertiary : textSecondary}`}
                >
                  {step.sublabel}
                </p>
              </div>
            </div>
            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5 relative h-0.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-500"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── STEP 1: placement ────────────────────────────────────────────────────
  const PlacementStep = () => (
    <div className="space-y-6">
      {/* Placement cards */}
      <div>
        <label className={`block text-sm font-semibold ${textPrimary} mb-3`}>
          Placement <span className="text-red-500">*</span>
        </label>
        {availablePlacements.length <= 6 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availablePlacements.map((p) => (
              <button
                key={p}
                onClick={() => patch({ placement: p })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                  formData.placement === p
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm"
                    : `border-gray-200 dark:border-gray-700 ${textSecondary} hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800`
                }`}
              >
                <Layers
                  className={`w-4 h-4 shrink-0 ${formData.placement === p ? "text-blue-600" : textTertiary}`}
                />
                <span className="truncate">{p}</span>
                {formData.placement === p && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto shrink-0" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <select
            value={formData.placement}
            onChange={(e) => patch({ placement: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          >
            {availablePlacements.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}
        <p className={`text-xs ${textTertiary} mt-2`}>
          Select where this promotion appears on the website.
        </p>
      </div>

      {/* Active toggle */}
      <div
        className={`flex items-center justify-between p-4 rounded-xl border ${borderColor} ${bgSecondary}`}
      >
        <div>
          <p className={`text-sm font-semibold ${textPrimary}`}>
            Publish immediately
          </p>
          <p className={`text-xs ${textTertiary} mt-0.5`}>
            {formData.active
              ? "Promotion will be visible on the website right away."
              : "Saved as draft — activate it later from the dashboard."}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={formData.active}
          onClick={() => patch({ active: !formData.active })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            formData.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
              formData.active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Info callout */}
      <div
        className={`flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900`}
      >
        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
          Multiple promotions in the same placement rotate automatically based
          on your global rotation settings.
        </p>
      </div>
    </div>
  );

  // ── STEP 2: media ────────────────────────────────────────────────────────
  const UploadZone = ({
    side,
    label,
    hint,
    icon: Icon,
    mediaUrl,
    source,
    setSource,
    dragOver,
    onDragOver,
    onDragLeave,
    onDrop,
    inputRef,
    onClear,
    urlValue,
    onUrlChange,
  }: {
    side: "desktop" | "mobile";
    label: string;
    hint: string;
    icon: React.ElementType;
    mediaUrl: string;
    source: MediaSource;
    setSource: (s: MediaSource) => void;
    dragOver: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onClear: () => void;
    urlValue: string;
    onUrlChange: (v: string) => void;
  }) => (
    <div>
      <div className={`flex items-center gap-2 mb-2`}>
        <Icon className={`w-4 h-4 ${textSecondary}`} />
        <span className={`text-sm font-semibold ${textPrimary}`}>{label}</span>
        <span className="text-red-500 text-sm">*</span>
      </div>

      {/* Source tabs */}
      <div
        className={`flex rounded-lg border ${borderColor} ${bgSecondary} p-0.5 gap-0.5 mb-3 w-fit`}
      >
        {(["upload", "url"] as MediaSource[]).map((src) => (
          <button
            key={src}
            onClick={() => setSource(src)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              source === src
                ? `bg-white dark:bg-gray-700 ${textPrimary} shadow-sm`
                : `${textTertiary} hover:${textSecondary}`
            }`}
          >
            {src === "upload" ? (
              <Upload className="w-3.5 h-3.5" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5" />
            )}
            {src === "upload" ? "Upload file" : "Paste URL"}
          </button>
        ))}
      </div>

      {source === "url" ? (
        <div className="relative">
          <LinkIcon
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
          />
          <input
            type="url"
            value={urlValue}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
        </div>
      ) : mediaUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm group">
          <img
            src={mediaUrl}
            alt={`${side} preview`}
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <button
              onClick={onClear}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all shadow-lg"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm">
            {side === "desktop"
              ? "1920×800 recommended"
              : "800×600 recommended"}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver(e);
          }}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.01]"
              : `${borderColor} hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50`
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                dragOver ? "bg-blue-100 dark:bg-blue-900/40" : `${bgSecondary}`
              }`}
            >
              <Upload
                className={`w-5 h-5 ${dragOver ? "text-blue-500" : textTertiary}`}
              />
            </div>
            <div>
              <p className={`text-sm font-medium ${textPrimary}`}>
                {dragOver ? "Drop to upload" : "Drag & drop or click to browse"}
              </p>
              <p className={`text-xs ${textTertiary} mt-0.5`}>{hint}</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileInput(e, side)}
          />
        </div>
      )}
    </div>
  );

  const MediaStep = () => (
    <div className="space-y-5">
      {/* Media type toggle */}
      <div>
        <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
          Media Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["image", "video"] as const).map((type) => (
            <button
              key={type}
              onClick={() => patch({ mediaType: type })}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                formData.mediaType === type
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                  : `border-gray-200 dark:border-gray-700 ${textSecondary} hover:border-blue-300 dark:hover:border-blue-700`
              }`}
            >
              {type === "image" ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              {type === "image" ? "Image" : "Video"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <UploadZone
          side="desktop"
          label="Desktop"
          hint="Recommended: 1920×800 (16:7)"
          icon={Monitor}
          mediaUrl={formData.desktopMedia.url}
          source={desktopSource}
          setSource={setDesktopSource}
          dragOver={desktopDragOver}
          onDragOver={() => setDesktopDragOver(true)}
          onDragLeave={() => setDesktopDragOver(false)}
          onDrop={(e) => handleDrop(e, "desktop")}
          inputRef={desktopInputRef}
          onClear={() => patch({ desktopMedia: { url: "" } })}
          urlValue={desktopSource === "url" ? formData.desktopMedia.url : ""}
          onUrlChange={(v) => patch({ desktopMedia: { url: v } })}
        />
        <UploadZone
          side="mobile"
          label="Mobile"
          hint="Recommended: 800×600 (4:3)"
          icon={Smartphone}
          mediaUrl={formData.mobileMedia.url}
          source={mobileSource}
          setSource={setMobileSource}
          dragOver={mobileDragOver}
          onDragOver={() => setMobileDragOver(true)}
          onDragLeave={() => setMobileDragOver(false)}
          onDrop={(e) => handleDrop(e, "mobile")}
          inputRef={mobileInputRef}
          onClear={() => patch({ mobileMedia: { url: "" } })}
          urlValue={mobileSource === "url" ? formData.mobileMedia.url : ""}
          onUrlChange={(v) => patch({ mobileMedia: { url: v } })}
        />
      </div>
    </div>
  );

  // ── STEP 3: content ──────────────────────────────────────────────────────
  const ContentStep = () => {
    const isRTLLang = editingLang === "he" || editingLang === "ar";
    return (
      <div className="space-y-5">
        {/* Language selector */}
        <div
          className={`flex items-center gap-3 p-3 rounded-xl ${bgSecondary} border ${borderColor}`}
        >
          <Globe className={`w-4 h-4 ${textTertiary} shrink-0`} />
          <span className={`text-xs font-medium ${textSecondary}`}>
            Language:
          </span>
          <div className="flex gap-1.5">
            {(Object.keys(LANG_META) as Lang[]).map((lang) => {
              const m = LANG_META[lang];
              const complete = langComplete(lang);
              return (
                <button
                  key={lang}
                  onClick={() => setEditingLang(lang)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    editingLang === lang
                      ? "bg-blue-600 text-white shadow-sm"
                      : `${bgPrimary} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 border ${borderColor}`
                  }`}
                >
                  <span>{m.flag}</span>
                  <span>{m.native}</span>
                  {complete && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${editingLang === lang ? "bg-green-300" : "bg-green-500"}`}
                    />
                  )}
                  {lang === "en" && !complete && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${editingLang === lang ? "bg-red-300" : "bg-red-400"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {editingLang === "en" && (
            <span className="text-xs text-red-500 font-medium ml-auto">
              Required
            </span>
          )}
          {editingLang !== "en" && (
            <span className={`text-xs ${textTertiary} ml-auto`}>Optional</span>
          )}
        </div>

        <div dir={isRTLLang ? "rtl" : "ltr"} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-sm font-semibold ${textPrimary}`}>
                Title{" "}
                {editingLang === "en" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <span className={`text-xs ${textTertiary}`}>
                {formData.title[editingLang].length}/80
              </span>
            </div>
            <input
              type="text"
              maxLength={80}
              value={formData.title[editingLang]}
              onChange={(e) =>
                patch({
                  title: { ...formData.title, [editingLang]: e.target.value },
                })
              }
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
              placeholder={`Enter title in ${LANG_META[editingLang].label}...`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-sm font-semibold ${textPrimary}`}>
                Description{" "}
                {editingLang === "en" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <span className={`text-xs ${textTertiary}`}>
                {formData.content[editingLang].length}/300
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={300}
              value={formData.content[editingLang]}
              onChange={(e) =>
                patch({
                  content: {
                    ...formData.content,
                    [editingLang]: e.target.value,
                  },
                })
              }
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none`}
              placeholder={`Describe this promotion in ${LANG_META[editingLang].label}...`}
            />
          </div>
        </div>

        <div>
          <label
            className={`flex items-center gap-2 text-sm font-semibold ${textPrimary} mb-1.5`}
          >
            <LinkIcon className="w-4 h-4" />
            Destination URL
            <span className={`text-xs font-normal ${textTertiary}`}>
              (optional)
            </span>
          </label>
          <div className="relative">
            <ExternalLink
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
            />
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => patch({ linkUrl: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
              placeholder="/attractions/ramon-crater  or  https://..."
            />
          </div>
          <p className={`text-xs ${textTertiary} mt-1.5`}>
            Where users land when they click this promotion.
          </p>
        </div>

        <div className="flex gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            <strong>English content is required</strong> for promotion approval.
            Hebrew and Arabic are optional but improve reach.
          </p>
        </div>
      </div>
    );
  };

  // ── STEP 4: review ───────────────────────────────────────────────────────
  const ReviewStep = () => {
    const missingLangs = (["he", "ar"] as Lang[]).filter(
      (l) => !langComplete(l),
    );
    return (
      <div className="space-y-5">
        {/* Summary grid */}
        <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
          <div className={`px-4 py-3 ${bgSecondary} border-b ${borderColor}`}>
            <h4 className={`text-sm font-semibold ${textPrimary}`}>
              Promotion summary
            </h4>
          </div>
          <div className={`${bgPrimary} divide-y ${borderColor}`}>
            {[
              { label: "Website", value: websiteName },
              { label: "Placement", value: formData.placement },
              {
                label: "Status",
                value: formData.active ? "🟢 Active" : "⚫ Draft",
              },
              {
                label: "Media type",
                value: formData.mediaType === "image" ? "🖼 Image" : "🎥 Video",
              },
              { label: "Title (EN)", value: formData.title.en || "—" },
              ...(formData.linkUrl
                ? [{ label: "Link", value: formData.linkUrl }]
                : []),
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 px-4 py-2.5"
              >
                <span className={`text-sm ${textSecondary} shrink-0`}>
                  {label}
                </span>
                <span
                  className={`text-sm font-medium ${textPrimary} text-right truncate`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        {formData.desktopMedia.url && (
          <div>
            <h4 className={`text-sm font-semibold ${textPrimary} mb-2`}>
              Live preview
            </h4>
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={formData.desktopMedia.url}
                alt="Preview"
                className="w-full h-52 object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 rounded-full text-[10px] font-semibold mb-2 uppercase tracking-wider">
                  <Layers className="w-3 h-3" />
                  {formData.placement}
                </div>
                <h3 className="text-xl font-bold leading-tight drop-shadow">
                  {formData.title.en || "Untitled Promotion"}
                </h3>
                {formData.content.en && (
                  <p className="text-sm mt-1 opacity-90 line-clamp-2 drop-shadow-sm">
                    {formData.content.en}
                  </p>
                )}
                {formData.linkUrl && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-200">
                    <ExternalLink className="w-3 h-3" />
                    {formData.linkUrl}
                  </div>
                )}
              </div>
              {!formData.active && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gray-900/70 text-white text-[10px] font-semibold backdrop-blur-sm">
                  DRAFT
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missing translations notice */}
        {missingLangs.length > 0 && (
          <div
            className={`flex gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border ${borderColor}`}
          >
            <Globe className={`w-4 h-4 ${textTertiary} mt-0.5 shrink-0`} />
            <p className={`text-xs ${textSecondary} leading-relaxed`}>
              No content added for{" "}
              {missingLangs.map((l) => LANG_META[l].label).join(" and ")}. You
              can go back and add translations to reach more visitors.
            </p>
          </div>
        )}

        <div className="flex gap-3 p-3.5 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
            <strong>Ready to publish!</strong> Click "Save Promotion" below to
            add this to your website. You can edit or deactivate it any time.
          </p>
        </div>
      </div>
    );
  };

  // ── render ───────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (STEPS[currentStep].key) {
      case "placement":
        return <PlacementStep />;
      case "media":
        return <MediaStep />;
      case "content":
        return <ContentStep />;
      case "review":
        return <ReviewStep />;
      default:
        return null;
    }
  };

  const step = STEPS[currentStep];
  const valid = isStepValid();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`${bgPrimary} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden`}
        style={{ boxShadow: "0 25px 60px -10px rgba(0,0,0,0.35)" }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}
        >
          <div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>
              {existingPromotion ? "Edit Promotion" : "New Promotion"}
            </h2>
            <p className={`text-xs ${textSecondary} mt-0.5`}>
              {websiteName} · Step {currentStep + 1} of {STEPS.length} —{" "}
              {step.sublabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <StepIndicator />

        {/* Step title */}
        <div className={`px-6 pb-3 border-b ${borderColor}`}>
          <h3 className={`text-base font-semibold ${textPrimary}`}>
            {step.label}
          </h3>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{renderStep()}</div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between gap-3 px-6 py-4 border-t ${borderColor}`}
        >
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentStep === 0
                ? "opacity-40 cursor-not-allowed"
                : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800`
            }`}
          >
            {isRTL ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border ${borderColor} ${textSecondary} text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            >
              Cancel
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!valid}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  valid
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <button
                onClick={() =>
                  onSave({
                    websiteId,
                    websiteName,
                    placement: formData.placement,
                    title: formData.title,
                    content: formData.content,
                    linkUrl: formData.linkUrl,
                    mediaType: formData.mediaType,
                    desktopMedia: formData.desktopMedia,
                    mobileMedia: formData.mobileMedia,
                    active: formData.active,
                    order: formData.order,
                  })
                }
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-green-200 dark:shadow-green-900"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                Save Promotion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
