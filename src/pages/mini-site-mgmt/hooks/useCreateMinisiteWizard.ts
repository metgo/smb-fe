import * as XLSX from "xlsx";
import {
  Eye,
  CheckCircle,
  Building2,
  Ticket,
  Briefcase,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useMemo, useEffect } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import { getPlainText } from "@/components/shared/RichTextEditor";
import {
  useInitMiniSiteCreateMutation,
  useUpdateMiniSiteMutation,
  useMinisiteVoucherUploadMutation,
} from "@/store/api/miniSiteMutation";
import { useGetAllProductsQuery } from "@/store/api/productQueryApi";
import {
  makeMinisiteVoucherAssignee,
  type IMinisiteVoucherAssignee,
} from "../components/sub-components/MinisiteVoucherCreation";

export interface MiniSiteFormData {
  // Step 1
  externalApiId: string;
  companyName: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  officeAddress: string;
  campaignName: string;
  campaignCode: string;
  voucherAmount: string;
  totalVouchers: string;
  startDate: string;
  endDate: string;
  deliveryArea: "home" | "office";
  contentTitle: string;
  contentSubtitle: string;
  contentGreeting: string;
  backgroundImage: string;
  footerImage: string;

  // Step 2
  selectedProducts: string[];
  primaryProducts: string[];

  // Step 4
  sendTiming: "immediate" | "scheduled";
  scheduledDate: string;
  scheduledTime: string;
  allowInstanceCreation: boolean;
  instanceName: string;
  instanceEmail: string;
  instancePhone: string;
  uploadedFile: File | null;
}

const totalSteps = 6;
const MIN_SELECTED_PRODUCTS = 3;

const initialFormData: MiniSiteFormData = {
  externalApiId: "",
  companyName: "",
  contactName: "",
  email: "",
  phoneNumber: "",
  officeAddress: "",
  campaignName: "",
  campaignCode: "",
  voucherAmount: "",
  totalVouchers: "",
  startDate: "",
  endDate: "",
  deliveryArea: "home",
  contentTitle: "",
  contentSubtitle: "",
  contentGreeting: "",
  backgroundImage: "",
  footerImage: "",

  selectedProducts: [],
  primaryProducts: [],

  sendTiming: "immediate",
  scheduledDate: "",
  scheduledTime: "",
  allowInstanceCreation: false,
  instanceName: "",
  instanceEmail: "",
  instancePhone: "",
  uploadedFile: null,
};

