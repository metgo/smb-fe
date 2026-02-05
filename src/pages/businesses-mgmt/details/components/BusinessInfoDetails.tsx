import { useState, type FC } from "react";
import i18n from "@/i18n";

import {
  Tag,
  TrendingUp,
  ExternalLink,
  Download,
  ChevronDown,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useGetCategoriesQuery } from "@/store/api/masterDataApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import { UserRole } from "@/enums/user.types";
import clsx from "clsx";
import { ImageWithFallback } from "@/components/shared";

interface Business {
  shortDescription: string;
  description: string;
  primaryCategoryId: string;
  subcategories: string[];
  tags: string[];
  impact: number;
  internalNotes?: string;
  status: string;
  rejectionNote?: string;
  associatedWebsites: { name: string; url: string }[];
}

interface BusinessInfoDetailsProps {
  t: (key: string) => string;
  business: Business;
}

const qrSites = [
  { id: "tav8", name: "TAV8" },
  { id: "negevtime", name: "NegevTime" },
  { id: "visitnegev", name: "Visit Negev" },
  { id: "tourism-il", name: "Tourism IL" },
  { id: "google-business", name: "Google My Business" },
];

/* ---------- Component ---------- */

const BusinessInfoDetails: FC<BusinessInfoDetailsProps> = ({ t, business }) => {
  const locale = i18n.language as Language;

  const { isDark } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

  const [showQRDropdown, setShowQRDropdown] = useState(false);

  const { data: primaryCategories } = useGetCategoriesQuery({ locale });

  const handleWebsiteClick = (website: any) => {
    if (website.url) {
      window.open(website.url, "_blank");
    }
    toast.success(`${website.name} site opened`, {
      description: `Redirecting to ${website.name}...`,
      duration: 2000,
    });
  };

  const handleQRDownload = (site: (typeof qrSites)[0]) => {
    toast.success(t("qr_code_downloaded"), {
      description: t(`qr_code_download_description, ${site.name} `),
      duration: 2000,
    });
    setShowQRDropdown(false);

    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = "black";
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (Math.random() > 0.5) ctx.fillRect(i * 30, j * 30, 28, 28);
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${business}-${site.id}-qr-code.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Short Description */}
      <div>
        <h3
          className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("short_description")}
        </h3>
        <div
          className={isDark ? "text-gray-300" : "text-gray-700"}
          dangerouslySetInnerHTML={{ __html: business?.shortDescription || "" }}
        />
      </div>

      {/* Full Description */}
      <div>
        <h3
          className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("full_description")}
        </h3>
        <div
          className={isDark ? "text-gray-300" : "text-gray-700"}
          dangerouslySetInnerHTML={{ __html: business?.description || "" }}
        />
      </div>

      {/* Categories */}
      <div>
        <h3
          className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("categories")}
        </h3>

        <div className="flex flex-wrap gap-2">
          {(() => {
            const category = primaryCategories?.datas?.data.find(
              (cat: any) => cat._id === business?.primaryCategoryId,
            );
            return category ? category.name : "-";
          })()}
        </div>
      </div>

      {/* Subcategories */}
      {business?.subcategories?.length > 0 && (
        <div>
          <h3
            className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("subcategories")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {business?.subcategories?.map((subcat, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-sm ${
                  isDark
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {subcat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <h3
        className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        {t("tags")}
      </h3>
      {business?.tags?.length > 0 ? (
        <div>
          <div className="flex flex-wrap gap-2">
            {business?.tags?.map((tag, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded text-xs ${
                  isDark
                    ? "bg-gray-800 text-gray-400"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                <Tag className="w-3 h-3 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p
          className={`text-sm italic ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          -
        </p>
      )}

      {/* Impact */}
      <div>
        <h3
          className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("impact")}
        </h3>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span
            className={`text-2xl ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {business?.impact?.toFixed(1) ? business.impact?.toFixed(1) : "-"}
          </span>
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
            / 10
          </span>
        </div>
      </div>

      {/* Website Connections */}
      {business?.associatedWebsites &&
        business?.associatedWebsites.length > 0 && (
          <div
            className={clsx(
              "rounded-xl border p-6 transition-all duration-200",
              isDark
                ? "bg-linear-to-br from-gray-800 to-gray-800/50 border-gray-700"
                : "bg-linear-to-br from-blue-50 to-purple-50 border-blue-200",
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={clsx(
                  "p-2 rounded-lg",
                  isDark ? "bg-green-500/20" : "bg-green-100",
                )}
              >
                <Globe
                  className={clsx(
                    "w-5 h-5",
                    isDark ? "text-green-400" : "text-green-600",
                  )}
                />
              </div>
              <div>
                <h3
                  className={clsx(
                    "text-sm font-semibold uppercase tracking-wide",
                    isDark ? "text-gray-300" : "text-gray-700",
                  )}
                >
                  {t("connected_websites")}
                </h3>
                <p
                  className={clsx(
                    "text-xs mt-0.5",
                    isDark ? "text-gray-400" : "text-gray-600",
                  )}
                >
                  {business?.associatedWebsites.length}{" "}
                  {business?.associatedWebsites.length === 1
                    ? "website"
                    : "websites"}{" "}
                  connected
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {business?.associatedWebsites?.map((website: any) => (
                <button
                  key={website._id}
                  onClick={() => handleWebsiteClick(website)}
                  className={clsx(
                    "group relative flex items-center gap-3 px-4 py-3 border rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
                    isDark
                      ? "bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-900"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100",
                  )}
                  title={`Open ${website.name}`}
                >
                  <div
                    className={clsx(
                      "p-2 rounded-lg",
                      isDark ? "bg-gray-800" : "bg-gray-100",
                    )}
                  >
                    <ImageWithFallback
                      src={website?.logo || website?.url}
                      alt={website?.name}
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <span
                    className={clsx(
                      "font-medium text-sm flex-1 text-left",
                      isDark ? "text-gray-200" : "text-gray-800",
                    )}
                  >
                    {website.name}
                  </span>
                  <ExternalLink
                    className={clsx(
                      "w-4 h-4 transition-all duration-200",
                      isDark
                        ? "text-gray-500 group-hover:text-blue-400"
                        : "text-gray-400 group-hover:text-blue-600",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

      {/* QR Code Download */}
      <div
        className={`p-4 rounded-lg border ${
          isDark
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("download_qr_codes")}
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowQRDropdown(!showQRDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                isDark
                  ? "bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300"
                  : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">{t("download_qr")}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showQRDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showQRDropdown && (
              <div
                className={`absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg border z-10 ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`p-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
                >
                  <p
                    className={`text-xs px-2 py-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("select_site_for_qr")}
                  </p>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {qrSites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => handleQRDownload(site)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                        isDark
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Download className="w-4 h-4 text-teal-600" />
                      {site.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          {t("qr_code_description")}
        </p>
      </div>

      {/* Internal Notes */}
      {userRole === UserRole.SUPERADMIN && business?.internalNotes && (
        <div
          className={`p-4 rounded-lg ${isDark ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"}`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-yellow-400" : "text-yellow-800"}`}
          >
            {t("internal_notes")}
          </h3>
          <p className={isDark ? "text-yellow-300" : "text-yellow-900"}>
            {business?.internalNotes}
          </p>
        </div>
      )}

      {/* Rejection Note */}
      {business?.status === "rejected" && business?.rejectionNote && (
        <div
          className={`p-4 rounded-lg ${isDark ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"}`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-red-400" : "text-red-800"}`}
          >
            {t("rejection_note")}
          </h3>
          <p className={isDark ? "text-red-300" : "text-red-900"}>
            {business?.rejectionNote || t("no_rejection_note")}
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessInfoDetails;
