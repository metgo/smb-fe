import React, { useState } from "react";
import { MapPin, Package, Download, ChevronDown, Clock } from "lucide-react";
import { toast } from "sonner";

interface ProductInfoDetailsProps {
  t: (key: string) => string;
  product: Product;
  theme: Theme;
  language: Language;
}

/* -------------------- Component -------------------- */

const ProductInfoDetails: React.FC<ProductInfoDetailsProps> = ({
  t,
  product,
  theme,
  language,
}) => {
  const [showQRDropdown, setShowQRDropdown] = useState(false);

  const handleQRDownload = (site: (typeof qrSites)[0]) => {
    // Generate a mock QR code download
    toast.success(`QR Code Downloaded`, {
      description: `Downloaded QR code for ${site.name}`,
      duration: 2000,
    });
    setShowQRDropdown(false);

    // Simulate QR code download
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 300, 300);

      // Draw mock QR pattern
      ctx.fillStyle = "black";
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i * 30, j * 30, 28, 28);
          }
        }
      }

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${product?.name}-${site.id}-qr-code.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  // QR code sites - these would be filtered based on user permissions
  const qrSites = [
    { id: "tav8", name: "TAV8" },
    { id: "negevtime", name: "NegevTime" },
    { id: "visitnegev", name: "Visit Negev" },
    { id: "tourism-il", name: "Tourism IL" },
    { id: "google-business", name: "Google My Business" },
  ];

  const getProductTypeLabel = (type: Product["productType"]) => {
    const labels = {
      PHYSICAL: t("physical_product"),
      TABLE_ORDER: t("table_order"),
      SERVICE: t("service"),
      HOTEL: t("hotel_room"),
      EXPERIENCE: t("experience"),
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Product Image */}
      <h3
        className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
      >
        {t("product_image")}
      </h3>
      {product?.images?.length > 0 ? (
        <div>
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <img
              src={product?.images[0]?.image}
              alt={product?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="text-gray-400">-</div>
      )}

      {/* Short Description */}
      <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("short_description")}
        </h3>
        <p className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
          {product?.shortDescription}
        </p>
      </div>

      {/* Business */}
      <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("business_name")}
        </h3>
        <div
          className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
        >
          <MapPin className="w-4 h-4" />
          <span>{product?.businessId?.name}</span>
        </div>
      </div>

      {/* Product Type */}
      <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("product_type")}
        </h3>
        <div
          className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
        >
          <Package className="w-4 h-4" />
          <span>{getProductTypeLabel(product?.productType)}</span>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("categories")}
        </h3>
        {product?.categories?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {product?.categories?.map((cat, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-sm ${
                  theme === "dark"
                    ? "bg-teal-900/30 text-teal-400"
                    : "bg-teal-100 text-teal-800"
                }`}
              >
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <div className="">-</div>
        )}
      </div>

      {/* Language Completeness */}
      {/* <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("language_completeness")}
        </h3>
        <div className="flex gap-2">
          {(["en", "he", "ar"] as const).map((lng) => (
            <span
              key={lng}
              className={`px-3 py-1 rounded-full text-sm ${
                product.languageCompleteness[lng]
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              }`}
            >
              {t(`language_${lng}`)}{" "}
              {product.languageCompleteness[lng] ? "✓" : "✗"}
            </span>
          ))}
        </div>
      </div> */}

      {/* Connected Websites */}
      {/* <div
        className={`p-4 rounded-lg border ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <h3
          className={`text-sm mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("connected_websites")}
        </h3>
        <div className="flex flex-wrap gap-3">
          {websiteConnections.map((website) => (
            <button
              key={website.id}
              onClick={() => handleWebsiteClick(website)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${website.color} text-white`}
            >
              {website.logo}
              <span className="text-sm">{website.name}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div> */}

      {/* QR Download */}
      <div
        className={`p-4 rounded-lg border ${
          theme === "dark"
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex justify-between mb-3">
          <h3
            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
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
      </div>

      {/* Last Updated */}
      <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("last_updated")}
        </h3>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{new Date(product?.updatedAt).toLocaleString(language)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoDetails;
