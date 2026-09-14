import { useState, useEffect, useMemo, useCallback } from "react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllProductsQuery } from "@/store/api/productQueryApi";
import { detectLanguage } from "@/helpers";

export interface VoucherRecipient {
  name: string;
  email: string;
  phone: string;
  emailSent: boolean;
  smsSent: boolean;
}

export interface MiniCampaignFormData {
  createMiniSite: boolean;
  selectedWebsite: string;
  campaignType: "cash-back" | "cash-in";
  companyName: string;
  contactName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  officeAddress: string;
  logoFile: string | null;
  campaignName: string;
  campaignCode: string;
  voucherAmount: string;
  totalVouchers: string;
  startDate: string;
  endDate: string;
  deliveryArea: "home" | "office";
  contentTitle: string;
  contentTitleHe: string;
  contentTitleAr: string;
  contentSubtitle: string;
  contentSubtitleHe: string;
  contentSubtitleAr: string;
  contentGreeting: string;
  contentGreetingHe: string;
  contentGreetingAr: string;
  sendTiming: "immediate" | "scheduled";
  scheduledDate: string;
  scheduledTime: string;
  allowInstanceCreation: boolean;
  instanceName: string;
  instanceEmail: string;
  instancePhone: string;
}

interface UseMiniCampaignWizardProps {
  onSubmit: (data: any, status: "draft" | "active") => void;
  editingMiniSite?: any;
}

const initialFormData: MiniCampaignFormData = {
  createMiniSite: false,
  selectedWebsite: "",
  campaignType: "cash-back",
  companyName: "",
  contactName: "",
  email: "",
  phoneCountryCode: "+972",
  phoneNumber: "",
  officeAddress: "",
  logoFile: null,
  campaignName: "",
  campaignCode: "",
  voucherAmount: "",
  totalVouchers: "",
  startDate: "",
  endDate: "",
  deliveryArea: "office",
  contentTitle: "",
  contentTitleHe: "",
  contentTitleAr: "",
  contentSubtitle: "",
  contentSubtitleHe: "",
  contentSubtitleAr: "",
  contentGreeting: "",
  contentGreetingHe: "",
  contentGreetingAr: "",
  sendTiming: "immediate",
  scheduledDate: "",
  scheduledTime: "",
  allowInstanceCreation: false,
  instanceName: "",
  instanceEmail: "",
  instancePhone: "",
};

const PRODUCTS_LIMIT = 20;
const MIN_SELECTED_PRODUCTS = 2;

