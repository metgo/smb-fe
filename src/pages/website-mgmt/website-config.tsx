import clsx from "clsx";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useRef, useEffect } from "react";

import { useSearchParams } from "react-router-dom";
import { ImageWithFallback } from "@/components/shared";
import { PublishButton } from "@/components/btns";

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
  Step01Generals,
  Step02BrandingMedia,
  Step03HomeVideo,
  Step04ThemeAppearance,
  Step05SocialMedia,
  Step06ContactDetails,
  Step07SeoMeta,
  Step08Analytics,
  Step09Localization
} from "./components/steps";
import {
  useCreateWebsiteSettingMutation,
  useUpdateWebsiteSettingMutation,
  useGetWebsiteSettingDetailsQuery,
} from "@/store/api/websiteSettingsApi";
import { Spinner } from "@/components/shared";
import { useCreateSignedUrlMutation } from "@/store/api/mediaMutationApi";
import { convertToWebP, uploadWithProgress } from "@/helpers";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 9;

const STEP_ICONS: React.FC<{ className?: string }>[] = [
  Settings,
  ImageIcon,
  Video,
  Palette,
  Share2,
  Phone,
  Search,
  BarChart2,
  Globe,
];

const DEFAULT_FORM: SiteSettingsFormData = {
  /* Step 1 */
  dmoId: "",
  authorityId: "",
  websiteName: "",
  websiteUrl: "",
  slogan: "",
  purpose: "MARKETPLACE",
  identifierId: "",
  campCode: "",

  /* Step 2 */
  logoUrl: "",
  faviconUrl: "",
  bgImageUrl: "",
  specialSymbolUrl: "",

  /* Step 2 */
  desktopVideos: [],
  mobileVideos: [],
  desktopVideoThumbnails: [],
  mobileVideoThumbnails: [],

  /* Step 3 */
  primaryColor: "#0d9488",
  secondaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  fontFamily: "Inter",
  fontSourceUrl: "",
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
/*  Payload builder                                                     */
/* ------------------------------------------------------------------ */

const buildPayload = (data: SiteSettingsFormData, externalApiId: string) => ({
  externalApiId,
  websiteName: data.websiteName,
  websiteUrl: data.websiteUrl,
  slogan: data.slogan,
  purpose: data.purpose,
  identifierId: data.identifierId,
  campCode: data.campCode,
  logoUrl: data.logoUrl,
  faviconUrl: data.faviconUrl,
  desktopVideos: data.desktopVideos,
  mobileVideos: data.mobileVideos,
  desktopVideoThumbnails: data.desktopVideoThumbnails,
  mobileVideoThumbnails: data.mobileVideoThumbnails,
  primaryColor: data.primaryColor,
  secondaryColor: data.secondaryColor,
  backgroundColor: data.backgroundColor,
  fontFamily: data.fontFamily,
  fontSourceUrl: data.fontSourceUrl,
  buttonStyle: data.buttonStyle,
  buttonRadius: data.buttonRadius,
  darkModeEnabled: data.darkModeEnabled,
  facebookUrl: data.facebookUrl,
  instagramUrl: data.instagramUrl,
  twitterUrl: data.twitterUrl,
  youtubeUrl: data.youtubeUrl,
  linkedinUrl: data.linkedinUrl,
  tiktokUrl: data.tiktokUrl,
  showSocialIcons: data.showSocialIcons,
  socialLinksNewTab: data.socialLinksNewTab,
  phoneNumber: data.phoneNumber,
  whatsappNumber: data.whatsappNumber,
  email: data.email,
  supportEmail: data.supportEmail,
  physicalAddress: data.physicalAddress,
  googleMapsEmbed: data.googleMapsEmbed,
  enableClickToCall: data.enableClickToCall,
  enableWhatsappChat: data.enableWhatsappChat,
  metaTitle: data.metaTitle,
  metaDescription: data.metaDescription,
  metaKeywords: data.metaKeywords,
  ogTitle: data.ogTitle,
  ogDescription: data.ogDescription,
  ogImageUrl: data.ogImageUrl,
  twitterCardTitle: data.twitterCardTitle,
  twitterCardDescription: data.twitterCardDescription,
  twitterCardImageUrl: data.twitterCardImageUrl,
  canonicalUrl: data.canonicalUrl,
  robotsTxt: data.robotsTxt,
  sitemapUrl: data.sitemapUrl,
  googleAnalyticsId: data.googleAnalyticsId,
  googleTagManagerId: data.googleTagManagerId,
  facebookPixelId: data.facebookPixelId,
  headerScripts: data.headerScripts,
  footerScripts: data.footerScripts,
  defaultLanguage: data.defaultLanguage,
  multiLanguageEnabled: data.multiLanguageEnabled,
  timezone: data.timezone,
  currency: data.currency,
  dateFormat: data.dateFormat,
});

export default function WebsiteConfigPage() {
  const { t } = useTranslation("website_settings");
  const [searchParams] = useSearchParams();

  const websiteId = searchParams.get("websiteId");
  const websiteName = searchParams.get("websiteName");
  const websiteLogo = searchParams.get("websiteLogo");

  const { textPrimary, textSecondary, borderColor, cardClasses, isDark } =
    useThemeClasses();

  const STEP_META = [
    t("general"),
    t("step_branding"),
    t("step_videos"),
    t("step_theme"),
    t("step_social"),
    t("step_contact"),
    t("step_seo"),
    t("step_analytics"),
    t("step_language"),
  ].map((label, i) => ({ icon: STEP_ICONS[i], label }));

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SiteSettingsFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<SiteSettingsErrors>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadStates, setUploadStates] = useState<
    Record<string, "idle" | "uploading" | "done" | "error">
  >({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const stepContentRef = useRef<HTMLDivElement>(null);

  /* ---------------- API Hooks ---------------- */

  const [createWebsiteSetting, { isLoading: isSaving }] =
    useCreateWebsiteSettingMutation();
  const [updateWebsiteSetting] = useUpdateWebsiteSettingMutation();
  const [createSignedUrl] = useCreateSignedUrlMutation();

  const { data: existingSettings, isLoading } =
    useGetWebsiteSettingDetailsQuery(websiteId, { skip: !websiteId });

  /* ---------------- Hydrate form from fetched settings ---------------- */

  useEffect(() => {
    setFormData(DEFAULT_FORM);
    setUploadStates({});
    setErrors({});
  }, [websiteId]);

  useEffect(() => {
    if (!existingSettings) return;
    const d = existingSettings;
    setFormData({
      dmoId: d.dmoId ?? "",
      authorityId: d.authorityId ?? "",
      websiteName: d.websiteName ?? "",
      websiteUrl: d.websiteUrl ?? "",
      slogan: d.slogan ?? "",
      purpose: d.purpose ?? "MARKETPLACE",
      identifierId: d.identifierId ?? "",
      campCode: d.campCode ?? "",

      logoUrl: d.logoUrl ?? "",
      faviconUrl: d.faviconUrl ?? "",
      specialSymbolUrl: d.specialSymbolUrl ?? "",
      bgImageUrl: d.bgImageUrl ?? "",

      desktopVideos: d.desktopVideos ?? [],
      mobileVideos: d.mobileVideos ?? [],
      desktopVideoThumbnails: d.desktopVideoThumbnails ?? [],
      mobileVideoThumbnails: d.mobileVideoThumbnails ?? [],
      primaryColor: d.primaryColor ?? "#0d9488",
      secondaryColor: d.secondaryColor ?? "#6366f1",
      backgroundColor: d.backgroundColor ?? "#ffffff",
      fontFamily: d.fontFamily ?? "Inter",
      fontSourceUrl: d.fontSourceUrl ?? "",
      buttonStyle: d.buttonStyle ?? "rounded",
      buttonRadius: d.buttonRadius ?? "8",
      darkModeEnabled: d.darkModeEnabled ?? false,
      facebookUrl: d.facebookUrl ?? "",
      instagramUrl: d.instagramUrl ?? "",
      twitterUrl: d.twitterUrl ?? "",
      youtubeUrl: d.youtubeUrl ?? "",
      linkedinUrl: d.linkedinUrl ?? "",
      tiktokUrl: d.tiktokUrl ?? "",
      showSocialIcons: d.showSocialIcons ?? true,
      socialLinksNewTab: d.socialLinksNewTab ?? true,
      phoneNumber: d.phoneNumber ?? "",
      whatsappNumber: d.whatsappNumber ?? "",
      email: d.email ?? "",
      supportEmail: d.supportEmail ?? "",
      physicalAddress: d.physicalAddress ?? "",
      googleMapsEmbed: d.googleMapsEmbed ?? "",
      enableClickToCall: d.enableClickToCall ?? true,
      enableWhatsappChat: d.enableWhatsappChat ?? false,
      metaTitle: d.metaTitle ?? "",
      metaDescription: d.metaDescription ?? "",
      metaKeywords: d.metaKeywords ?? "",
      ogTitle: d.ogTitle ?? "",
      ogDescription: d.ogDescription ?? "",
      ogImageUrl: d.ogImageUrl ?? "",
      twitterCardTitle: d.twitterCardTitle ?? "",
      twitterCardDescription: d.twitterCardDescription ?? "",
      twitterCardImageUrl: d.twitterCardImageUrl ?? "",
      canonicalUrl: d.canonicalUrl ?? "",
      robotsTxt: d.robotsTxt ?? "User-agent: *\nAllow: /",
      sitemapUrl: d.sitemapUrl ?? "",
      googleAnalyticsId: d.googleAnalyticsId ?? "",
      googleTagManagerId: d.googleTagManagerId ?? "",
      facebookPixelId: d.facebookPixelId ?? "",
      headerScripts: d.headerScripts ?? "",
      footerScripts: d.footerScripts ?? "",
      defaultLanguage: d.defaultLanguage ?? "English",
      multiLanguageEnabled: d.multiLanguageEnabled ?? false,
      timezone: d.timezone ?? "UTC",
      currency: d.currency ?? "USD",
      dateFormat: d.dateFormat ?? "",
    });
    setUploadStates({});
  }, [existingSettings]);

  /* ---------------- Helpers ---------------- */

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

  /* ---------------- Image Upload (logo, favicon, splash, OG) ---------------- */

  const handleFileSelect = useCallback(
    async (field: keyof SiteSettingsFormData, file: File) => {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, [field]: previewUrl }));
      setUploadStates((prev) => ({ ...prev, [field]: "uploading" }));

      try {
        const skipConversion = field === "logoUrl" || field === "faviconUrl";
        const fileToUpload = skipConversion ? file : await convertToWebP(file);
        const res = await createSignedUrl([
          { originalName: fileToUpload.name, mimeType: fileToUpload.type },
        ]);
        const { signedUrl, gcsURL } = res.data[0];

        await uploadWithProgress(fileToUpload, signedUrl, (p) =>
          setUploadProgress((prev) => ({ ...prev, [field]: p })),
        );

        URL.revokeObjectURL(previewUrl);
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[field as string];
          return next;
        });
        setFormData((prev) => ({ ...prev, [field]: gcsURL }));
        setUploadStates((prev) => ({ ...prev, [field]: "done" }));
        toast.success(t("file_uploaded"));
      } catch {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[field as string];
          return next;
        });
        setUploadStates((prev) => ({ ...prev, [field]: "error" }));
        toast.error(t("upload_failed"));
      }
    },
    [createSignedUrl],
  );

  const handleFileClear = useCallback((field: keyof SiteSettingsFormData) => {
    setFormData((prev) => {
      const url = prev[field] as string;
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      return { ...prev, [field]: "" };
    });
    setUploadStates((prev) => ({ ...prev, [field]: "idle" }));
  }, []);

  /* ---------------- Video Upload ---------------- */

  const handleVideoAdd = useCallback(
    async (field: "desktopVideos" | "mobileVideos", file: File) => {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);

      setFormData((prev) => {
        const existing = prev[field];
        const newItem: VideoItem = {
          id,
          url: previewUrl,
          name: file.name,
          isActive: existing.length === 0,
        };
        return { ...prev, [field]: [...existing, newItem] };
      });
      setUploadStates((prev) => ({ ...prev, [id]: "uploading" }));

      try {
        const res = await createSignedUrl([
          { originalName: file.name, mimeType: file.type },
        ]);
        const { signedUrl, gcsURL } = res.data[0];

        await uploadWithProgress(file, signedUrl, (p) =>
          setUploadProgress((prev) => ({ ...prev, [id]: p })),
        );

        URL.revokeObjectURL(previewUrl);
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setFormData((prev) => ({
          ...prev,
          [field]: prev[field].map((v) =>
            v.id === id ? { ...v, url: gcsURL } : v,
          ),
        }));
        setUploadStates((prev) => ({ ...prev, [id]: "done" }));
        toast.success(t("video_uploaded"));
      } catch {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setUploadStates((prev) => ({ ...prev, [id]: "error" }));
        toast.error(t("video_upload_failed"));
      }
    },
    [createSignedUrl],
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

  /* ---------------- Thumbnail Upload ---------------- */

  const handleThumbnailAdd = useCallback(
    async (
      field: "desktopVideoThumbnails" | "mobileVideoThumbnails",
      file: File,
    ) => {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);

      setFormData((prev) => {
        const existing = prev[field];
        const newItem: ThumnailItem = {
          id,
          url: previewUrl,
          name: file.name,
          isActive: existing.length === 0,
        };
        return { ...prev, [field]: [...existing, newItem] };
      });
      setUploadStates((prev) => ({ ...prev, [id]: "uploading" }));

      try {
        const fileToUpload = await convertToWebP(file);
        const res = await createSignedUrl([
          { originalName: fileToUpload.name, mimeType: fileToUpload.type },
        ]);
        const { signedUrl, gcsURL } = res.data[0];

        await uploadWithProgress(fileToUpload, signedUrl, (p) =>
          setUploadProgress((prev) => ({ ...prev, [id]: p })),
        );

        URL.revokeObjectURL(previewUrl);
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setFormData((prev) => ({
          ...prev,
          [field]: prev[field].map((th) =>
            th.id === id ? { ...th, url: gcsURL } : th,
          ),
        }));
        setUploadStates((prev) => ({ ...prev, [id]: "done" }));
        toast.success(t("file_uploaded"));
      } catch {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setUploadStates((prev) => ({ ...prev, [id]: "error" }));
        toast.error(t("upload_failed"));
      }
    },
    [createSignedUrl],
  );

  const handleThumbnailRemove = useCallback(
    (field: "desktopVideoThumbnails" | "mobileVideoThumbnails", id: string) => {
      setFormData((prev) => {
        const removedWasActive =
          prev[field].find((th) => th.id === id)?.isActive ?? false;
        const remaining = prev[field].filter((th) => th.id !== id);
        if (removedWasActive && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isActive: true };
        }
        const url = prev[field].find((th) => th.id === id)?.url;
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

  const handleThumbnailActivate = useCallback(
    (field: "desktopVideoThumbnails" | "mobileVideoThumbnails", id: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].map((th) => ({ ...th, isActive: th.id === id })),
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

  const validateStep1 = (): boolean => {
    const newErrors: SiteSettingsErrors = {};
    if (!formData.websiteName.trim())
      newErrors.websiteName = t("field_required");
    if (!formData.slogan.trim()) newErrors.slogan = t("field_required");
    if (!formData.identifierId.trim())
      newErrors.identifierId = t("field_required");
    if (!formData.campCode.trim()) newErrors.campCode = t("field_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    goToStep(Math.min(TOTAL_STEPS, currentStep + 1));
  };

  /* ---------------- Save / Publish ---------------- */

  const handlePublish = async () => {
    if (!websiteId) {
      toast.error(t("select_website_first"));
      return;
    }

    setIsPublishing(true);
    try {
      const payload = buildPayload(formData, websiteId);
      if (existingSettings) {
        await updateWebsiteSetting({
          id: existingSettings._id,
          body: payload,
        }).unwrap();
      } else {
        await createWebsiteSetting(payload).unwrap();
      }
      toast.success(t("settings_published"));
    } catch {
      toast.error(t("settings_publish_failed"));
    } finally {
      setIsPublishing(false);
    }
  };

  /* ---------------- Step Rendering ---------------- */

  const stepProps = {
    isEdit: !!existingSettings,
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
        return <Step01Generals {...stepProps} />;
      case 2:
        return (
          <Step02BrandingMedia {...stepProps} uploadProgress={uploadProgress} />
        );
      case 3:
        return (
          <Step03HomeVideo
            formData={formData}
            uploadStates={uploadStates}
            uploadProgress={uploadProgress}
            onVideoAdd={handleVideoAdd}
            onVideoRemove={handleVideoRemove}
            onVideoActivate={handleVideoActivate}
            onThumbnailAdd={handleThumbnailAdd}
            onThumbnailRemove={handleThumbnailRemove}
            onThumbnailActivate={handleThumbnailActivate}
          />
        );
      case 4:
        return <Step04ThemeAppearance {...stepProps} />;
      case 5:
        return <Step05SocialMedia {...stepProps} />;
      case 6:
        return <Step06ContactDetails {...stepProps} />;
      case 7:
        return <Step07SeoMeta {...stepProps} uploadProgress={uploadProgress} />;
      case 8:
        return (
          <Step08Analytics
            formData={formData}
            errors={errors}
            onChange={onChange}
          />
        );
      case 9:
        return <Step09Localization {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 mx-auto w-full h-full">
      {/* Page Header */}
      <section className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-teal-500">
            {websiteLogo ? (
              <ImageWithFallback
                src={websiteLogo}
                alt={websiteName || "Logo"}
                className=" object-contain w-12 h-12"
              />
            ) : (
              <Settings className="w-8 h-8 text-teal-600" />
            )}
          </div>
          <div>
            <h1 className={clsx("text-xl font-bold", textPrimary)}>
              {websiteName && websiteName + " - "} {t("page_title")}
            </h1>
            <p className={clsx("text-sm", textSecondary)}>
              {t("page_subtitle")}
            </p>
          </div>
        </div>
        {/* Publish button */}
        <PublishButton isLoading={false} onClick={() => handlePublish} />
      </section>

      {/* Wizard — fills remaining height */}
      <div className="flex-1 min-h-0">
        <div
          className={clsx(
            "flex flex-col h-full rounded-2xl border overflow-hidden relative",
            cardClasses,
            borderColor,
          )}
        >
          <Spinner isLoading={isLoading} />
          {/* Step indicator */}
          <div
            className={clsx(
              "flex items-center justify-between px-6 py-1 border-b overflow-x-auto shrink-0",
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
          <div
            ref={stepContentRef}
            className="flex-1 overflow-y-auto px-6 py-8 relative"
          >
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
            onPublish={handlePublish}
            isPublishButton={currentStep === TOTAL_STEPS}
          />
        </div>
      </div>
    </div>
  );
}
