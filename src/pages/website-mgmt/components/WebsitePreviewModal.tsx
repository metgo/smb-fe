import clsx from "clsx";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Gift,
  ImageIcon,
  Video,
  Palette,
  Share2,
  Phone,
  Search,
  BarChart2,
  Globe,
  ExternalLink,
  Minus,
  Check,
  Type,
  MessageSquareQuote,
  Link2,
  Target,
  Fingerprint,
  CircleDollarSign,
  Megaphone,
  Star,
  Image as ImageSquare,
  Droplet,
  Baseline,
  MousePointerClick,
  CornerDownRight,
  Moon,
  Music2,
  Play,
  Eye,
  ExternalLink as ExternalLinkAlt,
  MessageCircle,
  Mail,
  LifeBuoy,
  MapPin,
  Map,
  PhoneCall,
  Tag,
  Hash,
  FileText,
  Link as LinkIcon,
  Code2,
  Languages,
  Clock,
  CalendarDays,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ModalWrapper } from "@/components/wrapper";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetWebsiteSettingDetailsQuery } from "@/store/api/websiteConfigApi";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  websiteId: string;
  websiteName?: string;
  websiteLogo?: string;
  onClose: () => void;
}

type TabId =
  | "general"
  | "campaigns"
  | "branding"
  | "videos"
  | "theme"
  | "social"
  | "contact"
  | "seo"
  | "analytics"
  | "localization";

