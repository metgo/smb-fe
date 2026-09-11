import clsx from "clsx";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Link2,
  Copy,
  Check,
  Trash2,
  RotateCcw,
  ExternalLink,
  Pencil,
  CopyPlus,
  X,
  Globe,
  Mail,
  Phone,
  Loader,
  ChartLine,
} from "lucide-react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { routes } from "@/lib/routes";
import {
  PageHeader,
  ConfirmDialog,
  WebsiteSelect,
  ImageWithFallback,
} from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useGetAllUtmCampaignsQuery,
  useCreateUtmCampaignMutation,
  useUpdateUtmCampaignMutation,
  useDeleteUtmCampaignMutation,
  type IUtmCampaign,
  type IUtmCampaignPayload,
} from "@/store/api/utmCampaignApi";

// Medium options recommended by Google Analytics for influencer / social promotion.
// https://support.google.com/analytics/answer/10917952
const MEDIUM_OPTIONS = [
  "influencer",
  "social",
  "cpc",
  "email",
  "affiliate",
  "referral",
  "banner",
  "display",
];

// Common referral sources for influencer / social promotion. The field stays a
// free-text combobox so a specific influencer handle can also be entered.
const SOURCE_OPTIONS = [
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "twitter",
  "linkedin",
  "snapchat",
  "pinterest",
  "telegram",
  "whatsapp",
  "newsletter",
  "blog",
];

interface IUtmForm {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  campaignId: string;
  term: string;
  content: string;
}

const EMPTY_FORM: IUtmForm = {
  baseUrl: "",
  source: "",
  medium: "influencer",
  campaign: "",
  campaignId: "",
  term: "",
  content: "",
};

const getHost = (value: string): string => {
  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(normalized).host.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

// Client-side preview of the URL the backend will build on save.
const buildUtmUrl = (form: IUtmForm): string => {
  const trimmedBase = form.baseUrl.trim();
  if (!trimmedBase) return "";

  const normalizedBase = /^https?:\/\//i.test(trimmedBase)
    ? trimmedBase
    : `https://${trimmedBase}`;

  let url: URL;
  try {
    url = new URL(normalizedBase);
  } catch {
    return "";
  }

  const params = url.searchParams;
  const setOrDelete = (key: string, value: string) => {
    const v = value.trim();
    if (v) params.set(key, v);
    else params.delete(key);
  };

  setOrDelete("utm_source", form.source);
  setOrDelete("utm_medium", form.medium);
  setOrDelete("utm_campaign", form.campaign);
  setOrDelete("utm_id", form.campaignId);
  setOrDelete("utm_term", form.term);
  setOrDelete("utm_content", form.content);

  return url.toString();
};

// Human-readable version of a URL: percent-encoded non-ASCII bytes (e.g. Hebrew
// slugs like %D7%98%D7%A2...) are shown as real characters. Used for display
// only — the copied / stored value keeps the valid encoded form.
const toReadableUrl = (rawUrl: string): string => {
  if (!rawUrl) return "";
  try {
    return decodeURI(rawUrl);
  } catch {
    return rawUrl;
  }
};

// Turn whatever the user typed/pasted (encoded or decoded, with or without a
// scheme) into a canonical percent-encoded URL string. Falls back to a trimmed
// string if it cannot be parsed.
const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return trimmed;
  }
};

const buildPayload = (
  form: IUtmForm,
  contact: {
    influencer: string;
    influencerEmail: string;
    influencerPhone: string;
  },
): IUtmCampaignPayload => ({
  // Normalise the destination to a valid, percent-encoded URL for storage,
  // regardless of whether the user pasted encoded or decoded (e.g. Hebrew) text.
  baseUrl: normalizeUrl(form.baseUrl),
  source: form.source.trim(),
  medium: form.medium.trim(),
  campaign: form.campaign.trim(),
  campaignId: form.campaignId.trim() || undefined,
  term: form.term.trim() || undefined,
  content: form.content.trim() || undefined,
  influencer: contact.influencer.trim() || undefined,
  influencerEmail: contact.influencerEmail.trim() || undefined,
  influencerPhone: contact.influencerPhone.trim() || undefined,
});

