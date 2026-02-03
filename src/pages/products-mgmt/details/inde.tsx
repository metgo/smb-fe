import { toast } from "sonner";
import { useState } from "react";
import {
  ArrowLeft,
  Edit,
  Package,
  Copy,
  Calendar,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Box,
  ChevronDown,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";
import {
  ProductAvailabilityDetails,
  ProductInfoDetails,
  ProductInventoryDetails,
  ProductMediaDetails,
  ProductPricingDetails,
} from "./components";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
}

const USER_ROLE = "admin"; // Can be: 'superadmin', 'admin', 'dmo', 'authority', 'business_owner'

export default function ProductDetails({
  product,
  onBack,
  onEdit,
  onDuplicate,
}: any) {
  const { t, i18n } = useTranslation("products");
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const language = i18n.language as Language;

  const [activeTab, setActiveTab] = useState("overview");
  const [currentStatus, setCurrentStatus] = useState<Product["status"]>(
    product.status,
  );
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const canEdit = [
    "superadmin",
    "admin",
    "dmo",
    "authority",
    "business_owner",
  ].includes(USER_ROLE);

  const tabs = [
    { id: "overview", label: t("overview"), icon: FileText },
    {
      id: "pricing",
      label: t("pricing") || "Pricing & Sales",
      icon: DollarSign,
    },
    { id: "inventory", label: t("inventory") || "Inventory", icon: Box },
    {
      id: "availability",
      label: t("availability") || "Availability",
      icon: Calendar,
    },
    { id: "media", label: t("media") || "Media", icon: ImageIcon },
  ];

  const StatusBadge = ({ status }: { status: Product["status"] }) => {
    const statusConfig = {
      draft: { color: "bg-gray-500", label: t("draft") },
      pending: { color: "bg-yellow-500", label: t("pending") },
      approved: { color: "bg-green-500", label: t("approved") },
      rejected: { color: "bg-red-500", label: t("rejected") },
      archived: { color: "bg-gray-400", label: t("archived") },
    };

    const config = statusConfig[status];

    const handleStatusChange = (newStatus: Product["status"]) => {
      setCurrentStatus(newStatus);
      setShowStatusDropdown(false);
      toast.success(t("status_updated") || "Status Updated", {
        description: `${t("product_status_changed_to") || "Product status changed to"} ${statusConfig[newStatus].label}`,
        duration: 2000,
      });
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white ${config?.color} hover:opacity-90 transition-opacity`}
        >
          <span>{config?.label}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {showStatusDropdown && (
          <div
            className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-48 rounded-lg shadow-lg border z-20 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`p-2 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
            >
              <p
                className={`text-xs px-2 py-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                {t("change_status") || "Change Status"}
              </p>
            </div>
            <div className="p-2">
              {(Object.keys(statusConfig) as Array<Product["status"]>).map(
                (statusKey) => {
                  const statusOption = statusConfig[statusKey];
                  const isActive = statusKey === currentStatus;
                  return (
                    <button
                      key={statusKey}
                      onClick={() => handleStatusChange(statusKey)}
                      className={`w-full text-${isRTL ? "right" : "left"} px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                        theme === "dark"
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      } ${isActive ? (theme === "dark" ? "bg-gray-700" : "bg-gray-100") : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${statusOption.color}`}
                        />
                        <span>{statusOption.label}</span>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-teal-500" />}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    const commonProps = { theme, t, language, product };
    switch (activeTab) {
      case "overview":
        return <ProductInfoDetails {...commonProps} />;
      case "pricing":
        return <ProductPricingDetails {...commonProps} />;
      case "inventory":
        return <ProductInventoryDetails {...commonProps} />;
      case "availability":
        return <ProductAvailabilityDetails {...commonProps} />;
      case "media":
        return <ProductMediaDetails {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`h-[calc(100vh-64px)] overflow-y-auto ${
        theme === "dark" ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      {/* Fixed Header */}
      <div
        className={`sticky top-0 z-10 ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        } border-b`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              } transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t("back") || "Back"}</span>
            </button>

            <div className="flex items-center gap-3">
              {canEdit && (
                <>
                  <button
                    onClick={onDuplicate}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      theme === "dark"
                        ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    } transition-colors`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>{t("duplicate") || "Duplicate"}</span>
                  </button>
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{t("edit") || "Edit"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.images[0]}
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
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {product.name}
                </h1>
                {/* <p
                  className={
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }
                >
                  {product.shortDescription}
                </p> */}
              </div>
            </div>
            <StatusBadge status={product.status} />
          </div>
        </div>

        {/* Analytics Stats */}
        <div
          className={`px-6 pb-4 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("total_revenue") || "Total Revenue"}
                </h3>
              </div>
              <p
                className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                ₪
                {(
                  product.quantity?.sold * product.price?.sellingPrice
                ).toLocaleString()}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("units_sold") || "Units Sold"}
                </h3>
              </div>
              <p
                className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {product.quantity?.sold.toLocaleString()}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("available_stock") || "Available Stock"}
                </h3>
              </div>
              <p
                className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {product.quantity?.isUnlimited ? (
                  <span className="text-teal-500">∞</span>
                ) : (
                  (product.quantity?.remaining
                    ? product.quantity.remaining
                    : ""
                  ).toLocaleString()
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`flex gap-1 px-6 overflow-x-auto ${
            theme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? theme === "dark"
                      ? "border-teal-500 text-teal-400"
                      : "border-teal-600 text-teal-600"
                    : theme === "dark"
                      ? "border-transparent text-gray-400 hover:text-gray-300"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div
          className={`${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-xl border p-6`}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