export const useCreateMinisiteWizard = (editData?: IMinisiteDetailsRes) => {
  const { t } = useTranslation("minisites");
  const { language } = useThemeClasses();
  const { associatedWebsite } = useAppSelector((state) => state.auth);

  const [isPublishing] = useState(false);
  const [logoGcsUrl, setLogoGcsUrl] = useState<string>(
    editData?.logoPath ?? "",
  );
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<MiniSiteFormData>(() =>
    editData
      ? {
          ...initialFormData,
          externalApiId: editData.externalApiId ?? "",
          companyName: editData.companyInfo?.name ?? "",
          contactName: editData.companyInfo?.contactPerson ?? "",
          email: editData.companyInfo?.email ?? "",
          phoneNumber: editData.companyInfo?.phoneNumber ?? "",
          officeAddress: editData.miniSite?.deliveryAddress ?? "",
          campaignName: editData.name ?? "",
          campaignCode: editData.code ?? "",
          backgroundImage: editData.backgroundImage ?? "",
          footerImage: editData.footerImage ?? "",
          deliveryArea: editData.miniSite?.isDeliveredToHome
            ? "home"
            : "office",
          contentTitle: editData.miniSite?.title ?? "",
          contentSubtitle: editData.miniSite?.subTitle ?? "",
          contentGreeting: editData.miniSite?.greeting ?? "",
        }
      : initialFormData,
  );
  const [miniSiteId, setMiniSiteId] = useState(editData?._id ?? "");
  // Step 2: Select Products
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    editData?.productIds?.map((p) => p._id) ?? [],
  );
  const [primaryProducts, setPrimaryProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);

  // Step 5: Voucher assignees
  const [assignees, setAssignees] = useState<IMinisiteVoucherAssignee[]>([
    makeMinisiteVoucherAssignee(),
  ]);

  // Step 6: Results
  const [voucherResults, setVoucherResults] = useState<
    IMinisiteVoucherUploadRes[]
  >([]);

  const campaignPayloadMap = useMemo(
    () => ({
      type: "MINI_SITE",
      status: "ACTIVE",
      // Basic campaign metadata (similar to step 1)
      name: formData.campaignName,
      code: formData.campaignCode,
      logoPath: logoGcsUrl,
      backgroundImage: formData.backgroundImage,
      footerImage: formData.footerImage,

      externalApiId: formData.externalApiId,
      productIds: selectedProducts,

      companyInfo: {
        name: formData.companyName,
        contactPerson: formData.contactName,
        contryCode: "972",
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      },

      miniSite: {
        title: formData.contentTitle,
        subTitle: formData.contentSubtitle,
        greeting: formData.contentGreeting,
        isDeliveredToHome: formData.deliveryArea === "office" ? false : true,
        deliveryAddress: formData.officeAddress,
      },
      // Monetary / voucher details
      voucher: {
        amount: Number(formData.voucherAmount) || 0,
        totalVouchers: Number(formData.totalVouchers) || 0,
        currency: "ILS", // ← hard-code or add to formData if multi-currency
      },

      // Dates & timing (similar to opening hours / availability)
      startDate: formData.startDate, // should be ISO string "2025-04-10"
      endDate: formData.endDate,
    }),
    [
      formData.campaignName,
      formData.campaignCode,
      formData.voucherAmount,
      formData.totalVouchers,
      formData.startDate,
      formData.endDate,
      formData.backgroundImage,
      formData.footerImage,
      logoGcsUrl,
      formData.externalApiId,
      selectedProducts,
    ],
  );

  const [initMiniSiteCreate, { isLoading: isCreating }] =
    useInitMiniSiteCreateMutation();
  const [updateMiniSite, { isLoading: isSaving }] = useUpdateMiniSiteMutation();
  const [minisiteVoucherUpload, { isLoading: isUploadingVouchers }] =
    useMinisiteVoucherUploadMutation();

  // Snapshot of the payload as it was last persisted to the server, so
  // subsequent saves can send only the fields that actually changed.
  const [lastSavedPayload, setLastSavedPayload] = useState<Record<
    string,
    any
  > | null>(null);

  const saveDraft = useCallback(
    async (isPublish = false): Promise<string | null> => {
      try {
        const payload = { ...campaignPayloadMap };

        if (!Object.keys(payload).length) return null;

        // No mini-site yet: create it directly with the current data.
        if (!miniSiteId) {
          const res = await initMiniSiteCreate(payload).unwrap();
          const newId = res?.data?._id;
          setMiniSiteId(newId);
          setLastSavedPayload(payload);

          toast.success(
            res?.message ?? (isPublish ? "Campaign published" : "Draft saved"),
          );
          return newId;
        }

        // Existing mini-site: only send fields that changed since the last save.
        const changedFields = Object.keys(payload).reduce<Record<string, any>>(
          (acc, key) => {
            const prevValue = lastSavedPayload?.[key];
            const nextValue = (payload as Record<string, any>)[key];

            if (JSON.stringify(prevValue) !== JSON.stringify(nextValue)) {
              acc[key] = nextValue;
            }

            return acc;
          },
          {},
        );

        if (!Object.keys(changedFields).length) {
          if (isPublish) {
            toast.success("Campaign published");
          }
          return miniSiteId;
        }

        const res = await updateMiniSite({
          miniSiteId,
          body: { ...changedFields, status: "ACTIVE" },
        }).unwrap();

        setLastSavedPayload(payload);

        toast.success(
          res?.message ?? (isPublish ? "Campaign published" : "Draft saved"),
        );
        return miniSiteId;
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || "Failed to save");
        return null;
      }
    },
    [
      miniSiteId,
      setMiniSiteId,
      campaignPayloadMap,
      lastSavedPayload,
      initMiniSiteCreate,
      updateMiniSite,
    ],
  );

  // Builds and sends the minisite voucher-upload payload for the current
  // assignees against the given (already created/updated) campaign id.
  const uploadVouchers = useCallback(
    async (campaignId: string) => {
      const payload: IMinisiteVoucherUploadPayload = {
        campaignId,
        languagePreference: "he",
        purchaserCountryCode: "972",
        purchaserEmail: formData.email,
        purchaserName: formData.contactName,
        purchaserPhone: formData.phoneNumber,
        vouchers: assignees.map((a) => ({
          assigneeName: a.assigneeName,
          assigneeEmail: a.assigneeEmail,
          assigneeCountryCode: a.assigneeCountryCode.replace("+", ""),
          assigneePhone: a.assigneePhone,
        })),
      };

      const res = await minisiteVoucherUpload(payload).unwrap();
      setVoucherResults(res);
      return res;
    },
    [
      assignees,
      formData.email,
      formData.contactName,
      formData.phoneNumber,
      minisiteVoucherUpload,
    ],
  );

  const steps: IWizardStep[] = useMemo(
    () => [
      {
        number: 1,
        title: t("general") || "General",
        icon: Building2,
      },
      { number: 2, title: t("media") || "Media", icon: ImageIcon },
      {
        number: 3,
        title: t("products") || "Products",
        icon: Briefcase,
      },
      {
        number: 4,
        title: t("preview") || "Preview",
        icon: Eye,
      },
      {
        number: 5,
        title: t("voucher") || "Voucher",
        icon: Ticket,
      },
      { number: 6, title: t("results") || "Results", icon: CheckCircle },
    ],
    [t],
  );

  // Debounce the search keyword so we don't refetch products on every keystroke.
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProductSearch(productSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [productSearch]);

  // Reset pagination whenever the effective query changes.
  useEffect(() => {
    setProductPage(1);
    setCombinedProducts([]);
  }, [debouncedProductSearch, formData.externalApiId, language]);

  // Fetch marketplace products for the selected website on both the Select
  // Products step and the Preview step (which renders the selected products).
  const shouldFetchProducts =
    (currentStep === 3 || currentStep === 4) && !!formData.externalApiId;

  const {
    data: productData,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useGetAllProductsQuery(
    {
      page: productPage,
      limit: 20,
      locale: language,
      websiteId: formData.externalApiId,
      ...(debouncedProductSearch ? { search: debouncedProductSearch } : {}),
    },
    { skip: !shouldFetchProducts, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (!productData?.data?.length) {
      if (productPage === 1) setCombinedProducts([]);
      return;
    }
    setCombinedProducts((prev) => {
      if (productPage === 1) return productData.data;
      const existingIds = new Set(prev.map((p: any) => p._id));
      const newItems = productData.data.filter(
        (p: any) => !existingIds.has(p._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [productData, productPage]);

  const hasMoreProducts = !!productData?.meta?.hasNextPage;

  const fetchNextProductsPage = useCallback(() => {
    if (!hasMoreProducts || isProductsFetching) return;
    setProductPage((prev) => prev + 1);
  }, [hasMoreProducts, isProductsFetching]);

  const products = combinedProducts;

  const toggleProductSelection = useCallback((productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const togglePrimaryProduct = useCallback((productId: string) => {
    setPrimaryProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const removeSelectedProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    setPrimaryProducts((prev) => prev.filter((id) => id !== productId));
    if (selectedProducts?.length === MIN_SELECTED_PRODUCTS) {
      toast(
        t("min_products_required_notice", { count: MIN_SELECTED_PRODUCTS }),
      );
    }
  }, []);

  // Step 1: Website & Purchaser Info — Company, Purchaser and Content fields
  // are all required before moving on.
  const isStep1Valid =
    !!formData.companyName.trim() &&
    !!formData.contactName.trim() &&
    !!formData.email.trim() &&
    !!formData.phoneNumber.trim() &&
    !!formData.officeAddress.trim() &&
    !!formData.campaignName.trim() &&
    !!formData.campaignCode.trim() &&
    !!formData.voucherAmount.trim() &&
    !!formData.totalVouchers.trim() &&
    !!formData.startDate.trim() &&
    !!formData.endDate.trim() &&
    !!getPlainText(formData.contentTitle).trim() &&
    !!getPlainText(formData.contentSubtitle).trim() &&
    !!getPlainText(formData.contentGreeting).trim();

  // Step 2: Media — logo, background and footer images are all required.
  const isStep2Valid =
    !!logoGcsUrl && !!formData.backgroundImage && !!formData.footerImage;

  // Step 3: Select Products — require at least MIN_SELECTED_PRODUCTS.
  const isStep3Valid = selectedProducts.length >= MIN_SELECTED_PRODUCTS;

  // Step 5: Voucher assignees — each assignee needs a name and either an
  // email or a phone number.
  const isStep5Valid =
    assignees.length > 0 &&
    assignees.every(
      (a) =>
        !!a.assigneeName.trim() &&
        (!!a.assigneeEmail.trim() || !!a.assigneePhone.trim()),
    );

  const handleNext = useCallback(async () => {
    if (currentStep === 1 && !isStep1Valid) {
      toast.error(
        t("fill_required_fields") || "Please fill all required fields",
      );
      return;
    }
    if (currentStep === 2 && !isStep2Valid) {
      toast.error(
        t("upload_required_images") ||
          "Please upload logo, background and footer images",
      );
      return;
    }
    if (currentStep === 3 && !isStep3Valid) {
      toast.error(t("min_products_required", { count: MIN_SELECTED_PRODUCTS }));
      return;
    }
    if (currentStep === 4) {
      const campaignId = await saveDraft(true);
      if (!campaignId) {
        toast.error("Failed to save campaign before creating vouchers");
        return;
      }
    }
    if (miniSiteId) {
      try {
        await uploadVouchers(miniSiteId);
      } catch (err: any) {
        toast.error(
          err?.data?.message || err?.message || "Failed to create vouchers",
        );
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  }, [
    currentStep,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep5Valid,
    saveDraft,
    uploadVouchers,
    t,
  ]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const copyMiniSiteUrl = useCallback(() => {
    const url = `https://tav-8.co.il/mini-site?campCode=${formData.campaignCode}&voucherId=65c3874cd753aecdd6cb85ae&customerEmail=${formData.email}`;
    navigator.clipboard.writeText(url);
  }, [formData.campaignCode, formData.email]);

  const downloadSampleXLS = useCallback(() => {
    const rows = [
      {
        Name: "John Doe",
        Email: "john@example.com",
        CountryCode: "972",
        Phone: "501234567",
      },
      {
        Name: "Jane Smith",
        Email: "jane@example.com",
        CountryCode: "972",
        Phone: "501234568",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vouchers");
    XLSX.writeFile(workbook, "voucher-template.xlsx");
  }, []);

  const handlePublish = useCallback(
    async (onSuccess?: () => void) => {
      const success = await saveDraft(true);
      if (success) {
        onSuccess?.();
      }
    },
    [saveDraft],
  );

  return {
    t,
    associatedWebsite,

    // publishing / saving state
    isPublishing,
    isCreating,
    isSaving,

    // media
    logoGcsUrl,
    setLogoGcsUrl,

    // wizard state
    currentStep,
    setCurrentStep,
    steps,
    totalSteps,

    // form data
    formData,
    setFormData,

    // draft / publish
    saveDraft,
    handlePublish,

    // products
    products,
    isProductsLoading,
    isProductsFetching,
    hasMoreProducts,
    fetchNextProductsPage,
    productSearch,
    setProductSearch,
    selectedProducts,
    primaryProducts,
    toggleProductSelection,
    togglePrimaryProduct,
    removeSelectedProduct,
    MIN_SELECTED_PRODUCTS,

    // voucher assignees (step 5)
    assignees,
    setAssignees,

    // voucher results (step 6)
    voucherResults,
    isUploadingVouchers,

    // navigation
    handleNext,
    handlePrev,

    // misc actions
    copyMiniSiteUrl,
    downloadSampleXLS,
  };
};
