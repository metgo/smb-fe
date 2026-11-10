import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useCommon } from "@/hooks/useCommon";
import {
  useGetAllUtmCampaignsQuery,
  useCreateUtmCampaignMutation,
  useUpdateUtmCampaignMutation,
  useDeleteUtmCampaignMutation,
  type IUtmCampaign,
} from "@/store/api/utmCampaignApi";
import { EMPTY_CONTACT, EMPTY_FORM } from "../constants";
import type { IInfluencerContact, IUtmForm } from "../types";
import {
  buildPayload,
  buildUtmUrl,
  generateCampaignId,
  getHost,
  parseUtmUrl,
  randomIdSuffix,
  toReadableUrl,
} from "../utils/utm";

// All state and actions of the UTM builder page: the form, the influencer
// contact, the saved links and their create / update / delete calls.
export const useUtmBuilder = () => {
  const { t } = useTranslation("utm_campaign");
  const { allWebsites } = useCommon();

  const { data: savedLinksResponse, isLoading: isLoadingLinks } =
    useGetAllUtmCampaignsQuery({ page: 1, limit: 100 });
  const [createUtmCampaign, { isLoading: isCreating }] =
    useCreateUtmCampaignMutation();
  const [updateUtmCampaign, { isLoading: isUpdating }] =
    useUpdateUtmCampaignMutation();
  const [deleteUtmCampaign] = useDeleteUtmCampaignMutation();

  const savedLinks = useMemo(
    () => savedLinksResponse?.data ?? [],
    [savedLinksResponse],
  );
  const isSaving = isCreating || isUpdating;

  const [form, setForm] = useState<IUtmForm>(EMPTY_FORM);
  const [contact, setContact] = useState<IInfluencerContact>(EMPTY_CONTACT);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  // While true, the UTM ID follows the influencer name; typing an ID manually stops it.
  const [isAutoCampaignId, setIsAutoCampaignId] = useState(false);
  const campaignIdSuffix = useRef(randomIdSuffix());

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
    if (!form.campaignId.trim()) missing.push(t("missing_campaign_id"));
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

  const updateContact = (patch: Partial<IInfluencerContact>) =>
    setContact((prev) => ({ ...prev, ...patch }));

  const selectWebsiteForUrl = (url: string) =>
    setSelectedWebsiteId(websiteByHost.get(getHost(url))?._id ?? "");

  const handleWebsiteSelect = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
    const website = (allWebsites ?? []).find((w) => w._id === websiteId);
    if (website?.websiteUrl) updateForm({ baseUrl: website.websiteUrl });
  };

  const handleBaseUrlChange = (value: string) => {
    // Show pasted percent-encoded paths (e.g. Hebrew slugs) as real characters.
    const readable = toReadableUrl(value);
    updateForm({ baseUrl: readable });
    selectWebsiteForUrl(readable);
  };

  const handleCampaignIdChange = (value: string) => {
    updateForm({ campaignId: value });
    setIsAutoCampaignId(false);
  };

  const handleInfluencerChange = (value: string) => {
    updateContact({ influencer: value });
    if (!isAutoCampaignId && form.campaignId.trim()) return;
    const campaignId = value.trim()
      ? generateCampaignId(value, campaignIdSuffix.current)
      : "";
    updateForm({ campaignId });
    setIsAutoCampaignId(!!campaignId);
  };

  // Returns whether the text was a UTM link the form could be filled from.
  const fillFormFromUrl = (value: string) => {
    const parsed = parseUtmUrl(value);
    if (!parsed) {
      toast.error(t("toast_paste_invalid"));
      return false;
    }
    const readableBase = toReadableUrl(parsed.baseUrl);
    setForm({ ...parsed, baseUrl: readableBase });
    selectWebsiteForUrl(readableBase);
    setIsAutoCampaignId(false);
    toast.success(t("toast_paste_filled"));
    return true;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setContact(EMPTY_CONTACT);
    setSelectedWebsiteId("");
    setEditingId(null);
    setIsAutoCampaignId(false);
    campaignIdSuffix.current = randomIdSuffix();
  };

  const handleSave = async () => {
    if (!canGenerate) {
      toast.error(
        t("toast_fill_required", { fields: missingRequired.join(", ") }),
      );
      return;
    }
    const payload = buildPayload(form, contact);

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
    selectWebsiteForUrl(link.baseUrl);
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
    setIsAutoCampaignId(false);
    setContact({
      influencer: link.influencer ?? "",
      influencerEmail: link.influencerEmail ?? "",
      influencerPhone: link.influencerPhone ?? "",
    });
    loadLinkIntoForm(link);
  };

  // Reuse the destination + params for another influencer: load everything as a
  // NEW entry (no editingId) and clear the fields that must differ per influencer.
  const handleDuplicate = (link: IUtmCampaign) => {
    setEditingId(null);
    setContact(EMPTY_CONTACT);
    loadLinkIntoForm(link);
    // The copied ID belongs to the original influencer; replace it once a new name is typed.
    campaignIdSuffix.current = randomIdSuffix();
    setIsAutoCampaignId(true);
    toast.info(t("toast_duplicated"));
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

  return {
    allWebsites,
    savedLinks,
    isLoadingLinks,
    isSaving,
    form,
    contact,
    selectedWebsiteId,
    editingId,
    deleteTarget,
    generatedUrl,
    readableUrl,
    missingRequired,
    canGenerate,
    websiteByHost,
    updateForm,
    updateContact,
    setDeleteTarget,
    handleWebsiteSelect,
    handleBaseUrlChange,
    handleCampaignIdChange,
    handleInfluencerChange,
    fillFormFromUrl,
    resetForm,
    handleSave,
    handleEdit,
    handleDuplicate,
    handleDelete,
  };
};
