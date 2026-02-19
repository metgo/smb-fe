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
  AttributesDetails,
  DeliveryPolicyOptionDetails,
  LocationDetails,
} from "@/components/details-sections";
import { businessTabs } from "@/constants/tabs";
import {
  CreateProductWizard,
  ProductGridView,
} from "@/pages/products-mgmt/components";
import {
  useGetAllProductsQuery,
  useLazyGetProductbyIdQuery,
} from "@/store/api/productQueryApi";

export default function BusinessDetailsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("businesses");
  const { t: tc } = useTranslation("common");

  const { borderColor, isDark, textPrimary } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState();
  const businessId = searchParams.get("businessId") ?? "";
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);
  const [errors, _setErrors] = useState<Record<string, string>>({});
  const [businessLogoImage, setBusinessLogoImage] = useState<IImage | null>(
    null,
  );
  const [galleryImages, setGalleryImages] = useState<TImages>([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [isOwnerChangeModalOpen, setIsOwnerChangeModalOpen] = useState(false);

  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);

  ///business detail stats
  const {
    data,
    refetch,
    isLoading: isDetailStatsLoading,
  } = useGetIndividualBusinessStatsQuery({ businessId }, { skip: !businessId });

  const [getProductDetailsById, { isLoading: isProductDetailsFetching }] =
    useLazyGetProductbyIdQuery();

  const {
    data: productData,
    refetch: productRefetch,
    isFetching,
    isLoading: isLoadingProduct,
  } = useGetAllProductsQuery(
    { limit: 7, page, businessId },
    { skip: !businessId },
  );

  const products = productData?.data ?? [];
  const hasMore = productData?.meta?.hasNextPage;

  useEffect(() => {
    if (page === 1) setCombinedProducts(products);
    else {
      setCombinedProducts((prev: any) => {
        const existingIds = new Set(prev.map((b: any) => b._id));
        const newItems = products?.filter((b: any) => !existingIds?.has(b._id));

        return [...prev, ...newItems];
      });
    }
  }, [products, page]);

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => {
      return prev + 1;
    });
  };

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
    isLoading,
    data: business,
    refetch: businessDataRefetch,
  } = useGetbusinessByIdQuery(businessId ? { businessId } : skipToken);
  const [updateBusiness] = useUpdateBusinessMutation();

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

  useEffect(() => {
    setGalleryImages(business?.images);
    setBusinessLogoImage({ image: business?.logo?.image });
  }, [business]);

  useEffect(() => {
    if (!isEditClicked) {
      businessDataRefetch();
    }
  }, [isEditClicked]);

  const onStatusChangeHandler = async (status: string) => {
    try {
      await updateBusiness({
        businessId,
        body: { status: status.toUpperCase() },
      }).unwrap();

      toast.success("Business status updated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to update business status.");
      console.error(error);
    }
  };

  const handleEditProductClick = async (productId: string) => {
    await getProductDetailsById({ productId }).then((res) => {
      setProduct(res?.data);
    });
    navigate(`?businessId=${businessId}&productId=${productId}`);
    setIsEditProductModalOpen(true);
  };

  const handleProductModalClose = () => {
    setIsCreateProductModalOpen(false);
    setIsEditProductModalOpen(false);
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
        return (
          <AttributesDetails
            title="Business Attributes"
            categoriesId={[business?.primaryCategoryId]}
            groupTypesId={business?.groupTypesId}
            accessibilitiesId={business?.accessibilitiesId}
            tags={business?.tags}
          />
        );
      case "hours":
        return <BusinessOpeningHoursDetails {...commonProps} />;
      case "products":
        return (
          <>
            {combinedProducts?.length > 0 ? (
              <div>
                <h2 className={clsx("text-lg font-semibold mb-4", textPrimary)}>
                  {tc("products")} ({productData?.totalData})
                </h2>
                <ProductGridView
                  products={combinedProducts}
                  hasMore={hasMore}
                  isLoading={isFetching || isLoadingProduct}
                  refetch={productRefetch}
                  fetchNextPage={fetchNextPage}
                  handleEditClick={handleEditProductClick}
                />
              </div>
            ) : (
              <div>
                <h2 className={clsx("text-lg font-semibold mb-4", textPrimary)}>
                  {tc("products")}
                </h2>
                <p className={clsx("mb-4", textPrimary)}>
                  {t("no_products_yet")}
                </p>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className=" flex flex-col overflow-hidden relative ">
      <Spinner isLoading={isLoading || isProductDetailsFetching} />

      {/* Header */}
      <div className={clsx(` shrink-0 border-b px-6 py-4 `, borderColor)}>
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <BackToListBtn navPath={routes.businessMgmt} />

          <div className="flex items-center gap-2">
            <StatusChangeBtn
              handleStatusChange={onStatusChangeHandler}
              status={business?.status}
            />

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
              onClick={() => setIsEditClicked(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              {t("edit")}
            </button>

            <button
              onClick={() => setIsCreateProductModalOpen(true)}
              className="px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-lg text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t("create_product")}
            </button>
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
          refetch={refetch}
        />
      )}

      {(isCreateProductModalOpen || isEditProductModalOpen) && (
        <CreateProductWizard
          refetch={productRefetch}
          onClose={handleProductModalClose}
          product={isEditProductModalOpen ? product : undefined}
          // businessName={business?.name}
          // bzIdForProdCreate={businessId}
        />
      )}
    </div>
  );
}
