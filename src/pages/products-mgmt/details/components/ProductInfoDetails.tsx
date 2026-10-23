import React from "react";
import { FileText, AlignLeft, BriefcaseBusinessIcon } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";
import clsx from "clsx";

interface ProductInfoDetailsProps {
  t: (key: string) => string;
  product: Product;
}

/* -------------------- Component -------------------- */

const ProductInfoDetails: React.FC<ProductInfoDetailsProps> = ({
  t,
  product,
}) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="space-y-6">
      {/* Short Description */}
      <DescriptionCard
        title={t("short_description")}
        content={product?.shortDescription}
        icon={
          <FileText
            className={clsx(
              "w-5 h-5",
              isDark ? "text-blue-400" : "text-blue-600",
            )}
          />
        }
        iconBgClass={isDark ? "bg-blue-500/20" : "bg-blue-100"}
        isDark={isDark}
      />

      {/*  Description */}
      <DescriptionCard
        title={t("full_description")}
        content={product?.description}
        icon={
          <AlignLeft
            className={clsx(
              "w-5 h-5",
              isDark ? "text-purple-400" : "text-purple-600",
            )}
          />
        }
        iconBgClass={isDark ? "bg-purple-500/20" : "bg-purple-100"}
        isDark={isDark}
        preWrap={true} // preserves line breaks
      />

      <DescriptionCard
        title={t("business_name")}
        content={product?.businessId?.name}
        icon={
          <BriefcaseBusinessIcon
            className={clsx(
              "w-5 h-5",
              isDark ? "text-purple-400" : "text-purple-600",
            )}
          />
        }
        iconBgClass={isDark ? "bg-purple-500/20" : "bg-purple-100"}
        isDark={isDark}
        preWrap={true} // preserves line breaks
      />

      {/* QR Download */}
      {/* future use */}
      {/* <div
        className={`p-4 rounded-lg border ${
          isDark
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex justify-between mb-3">
          <h3
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("download_qr_codes")}
          </h3>

          <button
            onClick={() => setShowQRDropdown(!showQRDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border"
          >
            <Download className="w-4 h-4" />
            {t("download_qr")}
            <ChevronDown
              className={`w-4 h-4 ${showQRDropdown ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {showQRDropdown && (
          <div className="space-y-2">
            {qrSites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleQRDownload(site)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg"
              >
                <Download className="w-4 h-4 text-teal-600" />
                {site.name}
              </button>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default ProductInfoDetails;