interface TabMeta {
  id: TabId;
  label: string;
  Icon: LucideIcon;
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

/** Small uppercase caption with a leading icon, shared by every field type. */
function FieldLabel({ label, Icon }: { label: string; Icon?: LucideIcon }) {
  const { textTertiary } = useThemeClasses();
  return (
    <span
      className={clsx(
        "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide",
        textTertiary,
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {label}
    </span>
  );
}

/** A single label / value pair rendered in read-only style. */
function Field({
  label,
  value,
  isLink,
  fullWidth,
  Icon,
}: {
  label: string;
  value?: string | number | null;
  isLink?: boolean;
  fullWidth?: boolean;
  Icon?: LucideIcon;
}) {
  const { textTertiary, textPrimary } = useThemeClasses();
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");

  return (
    <div className={clsx("flex flex-col gap-1", fullWidth && "sm:col-span-2")}>
      <FieldLabel label={label} Icon={Icon} />
      {isEmpty ? (
        <span
          className={clsx(
            "text-sm inline-flex items-center gap-1",
            textTertiary,
          )}
        >
          <Minus className="w-3.5 h-3.5" />
        </span>
      ) : isLink && typeof value === "string" ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 break-all"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          {value}
        </a>
      ) : (
        <span className={clsx("text-sm wrap-break-word", textPrimary)}>
          {value}
        </span>
      )}
    </div>
  );
}

/** Boolean shown as an on/off chip. */
function BoolField({
  label,
  value,
  Icon,
}: {
  label: string;
  value?: boolean;
  Icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel label={label} Icon={Icon} />
      <span
        className={clsx(
          "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
          value
            ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
            : "bg-gray-500/15 text-gray-500 dark:text-gray-400",
        )}
      >
        {value ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        {value ? "On" : "Off"}
      </span>
    </div>
  );
}

/** Section grouping fields under a subtle heading. */
function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const { textSecondary, borderColor } = useThemeClasses();
  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h4
          className={clsx(
            "text-xs font-bold uppercase tracking-wider pb-2 border-b",
            textSecondary,
            borderColor,
          )}
        >
          {title}
        </h4>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

/** Image preview tile. */
function ImageField({
  label,
  url,
  Icon = ImageIcon,
}: {
  label: string;
  url?: string;
  Icon?: LucideIcon;
}) {
  const { textTertiary, borderColor, bgSecondary } = useThemeClasses();
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} Icon={Icon} />
      <div
        className={clsx(
          "h-24 w-full rounded-lg border flex items-center justify-center overflow-hidden",
          borderColor,
          bgSecondary,
        )}
      >
        {url ? (
          <ImageWithFallback
            src={url}
            alt={label}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageIcon className={clsx("w-6 h-6", textTertiary)} />
        )}
      </div>
    </div>
  );
}

function ColorSwatch({
  label,
  value,
  Icon = Droplet,
}: {
  label: string;
  value?: string;
  Icon?: LucideIcon;
}) {
  const { textPrimary, borderColor } = useThemeClasses();
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel label={label} Icon={Icon} />
      <span
        className={clsx("inline-flex items-center gap-2 text-sm", textPrimary)}
      >
        <span
          className={clsx("w-5 h-5 rounded-md border shrink-0", borderColor)}
          style={{ background: value || "transparent" }}
        />
        {value || "—"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WebsitePreviewModal({
  websiteId,
  websiteName,
  websiteLogo,
  onClose,
}: Props) {
  const { t } = useTranslation("website_settings");
  const { t: tc } = useTranslation("common");
  const { textPrimary, textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();

  const { data, isLoading, isFetching } =
    useGetWebsiteSettingDetailsQuery(websiteId);

  const [activeTab, setActiveTab] = useState<TabId>("general");

  const tabs: TabMeta[] = [
    { id: "general", label: t("general"), Icon: Settings },
    { id: "campaigns", label: t("campaigns_title"), Icon: Gift },
    { id: "branding", label: t("step_branding"), Icon: ImageIcon },
    { id: "videos", label: t("step_videos"), Icon: Video },
    { id: "theme", label: t("step_theme"), Icon: Palette },
    { id: "social", label: t("step_social"), Icon: Share2 },
    { id: "contact", label: t("step_contact"), Icon: Phone },
    { id: "seo", label: t("step_seo"), Icon: Search },
    { id: "analytics", label: t("step_analytics"), Icon: BarChart2 },
    { id: "localization", label: t("step_language"), Icon: Globe },
  ];

  const loading = isLoading || isFetching;
  const displayName = data?.websiteNameEn || websiteName || "";
  const displayLogo = data?.logoUrl || websiteLogo || "";

  const renderTab = () => {
    if (!data) return null;

    switch (activeTab) {
      case "general":
        return (
          <Section>
            <Field
              label={t("website_name_en_placeholder")}
              value={data.websiteNameEn}
              Icon={Type}
            />
            <Field
              label={t("website_name_he_placeholder")}
              value={data.websiteNameHe}
              Icon={Type}
            />
            <Field
              label={t("website_name_ar_placeholder")}
              value={data.websiteNameAr}
              Icon={Type}
            />
            <Field
              label={t("slogan_en_placeholder")}
              value={data.sloganEn}
              Icon={MessageSquareQuote}
            />
            <Field
              label={t("slogan_he_placeholder")}
              value={data.sloganHe}
              Icon={MessageSquareQuote}
            />
            <Field
              label={t("slogan_ar_placeholder")}
              value={data.sloganAr}
              Icon={MessageSquareQuote}
            />
            <Field
              label={t("website_url")}
              value={data.websiteUrl}
              isLink
              Icon={Link2}
            />
            <Field label={t("purpose")} value={data.purpose} Icon={Target} />
            <Field
              label={t("identifier_id")}
              value={data.identifierId}
              Icon={Fingerprint}
            />
            <Field
              label={t("platform_charge")}
              value={data.platformCharge}
              Icon={CircleDollarSign}
            />
          </Section>
        );

      case "campaigns":
        return (
          <Section>
            <Field
              label={t("campaigns_primary_title")}
              value={
                data.primaryCampIds?.length
                  ? data.primaryCampIds.join(", ")
                  : ""
              }
              fullWidth
              Icon={Star}
            />
            <Field
              label={t("campaigns_title")}
              value={data.campIds?.length ? data.campIds.join(", ") : ""}
              fullWidth
              Icon={Megaphone}
            />
          </Section>
        );

      case "branding":
        return (
          <Section>
            <ImageField
              label={t("website_logo")}
              url={data.logoUrl}
              Icon={ImageSquare}
            />
            <ImageField
              label={t("favicon")}
              url={data.faviconUrl}
              Icon={Star}
            />
            <ImageField
              label={t("special_symbole")}
              url={data.specialSymbolUrl}
              Icon={Star}
            />
            <ImageField
              label={t("background_image")}
              url={data.bgImageUrl}
              Icon={ImageSquare}
            />
          </Section>
        );

      case "videos":
        return (
          <div className="flex flex-col gap-6">
            <VideoList title={t("desktop_videos")} items={data.desktopVideos} />
            <VideoList title={t("mobile_videos")} items={data.mobileVideos} />
            <VideoList
              title={t("desktop_video_thumbnails")}
              items={data.desktopVideoThumbnails}
              isImage
            />
            <VideoList
              title={t("mobile_video_thumbnails")}
              items={data.mobileVideoThumbnails}
              isImage
            />
          </div>
        );

      case "theme":
        return (
          <Section>
            <ColorSwatch label={t("primary_color")} value={data.primaryColor} />
            <ColorSwatch
              label={t("secondary_color")}
              value={data.secondaryColor}
            />
            <ColorSwatch
              label={t("background_color")}
              value={data.backgroundColor}
            />
            <Field
              label={t("font_family")}
              value={data.fontFamily}
              Icon={Baseline}
            />
            <Field
              label={t("font_source_url")}
              value={data.fontSourceUrl}
              isLink
              fullWidth
              Icon={Link2}
            />
            <Field
              label={t("button_style")}
              value={data.buttonStyle}
              Icon={MousePointerClick}
            />
            <Field
              label={t("btn_custom")}
              value={data.buttonRadius}
              Icon={CornerDownRight}
            />
            <BoolField
              label={t("dark_mode")}
              value={data.darkModeEnabled}
              Icon={Moon}
            />
          </Section>
        );

      case "social":
        return (
          <Section>
            <Field
              label={t("facebook_url")}
              value={data.facebookUrl}
              isLink
              Icon={Share2}
            />
            <Field
              label={t("instagram_url")}
              value={data.instagramUrl}
              isLink
              Icon={ImageSquare}
            />
            <Field
              label={t("twitter_url")}
              value={data.twitterUrl}
              isLink
              Icon={MessageCircle}
            />
            <Field
              label={t("youtube_url")}
              value={data.youtubeUrl}
              isLink
              Icon={Video}
            />
            <Field
              label={t("linkedin_url")}
              value={data.linkedinUrl}
              isLink
              Icon={Link2}
            />
            <Field
              label={t("tiktok_url")}
              value={data.tiktokUrl}
              isLink
              Icon={Music2}
            />
            <BoolField
              label={t("show_social_icons")}
              value={data.showSocialIcons}
              Icon={Eye}
            />
            <BoolField
              label={t("open_links_new_tab")}
              value={data.socialLinksNewTab}
              Icon={ExternalLinkAlt}
            />
          </Section>
        );

      case "contact":
        return (
          <Section>
            <Field
              label={t("phone_number")}
              value={data.phoneNumber}
              Icon={Phone}
            />
            <Field
              label={t("whatsapp_number")}
              value={data.whatsappNumber}
              Icon={MessageCircle}
            />
            <Field label={t("email_address")} value={data.email} Icon={Mail} />
            <Field
              label={t("support_email")}
              value={data.supportEmail}
              Icon={LifeBuoy}
            />
            <Field
              label={t("physical_address")}
              value={data.physicalAddress}
              fullWidth
              Icon={MapPin}
            />
            <Field
              label={t("google_maps_embed")}
              value={data.googleMapsEmbed}
              fullWidth
              Icon={Map}
            />
            <Field
              label={`${t("whatsapp_message")} (EN)`}
              value={data.whatsappMessageEn}
              Icon={MessageCircle}
            />
            <Field
              label={`${t("whatsapp_message")} (HE)`}
              value={data.whatsappMessageHe}
              Icon={MessageCircle}
            />
            <Field
              label={`${t("whatsapp_message")} (AR)`}
              value={data.whatsappMessageAr}
              Icon={MessageCircle}
            />
            <BoolField
              label={t("enable_click_to_call")}
              value={data.enableClickToCall}
              Icon={PhoneCall}
            />
            <BoolField
              label={t("enable_whatsapp_chat")}
              value={data.enableWhatsappChat}
              Icon={MessageCircle}
            />
          </Section>
        );

      case "seo":
        return (
          <div className="flex flex-col gap-6">
            <Section title={t("basic_meta")}>
              <Field
                label={t("meta_title")}
                value={data.metaTitle}
                Icon={Type}
              />
              <Field
                label={t("meta_keywords")}
                value={data.metaKeywords}
                Icon={Tag}
              />
              <Field
                label={t("meta_description")}
                value={data.metaDescription}
                fullWidth
                Icon={FileText}
              />
              <Field
                label={t("canonical_url")}
                value={data.canonicalUrl}
                isLink
                fullWidth
                Icon={LinkIcon}
              />
            </Section>
            <Section title={t("open_graph")}>
              <Field label={t("og_title")} value={data.ogTitle} Icon={Type} />
              <Field
                label={t("og_description")}
                value={data.ogDescription}
                Icon={FileText}
              />
              <ImageField label={t("og_image")} url={data.ogImageUrl} />
            </Section>
            <Section title={t("twitter_card")}>
              <Field
                label={t("twitter_card_title")}
                value={data.twitterCardTitle}
                Icon={Type}
              />
              <Field
                label={t("twitter_card_description")}
                value={data.twitterCardDescription}
                Icon={FileText}
              />
              <ImageField
                label={t("twitter_card_image")}
                url={data.twitterCardImageUrl}
              />
            </Section>
            <Section title={t("robots_sitemap")}>
              <Field
                label={t("robots_txt")}
                value={data.robotsTxt}
                fullWidth
                Icon={FileText}
              />
              <Field
                label={t("sitemap_url")}
                value={data.sitemapUrl}
                isLink
                fullWidth
                Icon={LinkIcon}
              />
            </Section>
          </div>
        );

      case "analytics":
        return (
          <div className="flex flex-col gap-6">
            <Section>
              <Field
                label={t("google_analytics_id")}
                value={data.googleAnalyticsId}
                Icon={BarChart2}
              />
              <Field
                label={t("google_ads_conversion_tracking_id")}
                value={data.googleAdsConvTrackId}
                Icon={Target}
              />
              <Field
                label={t("enable_widget_id")}
                value={data.enableWidgetId}
                Icon={Hash}
              />
              <Field label={t("hotjar_id")} value={data.hotjarId} Icon={Hash} />
              <Field
                label={t("facebook_pixel_id")}
                value={data.facebookPixelId}
                Icon={Hash}
              />
            </Section>
            <Section title={t("custom_scripts")}>
              <Field
                label={t("header_scripts")}
                value={data.headerScripts}
                fullWidth
                Icon={Code2}
              />
              <Field
                label={t("footer_scripts")}
                value={data.footerScripts}
                fullWidth
                Icon={Code2}
              />
            </Section>
          </div>
        );

      case "localization":
        return (
          <Section>
            <Field
              label={t("default_language")}
              value={data.defaultLanguage}
              Icon={Languages}
            />
            <Field label={t("timezone")} value={data.timezone} Icon={Clock} />
            <Field
              label={t("currency")}
              value={data.currency}
              Icon={CircleDollarSign}
            />
            <Field
              label={t("date_format")}
              value={data.dateFormat}
              Icon={CalendarDays}
            />
            <BoolField
              label={t("multi_language_support")}
              value={data.multiLanguageEnabled}
              Icon={Languages}
            />
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <ModalWrapper onClose={onClose} showSpinner={loading} maxWidth="max-w-4xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={clsx(
            "flex items-center gap-3 px-5 py-4 border-b shrink-0",
            borderColor,
          )}
        >
          <div
            className={clsx(
              "w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center overflow-hidden",
              "border-teal-500/50",
              isDark ? "bg-gray-800" : "bg-gray-50",
            )}
          >
            {displayLogo ? (
              <ImageWithFallback
                src={displayLogo}
                alt={displayName}
                className="w-full h-full object-contain"
              />
            ) : (
              <Globe className="w-5 h-5 text-teal-600" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className={clsx("text-base font-bold truncate", textPrimary)}>
              {displayName || tc("details")}
            </h3>
            <p className={clsx("text-xs truncate", textSecondary)}>
              {data?.websiteUrl || t("page_subtitle")}
            </p>
          </div>
          {typeof data?.platformCharge === "number" && (
            <span
              className={clsx(
                "ml-auto shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full",
                "bg-teal-500/15 text-teal-600 dark:text-teal-400",
              )}
            >
              {data.purpose}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div
          className={clsx(
            "flex gap-1 px-3 py-2 overflow-x-auto border-b shrink-0",
            borderColor,
          )}
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  isActive
                    ? "bg-teal-500 text-white shadow-sm"
                    : clsx(
                        textTertiary,
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100",
                      ),
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
          {!loading && !data ? (
            <div
              className={clsx(
                "flex flex-col items-center justify-center py-20 gap-2",
                textTertiary,
              )}
            >
              <Globe className="w-10 h-10" />
              <p className="text-sm">{t("no_websites_found")}</p>
            </div>
          ) : (
            renderTab()
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ------------------------------------------------------------------ */
/*  Video / thumbnail list                                             */
/* ------------------------------------------------------------------ */

/** Poster-style video tile: click the play button to load native controls. */
function VideoPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    // Wait for the render that adds `controls` before requesting playback.
    requestAnimationFrame(() => void videoRef.current?.play());
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain"
        controls={playing}
        preload="metadata"
        playsInline
      />
      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40 cursor-pointer"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play
              className="w-5 h-5 translate-x-0.5 text-gray-900"
              fill="currentColor"
            />
          </span>
        </button>
      )}
    </div>
  );
}

function VideoList({
  title,
  items,
  isImage,
}: {
  title: string;
  items?: (VideoItem | ThumnailItem)[];
  isImage?: boolean;
}) {
  const { textSecondary, textTertiary, borderColor, bgSecondary } =
    useThemeClasses();

  return (
    <div className="flex flex-col gap-3">
      <h4
        className={clsx(
          "text-xs font-bold uppercase tracking-wider pb-2 border-b",
          textSecondary,
          borderColor,
        )}
      >
        {title}
      </h4>
      {!items || items.length === 0 ? (
        <p className={clsx("text-sm", textTertiary)}>—</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item._id}
              className={clsx(
                "rounded-lg border overflow-hidden flex flex-col",
                borderColor,
                bgSecondary,
              )}
            >
              <div className="h-28 flex items-center justify-center overflow-hidden bg-black">
                {isImage ? (
                  <ImageWithFallback
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <VideoPlayer src={item.url} />
                )}
              </div>
              <div className="px-2 py-1.5 flex items-center justify-between gap-2">
                <span
                  className={clsx("text-[11px] truncate", textTertiary)}
                  title={item.name}
                >
                  {item.name}
                </span>
                {item.isActive && (
                  <span className="shrink-0 text-[10px] font-bold text-teal-500">
                    ●
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