export function useMiniCampaignWizard({
  onSubmit,
  editingMiniSite,
}: UseMiniCampaignWizardProps) {
  const { language } = useThemeClasses();
  const { allWebsites } = useCommon();

  const marketplaceWebsites = useMemo(
    () => (allWebsites ?? []).filter((site) => site.purpose === "MARKETPLACE"),
    [allWebsites],
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<MiniCampaignFormData>(initialFormData);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [voucherResults, setVoucherResults] = useState<VoucherRecipient[]>([]);

  // Step 2: Select Products
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [primaryProducts, setPrimaryProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Auto-generate campaign code
  useEffect(() => {
    if (!formData.campaignCode && formData.campaignName) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      setFormData((prev) => ({ ...prev, campaignCode: code }));
    }
  }, [formData.campaignName, formData.campaignCode]);

  // Populate fields when editing
  useEffect(() => {
    if (editingMiniSite) {
      const website = editingMiniSite.website
        ? typeof editingMiniSite.website === "string"
          ? editingMiniSite.website.split(",")[0]
          : editingMiniSite.website[0]
        : "";
      setFormData((prev) => ({
        ...prev,
        selectedWebsite: website || "",
        companyName: editingMiniSite.companyName || "",
        campaignName: editingMiniSite.campaignName || "",
        campaignCode: editingMiniSite.campaignCode || "",
        voucherAmount: editingMiniSite.voucherAmount?.toString() || "",
        totalVouchers: editingMiniSite.totalVouchers?.toString() || "",
        startDate: editingMiniSite.startDate || "",
        endDate: editingMiniSite.endDate || "",
      }));
    }
  }, [editingMiniSite]);

  // Dynamic steps based on createMiniSite checkbox
  const allSteps = [
    { number: 1, name: "website_purchaser_info" },
    { number: 2, name: "select_products" },
    { number: 3, name: "mini_site_preview" },
    { number: 4, name: "voucher_creation" },
    { number: 5, name: "results" },
  ];

  const steps = formData.createMiniSite
    ? allSteps
    : [allSteps[0], allSteps[3], allSteps[4]];

  const getActualStepNumber = useCallback(
    (displayStep: number) => {
      if (formData.createMiniSite) return displayStep;
      if (displayStep === 1) return 1;
      if (displayStep === 2) return 4;
      if (displayStep === 3) return 5;
      return displayStep;
    },
    [formData.createMiniSite],
  );

  const actualStepNumber = getActualStepNumber(currentStep);

  // Fetch marketplace products for the selected website on both the Select
  // Products step and the Preview step (which renders the selected products).
  const shouldFetchProducts =
    formData.createMiniSite &&
    (actualStepNumber === 2 || actualStepNumber === 3) &&
    !!formData.selectedWebsite;

  const {
    data: productData,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useGetAllProductsQuery(
    {
      page: 1,
      limit: PRODUCTS_LIMIT,
      locale: language,
      websiteId: formData.selectedWebsite,
      ...(productSearch ? { search: productSearch } : {}),
    },
    { skip: !shouldFetchProducts, refetchOnMountOrArgChange: true },
  );

  const products = productData?.data ?? [];

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
  }, []);

  // On the Select Products step of the mini-site flow, require at least
  // MIN_SELECTED_PRODUCTS selections before the user can move on.
  const isProductStepValid =
    !formData.createMiniSite ||
    actualStepNumber !== 2 ||
    selectedProducts.length >= MIN_SELECTED_PRODUCTS;

  const handleNext = useCallback(() => {
    if (!isProductStepValid) return;
    setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
  }, [steps.length, isProductStepValid]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            logoFile: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const copyMiniSiteUrl = useCallback(() => {
    const url = `https://tav-8.co.il/mini-site?campCode=${formData.campaignCode}&voucherId=65c3874cd753aecdd6cb85ae&customerEmail=${formData.email}`;
    navigator.clipboard.writeText(url);
  }, [formData.campaignCode, formData.email]);

  const downloadSampleXLS = useCallback(() => {
    const csvContent =
      "Name,Email,Phone\nJohn Doe,john@example.com,+972501234567\nJane Smith,jane@example.com,+972501234568";
    const blob = new Blob(["﻿", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "voucher-template.csv";
    link.click();
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setUploadedFile(file);
        // Mock parsing results
        setVoucherResults([
          {
            name: "John Doe",
            email: "john@example.com",
            phone: "+972501234567",
            emailSent: true,
            smsSent: true,
          },
          {
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+972501234568",
            emailSent: true,
            smsSent: false,
          },
          {
            name: "Bob Johnson",
            email: "bob@example.com",
            phone: "+972501234569",
            emailSent: false,
            smsSent: false,
          },
        ]);
      }
    },
    [],
  );

  const handleInstanceVoucherAdd = useCallback(() => {
    const { instanceName, instanceEmail, instancePhone } = formData;
    if (instanceName && instanceEmail && instancePhone) {
      setVoucherResults((prev) => [
        ...prev,
        {
          name: instanceName,
          email: instanceEmail,
          phone: instancePhone,
          emailSent: false,
          smsSent: false,
        },
      ]);
      setFormData((prev) => ({
        ...prev,
        instanceName: "",
        instanceEmail: "",
        instancePhone: "",
      }));
    }
  }, [formData]);

  // Whichever content field the user was actually typing into, based on the
  // global language at the time of entry (mirrors CreateBusinessWizard)
  const getActiveField = (base: string, lang: string): string => {
    if (lang === "en") return base;
    const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
    return `${base}${suffix}`;
  };

  const detectAndAssignLanguageFields = useCallback(
    (data: MiniCampaignFormData): MiniCampaignFormData => {
      const updated = { ...data };

      const fieldGroups = [
        {
          base: "contentTitle",
          en: "contentTitle",
          he: "contentTitleHe",
          ar: "contentTitleAr",
        },
        {
          base: "contentSubtitle",
          en: "contentSubtitle",
          he: "contentSubtitleHe",
          ar: "contentSubtitleAr",
        },
        {
          base: "contentGreeting",
          en: "contentGreeting",
          he: "contentGreetingHe",
          ar: "contentGreetingAr",
        },
      ] as const;

      fieldGroups.forEach(({ base, en, he, ar }) => {
        const activeField = getActiveField(
          base,
          language,
        ) as keyof MiniCampaignFormData;
        const text = (data[activeField] as string)?.trim();
        if (!text) return;

        const detectedLang = detectLanguage(text);

        updated[en] = "";
        updated[he] = "";
        updated[ar] = "";

        if (detectedLang === "he") {
          updated[he] = text;
        } else if (detectedLang === "ar") {
          updated[ar] = text;
        } else {
          updated[en] = text;
        }
      });

      return updated;
    },
    [language],
  );

  const buildPayload = useCallback(() => {
    const {
      selectedWebsite,
      campaignType,
      companyName,
      contactName,
      email,
      phoneCountryCode,
      phoneNumber,
      officeAddress,
      campaignName,
      campaignCode,
      voucherAmount,
      totalVouchers,
      startDate,
      endDate,
      deliveryArea,
      createMiniSite,
    } = formData;

    const {
      contentTitle,
      contentTitleHe,
      contentTitleAr,
      contentSubtitle,
      contentSubtitleHe,
      contentSubtitleAr,
      contentGreeting,
      contentGreetingHe,
      contentGreetingAr,
    } = detectAndAssignLanguageFields(formData);

    return {
      selectedWebsite,
      campaignType,
      companyName,
      contactName,
      email,
      phone: phoneCountryCode + phoneNumber,
      officeAddress,
      campaignName,
      campaignCode,
      voucherAmount,
      totalVouchers,
      startDate,
      endDate,
      deliveryArea: createMiniSite ? deliveryArea : undefined,
      contentTitle,
      contentTitleHe,
      contentTitleAr,
      contentSubtitle,
      contentSubtitleHe,
      contentSubtitleAr,
      contentGreeting,
      contentGreetingHe,
      contentGreetingAr,
      selectedProducts: createMiniSite ? selectedProducts : [],
      primaryProducts: createMiniSite ? primaryProducts : [],
      createMiniSite,
    };
  }, [
    formData,
    selectedProducts,
    primaryProducts,
    detectAndAssignLanguageFields,
  ]);

  const handleSaveDraft = useCallback(() => {
    onSubmit(buildPayload(), "draft");
  }, [buildPayload, onSubmit]);

  const handlePublish = useCallback(() => {
    onSubmit({ ...buildPayload(), voucherResults }, "active");
  }, [buildPayload, onSubmit, voucherResults]);

  return {
    currentStep,
    setCurrentStep,
    steps,
    actualStepNumber,
    formData,
    setFormData,
    uploadedFile,
    voucherResults,
    marketplaceWebsites,
    handleNext,
    handlePrev,
    handleLogoUpload,
    copyMiniSiteUrl,
    downloadSampleXLS,
    handleFileUpload,
    handleInstanceVoucherAdd,
    handleSaveDraft,
    handlePublish,

    // Step 2: Select Products
    products,
    isProductsLoading: isProductsLoading || isProductsFetching,
    productSearch,
    setProductSearch,
    selectedProducts,
    toggleProductSelection,
    primaryProducts,
    togglePrimaryProduct,
    removeSelectedProduct,
    isProductStepValid,
    minSelectedProducts: MIN_SELECTED_PRODUCTS,
  };
}
