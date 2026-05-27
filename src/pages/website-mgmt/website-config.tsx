import clsx from "clsx";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useRef, useEffect } from "react";

import { useSearchParams } from "react-router-dom";
import { ImageWithFallback } from "@/components/shared";
import { BackToListBtn, PublishButton } from "@/components/btns";

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
  Step09Localization,
  Step10Campaigns,
} from "./components/steps";
import {
  useCreateWebsiteSettingMutation,
  useUpdateWebsiteSettingMutation,
  useGetWebsiteSettingDetailsQuery,
  useGetAllCampaignsQuery,
} from "@/store/api/websiteConfigApi";
import { Spinner } from "@/components/shared";
import { useCreateSignedUrlMutation } from "@/store/api/mediaMutationApi";
import { convertToWebP, uploadWithProgress } from "@/helpers";
import { routes } from "@/lib/routes";
import { StepIndicator } from "./components/StepIndicator";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 10;

const DEFAULT_FORM: ISiteSettingsFormData = {
  isActive: true,
  /* Step 1 */
  websiteNameEn: "",
  websiteNameHe: "",
  websiteNameAr: "",
  sloganEn: "",
  sloganHe: "",
  sloganAr: "",
  websiteUrl: "",
  purpose: "MARKETPLACE",
  identifierId: "",

  /* Step 2 */
  logoUrl: "",
  faviconUrl: "",
  bgImageUrl: "",
  specialSymbolUrl: "",

  /* Step 3 */
  desktopVideos: [],
  mobileVideos: [],
  desktopVideoThumbnails: [],
  mobileVideoThumbnails: [],

  /* Step 4 */
  primaryColor: "#0d9488",
  secondaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  fontFamily: "Inter",
  fontSourceUrl: "",
  buttonStyle: "rounded",
  buttonRadius: "8",
  darkModeEnabled: false,

  /* Step 5 */
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  tiktokUrl: "",
  showSocialIcons: true,
  socialLinksNewTab: true,

  /* Step 6 */
  phoneNumber: "",
  whatsappNumber: "",
  whatsappMessageEn: "",
  whatsappMessageHe: "",
  whatsappMessageAr: "",
  email: "",
  supportEmail: "",
  physicalAddress: "",
  googleMapsEmbed: "",
  enableClickToCall: true,
  enableWhatsappChat: false,

  /* Step 7 */
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

  /* Step 8 */
  googleAnalyticsId: "",
  googleTagManagerId: "",
  facebookPixelId: "",
  headerScripts: "",
  footerScripts: "",

  /* Step 9 */
  defaultLanguage: "English",
  multiLanguageEnabled: false,
  timezone: "UTC",
  currency: "USD",
  dateFormat: "",

  /* Step 10 */
  primaryCampId: "",
  campIds: [],
};

/* ------------------------------------------------------------------ */
/*  Completion score                                                    */
/* ------------------------------------------------------------------ */

// Keyed by wizard display step (1–10 as rendered in renderStep)
const STEP_FIELDS: Record<number, (keyof ISiteSettingsFormData)[]> = {
  1: [
    "websiteNameEn",
    "websiteNameHe",
    "websiteNameAr",
    "sloganEn",
    "sloganHe",
    "sloganAr",
    "websiteUrl",
    "identifierId",
  ],
  2: ["primaryCampId", "campIds"],
  3: ["logoUrl", "faviconUrl", "bgImageUrl", "specialSymbolUrl"],
  4: [
    "desktopVideos",
    "mobileVideos",
    "desktopVideoThumbnails",
    "mobileVideoThumbnails",
  ],
  5: ["fontSourceUrl"],
  6: [
    "facebookUrl",
    "instagramUrl",
    "twitterUrl",
    "youtubeUrl",
    "linkedinUrl",
    "tiktokUrl",
  ],
  7: [
    "phoneNumber",
    "whatsappNumber",
    "whatsappMessageEn",
    "whatsappMessageHe",
    "whatsappMessageAr",
    "email",
    "supportEmail",
    "physicalAddress",
    "googleMapsEmbed",
  ],
  8: [
    "metaTitle",
    "metaDescription",
    "metaKeywords",
    "ogTitle",
    "ogDescription",
    "ogImageUrl",
    "twitterCardTitle",
    "twitterCardDescription",
    "twitterCardImageUrl",
    "canonicalUrl",
    "sitemapUrl",
  ],
  9: [
    "googleAnalyticsId",
    "googleTagManagerId",
    "facebookPixelId",
    "headerScripts",
    "footerScripts",
  ],
  10: ["dateFormat"],
};

