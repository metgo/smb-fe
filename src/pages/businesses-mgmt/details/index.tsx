import { toast } from "sonner";
import axios from "axios";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bookmark,
  ChevronDown,
  Compass,
  Edit,
  Eye,
  MessageCircle,
  MousePointer,
  Plus,
  Share2,
  Timer,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  BusinessContactDetails,
  BusinessInfoDetails,
  BusinessOnlinePresenceDetails,
  BusinessOpeningHoursDetails,
  ChangeOwnerModal,
} from "./components";
import { routes } from "@/lib/routes";
import { skipToken } from "@reduxjs/toolkit/query";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { PageStats, Spinner, TabsSection } from "@/components/shared";
import {
  useGetbusinessByIdQuery,
  useGetIndividualBusinessStatsQuery,
} from "@/store/api/businessQueryApi";
import { StatusChangeBtn } from "@/components/btns";
import { useUpdateBusinessMutation } from "@/store/api/businessMutationApi";
import { CreateBusinessWizard } from "../components";
import {
  AttributesDetails,
  DeliveryPolicyOptionDetails,
  DetailTitleSection,
  MediaDetails,
} from "@/components/details-sections";
import BusinessScoreDetails from "./components/BusinessScoreDetails";
import { businessTabs } from "@/constants/tabs";
import { IOpMode } from "@/enums/operation.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { envKeys } from "@/lib/envKeys";
import { TourProvider, TourPortal, useTour } from "@/components/tour";
import type { TourStep } from "@/components/tour";
import { getLngWiseStr } from "@/helpers";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { openChatPopup } from "@/features/chatPopupSlice";
import { ChatCreatorBubble } from "@/components/chat-popup";

// ─── Tour trigger (inner — needs TourProvider in scope) ───────────────────────

