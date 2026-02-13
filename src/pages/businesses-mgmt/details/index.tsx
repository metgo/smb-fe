import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bookmark,
  Edit,
  Eye,
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
  BusinessAttributesDetails,
  BusinessContactDetails,
  BusinessInfoDetails,
  BusinessMediaDetails,
  BusinessOnlinePresenceDetails,
  BusinessOpeningHoursDetails,
  BusinessTitleSection,
  ChangeOwnerModal,
} from "./components";
import { routes } from "@/lib/routes";
import { UserRole } from "@/enums/user.types";
import { useAppSelector } from "@/hooks/hooks";
import { skipToken } from "@reduxjs/toolkit/query";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { PageStats, Spinner, TabsSection } from "@/components/shared";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import {
  useGetbusinessByIdQuery,
  useGetIndividualBusinessStatsQuery,
} from "@/store/api/businessQueryApi";
import { BackToListBtn, StatusChangeBtn } from "@/components/btns";
import { useUpdateBusinessMutation } from "@/store/api/businessMutationApi";
import { CreateBusinessWizard } from "../components";
import {
  DeliveryPolicyOptionDetails,
  LocationDetails,
} from "@/components/details-sections";
import { businessTabs } from "@/constants/tabs";

export default function BusinessDetailsPage() {
  const { t } = useTranslation("businesses");
  const navigate = useNavigate();
  const { borderColor, isDark } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId") ?? "";
  ///business detail stats
  const { data, isLoading: isDetailStatsLoading } =
    useGetIndividualBusinessStatsQuery({ businessId }, { skip: !businessId });

  const businessStats = [
    {
      icon: <Eye className="w-5 h-5 text-green-600" />,
      title: t("page_views"),
      value: data?.pageViews?.toLocaleString() || 0,
    },
    {
      icon: <Users className="w-5 h-5 text-green-600" />,
      title: t("unique_visitors"),
      value: data?.uniqueVisitors?.toLocaleString() || 0,
    },
    {
      icon: <MousePointer className="w-5 h-5 text-green-600" />,
      title: t("clicks"),
      value: data?.clicks?.toLocaleString() || 0,
    },
    {
      icon: <Bookmark className="w-5 h-5 text-green-600" />,
      title: t("bookmarks"),
      value: data?.bookmarks?.toLocaleString() || 0,
    },
    {
      icon: <Share2 className="w-5 h-5 text-green-600" />,
      title: t("shares"),
      value: data?.shares?.toLocaleString() || 0,
    },
    {
      icon: <Timer className="w-5 h-5 text-green-600" />,
      title: t("avg_time_on_page"),
      value: `${data?.averageEngagementTime}`,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      title: t("conversion_rate"),
      value: `${data?.conversionRate || 0}%`,
    },
  ];
  const {
    data: business,
    refetch,
    isLoading,
  } = useGetbusinessByIdQuery(businessId ? { businessId } : skipToken);
  const [updateBusiness] = useUpdateBusinessMutation();
  const [errors, _setErrors] = useState<Record<string, string>>({});
  const [businessLogoImage, setBusinessLogoImage] = useState<IImage | null>(
    null,
  );
  const [galleryImages, setGalleryImages] = useState<TImages>([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [isOwnerChangeModalOpen, setIsOwnerChangeModalOpen] = useState(false);

  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    userRole,
  );

  const {
    images,
    imagesRef,
    primaryImageIndex,
    handleImageUpload,
    setPrimaryImage,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isImageDeleting,
    handleDeleteImage,
  } = useImagesUpload({
    initialImages: galleryImages,
    onChange: setGalleryImages,
  });
  const {
    image: logoImage,
    handleImageSelect: handleLogoImageSelect,
    uploadImage: uploadLogoImage,
    confirmDelete: confirmDeleteLogo,
    deleteTarget: deleteTargetLogo,
    setDeleteTarget: setDeleteTargetLogo,
    isImageDeleting: isLogoImageDeleting,
    handleDeleteImage: handleDeleteLogoImage,
  } = useSingleImageUpload({
    initialImage: businessLogoImage?.image,
    onChange: setBusinessLogoImage,
  });

  // const StatusBadge = ({ status }: { status: Business["status"] }) => {
  //   const statusConfig = {
  //     draft: { color: "bg-gray-500", label: t("draft") },
  //     pending: { color: "bg-yellow-500", label: t("pending") },
  //     approved: { color: "bg-green-500", label: t("approved") },
  //     rejected: { color: "bg-red-500", label: t("rejected") },
  //     archived: { color: "bg-gray-400", label: t("archived") },
  //   };

  //   const config = statusConfig[status];

  //   return (
  //     <span
  //       className={`px-3 py-1 rounded-full text-sm text-white ${config.color}`}
  //     >
  //       {config.label}
  //     </span>
  //   );
  // };

  // useEffect(() => {
  //   if (!business?.logo || !business?.images?.length) return;
  //   const hasPrimary = business?.images?.some((img: any) => img.isPrimary);

  //   if (business) {
  //     const logo = {
  //       id: Date.now(),
  //       previewUrl: business?.logo?.image,
  //       progress: 100,
  //       status: "success",
  //       isPrimary: false,
  //       gcsURL: business?.logo?.image,
  //     };
  //     const gallery = business?.images?.map((item: any, index: number) => ({
  //       id: Date.now() + index,
  //       previewUrl: item.image,
  //       progress: 100,
  //       status: "success",
  //       isPrimary: item.isPrimary || (!hasPrimary && index === 0),
  //       gcsURL: item.image,
  //     }));
  //     setBusinessMedia({
  //       logo,
  //       gallery,
  //     });
  //   }
  // }, [business, businessSlug]);

  // const [updateBusiness] = useUpdateBusinessMutation();

  useEffect(() => {
    setGalleryImages(business?.images);
    setBusinessLogoImage({ image: business?.logo?.image });
  }, [business]);

  // const handleSubmit = async () => {
  //   try {
  //     let logoUrl = businessLogoImage?.image ?? null;

  //     // upload logo only if replaced
  //     if (logoImage?.file) {
  //       logoUrl = await uploadLogoImage();
  //     }
  //     // upload gallery images
  //     await uploadAll();

  //     const body = {
  //       logo: { image: logoUrl },
  //       images: galleryImages,
  //     };

  //     await updateBusiness({ body, businessId }).unwrap();

  //     console.log("Business updated", galleryImages);
  //   } catch {
  //     console.error("Failed to save");
  //   }
  // };

  // const onViewProducts = () => { };

  const onCreateProduct = () => {
    navigate(`${routes.productsMgmt}?businessId=${businessId}`);
  };
  const onClickView = () => {
    navigate(`${routes.productsMgmt}?businessIdView=${businessId}`);
  };
  const onStatusChangeHandler = async (status: string) => {
    try {
      await updateBusiness({
        businessId,
        body: { status: status.toUpperCase() },
      }).unwrap();

      refetch();
      toast.success("Business status updated successfully!");
    } catch (error) {
      toast.error("Failed to update business status.");
      console.error(error);
    }
  };

  const renderContent = () => {
    const commonProps = { t, isDark, business };
    const mediaProps = {
      t,
      isDark,
      errors,
      uploadLogoImage,
      business,
      logoImage,
      handleLogoImageSelect,
      deleteTargetLogo,
      setDeleteTargetLogo,
      isLogoImageDeleting,
      confirmDeleteLogo,
      handleDeleteLogoImage,
      images,
      imagesRef,
      primaryImageIndex,
      setPrimaryImage,
      handleImageUpload,
      deleteTarget,
      setDeleteTarget,
      isImageDeleting,
      confirmDelete,
      handleDeleteImage,
    };

    switch (activeTab) {
      case "overview":
        return <BusinessInfoDetails {...commonProps} />;
      case "contact":
        return <BusinessContactDetails {...commonProps} USER_ROLE={userRole} />;
      case "location":
        return (
          <LocationDetails
            purpose="Business"
            address={business?.address}
            lat={
              business?.geoLocation?.lat ?? business?.location?.coordinates?.[0]
            }
            lng={
              business?.geoLocation?.long ??
              business?.location?.coordinates?.[1]
            }
          />
        );
      case "media":
        return <BusinessMediaDetails {...mediaProps} />;
      case "social":
        return <BusinessOnlinePresenceDetails {...commonProps} />;
      case "delivery":
        return <DeliveryPolicyOptionDetails data={business} />;
      case "accessibility":
        return <BusinessAttributesDetails {...commonProps} />;
      case "hours":
        return <BusinessOpeningHoursDetails {...commonProps} />;
      default:
        return null;
    }
  };
  return (
    <div className=" flex flex-col overflow-hidden relative ">
      <Spinner isLoading={isLoading} />

      {/* Header */}
      <div className={clsx(` shrink-0 border-b px-6 py-4 `, borderColor)}>
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <BackToListBtn navPath={routes.businessMgmt} />

          <div className="flex items-center gap-2">
            {canChangeStatus && (
              <StatusChangeBtn
                handleStatusChange={onStatusChangeHandler}
                status={business?.status}
              />
            )}

            {userRole === UserRole.SUPERADMIN && (
              <button
                onClick={() => setIsOwnerChangeModalOpen(true)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                    : "border-gray-300 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <UserCog className="w-4 h-4" />
                {t("change_owner")}
              </button>
            )}
            <button
              onClick={onClickView}
              className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-lg text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {t("view_product")}
            </button>
            <button
              onClick={() => setIsEditClicked(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              {t("edit")}
            </button>

            {onCreateProduct && (
              <button
                onClick={onCreateProduct}
                className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-lg text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t("create_product")}
              </button>
            )}
          </div>
        </div>

        <BusinessTitleSection business={business} t={t} />
        <PageStats
          stats={businessStats}
          isLoading={isDetailStatsLoading}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 mt-3 gap-4"
        />
        <TabsSection
          tabs={businessTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

      {/* Change Owner Modal */}
      {isOwnerChangeModalOpen && (
        <ChangeOwnerModal
          setIsOpen={setIsOwnerChangeModalOpen}
          USER_ROLE={userRole}
          currentOwner={business?.owner}
        />
      )}

      {isEditClicked && (
        <CreateBusinessWizard
          editData={business}
          currentView={"edit"}
          onClose={() => setIsEditClicked(false)}
        />
      )}
    </div>
  );
}
