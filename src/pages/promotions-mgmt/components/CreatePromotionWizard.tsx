import { useState, useRef } from "react";
import {
  X,
  Check,
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
import clsx from "clsx";
import { WizardFooter } from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";

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
  const { t } = useTranslation("promotions");
  const [isPublishing, _setIsPublishing] = useState(false);
  const STEPS = [
    {
      key: "placement",
      label: t("step_placement"),
      sublabel: t("step_placement_sublabel"),
      icon: Layers,
    },
    {
      key: "media",
      label: t("step_media"),
      sublabel: t("step_media_sublabel"),
      icon: ImageIcon,
    },
    {
      key: "content",
      label: t("step_content"),
      sublabel: t("step_content_sublabel"),
      icon: FileText,
    },
    {
      key: "review",
      label: t("step_review"),
      sublabel: t("step_review_sublabel"),
      icon: Eye,
    },
  ];
  const { isDark } = useThemeClasses();
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
  const handleNext = async () => {
    setCurrentStep((prev) => prev + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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

  // const isStepValid = (idx = currentStep) => {
  //   switch (STEPS[idx]?.key) {
  //     case "placement":
  //       return formData.placement.length > 0;
  //     case "media":
  //       return !!(formData.desktopMedia.url && formData.mobileMedia.url);
  //     case "content":
  //       return formData.title.en.length > 0 && formData.content.en.length > 0;
  //     case "review":
  //       return true;
  //     default:
  //       return false;
  //   }
  // };

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
          <div
            key={step.key}
            className="flex items-center flex-1 min-w-0"
            onClick={() => setCurrentStep(idx)}
          >
            {/* Node */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",

                  done
                    ? [
                        "bg-green-600 border-green-600 text-white",
                        isDark
                          ? "shadow-green-900"
                          : "shadow-md shadow-green-200",
                      ]
                    : active
                      ? [
                          isDark ? "bg-gray-900" : "bg-white",
                          "border-green-600 text-green-600",
                          isDark
                            ? "shadow-green-900/40"
                            : "shadow-md shadow-green-100",
                        ]
                      : [
                          isDark ? "border-gray-700" : "border-gray-200",
                          textTertiary,
                          "bg-transparent",
                        ],
                )}
              >
                {done ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="mt-1.5 text-center">
                <p
                  className={`text-xs font-semibold leading-tight ${
                    active
                      ? "text-green-600"
                      : done
                        ? textPrimary
                        : textTertiary
                  }`}
                >
                  {step?.label}
                </p>

                <p
                  className={`text-[10px] leading-tight hidden sm:block ${
                    future ? textTertiary : textSecondary
                  }`}
                >
                  {step?.sublabel}
                </p>
              </div>
            </div>
            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5 relative h-0.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="absolute inset-y-0 left-0 bg-green-600 transition-all duration-500"
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
    <div
      className={clsx(
        "space-y-6 rounded-md p-4",
        isDark ? "bg-gray-900" : "bg-white",
      )}
    >
      {/* Placement cards */}
      <div>
        <label
          className={clsx("block text-sm font-semibold mb-3", textPrimary)}
        >
          {t("placement_label")} <span className="text-red-500">*</span>
        </label>

        {availablePlacements.length <= 6 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availablePlacements.map((p) => {
              const selected = formData.placement === p;

              return (
                <button
                  key={p}
                  onClick={() => patch({ placement: p })}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 text-left",

                    isDark
                      ? "text-gray-300 bg-gray-900"
                      : "text-gray-700 bg-white",

                    selected && [
                      "border-green-600",
                      "bg-green-50 dark:bg-green-900/30",
                      "text-green-700 dark:text-green-300 shadow-sm",
                    ],

                    !selected && [
                      "border-gray-200 dark:border-gray-900",
                      "hover:border-green-300 dark:hover:border-green-600",
                      "dark:hover:bg-gray-700",
                      "hover:text-green-600 dark:hover:text-green-400",
                    ],
                  )}
                >
                  <Layers
                    className={clsx(
                      "w-4 h-4 shrink-0",
                      selected ? "text-green-600" : textTertiary,
                    )}
                  />

                  <span className="truncate">{p}</span>

                  {selected && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <select
            value={formData.placement}
            onChange={(e) => patch({ placement: e.target.value })}
            className={clsx(
              "w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition",
              borderColor,
              isDark ? "bg-gray-700" : bgPrimary,
              textPrimary,
            )}
          >
            {availablePlacements.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

        <p className={clsx("text-xs mt-2", textTertiary)}>
          {t("placement_help_text")}
        </p>
      </div>

      {/* Active toggle */}
      <div
        className={clsx(
          "flex items-center justify-between p-4 rounded-xl border",
          borderColor,
          isDark ? "bg-gray-900" : bgSecondary,
        )}
      >
        <div>
          <p className={clsx("text-sm font-semibold", textPrimary)}>
            {t("publish_immediately")}
          </p>

          <p className={clsx("text-xs mt-0.5", textTertiary)}>
            {formData.active
              ? t("publish_active_desc")
              : t("publish_draft_desc")}
          </p>
        </div>

        <button
          role="switch"
          aria-checked={formData.active}
          onClick={() => patch({ active: !formData.active })}
          className={clsx(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
            formData.active ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600",
          )}
        >
          <span
            className={clsx(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200",
              formData.active
                ? isRTL
                  ? "-translate-x-5"
                  : "translate-x-5"
                : "translate-x-0",
            )}
          />
        </button>
      </div>

      {/* Info callout */}
      <div
        className={clsx(
          "flex gap-3 p-4 rounded-xl border",
          isDark
            ? "bg-gray-900 border-gray-600"
            : "bg-green-50 border-green-100",
        )}
      >
        <AlertCircle
          className={clsx(
            "w-4 h-4 mt-0.5 shrink-0",
            isDark ? "text-green-400" : "text-green-500",
          )}
        />

        <p
          className={clsx(
            "text-xs leading-relaxed",
            isDark ? "text-gray-200" : "text-green-800",
          )}
        >
          {t("placement_info_text")}
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
    <div
      className={clsx(
        "space-y-6 rounded-md p-4",
        isDark ? "bg-gray-900" : "bg-white",
      )}
    >
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
                ? `${isDark ? "bg-gray-700" : "bg-white"} ${textPrimary} shadow-sm`
                : `${textTertiary} hover:${textSecondary}`
            }`}
          >
            {src === "upload" ? (
              <Upload className="w-3.5 h-3.5" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5" />
            )}

            {src === "upload" ? t("upload_file") : t("paste_url")}
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
            placeholder={t("media_url_placeholder")}
            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
          />
        </div>
      ) : mediaUrl ? (
        <div
          className={`relative rounded-xl overflow-hidden border ${
            isDark ? "border-gray-700" : "border-gray-200"
          } shadow-sm group`}
        >
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
              <X className="w-3.5 h-3.5" />
              {t("remove")}
            </button>
          </div>

          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm">
            {side === "desktop"
              ? t("desktop_recommendation")
              : t("mobile_recommendation")}
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
              ? "border-green-500 bg-green-50 dark:bg-gray-700 scale-[1.01]"
              : `${borderColor} hover:border-green-400 dark:hover:border-green-600 dark:hover:bg-gray-700`
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                dragOver ? "bg-green-100 dark:bg-gray-700" : `${bgSecondary}`
              }`}
            >
              <Upload
                className={`w-5 h-5 ${
                  dragOver ? "text-green-500" : textTertiary
                }`}
              />
            </div>

            <div>
              <p className={`text-sm font-medium ${textPrimary}`}>
                {dragOver ? t("drop_to_upload") : t("drag_or_click_upload")}
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
    <div
      className={clsx(
        "space-y-6 rounded-md p-4",
        isDark ? "bg-gray-900" : "bg-white",
      )}
    >
      {" "}
      {/* Media type toggle */}
      <div>
        <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
          {t("media_type")} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["image", "video"] as const).map((type) => (
            <button
              key={type}
              onClick={() => patch({ mediaType: type })}
              className={clsx(
                "flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all",

                formData.mediaType === type
                  ? [
                      "border-green-600",
                      isDark
                        ? "bg-green-950/30 text-green-300"
                        : "bg-green-50 text-green-700",
                    ]
                  : [
                      isDark ? "border-gray-700" : "border-gray-200",
                      textSecondary,
                      isDark
                        ? "hover:border-green-700"
                        : "hover:border-green-300",
                    ],
              )}
            >
              {type === "image" ? (
                <ImageIcon className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              {type === "image" ? t("image") : t("video")}{" "}
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <UploadZone
          side="desktop"
          label={t("desktop")}
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
          label={t("mobile")}
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
      <div
        className={clsx(
          "space-y-6 rounded-md p-4",
          isDark ? "bg-gray-900" : "bg-white",
        )}
      >
        {" "}
        {/* Language selector */}
        <div
          className={`flex items-center gap-3 p-3 rounded-xl ${bgSecondary} border ${borderColor}`}
        >
          <Globe className={`w-4 h-4 ${textTertiary} shrink-0`} />

          <span className={`text-xs font-medium ${textSecondary}`}>
            {t("language")}
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
                      ? "bg-green-600 text-white shadow-sm"
                      : `${bgPrimary} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 border ${borderColor}`
                  }`}
                >
                  <span>{m.flag}</span>
                  <span>{m.native}</span>

                  {complete && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        editingLang === lang ? "bg-green-300" : "bg-green-500"
                      }`}
                    />
                  )}

                  {lang === "en" && !complete && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        editingLang === lang ? "bg-red-300" : "bg-red-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {editingLang === "en" ? (
            <span className="text-xs text-red-500 font-medium ml-auto">
              {t("required")}
            </span>
          ) : (
            <span className={`text-xs ${textTertiary} ml-auto`}>
              {t("optional")}
            </span>
          )}
        </div>
        {/* Title + Description */}
        <div dir={isRTLLang ? "rtl" : "ltr"} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-sm font-semibold ${textPrimary}`}>
                {t("title")}{" "}
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
                  title: {
                    ...formData.title,
                    [editingLang]: e.target.value,
                  },
                })
              }
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
              placeholder={t("title_placeholder", {
                lang: LANG_META[editingLang].label,
              })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-sm font-semibold ${textPrimary}`}>
                {t("description")}{" "}
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
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none`}
              placeholder={t("description_placeholder", {
                lang: LANG_META[editingLang].label,
              })}
            />
          </div>
        </div>
        {/* URL */}
        <div>
          <label
            className={`flex items-center gap-2 text-sm font-semibold ${textPrimary} mb-1.5`}
          >
            <LinkIcon className="w-4 h-4" />
            {t("destination_url")}
            <span className={`text-xs font-normal ${textTertiary}`}>
              ({t("optional")})
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
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
              placeholder={t("url_placeholder")}
            />
          </div>

          <p className={`text-xs ${textTertiary} mt-1.5`}>
            {t("destination_hint")}
          </p>
        </div>
        {/* Warning */}
        <div
          className={clsx(
            "flex gap-3 p-3.5 rounded-xl border",
            isDark
              ? "bg-amber-950/20 border-amber-800"
              : "bg-amber-50 border-amber-200",
          )}
        >
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />

          <p
            className={clsx(
              "text-xs leading-relaxed",
              isDark ? "text-amber-200" : "text-amber-800",
            )}
          >
            <strong>{t("english_required")}</strong>{" "}
            {t("language_requirement_note")}
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
              {t("promotion_summary")}
            </h4>
          </div>

          <div className={`${bgPrimary} divide-y ${borderColor}`}>
            {[
              { label: t("website"), value: websiteName },
              { label: t("placement"), value: formData.placement },
              {
                label: t("status"),
                value: formData.active ? "🟢 Active" : "⚫ Draft",
              },
              {
                label: t("media_type"),
                value: formData.mediaType === "image" ? "🖼 Image" : "🎥 Video",
              },
              { label: t("title_en"), value: formData.title.en || "—" },
              ...(formData.linkUrl
                ? [{ label: t("link"), value: formData.linkUrl }]
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
              {t("live_preview")}
            </h4>

            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src={formData.desktopMedia.url}
                alt="Preview"
                className="w-full h-52 object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 rounded-full text-[10px] font-semibold mb-2 uppercase tracking-wider">
                  <Layers className="w-3 h-3" />
                  {formData.placement}
                </div>

                <h3 className="text-xl font-bold leading-tight drop-shadow">
                  {formData.title.en || t("untitled_promotion")}
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
                  {t("draft")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missing translations notice */}
        {missingLangs.length > 0 && (
          <div
            className={clsx(
              "flex gap-3 p-3.5 rounded-xl border",
              isDark
                ? "bg-gray-800/60 border-gray-700"
                : "bg-gray-50 border-gray-200",
            )}
          >
            <Globe className={clsx("w-4 h-4 mt-0.5 shrink-0", textTertiary)} />

            <p className={clsx("text-xs leading-relaxed", textSecondary)}>
              {t("missing_translations_prefix")}{" "}
              {missingLangs.map((l) => LANG_META[l].label).join(" and ")}.{" "}
              {t("missing_translations_suffix")}
            </p>
          </div>
        )}

        {/* Success message */}
        <div
          className={clsx(
            "flex gap-3 p-3.5 rounded-xl border",
            isDark
              ? "bg-green-950/20 border-green-800"
              : "bg-green-50 border-green-200",
          )}
        >
          <Sparkles
            className={clsx(
              "w-4 h-4 mt-0.5 shrink-0",
              isDark ? "text-green-400" : "text-green-600",
            )}
          />

          <p
            className={clsx(
              "text-xs leading-relaxed",
              isDark ? "text-green-200" : "text-green-800",
            )}
          >
            <strong>{t("ready_to_publish")}</strong> {t("publish_instruction")}
          </p>
        </div>
      </div>
    );
  };

  // ── render ───────────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (STEPS[currentStep]?.key) {
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
  // const valid = isStepValid();

  return (
    <ModalWrapper onClose={() => onClose}>
      <div className="overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}
        >
          <div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>
              {existingPromotion
                ? t("edit_promotion")
                : t("new_promotion")}{" "}
            </h2>
            <p className={`text-xs ${textSecondary} mt-0.5`}>
              {websiteName} · Step {currentStep + 1} of {STEPS.length} —{" "}
              {step?.sublabel}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator />

        {/* Step title */}
        <div className={`px-6 pb-3 border-b ${borderColor}`}>
          <h3 className={`text-base font-semibold ${textPrimary}`}>
            {step?.label}
          </h3>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{renderStep()}</div>

        {/* Footer */}
        <WizardFooter
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isSaving={isPublishing}
          isPublishing={isPublishing}
          onPublish={() =>
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
        />
      </div>
    </ModalWrapper>
  );
}