const isFilled = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const calculateCompletionScore = (data: ISiteSettingsFormData): number => {
  const allFields = Object.values(STEP_FIELDS).flat();
  const filled = allFields.filter((field) => isFilled(data[field])).length;
  return Math.round((filled / allFields.length) * 100);
};

/* ------------------------------------------------------------------ */
/*  Payload builder                                                     */
/* ------------------------------------------------------------------ */

const buildPayload = (data: ISiteSettingsFormData) => ({
  isActive: true,
  score: calculateCompletionScore(data),
  websiteNameEn: data.websiteNameEn,
  websiteNameHe: data.websiteNameHe,
  websiteNameAr: data.websiteNameAr,
  sloganEn: data.sloganEn,
  sloganHe: data.sloganHe,
  sloganAr: data.sloganAr,
  websiteUrl: data.websiteUrl,
  purpose: data.purpose,
  identifierId: data.identifierId,
  logoUrl: data.logoUrl,
  faviconUrl: data.faviconUrl,
  specialSymbolUrl: data.specialSymbolUrl,
  bgImageUrl: data.bgImageUrl,
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
  whatsappMessageEn: data.whatsappMessageEn,
  whatsappMessageHe: data.whatsappMessageHe,
  whatsappMessageAr: data.whatsappMessageAr,
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
  primaryCampId: data.primaryCampId,
  campIds: data.campIds,
});

