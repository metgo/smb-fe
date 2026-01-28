import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Plus, Box, UserCog } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";
import {
  AnalyticsStatsSection,
  BusinessAttributesDetails,
  BusinessContactDetails,
  BusinessDeliveryPolicyDetails,
  BusinessInfoDetails,
  BusinessLocationDetails,
  BusinessMediaDetails,
  BusinessOnlinePresenceDetails,
  BusinessOpeningHoursDetails,
  BusinessTitleSection,
  ChangeOwnerModal,
  TabsSection,
} from "./components";
import { useSearchParams } from "react-router-dom";
import { useGetbusinessBySlugQuery } from "@/store/api/businessQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { useUpdateBusinessMutation } from "@/store/api/businessMutationApi";

interface BusinessDetailsProps {
  onBack: () => void;
  onEdit: () => void;
  onCreateProduct?: () => void;
  onViewProducts?: () => void;
}

const USER_ROLE = "admin"; // Can be: 'superadmin', 'admin', 'dmo', 'authority', 'business_owner'

export default function BusinessDetails({
  onBack,
  onEdit,
  onCreateProduct,
  onViewProducts,
}: BusinessDetailsProps) {
  const { t } = useTranslation("businesses");
  const { theme } = useAppSelector((state) => state.settings);

  const [searchParams] = useSearchParams();
  const businessSlug = searchParams.get("businessSlug");
  const businessId = searchParams.get("businessId");
  const { data: business } = useGetbusinessBySlugQuery(
    businessSlug ? { slug: businessSlug } : skipToken,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businessLogoImage, setBusinessLogoImage] = useState<IImage | null>(
    null,
  );
  const [galleryImages, setGalleryImages] = useState<TImages>([]);

  const [businessMedia, setBusinessMedia] = useState<IBusinessMedia | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [_showStatusModal, setShowStatusModal] = useState(false);
  const [showChangeOwnerModal, setShowChangeOwnerModal] = useState(false);

  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );
  const {
    images,
    imagesRef,
    primaryImageIndex,
    handleImageUpload,
    uploadAll,
    setPrimaryImage,
    // setImages,
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

  const [updateBusiness] = useUpdateBusinessMutation();

  useEffect(() => {
    setGalleryImages(business?.images);
    setBusinessLogoImage({ image: business?.logo?.image });
  }, [business]);

  const handleSubmit = async () => {
    try {
      let logoUrl = businessLogoImage?.image ?? null;

      // upload logo only if replaced
      if (logoImage?.file) {
        logoUrl = await uploadLogoImage();
      }
      // upload gallery images
      await uploadAll();

      const body = {
        logo: { image: logoUrl },
        images: galleryImages,
      };

      await updateBusiness({ body, businessId }).unwrap();

      console.log("Business updated", galleryImages);
    } catch {
      console.error("Failed to save");
    }
  };

  console.log("Business out", galleryImages);

  const renderContent = () => {
    const commonProps = { theme, t, business };
    const mediaProps = {
      theme,
      t,
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
        return (
          <BusinessContactDetails {...commonProps} USER_ROLE={USER_ROLE} />
        );
      case "location":
        return <BusinessLocationDetails {...commonProps} />;
      case "media":
        return <BusinessMediaDetails {...mediaProps} />;
      case "social":
        return <BusinessOnlinePresenceDetails {...commonProps} />;
      case "delivery":
        return <BusinessDeliveryPolicyDetails {...commonProps} />;
      case "accessibility":
        return <BusinessAttributesDetails {...commonProps} />;
      case "hours":
        return <BusinessOpeningHoursDetails {...commonProps} />;
      default:
        return null;
    }
  };
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className={`border-b ${theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} px-6 py-4`}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm hover:text-teal-600 transition-colors ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {t("back_to_list")}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {t("edit")}
            </button>

            {onCreateProduct && (
              <button
                onClick={onCreateProduct}
                className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-lg text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("create_product")}
              </button>
            )}

            {onViewProducts && (
              <button
                onClick={onViewProducts}
                className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-lg text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Box className="w-4 h-4" />
                {t("view_products")}
              </button>
            )}

            {canChangeStatus && (
              <button
                onClick={() => setShowStatusModal(true)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                    : "border-gray-300 hover:bg-gray-100 text-gray-700"
                }`}
              >
                {t("change_status")}
              </button>
            )}

            {USER_ROLE === "admin" && (
              <button
                onClick={() => setShowChangeOwnerModal(true)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                    : "border-gray-300 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <UserCog className="w-4 h-4" />
                {t("change_owner")}
              </button>
            )}
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                theme === "dark"
                  ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                  : "border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              Save
            </button>
          </div>
        </div>

        <BusinessTitleSection business={business} theme={theme} t={t} />
        {business?.analytics && (
          <AnalyticsStatsSection business={business} theme={theme} t={t} />
        )}
        <TabsSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          t={t}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">{renderContent()}</div>

      {/* Change Owner Modal */}
      <ChangeOwnerModal
        isOpen={showChangeOwnerModal}
        onClose={() => setShowChangeOwnerModal(false)}
        theme={theme}
        USER_ROLE={USER_ROLE}
        currentOwner={business?.owner}
        onOwnerChange={(ownerData) => {
          console.log("🚀 ~ BusinessDetails ~ ownerData:", ownerData);
          setShowChangeOwnerModal(false);
        }}
      />
    </div>
  );
}
