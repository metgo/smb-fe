import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit,
  Package,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";

import {
  ProductAvailabilityDetails,
  ProductInfoDetails,
  ProductInventoryDetails,
  ProductPricingDetails,
} from "./components";
import {
  useGetProductbyIdQuery,
  useGetProductStatsByIdQuery,
} from "@/store/api/productQueryApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useUpdateProductMutation } from "@/store/api/productMutationApi";
import { PageStats, Spinner, TabsSection } from "@/components/shared";
import { CreateProductWizard } from "../components";
import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { productTabs } from "@/constants/tabs";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import {
  AttributesDetails,
  DeliveryPolicyOptionDetails,
  MediaDetails,
} from "@/components/details-sections";
import { StatusChangeBtn } from "@/components/btns";
import clsx from "clsx";

export default function ProductDetailsPage() {
  const { t } = useTranslation("products");
  const { t: ct } = useTranslation("common");
  const navigate = useNavigate();

  const { isDark, language, isRTL } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);
  const [updateProduct] = useUpdateProductMutation();

  const [searchParams] = useSearchParams();

  const productId = searchParams.get("productId");
  const {
    data: product,
    isLoading,
    refetch,
  } = useGetProductbyIdQuery(productId ? { productId: productId } : skipToken);
  //individual stats
  const { data: productStats, isLoading: isStatsLoading } =
    useGetProductStatsByIdQuery(productId ?? skipToken);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<TImages>([]);

  const [activeTab, setActiveTab] = useState("overview");
  const salesStats = [
    {
      id: 1,
      title: t("total_revenue"),
      value: `₪${productStats?.totalRevenue}`,
      label: t("all_time") || "All Time",
      icon: <Package className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 2,
      title: t("units_sold"),
      value: productStats?.itemsSold,
      label: t("total_units") || "Total Units",
      icon: <ArrowUpDown className="w-5 h-5 text-green-600" />,
    },

    {
      id: 3,
      title: t("available_stock"),
      value:
        typeof productStats?.availableStock !== "number" ? (
          <span className="text-teal-500">∞</span>
        ) : (
          `₪${productStats?.availableStock}`
        ),
      label: t("current_month") || "Current Month",
      icon: <ArrowUp className="w-5 h-5 text-orange-600" />,
    },
  ];
  const handleClose = () => {
    setIsEditOpen(false);
  };
  const handleEdit = () => {
    setIsEditOpen(true);
  };
  const canEdit = [
    "superadmin",
    "admin",
    "dmo",
    "authority",
    "business_owner",
  ].includes(userRole);

  const {
    images,
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

  useEffect(() => {
    if (product) {
      setGalleryImages(product?.images ?? []);
    }
  }, [product]);

  const onStatusChangeHandler = async (status: string) => {
    if (productId)
      try {
        await updateProduct({
          productId,
          body: { status },
        }).unwrap();

        refetch();
        toast.success("Product status updated successfully!");
      } catch (error) {
        toast.error("Failed to update product status.");
        console.error(error);
      }
  };

  const renderContent = () => {
    const commonProps = { t, language, product };
    const mediaProps = {
      t,
      images,
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
        return <ProductInfoDetails {...commonProps} />;
      case "attributes":
        return (
          <AttributesDetails
            title="Product Attributes"
            categoriesId={product?.categories}
            subCategoriesId={product?.subCategories}
          />
        );
      case "pricing":
        return <ProductPricingDetails {...commonProps} />;
      case "inventory":
        return <ProductInventoryDetails {...commonProps} />;
      case "availability":
        return <ProductAvailabilityDetails {...commonProps} />;
      case "delivery":
        return <DeliveryPolicyOptionDetails data={product} />;
      case "media":
        return <MediaDetails {...mediaProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`h-[calc(100vh-64px)] overflow-y-auto ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <Spinner isLoading={isLoading} />

      {/* Fixed Header */}
      <div
        className={`sticky top-0 z-10 ${
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        } border-b`}
      >
        <div className="max-w-full mx-auto px-6 py-4">
          <div className={clsx("flex items-center justify-between mb-4")}>
            <button
              onClick={() => navigate(routes.productsMgmt)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700",
              )}
            >
              {isRTL ? (
                <ArrowRight className="w-5 h-5" />
              ) : (
                <ArrowLeft className="w-5 h-5" />
              )}
              <span>{ct("back_to_list") || "Back"}</span>
            </button>

            <div className={clsx("flex items-center gap-3")}>
              <p
                className={clsx(
                  "inline-block px-5 py-2 text-sm font-semibold rounded-lg border border-gray-500",
                  product?.status === "active"
                    ? "bg-green-400 text-white border-green-500"
                    : product?.status === "inactive"
                      ? "bg-yellow-500/20 text-yellow-600 border-yellow-400"
                      : product?.status === "draft"
                        ? "bg-gray-500/20 text-gray-600 border-gray-400"
                        : isDark
                          ? "bg-gray-700 text-gray-300 border-gray-600"
                          : "bg-gray-100 text-gray-600 border-gray-300",
                )}
              >
                {product?.status
                  ? product.status.charAt(0).toUpperCase() +
                    product.status.slice(1)
                  : "-"}
              </p>

              {canEdit && (
                <>
                  <StatusChangeBtn
                    isProduct
                    status={product?.status}
                    handleStatusChange={onStatusChangeHandler}
                  />
                  {/* <button
                    // onClick={onDuplicate}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      isDark
                        ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    } transition-colors`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>{t("duplicate") || "Duplicate"}</span>
                  </button> */}
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{t("edit") || "Edit"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={clsx("flex items-center gap-4")}>
            <div className="w-16 h-16 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
              {product?.images?.length > 0 ? (
                <img
                  src={product?.images[0]?.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1
                className={`text-2xl mb-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {product?.name}
              </h1>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                {product?.shortDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Stats */}
        <PageStats
          stats={salesStats}
          isLoading={isStatsLoading}
          className={`grid  grid-cols-2 lg:grid-cols-3 gap-2 md:p-4 lg:p-8`}
        />

        <TabsSection
          tabs={productTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Content */}
      <div
        className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-xl border p-6 my-6 max-w-full`}
      >
        {renderContent()}
      </div>
      {isEditOpen && (
        <CreateProductWizard isOpen={isEditOpen} onClose={handleClose} />
      )}
    </div>
  );
}