/* ------------------------------------------------------------------ */
/*  Main Components                                                     */
/* ------------------------------------------------------------------ */
export default function WebsiteConfigPage() {
  const { t } = useTranslation("website_settings");
  const [searchParams] = useSearchParams();

  const websiteId = searchParams.get("websiteId");
  const websiteName = searchParams.get("websiteName");
  const websiteLogo = searchParams.get("websiteLogo");

  const { textPrimary, textSecondary, borderColor, cardClasses, isDark } =
    useThemeClasses();
  const { data: allCampaigns } = useGetAllCampaignsQuery();
  const campaigns = allCampaigns?.filter((c) => c.type !== "MINI_SITE") ?? [];

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ISiteSettingsFormData>(DEFAULT_FORM);
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

  const {
    data: existingSettings,
    isLoading,
    refetch,
  } = useGetWebsiteSettingDetailsQuery(websiteId, { skip: !websiteId });

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
      isActive: true,
      websiteNameEn: d.websiteNameEn ?? "",
      websiteNameHe: d.websiteNameHe ?? "",
      websiteNameAr: d.websiteNameAr ?? "",
      websiteUrl: d.websiteUrl ?? "",
      sloganEn: d.sloganEn ?? "",
      sloganHe: d.sloganHe ?? "",
      sloganAr: d.sloganAr ?? "",
      purpose: d.purpose ?? "MARKETPLACE",
      identifierId: d.identifierId ?? "",

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

      whatsappMessageEn: d.whatsappMessageEn ?? "",
      whatsappMessageHe: d.whatsappMessageHe ?? "",
      whatsappMessageAr: d.whatsappMessageAr ?? "",

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
      primaryCampId: d.primaryCampId ?? "",
      campIds: d.campIds ?? [],
    });
    setUploadStates({});
  }, [existingSettings]);

  /* ---------------- Helpers ---------------- */

  const scrollToTop = () => {
    stepContentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onChange = useCallback(
    (
      field: keyof ISiteSettingsFormData,
      value: string | boolean | string[],
    ) => {
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
    async (field: keyof ISiteSettingsFormData, file: File) => {
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

  const handleFileClear = useCallback((field: keyof ISiteSettingsFormData) => {
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
          _id: id,
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
            v._id === id ? { ...v, url: gcsURL } : v,
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
          prev[field].find((v) => v._id === id)?.isActive ?? false;
        const remaining = prev[field].filter((v) => v._id !== id);
        if (removedWasActive && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isActive: true };
        }
        const url = prev[field].find((v) => v._id === id)?.url;
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
        [field]: prev[field].map((v) => ({ ...v, isActive: v._id === id })),
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
          _id: id,
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
            th._id === id ? { ...th, url: gcsURL } : th,
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
          prev[field].find((th) => th._id === id)?.isActive ?? false;
        const remaining = prev[field].filter((th) => th._id !== id);
        if (removedWasActive && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isActive: true };
        }
        const url = prev[field].find((th) => th._id === id)?.url;
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
        [field]: prev[field].map((th) => ({ ...th, isActive: th._id === id })),
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
    if (!formData.websiteNameEn.trim())
      newErrors.websiteNameEn = t("field_required");
    if (!formData.sloganEn.trim()) newErrors.sloganEn = t("field_required");
    if (!formData.identifierId.trim())
      newErrors.identifierId = t("field_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    goToStep(Math.min(TOTAL_STEPS, currentStep + 1));
  };

  /* ---------------- Save / Publish ---------------- */

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const payload = buildPayload(formData);
      if (existingSettings) {
        await updateWebsiteSetting({
          id: existingSettings._id,
          body: payload,
        }).unwrap();
      } else {
        await createWebsiteSetting(payload).unwrap();
      }
      toast.success(t("settings_published"));
      refetch();
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
          <Step10Campaigns
            campaigns={campaigns}
            formData={formData}
            onChange={onChange}
          />
        );
      case 3:
        return (
          <Step02BrandingMedia {...stepProps} uploadProgress={uploadProgress} />
        );
      case 4:
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
      case 5:
        return <Step04ThemeAppearance {...stepProps} />;
      case 6:
        return <Step05SocialMedia {...stepProps} />;
      case 7:
        return <Step06ContactDetails {...stepProps} />;
      case 8:
        return <Step07SeoMeta {...stepProps} uploadProgress={uploadProgress} />;
      case 9:
        return (
          <Step08Analytics
            formData={formData}
            errors={errors}
            onChange={onChange}
          />
        );
      case 10:
        return <Step09Localization {...stepProps} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 py-6 mx-auto w-full h-full">
      <BackToListBtn navPath={routes.websiteMgmt} />
      {/* Page Header */}
      <section className="flex items-center flex-wrap justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg flex items-center justify-center border border-teal-500">
            {websiteLogo ? (
              <ImageWithFallback
                src={websiteLogo}
                alt={websiteName || "Logo"}
                className="object-contain w-10 h-10 sm:w-12 sm:h-12"
              />
            ) : (
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            )}
          </div>
          <div className="min-w-0">
            <h1
              className={clsx(
                "text-base sm:text-xl font-bold truncate",
                textPrimary,
              )}
            >
              {websiteName && websiteName + " - "} {t("page_title")}
            </h1>
            <p className={clsx("text-xs sm:text-sm", textSecondary)}>
              {t("page_subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {(() => {
            const score = calculateCompletionScore(formData);
            const color =
              score >= 75
                ? "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-700"
                : score >= 40
                  ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700"
                  : "text-red-500 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700";
            return (
              <div
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold",
                  color,
                )}
              >
                <svg
                  viewBox="0 0 32 32"
                  className="w-5 h-5 -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeDasharray={`${(score / 100) * 75.4} 75.4`}
                    strokeLinecap="round"
                  />
                </svg>
                {score}%
              </div>
            );
          })()}
          <PublishButton isLoading={isPublishing} onClick={handlePublish} />
        </div>
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

          <StepIndicator
            isDark={isDark}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />

          {/* Step content */}
          <div
            ref={stepContentRef}
            className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8 relative"
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