function TourTrigger() {
  const { startTour } = useTour();
  const { t } = useTranslation("tour");
  const { isDark } = useThemeClasses();
  const { t: tb } = useTranslation("businesses");

  const buildSteps = (): TourStep[] => [
    {
      id: "welcome",
      placement: "center",
      title: "business_details.welcome.title",
      desc: "business_details.welcome.desc",
    },
    {
      id: "status",
      target: '[data-tour="status-btn"]',
      placement: "bottom",
      title: "business_details.status.title",
      desc: "business_details.status.desc",
    },
    {
      id: "actions",
      target: '[data-tour="actions-dropdown"]',
      placement: "left",
      title: "business_details.actions.title",
      desc: "business_details.actions.desc",
    },
    {
      id: "header",
      target: '[data-tour="business-header"]',
      placement: "bottom",
      title: "business_details.header.title",
      desc: "business_details.header.desc",
    },
    {
      id: "stats",
      target: '[data-tour="business-stats"]',
      placement: "bottom",
      title: "business_details.stats.title",
      desc: "business_details.stats.desc",
    },
    {
      id: "tabs",
      target: '[data-tour="tabs-section"]',
      placement: "bottom",
      title: "business_details.tabs.title",
      desc: "business_details.tabs.desc",
    },
    {
      id: "content",
      target: '[data-tour="tab-content"]',
      placement: "top",
      title: "business_details.content.title",
      desc: "business_details.content.desc",
    },
  ];

  const handleManualStart = () => {
    startTour(buildSteps());
  };

  return (
    <button
      onClick={handleManualStart}
      title={t("start_tour")}
      className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
        isDark
          ? "border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-teal-400"
          : "border-gray-300 hover:bg-gray-100 text-gray-500 hover:text-teal-600"
      }`}
    >
      <Compass className="w-4 h-4" />
      <span className="hidden sm:inline text-sm font-medium">
        {tb("tour") ?? t("start_tour")}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function BusinessDetailsPageInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { t } = useTranslation("businesses");
  const { t: tt } = useTranslation("toast");

  const { isTraveller } = useUserRoles();

  const { isDark, isRTL, language } = useThemeClasses();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Tour integration ────────────────────────────────────────────────────
  const {
    isOpen: isTourOpen,
    steps: tourSteps,
    currentStep,
    refreshTargetRect,
  } = useTour();

  // Open the actions dropdown while the tour is on the "actions" step so the
  // spotlight can focus on the revealed menu items; close it on any other step.
  useEffect(() => {
    if (!isTourOpen) {
      setIsDropdownOpen(false);
      return;
    }
    const stepId = tourSteps[currentStep]?.id;
    if (stepId === "actions") {
      setIsDropdownOpen(true);
      // Wait one frame for React to render the dropdown, then re-measure.
      const raf = requestAnimationFrame(() => {
        setTimeout(() => refreshTargetRect(), 40);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setIsDropdownOpen(false);
    }
  }, [isTourOpen, currentStep, tourSteps, refreshTargetRect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const businessId = searchParams.get("businessId") ?? "";
  const profileToken = searchParams.get("token");

  const [opMode, setOpMode] = useState<TOpMode>(IOpMode.EDIT);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [isOwnerChangeModalOpen, setIsOwnerChangeModalOpen] = useState(false);
  const [missingFieldsFromToken, setMissingFieldsFromToken] = useState<
    string[]
  >([]);

  // ── No-auth profile completion token handling ──────────────────────────
  // When token is in URL, validate it directly and open Edit modal.
  // ProtectedRoute allows this page through without login when token is present.
  useEffect(() => {
    // Check URL token first (no-auth flow from email link)
    if (profileToken) {
      const validateToken = async () => {
        try {
          const res = await axios.get(
            `${envKeys.baseUrl}/complete-profile/${profileToken}`,
          );
          const { fields } = res.data;
          setIsEditClicked(true);
          setOpMode(IOpMode.EDIT);
          setMissingFieldsFromToken(fields ?? []);
          // Clean token from URL
          window.history.replaceState(
            {},
            "",
            `${routes.businessDetails}?businessId=${businessId}`,
          );
        } catch {
          // Token expired or invalid — redirect to a clean error page
          window.location.replace(`${routes.auth}?tokenError=expired`);
        }
      };
      validateToken();
      return;
    }

    // Check sessionStorage (post-login redirect flow)
    const storedToken = sessionStorage.getItem("profile_completion_token");
    const storedFields: string[] = JSON.parse(
      sessionStorage.getItem("profile_completion_fields") ?? "[]",
    );
    if (storedToken && storedFields.length) {
      sessionStorage.removeItem("profile_completion_token");
      sessionStorage.removeItem("profile_completion_business_id");
      sessionStorage.removeItem("profile_completion_fields");
      setIsEditClicked(true);
      setOpMode(IOpMode.EDIT);
      setMissingFieldsFromToken(storedFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileToken, businessId]);

  ///business detail stats
  const {
    data,
    refetch,
    isLoading: isDetailStatsLoading,
  } = useGetIndividualBusinessStatsQuery({ businessId }, { skip: !businessId });

  const businessStats = [
    {
      // id: "page-views",
      icon: <Eye className="w-5 h-5 text-green-600" />,
      title: t("page_views"),
      value: data?.pageViews?.toLocaleString() || 0,
    },
    {
      // id: "unique-visitors",
      icon: <Users className="w-5 h-5 text-green-600" />,
      title: t("unique_visitors"),
      value: data?.uniqueVisitors?.toLocaleString() || 0,
    },
    {
      // id: "clicks",
      icon: <MousePointer className="w-5 h-5 text-green-600" />,
      title: t("clicks"),
      value: data?.clicks?.toLocaleString() || 0,
    },
    {
      // id: "bookmarks",
      icon: <Bookmark className="w-5 h-5 text-green-600" />,
      title: t("bookmarks"),
      value: data?.bookmarks?.toLocaleString() || 0,
    },
    {
      // id: "shares",
      icon: <Share2 className="w-5 h-5 text-green-600" />,
      title: t("shares"),
      value: data?.shares?.toLocaleString() || 0,
    },
    {
      // id: "avg-time-on-page",
      icon: <Timer className="w-5 h-5 text-green-600" />,
      title: t("avg_time_on_page"),
      value: `${data?.averageEngagementTime}`,
    },
    {
      // id: "conversion-rate",
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      title: t("conversion_rate"),
      value: `${data?.conversionRate || 0}%`,
    },
  ];

  const {
    data: business,
    refetch: businessDataRefetch,
    isLoading,
  } = useGetbusinessByIdQuery(businessId ? { businessId } : skipToken);

  // ── Chat with business creator ──────────────────────────────────────────
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  const businessCreator: IChatUser = {
    _id: business?.userId?._id,
    name: business?.userId?.firstName + " " + business?.userId?.lastName,
    email: business?.userId?.email,
    role: business?.userId?.role,
    dmoId: business?.dmoId,
    authorityId: business?.authorityId,
  };

  // The business creator themself (never a superadmin) sees the
  // Messenger-style bubble for messages coming from their own business;
  // everyone else viewing this page keeps the plain "chat with creator" FAB.
  const isBusinessCreatorViewing =
    authUser?.role !== "superadmin" &&
    !!authUser?.email &&
    authUser.email === businessCreator.email;

  const handleChatWithCreator = () => {
    if (!businessCreator._id) return;
    dispatch(openChatPopup(businessCreator));
  };
  const [updateBusiness] = useUpdateBusinessMutation();

  useEffect(() => {
    if (!isEditClicked) {
      businessDataRefetch();
    }
  }, [isEditClicked]);

  const onCreateProduct = () => {
    const displayName = getLngWiseStr(
      language,
      business?.name,
      business?.nameHe,
      business?.nameAr,
    );
    navigate(
      `${routes.productsMgmt}?businessId=${businessId}&businessName=${encodeURIComponent(displayName || "")}`,
    );
  };
  const onViewProduct = () => {
    const displayName = getLngWiseStr(
      language,
      business?.name,
      business?.nameHe,
      business?.nameAr,
    );
    navigate(
      `${routes.productsMgmt}?businessId=${businessId}&businessNameProduct=${encodeURIComponent(displayName || "")}`,
    );
  };

  const handleMutateData = (mode: TOpMode) => {
    // Refetch fresh business data before opening edit modal
    businessDataRefetch();
    setIsEditClicked(true);
    setOpMode(mode);
  };

  const onStatusChangeHandler = async (status: string) => {
    try {
      await updateBusiness({
        businessId,
        body: { status: status.toUpperCase() },
      }).unwrap();

      toast.success(tt("business_status_update_success"));
      refetch();
    } catch (error) {
      toast.error(tt("business_status_update_failed"));
      console.error(error);
    }
  };

  const renderContent = () => {
    const commonProps = { t, isDark, business };
    const businessImages = business?.images ?? [];
    const mediaProps = {
      logoImage: business?.logo?.image ?? null,
      images: businessImages.map((img: IImage) => ({
        image: img.image,
        isPrimary: img.isPrimary,
      })),
      primaryImageIndex: Math.max(
        0,
        businessImages.findIndex((img: IImage) => img.isPrimary),
      ),
    };

    switch (activeTab) {
      case "overview":
        return <BusinessInfoDetails {...commonProps} />;
      case "contact":
        return (
          <BusinessContactDetails
            {...commonProps}
            refetch={businessDataRefetch}
          />
        );

      case "media":
        return <MediaDetails {...mediaProps} />;
      case "social":
        return <BusinessOnlinePresenceDetails {...commonProps} />;
      case "delivery":
        return <DeliveryPolicyOptionDetails data={business} />;
      case "accessibility":
        return (
          <AttributesDetails
            categoriesId={[business?.primaryCategoryId]}
            groupTypesId={business?.groupTypesId}
            accessibilitiesId={business?.accessibilitiesId}
            tags={business?.tagsId}
          />
        );
      case "hours":
        return <BusinessOpeningHoursDetails {...commonProps} />;
      case "score":
        return <BusinessScoreDetails businessId={businessId} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative pt-10 md:pt-0">
      <Spinner isLoading={isLoading} />

      <div className="details-top shrink-0 " data-tour="business-header">
        <DetailTitleSection
          {...business}
          imageSrc={
            business?.images?.find((img: IImage) => img.isPrimary)?.image ||
            business?.images?.[0]?.image ||
            business?.logo?.image
          }
          backPath={routes.businessMgmt}
          actions={
            <>
              {/* Status */}
              <div data-tour="status-btn">
                <StatusChangeBtn
                  handleStatusChange={onStatusChangeHandler}
                  status={business?.status}
                />
              </div>

              {/* Actions dropdown */}
              <div
                className="relative"
                ref={dropdownRef}
                data-tour="actions-btn"
              >
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-800 text-gray-300 bg-gray-900"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700 bg-white"
                  }`}
                >
                  <span className="inline text-sm font-medium">
                    {t("actions")}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    data-tour="actions-dropdown"
                    className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-52 rounded-xl shadow-lg border overflow-hidden ${
                      isTourOpen ? "z-10001" : "z-50"
                    } ${
                      isDark
                        ? "bg-gray-900 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* Edit */}
                    <button
                      onClick={() => {
                        handleMutateData(IOpMode.EDIT);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                        isDark
                          ? "text-teal-400 hover:bg-gray-800"
                          : "text-teal-700 hover:bg-gray-50"
                      }`}
                    >
                      <Edit className="w-4 h-4 shrink-0" />
                      {t("edit")}
                    </button>

                    {/* Change Owner */}
                    {!isTraveller && (
                      <button
                        onClick={() => {
                          setIsOwnerChangeModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                          isDark
                            ? "text-gray-300 hover:bg-gray-800"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <UserCog className="w-4 h-4 shrink-0" />
                        {t("change_owner")}
                      </button>
                    )}

                    <div
                      className={`mx-3 my-1 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}
                    />
                    {onCreateProduct && (
                      <button
                        onClick={() => {
                          onCreateProduct();
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                          isDark
                            ? "text-indigo-400 hover:bg-gray-800"
                            : "text-indigo-600 hover:bg-gray-50"
                        }`}
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        {t("create_product")}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onViewProduct();
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                        isDark
                          ? "text-gray-300 hover:bg-gray-800"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Eye className="w-4 h-4 shrink-0" />
                      View Product
                    </button>
                  </div>
                )}
              </div>

              {/* Tour trigger */}
              <TourTrigger />
            </>
          }
        />
        <div data-tour="business-stats">
          <PageStats
            stats={businessStats}
            isLoading={isDetailStatsLoading}
            className="sm:grid-cols-3 lg:grid-cols-4  xl:grid-cols-7 gap-2 md:gap-3"
            wrapperClassName=" my-2 sm:my-4"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-1 flex flex-col flex-1 min-h-0">
        <div className="shrink-0" data-tour="tabs-section">
          <TabsSection
            tabs={businessTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div
          className="details-content flex-1 overflow-y-auto min-h-0 !p-2"
          data-tour="tab-content"
        >
          {renderContent()}
        </div>
      </div>

      {/* Change Owner Modal */}
      {isOwnerChangeModalOpen && (
        <ChangeOwnerModal
          setIsOpen={setIsOwnerChangeModalOpen}
          currentOwner={business?.owner}
          refetch={businessDataRefetch}
        />
      )}

      {isEditClicked && (
        <CreateBusinessWizard
          editData={business}
          onClose={() => {
            setIsEditClicked(false);
            setMissingFieldsFromToken([]);
          }}
          refetch={refetch}
          businessDataRefetch={businessDataRefetch}
          opMode={opMode}
          missingFields={missingFieldsFromToken}
        />
      )}

      {/* Messenger-style bubble for the business creator's own messages */}
      {isBusinessCreatorViewing && businessCreator._id && (
        <ChatCreatorBubble creator={businessCreator} />
      )}

      {/* Chat with business creator (FAB), for everyone else viewing this page */}
      {!isBusinessCreatorViewing && businessCreator._id && (
        <button
          onClick={handleChatWithCreator}
          title={`Message ${businessCreator.name}`}
          className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-40 animate-pulse w-12 h-12 rounded-full bg-[#ff6634] text-white shadow-lg shadow-teal-500/30 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95`}
        >
          <MessageCircle className="w-6 h-6 animate-bounce" />
        </button>
      )}

      <TourPortal />
    </div>
  );
}

// ─── Exported page (wraps with TourProvider) ──────────────────────────────────

export default function BusinessDetailsPage() {
  return (
    <TourProvider>
      <BusinessDetailsPageInner />
    </TourProvider>
  );
}
