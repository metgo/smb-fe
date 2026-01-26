import { useState, type FC } from "react";
import {
  Tag,
  TrendingUp,
  ExternalLink,
  Download,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

/* ---------- Types ---------- */

type Theme = "light" | "dark";

// interface WebsiteConnection {
//   id: string | number
//   name: string
//   logo: JSX.Element
//   color: string
// }

interface Business {
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  subcategories: string[];
  tags: string[];
  impact: number;
  internalNotes?: string;
  status: string;
  rejectionNote?: string;
}

/* ---------- Props ---------- */

interface BusinessInfoDetailsProps {
  theme: Theme;
  t: (key: string) => string;
  business: Business;
  canChangeStatus?: boolean;
}

const websiteConnections = [
  {
    id: "tav8",
    name: "TAV8",
    logo: "🎯",
    url: "https://tav8.com",
    color: "bg-blue-600",
  },
  {
    id: "negevtime",
    name: "NegevTime",
    logo: "⏰",
    url: "https://negevtime.com",
    color: "bg-purple-600",
  },
  {
    id: "visitnegev",
    name: "Visit Negev",
    logo: "🏜️",
    url: "https://visitnegev.com",
    color: "bg-amber-600",
  },
  {
    id: "tourism-il",
    name: "Tourism IL",
    logo: "🇮🇱",
    url: "https://tourism.gov.il",
    color: "bg-green-600",
  },
];

const qrSites = [
  { id: "tav8", name: "TAV8" },
  { id: "negevtime", name: "NegevTime" },
  { id: "visitnegev", name: "Visit Negev" },
  { id: "tourism-il", name: "Tourism IL" },
  { id: "google-business", name: "Google My Business" },
];

/* ---------- Component ---------- */

const BusinessInfoDetails: FC<BusinessInfoDetailsProps> = ({
  theme,
  t,
  business,
  canChangeStatus,
}) => {
  const [showQRDropdown, setShowQRDropdown] = useState(false);

  const handleWebsiteClick = (website: (typeof websiteConnections)[0]) => {
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
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("short_description")}
        </h3>
        <p className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
          {business?.shortDescription}
        </p>
      </div>

      {/* Full Description */}
      <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("full_description")}
        </h3>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          {business?.fullDescription}
        </p>
      </div>

      {/* Categories */}
      <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("categories")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {business?.categories?.map((cat, idx) => (
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
      </div>

      {/* Subcategories */}
      {business?.subcategories?.length > 0 && (
        <div>
          <h3
            className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("subcategories")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {business?.subcategories?.map((subcat, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-sm ${
                  theme === "dark"
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
      {business?.tags?.length > 0 && (
        <div>
          <h3
            className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("tags")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {business?.tags?.map((tag, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded text-xs ${
                  theme === "dark"
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
      )}

      {/* Impact */}
      <div>
        <h3
          className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("impact")}
        </h3>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span
            className={`text-2xl ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
          >
            {business?.impact?.toFixed(1)}
          </span>
          <span
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            / 10
          </span>
        </div>
      </div>

      {/* Website Connections */}
      <div
        className={`p-4 rounded-lg border ${
          theme === "dark"
            ? "bg-linear-to-br from-gray-800/50 to-gray-900/30 border-gray-700"
            : "bg-linear-to-br from-blue-50 to-purple-50 border-blue-200"
        }`}
      >
        <h3
          className={`text-sm mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("connected_websites")}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {websiteConnections?.map((website) => (
            <button
              key={website.id}
              onClick={() => handleWebsiteClick(website)}
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-lg ${website.color} hover:shadow-lg text-white transition-all duration-200 hover:scale-105`}
              title={`Open ${website.name}`}
            >
              <span className="text-lg">{website.logo}</span>
              <span className="font-medium text-sm">{website.name}</span>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* QR Code Download */}
      <div
        className={`p-4 rounded-lg border ${
          theme === "dark"
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("download_qr_codes")}
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowQRDropdown(!showQRDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                theme === "dark"
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
                    {t("select_site_for_qr")}
                  </p>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {qrSites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => handleQRDownload(site)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                        theme === "dark"
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
        <p
          className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
        >
          {t("qr_code_description")}
        </p>
      </div>

      {/* Internal Notes */}
      {canChangeStatus && business?.internalNotes && (
        <div
          className={`p-4 rounded-lg ${theme === "dark" ? "bg-yellow-900/20 border border-yellow-800" : "bg-yellow-50 border border-yellow-200"}`}
        >
          <h3
            className={`text-sm mb-2 ${theme === "dark" ? "text-yellow-400" : "text-yellow-800"}`}
          >
            {t("internal_notes")}
          </h3>
          <p
            className={theme === "dark" ? "text-yellow-300" : "text-yellow-900"}
          >
            {business?.internalNotes}
          </p>
        </div>
      )}

      {/* Rejection Note */}
      {business?.status === "rejected" && business?.rejectionNote && (
        <div
          className={`p-4 rounded-lg ${theme === "dark" ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"}`}
        >
          <h3
            className={`text-sm mb-2 ${theme === "dark" ? "text-red-400" : "text-red-800"}`}
          >
            {t("rejection_note")}
          </h3>
          <p className={theme === "dark" ? "text-red-300" : "text-red-900"}>
            {business?.rejectionNote || t("no_rejection_note")}
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessInfoDetails;