const UtmBuilderPage = () => {
  const { t } = useTranslation("utm_campaign");
  const navigate = useNavigate();
  const { allWebsites } = useCommon();
  const {
    isDark,
    cardClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();

  const { data: savedLinksResponse, isLoading: isLoadingLinks } =
    useGetAllUtmCampaignsQuery({ page: 1, limit: 100 });
  const [createUtmCampaign, { isLoading: isCreating }] =
    useCreateUtmCampaignMutation();
  const [updateUtmCampaign, { isLoading: isUpdating }] =
    useUpdateUtmCampaignMutation();
  const [deleteUtmCampaign] = useDeleteUtmCampaignMutation();

  const savedLinks = savedLinksResponse?.data ?? [];
  const isSaving = isCreating || isUpdating;

  const [influencer, setInfluencer] = useState("");
  const [influencerEmail, setInfluencerEmail] = useState("");
  const [influencerPhone, setInfluencerPhone] = useState("");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [form, setForm] = useState<IUtmForm>(EMPTY_FORM);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const generatedUrl = useMemo(() => buildUtmUrl(form), [form]);
  const readableUrl = useMemo(
    () => toReadableUrl(generatedUrl),
    [generatedUrl],
  );

  const missingRequired = useMemo(() => {
    const missing: string[] = [];
    if (!form.baseUrl.trim()) missing.push(t("missing_destination_url"));
    if (!form.source.trim()) missing.push(t("missing_source"));
    if (!form.medium.trim()) missing.push(t("missing_medium"));
    if (!form.campaign.trim()) missing.push(t("missing_campaign_name"));
    return missing;
  }, [form, t]);

  const canGenerate = missingRequired.length === 0 && !!generatedUrl;

  // Resolve the website that matches the current base URL (for logos in the list).
  const websiteByHost = useMemo(() => {
    const map = new Map<string, IWebsite>();
    (allWebsites ?? []).forEach((w) => {
      const host = getHost(w.websiteUrl);
      if (host) map.set(host, w);
    });
    return map;
  }, [allWebsites]);

  const updateForm = (patch: Partial<IUtmForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleWebsiteSelect = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
    const website = (allWebsites ?? []).find((w) => w._id === websiteId);
    if (website?.websiteUrl) updateForm({ baseUrl: website.websiteUrl });
  };

  const handleBaseUrlChange = (value: string) => {
    // Show pasted percent-encoded paths (e.g. Hebrew slugs) as real characters.
    const readable = toReadableUrl(value);
    updateForm({ baseUrl: readable });
    const matched = websiteByHost.get(getHost(readable));
    setSelectedWebsiteId(matched?._id ?? "");
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(t("toast_copied"));
      setTimeout(
        () => setCopiedId((curr) => (curr === id ? null : curr)),
        2000,
      );
    } catch {
      toast.error(t("toast_copy_failed"));
    }
  };

  const handleSave = async () => {
    if (!canGenerate) {
      toast.error(
        t("toast_fill_required", { fields: missingRequired.join(", ") }),
      );
      return;
    }
    const payload = buildPayload(form, {
      influencer,
      influencerEmail,
      influencerPhone,
    });

    try {
      if (editingId) {
        await updateUtmCampaign({ id: editingId, body: payload }).unwrap();
        toast.success(t("toast_updated"));
      } else {
        await createUtmCampaign(payload).unwrap();
        toast.success(t("toast_saved"));
      }
      resetForm();
    } catch {
      toast.error(
        editingId ? t("toast_update_failed") : t("toast_save_failed"),
      );
    }
  };

  const loadLinkIntoForm = (link: IUtmCampaign) => {
    setSelectedWebsiteId(websiteByHost.get(getHost(link.baseUrl))?._id ?? "");
    setForm({
      baseUrl: toReadableUrl(link.baseUrl),
      source: link.source,
      medium: link.medium,
      campaign: link.campaign,
      campaignId: link.campaignId ?? "",
      term: link.term ?? "",
      content: link.content ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (link: IUtmCampaign) => {
    setEditingId(link._id);
    setInfluencer(link.influencer ?? "");
    setInfluencerEmail(link.influencerEmail ?? "");
    setInfluencerPhone(link.influencerPhone ?? "");
    loadLinkIntoForm(link);
  };

  // Reuse the destination + params for another influencer: load everything as a
  // NEW entry (no editingId) and clear the fields that must differ per influencer.
  const handleDuplicate = (link: IUtmCampaign) => {
    setEditingId(null);
    setInfluencer("");
    setInfluencerEmail("");
    setInfluencerPhone("");
    loadLinkIntoForm(link);
    toast.info(t("toast_duplicated"));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setInfluencer("");
    setInfluencerEmail("");
    setInfluencerPhone("");
    setSelectedWebsiteId("");
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUtmCampaign(deleteTarget).unwrap();
      if (editingId === deleteTarget) resetForm();
      toast.success(t("toast_removed"));
    } catch {
      toast.error(t("toast_remove_failed"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const fieldLabel = clsx(
    "text-[13px] font-medium mb-1.5 flex items-center gap-1",
    textSecondary,
  );
  const optionalTag = clsx("text-[11px] font-normal", textTertiary);
  const helpText = clsx(
    "text-[11px] font-normal italic mt-1 leading-relaxed",
    textTertiary,
  );
  const inputClass = clsx(
    "h-10",
    isDark
      ? "bg-gray-800 border-gray-700 text-white"
      : "bg-white border-gray-300 text-gray-900",
  );
  const comboClass = clsx(
    "w-full h-10 rounded-md border px-3 text-sm outline-none transition-colors",
    "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30",
    isDark
      ? "bg-gray-800 border-gray-700 text-white"
      : "bg-white border-gray-300 text-gray-900",
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3
      className={clsx(
        "text-[11px] font-semibold uppercase tracking-wider mb-3",
        textTertiary,
      )}
    >
      {children}
    </h3>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto xl:overflow-hidden pt-10 md:pt-0">
      <div className={clsx("shrink-0 z-10 relative")}>
        <PageHeader
          title={t("page_title")}
          h1Gradient="text-transparent bg-gradient-to-r from-violet-500 to-purple-500"
          description={t("page_description")}
        />
        <button
          type="button"
          onClick={() => navigate(routes.analyticsDashboard)}
          className={clsx(
            "absolute top-0 md:top-6 inset-e-0 inline-flex items-center gap-1.5 text-sm px-3 h-9 rounded-md border transition-colors cursor-pointer ",
            textSecondary,
            isDark
              ? "hover:bg-gray-800 text-green-500 border-green-500"
              : "hover:bg-gray-50 text-green-700 border-green-700",
          )}
        >
          <ChartLine className="w-4 h-4" />
          <span className="hidden md:block">
            {t("view_analytics_dashboard")}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-2 pb-10 xl:pb-0 xl:flex-1 xl:min-h-0">
        {/* Builder form */}
        <div
          className={clsx(
            "xl:col-span-3 rounded-xl p-6 xl:overflow-y-auto",
            cardClasses,
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={clsx("text-lg font-semibold", textPrimary)}>
                {editingId ? t("form_title_edit") : t("form_title_new")}
              </h2>
              <p className={clsx("text-xs mt-0.5", textTertiary)}>
                {t("required_hint")}
              </p>
            </div>
            {editingId && (
              <span
                className={clsx(
                  "text-xs px-2.5 py-1 rounded-full font-medium",
                  isDark
                    ? "bg-violet-700/40 text-violet-300"
                    : "bg-violet-100 text-violet-700",
                )}
              >
                {t("editing_badge")}
              </span>
            )}
          </div>

          {/* ---------- Destination ---------- */}
          <SectionTitle>{t("section_destination")}</SectionTitle>

          <div className="mb-2 space-y-4 grid grid-cols-2 gap-4">
            {!!(allWebsites ?? []).length && (
              <div>
                <label className={fieldLabel}>
                  <Globe className="w-3.5 h-3.5" />
                  {t("website_label")}
                  <span className={optionalTag}>{t("website_hint")}</span>
                </label>
                <WebsiteSelect
                  websites={allWebsites}
                  value={selectedWebsiteId}
                  onChange={handleWebsiteSelect}
                  isClearable
                  placeholder={t("website_placeholder")}
                />
              </div>
            )}

            <div>
              <label className={fieldLabel}>
                {t("destination_url_label")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                placeholder={t("destination_url_placeholder")}
                className={inputClass}
              />
            </div>
          </div>

          {/* ---------- Campaign parameters ---------- */}
          <SectionTitle>{t("section_parameters")}</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Source */}
            <div>
              <label className={fieldLabel}>
                {t("source_label")} <span className="text-red-500">*</span>
              </label>
              <input
                list="utm-source-options"
                value={form.source}
                onChange={(e) => updateForm({ source: e.target.value })}
                placeholder={t("source_placeholder")}
                className={comboClass}
              />
              <datalist id="utm-source-options">
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <p className={helpText}>{t("source_help")}</p>
            </div>

            {/* Medium */}
            <div>
              <label className={fieldLabel}>
                {t("medium_label")} <span className="text-red-500">*</span>
              </label>
              <input
                list="utm-medium-options"
                value={form.medium}
                onChange={(e) => updateForm({ medium: e.target.value })}
                placeholder={t("medium_placeholder")}
                className={comboClass}
              />
              <datalist id="utm-medium-options">
                {MEDIUM_OPTIONS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              <p className={helpText}>{t("medium_help")}</p>
            </div>

            {/* Campaign name */}
            <div>
              <label className={fieldLabel}>
                {t("campaign_name_label")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.campaign}
                onChange={(e) => updateForm({ campaign: e.target.value })}
                placeholder={t("campaign_name_placeholder")}
                className={inputClass}
              />
              <p className={helpText}>{t("campaign_name_help")}</p>
            </div>

            {/* Campaign ID */}
            <div>
              <label className={fieldLabel}>
                {t("campaign_id_label")}{" "}
                <span className={optionalTag}>{t("optional")}</span>
              </label>
              <Input
                value={form.campaignId}
                onChange={(e) => updateForm({ campaignId: e.target.value })}
                placeholder={t("campaign_id_placeholder")}
                className={inputClass}
              />
              <p className={helpText}>{t("campaign_id_help")}</p>
            </div>

            {/* Term */}
            <div>
              <label className={fieldLabel}>
                {t("term_label")}{" "}
                <span className={optionalTag}>{t("optional")}</span>
              </label>
              <Input
                value={form.term}
                onChange={(e) => updateForm({ term: e.target.value })}
                placeholder={t("term_placeholder")}
                className={inputClass}
              />
              <p className={helpText}>{t("term_help")}</p>
            </div>

            {/* Content */}
            <div>
              <label className={fieldLabel}>
                {t("content_label")}{" "}
                <span className={optionalTag}>{t("optional")}</span>
              </label>
              <Input
                value={form.content}
                onChange={(e) => updateForm({ content: e.target.value })}
                placeholder={t("content_placeholder")}
                className={inputClass}
              />
              <p className={helpText}>{t("content_help")}</p>
            </div>
          </div>

          {/* ---------- Influencer ---------- */}
          <SectionTitle>{t("section_influencer")}</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={fieldLabel}>
                {t("influencer_name_label")}{" "}
                <span className={optionalTag}>{t("optional")}</span>
              </label>
              <Input
                value={influencer}
                onChange={(e) => setInfluencer(e.target.value)}
                placeholder={t("influencer_name_placeholder")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={fieldLabel}>
                <Mail className="w-3.5 h-3.5" />
                {t("influencer_email_label")}{" "}
                <span className={optionalTag}>{t("optional")}</span>
              </label>
              <Input
                type="email"
                value={influencerEmail}
                onChange={(e) => setInfluencerEmail(e.target.value)}
                placeholder={t("influencer_email_placeholder")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={fieldLabel}>
                <Phone className="w-3.5 h-3.5" />
                {t("influencer_phone_label")}{" "}
                <span className={optionalTag}>{t("optional")}</span>
              </label>
              <Input
                type="tel"
                value={influencerPhone}
                onChange={(e) => setInfluencerPhone(e.target.value)}
                placeholder={t("influencer_phone_placeholder")}
                className={inputClass}
              />
            </div>
          </div>
          <p className={helpText}>{t("influencer_note")}</p>

          <div
            className={clsx(
              "flex items-center gap-3 mt-6 pt-5 border-t",
              borderColor,
            )}
          >
            <Button
              type="button"
              onClick={handleSave}
              variant="default"
              disabled={!canGenerate || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : editingId ? (
                <Check className="w-4 h-4" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              {editingId ? t("update") : t("save")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={resetForm}
              className="gap-2"
            >
              {editingId ? (
                <X className="w-4 h-4" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              {editingId ? t("cancel_edit") : t("reset")}
            </Button>
          </div>
        </div>

        {/* Preview + saved links */}
        <div className="xl:col-span-2 flex flex-col gap-2 xl:min-h-0">
          <div className={clsx("rounded-xl p-2 shrink-0", cardClasses)}>
            <div className="flex items-center flex-wrap gap-2 ">
              <h2 className={clsx("text-lg font-semibold mb-3", textPrimary)}>
                {t("generated_url_title")}
              </h2>

              {missingRequired.length > 0 && (
                <p
                  className={clsx(
                    "text-xs mb-2 px-2 rounded-md",
                    isDark
                      ? "bg-amber-500/10 text-amber-300"
                      : "bg-amber-50 text-amber-700",
                  )}
                >
                  {t("still_needed", { fields: missingRequired.join(", ") })}
                </p>
              )}
            </div>

            <div
              className={clsx(
                "rounded-md border p-3 text-sm break-all font-mono min-h-20",
                borderColor,
                isDark
                  ? "bg-gray-900 text-gray-200"
                  : "bg-gray-50 text-gray-800",
              )}
            >
              {readableUrl ? (
                <>
                  {readableUrl.split(/([?&])/).map((part, i) =>
                    part === "?" || part === "&" ? (
                      <span key={i} className="text-teal-500">
                        {part}
                      </span>
                    ) : part.startsWith("utm_") ? (
                      <span key={i} className="text-violet-500">
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    ),
                  )}
                </>
              ) : (
                <span className={textTertiary}>{t("generated_url_empty")}</span>
              )}
            </div>
            {readableUrl && readableUrl !== generatedUrl && (
              <p className={clsx("text-[11px] mt-1.5", textTertiary)}>
                {t("decoded_note")}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3">
              <Button
                type="button"
                onClick={() => copyToClipboard(generatedUrl, "preview")}
                disabled={!canGenerate}
                className="gap-2"
              >
                {copiedId === "preview" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {t("copy_link")}
              </Button>
              {canGenerate && (
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    "inline-flex items-center gap-1.5 text-sm px-3 h-9 rounded-md border transition-colors",
                    borderColor,
                    textSecondary,
                    isDark ? "hover:bg-gray-800" : "hover:bg-gray-50",
                  )}
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("open")}
                </a>
              )}
            </div>
          </div>

          <div
            className={clsx(
              "rounded-xl p-2 flex flex-col h-[60vh]",
              cardClasses,
            )}
          >
            <h2
              className={clsx(
                "text-lg font-semibold mb-4 shrink-0",
                textPrimary,
              )}
            >
              {t("saved_links_title")}
              <span
                className={clsx("ml-1.5 text-sm font-normal", textTertiary)}
              >
                ({savedLinks.length})
              </span>
            </h2>

            {isLoadingLinks ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-teal-500" />
              </div>
            ) : savedLinks.length === 0 ? (
              <div
                className={clsx(
                  "flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed",
                  borderColor,
                )}
              >
                <Link2 className={clsx("w-8 h-8 mb-2", textTertiary)} />
                <p className={clsx("text-sm", textSecondary)}>
                  {t("no_links_title")}
                </p>
                <p className={clsx("text-xs mt-1", textTertiary)}>
                  {t("no_links_description")}
                </p>
              </div>
            ) : (
              <ul className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-1 min-h-0">
                {savedLinks.map((link) => {
                  const website = websiteByHost.get(getHost(link.baseUrl));
                  return (
                    <li
                      key={link._id}
                      className={clsx(
                        "rounded-lg border p-3.5 transition-colors",
                        editingId === link._id
                          ? "border-violet-500 ring-1 ring-violet-500/30"
                          : borderColor,
                        isDark ? "bg-gray-900/40" : "bg-gray-50",
                      )}
                    >
                      <div className="">
                        <div className="flex items-center justify-between ">
                          <div className="flex gap-2">
                            {website ? (
                              <ImageWithFallback
                                src={website.logo}
                                alt={website.name}
                                className="w-8 h-8 rounded object-contain shrink-0 mt-0.5"
                              />
                            ) : (
                              <span
                                className={clsx(
                                  "w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5",
                                  isDark ? "bg-gray-800" : "bg-gray-200",
                                )}
                              >
                                <Globe className="w-4 h-4 text-gray-400" />
                              </span>
                            )}
                            <div>
                              {link.influencer && (
                                <p
                                  className={clsx(
                                    "text-sm font-semibold truncate",
                                    textPrimary,
                                  )}
                                >
                                  {link.influencer}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    link.campaign,
                                    `campaign:${link._id}`,
                                  )
                                }
                                title={t("copy_campaign_name")}
                                className={clsx(
                                  "group inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                                  isDark
                                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                                )}
                              >
                                <span
                                  className={clsx("shrink-0", textTertiary)}
                                >
                                  {t("campaign_name_short")}:
                                </span>
                                <span className="truncate font-semibold">
                                  {link.campaign}
                                </span>
                                {copiedId === `campaign:${link._id}` ? (
                                  <Check className="w-3 h-3 shrink-0" />
                                ) : (
                                  <Copy className="w-3 h-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDuplicate(link)}
                              title={t("action_duplicate")}
                              className={clsx(
                                "p-1.5 rounded-md transition-colors",
                                isDark
                                  ? "hover:bg-gray-800 text-gray-300"
                                  : "hover:bg-gray-200 text-gray-600",
                              )}
                            >
                              <CopyPlus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(link)}
                              title={t("action_edit")}
                              className={clsx(
                                "p-1.5 rounded-md transition-colors",
                                isDark
                                  ? "hover:bg-gray-800 text-gray-300"
                                  : "hover:bg-gray-200 text-gray-600",
                              )}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(link._id)}
                              title={t("action_delete")}
                              className={clsx(
                                "p-1.5 rounded-md transition-colors",
                                isDark
                                  ? "hover:bg-red-500/10 text-red-400"
                                  : "hover:bg-red-50 text-red-500",
                              )}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-x-2 flex-wrap">
                          {(link.influencerEmail || link.influencerPhone) && (
                            <div
                              className={clsx(
                                "flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]",
                                textTertiary,
                              )}
                            >
                              {link.influencerEmail && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {link.influencerEmail}
                                </span>
                              )}
                              {link.influencerPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {link.influencerPhone}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <p
                        className={clsx(
                          "text-[11px] mt-2 break-all font-semibold px-2 py-1.5 rounded italic",
                          isDark
                            ? "bg-gray-900 text-gray-200"
                            : "bg-white text-gray-500 border border-gray-100",
                        )}
                      >
                        {toReadableUrl(link.url)}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(link.url, link._id)}
                          title={t("action_copy")}
                          className={clsx(
                            "p-1 rounded-md transition-colors ms-4 ",
                            isDark
                              ? "hover:bg-gray-800 text-gray-300"
                              : "hover:bg-gray-200 text-gray-600",
                          )}
                        >
                          {copiedId === link._id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("delete_dialog_title")}
        message={t("delete_dialog_message")}
        variant="danger"
        confirmText={t("delete_confirm")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UtmBuilderPage;
