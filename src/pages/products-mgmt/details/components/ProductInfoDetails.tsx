import React from "react";
import { FileText, AlignLeft, BriefcaseBusinessIcon } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";
import clsx from "clsx";
import { getLngWiseStr } from "@/helpers";

interface ProductInfoDetailsProps {
  t: (key: string) => string;
  product: Product;
  language: Language;
}

/* -------------------- Component -------------------- */

const ProductInfoDetails: React.FC<ProductInfoDetailsProps> = ({
  t,
  product,
  language,
}) => {
  const { isDark } = useThemeClasses();
  // const [showQRDropdown, setShowQRDropdown] = useState(false);

  // const handleQRDownload = (site: (typeof qrSites)[0]) => {
  //   // Generate a mock QR code download
  //   toast.success(`QR Code Downloaded`, {
  //     description: `Downloaded QR code for ${site.name}`,
  //     duration: 2000,
  //   });
  //   setShowQRDropdown(false);

  //   // Simulate QR code download
  //   const canvas = document.createElement("canvas");
  //   canvas.width = 300;
  //   canvas.height = 300;
  //   const ctx = canvas.getContext("2d");
  //   if (ctx) {
  //     // White background
  //     ctx.fillStyle = "white";
  //     ctx.fillRect(0, 0, 300, 300);

  //     // Draw mock QR pattern
  //     ctx.fillStyle = "black";
  //     for (let i = 0; i < 10; i++) {
  //       for (let j = 0; j < 10; j++) {
  //         if (Math.random() > 0.5) {
  //           ctx.fillRect(i * 30, j * 30, 28, 28);
  //         }
  //       }
  //     }

  //     // Download
  //     canvas.toBlob((blob) => {
  //       if (blob) {
  //         const url = URL.createObjectURL(blob);
  //         const a = document.createElement("a");
  //         a.href = url;
  //         a.download = `${product?.name}-${site.id}-qr-code.png`;
  //         a.click();
  //         URL.revokeObjectURL(url);
  //       }
  //     });
  //   }
  // };

  // QR code sites - these would be filtered based on user permissions
  // const qrSites = [
  //   { id: "tav8", name: "TAV8" },
  //   { id: "negevtime", name: "NegevTime" },
  //   { id: "visitnegev", name: "Visit Negev" },
  //   { id: "tourism-il", name: "Tourism IL" },
  //   { id: "google-business", name: "Google My Business" },
  // ];

  return (
    <div className="space-y-6">
      {/* Short Description */}
      <DescriptionCard
        title={t("short_description")}
        content={
          product?.shortDescriptionHe ||
          product?.shortDescription ||
          product?.shortDescriptionAr ||
          "-"
        }
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
        content={
          product?.descriptionHe ||
          product?.description ||
          product?.description ||
          "-"
        }
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
        content={getLngWiseStr(
          language,
          product?.businessId?.name,
          product?.businessId?.nameHe,
          product?.businessId?.nameAr,
        )}
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
