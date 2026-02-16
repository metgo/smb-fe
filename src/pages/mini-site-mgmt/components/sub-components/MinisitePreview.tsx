import React from "react";
import { Monitor, Smartphone, Copy } from "lucide-react";

interface MiniSitePreviewProps {
  t: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  previewMode: "desktop" | "mobile";
  setPreviewMode: (mode: "desktop" | "mobile") => void;
  selectedProducts: string[];
  mockProducts: Array<{ id: string; name: string; price: number | string }>;
  copyMiniSiteUrl: () => void;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  borderColor: string;
}

export const MiniSitePreview: React.FC<MiniSitePreviewProps> = ({
  t,
  previewMode,
  setPreviewMode,
  formData,
  mockProducts,
  copyMiniSiteUrl,
  textPrimary,
  textSecondary,
  textTertiary,
  bgPrimary,
  bgSecondary,
  bgTertiary,
  borderColor,
}) => {
  const miniSiteUrl = `https://tav-8.co.il/mini-site?campCode=${formData.campaignCode}&voucherId=65c3874cd753aecdd6cb85ae&customerEmail=${formData.email}`;

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg ${textPrimary}`}>
          {t.miniSitePreview || "Mini-Site Preview"}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode("desktop")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              previewMode === "desktop"
                ? "bg-purple-600 text-white"
                : `${bgSecondary} ${textSecondary}`
            }`}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => setPreviewMode("mobile")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              previewMode === "mobile"
                ? "bg-purple-600 text-white"
                : `${bgSecondary} ${textSecondary}`
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>
      </div>

      {/* Preview container */}
      <div className={`${bgSecondary} rounded-lg p-8 flex justify-center`}>
        <div
          className={`${bgPrimary} rounded-lg shadow-2xl overflow-hidden ${
            previewMode === "desktop" ? "w-full max-w-4xl" : "w-80"
          }`}
          style={{
            height: previewMode === "desktop" ? "600px" : "667px",
          }}
        >
          <div
            className="p-6 space-y-6"
            dir={formData.contentLanguage === "en" ? "ltr" : "rtl"}
          >
            {/* Title */}
            <h1 className={`text-2xl ${textPrimary} text-center`}>
              {formData.contentTitle[formData.contentLanguage]?.trim() ||
                "Campaign Title"}
            </h1>

            {/* Subtitle */}
            <p className={`${textSecondary} text-center`}>
              {formData.contentSubtitle[formData.contentLanguage]?.trim() ||
                "Campaign subtitle"}
            </p>

            {/* Featured Products */}
            <div className={`${bgSecondary} rounded-lg p-4`}>
              <h3 className={`text-sm ${textTertiary} mb-3`}>
                {t.featuredProducts || "Featured Products"}
              </h3>
              <div className="space-y-2">
                {formData.selectedProducts
                  ?.slice(0, 3)
                  .map((productId: string) => {
                    const product = mockProducts.find(
                      (p) => p.id === productId,
                    );
                    return product ? (
                      <div
                        key={product.id}
                        className={`${bgTertiary} rounded p-3 flex items-center gap-3`}
                      >
                        <div
                          className={`w-12 h-12 ${bgSecondary} rounded shrink-0`}
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${textPrimary}`}>
                            {product.name}
                          </p>
                          <p className={`text-xs ${textTertiary}`}>
                            ₪{product.price}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })}

                {(formData.selectedProducts?.length ?? 0) === 0 && (
                  <p className={`text-sm ${textTertiary} text-center py-4`}>
                    No products selected yet
                  </p>
                )}
              </div>
            </div>

            {/* Greeting / Message */}
            <div className={`${bgSecondary} rounded-lg p-4`}>
              <p className={`text-sm ${textSecondary}`}>
                {formData.contentGreeting[formData.contentLanguage]?.trim() ||
                  "Greeting message will appear here"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini-Site URL section */}
      <div className={`${bgSecondary} rounded-lg p-4`}>
        <label className={`block text-sm ${textSecondary} mb-2`}>
          {t.miniSiteUrl || "Mini-Site URL"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={miniSiteUrl}
            className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary} text-sm`}
          />
          <button
            onClick={copyMiniSiteUrl}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {t.copy || "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};
