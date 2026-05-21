import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import {
  Edit,
  Package,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Copy,
  Eye,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ProductAvailabilityDetails,
  ProductInfoDetails,
  ProductPricingInventoryDetails,
} from "./components";
import {
  useGetProductbyIdQuery,
  useGetProductStatsByIdQuery,
} from "@/store/api/productQueryApi";
import { routes } from "@/lib/routes";
import { skipToken } from "@reduxjs/toolkit/query";
import { useUpdateProductMutation } from "@/store/api/productMutationApi";
import { PageStats, Spinner, TabsSection } from "@/components/shared";
import { CreateProductWizard } from "../components";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { productTabs } from "@/constants/tabs";
import {
  AttributesDetails,
  DeliveryPolicyOptionDetails,
  DetailTitleSection,
  MediaDetails,
} from "@/components/details-sections";
import { StatusChangeBtn } from "@/components/btns";
import { IOpMode } from "@/enums/operation.types";

export default function ProductDetailsPage() {
  const navigate = useNavigate();

  const { t } = useTranslation("products");
  const { t: ct } = useTranslation("common");
  const { t: tt } = useTranslation("toast");

  const { isDark, language, isRTL } = useThemeClasses();
  const [updateProduct] = useUpdateProductMutation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const onViewBusiness = () => {
    navigate(
      `${routes.businessDetails}?businessId=${product?.businessId?._id}`,
    );
  };
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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [opMode, setOpMode] = useState<TOpMode>(IOpMode.EDIT);
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
    refetch();
    setIsEditOpen(false);
  };
  const handleEdit = (mode: TOpMode) => {
    setIsEditOpen(true);
    setOpMode(mode);
  };

  const onStatusChangeHandler = async (status: string) => {
    if (productId)
      try {
        await updateProduct({
          productId,
          body: { status: status.toUpperCase() },
        }).unwrap();

        refetch();
        toast.success(tt("product_status_update_success"));
      } catch (error) {
        toast.error(tt("product_status_update_failed"));
        console.error(error);
      }
  };

  const renderContent = () => {
    const commonProps = { t, language, product };
    const mediaProps = {
      logoImage: null,
      images: (product?.images ?? []).map((img: IImage) => ({
        previewUrl: img.image,
      })),
      primaryImageIndex: 0,
    };
    switch (activeTab) {
      case "overview":
        return <ProductInfoDetails {...commonProps} />;
      case "attributes":
        return (
          <AttributesDetails
            categoriesId={[product?.primaryCategoryId]}
            groupTypesId={product?.groupTypesId}
            accessibilitiesId={product?.accessibilitiesId}
            tags={product?.tagsId}
          />
        );
      case "pricing_inventory":
        return <ProductPricingInventoryDetails {...commonProps} />;
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
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative">
      <Spinner isLoading={isLoading} />

      {/* Action bar */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <button
          onClick={() => navigate(routes.productsMgmt)}
          className={clsx(
            "flex items-center gap-2 py-2 rounded-lg transition-colors",
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

        <div className="flex items-center gap-3">
          <StatusChangeBtn
            status={product?.status}
            handleStatusChange={onStatusChangeHandler}
          />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer ${
                isDark
                  ? "border-gray-700 hover:bg-gray-800 text-gray-300 bg-gray-900"
                  : "border-gray-300 hover:bg-gray-100 text-gray-700 bg-white"
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Actions</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg border z-50 overflow-hidden ${
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <button
                  onClick={() => {
                    handleEdit(IOpMode.EDIT);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                    isDark
                      ? "text-indigo-400 hover:bg-gray-800"
                      : "text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  <Edit className="w-4 h-4 shrink-0" />
                  {t("edit") || "Edit"}
                </button>

                <button
                  onClick={() => {
                    handleEdit(IOpMode.DUPLICATE);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                    isDark
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Copy className="w-4 h-4 shrink-0" />
                  {t("duplicate") || "Duplicate"}
                </button>

                <div
                  className={`mx-3 my-1 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}
                />

                <button
                  onClick={() => {
                    onViewBusiness();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                    isDark
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  {t("view_business")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title + Stats */}
      <div className="details-top shrink-0">
        <DetailTitleSection
          {...product}
          imageSrc={product?.images?.[0]?.image}
        />
        <PageStats
          stats={salesStats}
          isLoading={isStatsLoading}
          className="grid grid-cols-2 lg:grid-cols-3 gap-2 my-4"
        />
      </div>

      {/* Tabs + scrollable content */}
      <div className="mt-6 flex flex-col flex-1 min-h-0">
        <div className="shrink-0">
          <TabsSection
            tabs={productTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="details-content flex-1 overflow-y-auto min-h-0">
          {renderContent()}
        </div>
      </div>

      {isEditOpen && (
        <CreateProductWizard
          onClose={handleClose}
          refetch={refetch}
          product={product}
          opMode={opMode}
        />
      )}
    </div>
  );
}
