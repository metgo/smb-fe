import clsx from "clsx";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Palette,
  Share2,
  Phone,
  Search,
  BarChart2,
  Globe,
  CheckCircle,
  Video,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import WizardFooter from "@/components/shared/WizardFooter";
import {
  Step01BrandingMedia,
  Step02HomeVideo,
  Step02ThemeAppearance,
  Step03SocialMedia,
  Step04ContactDetails,
  Step05SeoMeta,
  Step06Analytics,
  Step07Localization,
  Step12SavePublish,
} from "./steps";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 9;

const STEP_META: { icon: React.FC<{ className?: string }>; label: string }[] = [
  { icon: ImageIcon, label: "Branding" },
  { icon: Video, label: "Videos" },
  { icon: Palette, label: "Theme" },
  { icon: Share2, label: "Social" },
  { icon: Phone, label: "Contact" },
  { icon: Search, label: "SEO" },
  { icon: BarChart2, label: "Analytics" },
  { icon: Globe, label: "Language" },
  { icon: CheckCircle, label: "Publish" },
];

const DEFAULT_FORM: SiteSettingsFormData = {
  /* Step 1 */
  logoUrl: "",
  faviconUrl: "",
  splashLogoUrl: "",
  /* Step 2 */
  desktopVideos: [],
  mobileVideos: [],
  /* Step 3 */
  primaryColor: "#0d9488",
  secondaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  fontFamily: "Inter",
  buttonStyle: "rounded",
  buttonRadius: "8",
  darkModeEnabled: false,
  /* Step 4 */
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  tiktokUrl: "",
  showSocialIcons: true,
  socialLinksNewTab: true,
  /* Step 5 */
  phoneNumber: "",
  whatsappNumber: "",
  email: "",
  supportEmail: "",
  physicalAddress: "",
  googleMapsEmbed: "",
  enableClickToCall: true,
  enableWhatsappChat: false,
  /* Step 6 */
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  twitterCardTitle: "",
  twitterCardDescription: "",
  twitterCardImageUrl: "",
  canonicalUrl: "",
  robotsTxt: "User-agent: *\nAllow: /",
  sitemapUrl: "",
  /* Step 7 */
  googleAnalyticsId: "",
  googleTagManagerId: "",
  facebookPixelId: "",
  headerScripts: "",
  footerScripts: "",
  /* Step 8 */
  defaultLanguage: "English",
  multiLanguageEnabled: false,
  timezone: "UTC",
  currency: "USD",
  dateFormat: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function SiteSettingsWizard() {
  const { textPrimary, textSecondary, borderColor, cardClasses, isDark } =
    useThemeClasses();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SiteSettingsFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<SiteSettingsErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadStates, setUploadStates] = useState<
    Record<string, "idle" | "uploading" | "done" | "error">
  >({});

  const stepContentRef = useRef<HTMLDivElement>(null);

  /* ---------------- Helpers ----------------  */

  const scrollToTop = () => {
    stepContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onChange = useCallback(
    (field: keyof SiteSettingsFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleFileSelect = useCallback(
    async (field: keyof SiteSettingsFormData, file: File) => {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, [field]: previewUrl }));
      setUploadStates((prev) => ({ ...prev, [field]: "uploading" }));

      // TODO: replace with actual signed-url upload
      await new Promise((r) => setTimeout(r, 1000));
      setUploadStates((prev) => ({ ...prev, [field]: "done" }));
      toast.success("File uploaded successfully");
    },
    [],
  );

  const handleFileClear = useCallback((field: keyof SiteSettingsFormData) => {
    setFormData((prev) => {
      const url = prev[field] as string;
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      return { ...prev, [field]: "" };
    });
    setUploadStates((prev) => ({ ...prev, [field]: "idle" }));
  }, []);

  /* ---------------- Video Handlers ---------------- */

  const handleVideoAdd = useCallback(
    async (field: "desktopVideos" | "mobileVideos", file: File) => {
      const id = crypto.randomUUID();
      const url = URL.createObjectURL(file);

      setFormData((prev) => {
        const existing = prev[field];
        const newItem: VideoItem = {
          id,
          url,
          name: file.name,
          isActive: existing.length === 0,
        };
        return { ...prev, [field]: [...existing, newItem] };
      });
      setUploadStates((prev) => ({ ...prev, [id]: "uploading" }));

      // TODO: replace with actual signed-url upload
      await new Promise((r) => setTimeout(r, 1000));
      setUploadStates((prev) => ({ ...prev, [id]: "done" }));
      toast.success("Video uploaded successfully");
    },
    [],
  );

  const handleVideoRemove = useCallback(
    (field: "desktopVideos" | "mobileVideos", id: string) => {
      setFormData((prev) => {
        const removedWasActive =
          prev[field].find((v) => v.id === id)?.isActive ?? false;
        const remaining = prev[field].filter((v) => v.id !== id);
        if (removedWasActive && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isActive: true };
        }
        const url = prev[field].find((v) => v.id === id)?.url;
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        return { ...prev, [field]: remaining };
      });
      setUploadStates((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [],
  );

  const handleVideoActivate = useCallback(
    (field: "desktopVideos" | "mobileVideos", id: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].map((v) => ({ ...v, isActive: v.id === id })),
      }));
    },
    [],
  );

  /* ---------------- Navigation ---------------- */

  const goToStep = (step: number) => {
    setCurrentStep(step);
    scrollToTop();
  };

  const handlePrevious = () => goToStep(Math.max(1, currentStep - 1));
  const handleNext = () => goToStep(Math.min(TOTAL_STEPS, currentStep + 1));

  /* ---------------- Save / Publish ---------------- */

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // TODO: call API mutation
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success("Draft saved");
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // TODO: call API mutation
    await new Promise((r) => setTimeout(r, 1200));
    setIsPublishing(false);
    toast.success("Settings published successfully!");
  };

  /* ---------------- Step Rendering ---------------- */

  const stepProps = {
    formData,
    errors,
    onChange,
    uploadStates,
    onFileSelect: handleFileSelect,
    onFileClear: handleFileClear,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step01BrandingMedia {...stepProps} />;
      case 2:
        return (
          <Step02HomeVideo
            formData={formData}
            uploadStates={uploadStates}
            onVideoAdd={handleVideoAdd}
            onVideoRemove={handleVideoRemove}
            onVideoActivate={handleVideoActivate}
          />
        );
      case 3:
        return <Step02ThemeAppearance {...stepProps} />;
      case 4:
        return <Step03SocialMedia {...stepProps} />;
      case 5:
        return <Step04ContactDetails {...stepProps} />;
      case 6:
        return <Step05SeoMeta {...stepProps} />;
      case 7:
        return (
          <Step06Analytics
            formData={formData}
            errors={errors}
            onChange={onChange}
          />
        );
      case 8:
        return <Step07Localization {...stepProps} />;
      case 9:
        return <Step12SavePublish formData={formData} />;
      default:
        return null;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <div
      className={clsx(
        "flex flex-col h-full rounded-2xl border overflow-hidden",
        cardClasses,
        borderColor,
      )}
    >
      {/* Step indicator */}
      <div
        className={clsx(
          "flex items-center justify-between px-6 py-4 border-b overflow-x-auto shrink-0",
          borderColor,
        )}
      >
        {STEP_META.map(({ icon: Icon, label }, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <button
              key={step}
              onClick={() => goToStep(step)}
              className={clsx(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0",
                isActive
                  ? "bg-teal-500/15"
                  : isCompleted
                    ? isDark
                      ? "hover:bg-gray-800"
                      : "hover:bg-gray-100"
                    : isDark
                      ? "hover:bg-gray-800 opacity-50"
                      : "hover:bg-gray-100 opacity-50",
              )}
            >
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isActive
                    ? "bg-teal-500 text-white"
                    : isCompleted
                      ? "bg-teal-500/20 text-teal-600"
                      : isDark
                        ? "bg-gray-800 text-gray-500"
                        : "bg-gray-200 text-gray-400",
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={clsx(
                  "text-xs font-medium whitespace-nowrap",
                  isActive
                    ? "text-teal-600"
                    : isCompleted
                      ? textSecondary
                      : textSecondary,
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step progress bar */}
      <div
        className={clsx(
          "h-1 w-full shrink-0",
          isDark ? "bg-gray-800" : "bg-gray-100",
        )}
      >
        <div
          className="h-full bg-teal-500 transition-all duration-300"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <div ref={stepContentRef} className="flex-1 overflow-y-auto px-6 py-8">
        {renderStep()}
      </div>

      {/* Footer */}
      <WizardFooter
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isPublishButton={currentStep === TOTAL_STEPS}
      />
    </div>
  );
}
