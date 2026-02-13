import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Edit,
  MapPin,
  Phone,
  Mail,
  Globe,
  Image as ImageIcon,
  Link,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Spinner, TabsSection } from "@/components/shared";
import { skipToken } from "@reduxjs/toolkit/query";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import { useGetMiniSiteByIdQuery } from "@/store/api/miniSiteQueryApi"; // adjust if name differs
import { useAppSelector } from "@/hooks/hooks";
import { BackToListBtn, StatusChangeBtn } from "@/components/btns";
import { MinisiteCreateWizard } from "../components"; // your wizard
import { routes } from "@/lib/routes";
import { LocationDetails } from "@/components/details-sections";

// Simple tabs config (you can move to constants later)
const miniSiteTabs = [
  { id: "overview", label: "Overview" },
  { id: "contact", label: "Contact" },
  { id: "location", label: "Location" },
  { id: "media", label: "Media" },
  { id: "social", label: "Online Presence" },
];

export default function MiniSiteDetailsPage() {
  const { t } = useTranslation("minisites");
  const { borderColor, isDark, bgPrimary, textPrimary, textSecondary } =
    useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

  const [searchParams] = useSearchParams();
  const miniSiteId = searchParams.get("miniSiteId") ?? "";

  const {
    data: miniSite,
    refetch,
    isLoading,
    isFetching,
  } = useGetMiniSiteByIdQuery(miniSiteId ? { miniSiteId } : skipToken);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditClicked, setIsEditClicked] = useState(false);

  const canChangeStatus = [
    "superadmin",
    "admin" /* add campaign roles if needed */,
  ].includes(userRole);

  // ── Media handling ────────────────────────────────────────────────
  const [galleryImages, setGalleryImages] = useState<any[]>([]); // adjust type as needed
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (miniSite) {
      setGalleryImages(miniSite.images || []);
      setLogoPreview(miniSite.logo?.image || null);
    }
  }, [miniSite]);

  // ── Render sections ────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Campaign Basics
          </h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className={`font-medium ${textSecondary}`}>Name</dt>
              <dd className={textPrimary}>{miniSite?.campaignName || "—"}</dd>
            </div>
            <div>
              <dt className={`font-medium ${textSecondary}`}>Code</dt>
              <dd className={textPrimary}>{miniSite?.campaignCode || "—"}</dd>
            </div>
            <div>
              <dt className={`font-medium ${textSecondary}`}>Voucher Amount</dt>
              <dd className={textPrimary}>
                {miniSite?.voucher?.amount
                  ? `₪${miniSite.voucher.amount}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className={`font-medium ${textSecondary}`}>Total Vouchers</dt>
              <dd className={textPrimary}>
                {miniSite?.voucher?.totalVouchers ?? "—"}
              </dd>
            </div>
            <div>
              <dt className={`font-medium ${textSecondary}`}>Validity</dt>
              <dd className={textPrimary}>
                {miniSite?.validity?.startDate && miniSite?.validity?.endDate
                  ? `${new Date(miniSite.validity.startDate).toLocaleDateString()} — ${new Date(miniSite.validity.endDate).toLocaleDateString()}`
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Content</h3>
          <div className="mt-3 space-y-4">
            <div>
              <p className={`font-medium ${textSecondary}`}>
                Title (current language)
              </p>
              <p className={`mt-1 ${textPrimary}`}>
                {miniSite?.contentTitle?.he ||
                  miniSite?.contentTitle?.en ||
                  "—"}
              </p>
            </div>
            <div>
              <p className={`font-medium ${textSecondary}`}>Subtitle</p>
              <p className={`mt-1 ${textPrimary}`}>
                {miniSite?.contentSubtitle?.he ||
                  miniSite?.contentSubtitle?.en ||
                  "—"}
              </p>
            </div>
            <div>
              <p className={`font-medium ${textSecondary}`}>Greeting</p>
              <p className={`mt-1 ${textPrimary}`}>
                {miniSite?.contentGreeting?.he ||
                  miniSite?.contentGreeting?.en ||
                  "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats if available */}
      {miniSite?.analytics && (
        <div className="mt-8">
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Performance
          </h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-lg border ${borderColor} ${bgPrimary}`}
            >
              <p className={`text-sm ${textSecondary}`}>Page Views</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {miniSite.analytics.pageViews ?? "—"}
              </p>
            </div>
            {/* add more stats: vouchers used, conversion, etc. */}
          </div>
        </div>
      )}
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Company / Purchaser
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-500" />
              <div>
                <p className={`font-medium ${textPrimary}`}>
                  {miniSite?.companyName || "—"}
                </p>
                <p className={`text-sm ${textSecondary}`}>Company Name</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Contact Details
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className={textPrimary}>{miniSite?.email || "—"}</p>
                <p className={`text-sm ${textSecondary}`}>Email</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className={textPrimary}>
                  {miniSite?.phoneCountryCode}
                  {miniSite?.phoneNumber ? ` ${miniSite.phoneNumber}` : "—"}
                </p>
                <p className={`text-sm ${textSecondary}`}>Phone</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${textPrimary}`}>
        Office / Delivery Location
      </h3>
      <div className="mt-4">
        <p className={`mb-4 ${textPrimary}`}>
          {miniSite?.officeAddress ||
            miniSite?.address ||
            "No address provided"}
        </p>

        {(miniSite?.geoLocation?.lat && miniSite?.geoLocation?.long) ||
        miniSite?.location?.coordinates ? (
          <LocationDetails
            purpose="MiniSite"
            address={miniSite.officeAddress || miniSite.address}
            lat={
              miniSite.geoLocation?.lat ?? miniSite.location?.coordinates?.[0]
            }
            lng={
              miniSite.geoLocation?.long ?? miniSite.location?.coordinates?.[1]
            }
          />
        ) : (
          <div
            className={`p-8 border-2 border-dashed ${borderColor} rounded-xl text-center ${textSecondary}`}
          >
            No location coordinates available
          </div>
        )}
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-8">
      {/* Logo */}
      <div>
        <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Logo</h3>
        <div className="flex items-start gap-6">
          <div
            className={`w-32 h-32 rounded-xl border ${borderColor} overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center`}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <label
              className={`block text-sm font-medium ${textSecondary} mb-2`}
            >
              Upload new logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            {isLogoDeleting && (
              <p className="text-sm text-red-500 mt-2">Deleting...</p>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
          Gallery Images
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={img.id} className="relative group">
              <img
                src={img.previewUrl || img.gcsURL}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              {primaryImageIndex === idx && (
                <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-1 rounded">
                  Primary
                </span>
              )}
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}

          {/* Upload placeholder */}
          <label
            className={`h-40 border-2 border-dashed ${borderColor} rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors`}
          >
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className={`text-sm ${textSecondary}`}>Add image</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${textPrimary}`}>
        Online Presence
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {miniSite?.socialLinks?.length ? (
          miniSite.socialLinks.map((link: string, i: number) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 border ${borderColor} rounded-lg`}
            >
              <Globe className="w-5 h-5 text-gray-500" />
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-teal-600 hover:underline ${textPrimary}`}
              >
                {link}
              </a>
            </div>
          ))
        ) : (
          <p className={textSecondary}>No social links added yet.</p>
        )}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "contact":
        return renderContact();
      case "location":
        return renderLocation();
      case "media":
        return renderMedia();
      case "social":
        return renderSocial();
      default:
        return (
          <div className="text-center py-12 text-gray-500">Select a tab</div>
        );
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner isLoading={false} />
      </div>
    );
  }

  if (!miniSiteId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Mini-site not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          No mini-site found with ID: {miniSiteId}
        </p>
        <BackToListBtn navPath={routes.miniSiteMgmt} />
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${bgPrimary}`}>
      <Spinner isLoading={isLoading || isFetching} />

      {/* Header */}
      <header className={`shrink-0 border-b px-6 py-5 ${borderColor}`}>
        <div className="flex items-center justify-between mb-5">
          <BackToListBtn navPath={routes.miniSiteMgmt} />

          <div className="flex items-center gap-3">
            {/* {canChangeStatus && (
              <StatusChangeBtn
                handleStatusChange={onStatusChangeHandler}
                status={miniSite?.status}
              />
            )} */}

            <button
              onClick={() => setIsEditClicked(true)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Edit size={16} />
              Edit Mini-site
            </button>
          </div>
        </div>

        {/* Title & quick info */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>
            {miniSite?.campaignName || "Untitled Campaign"}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                miniSite?.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : miniSite?.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {miniSite?.status || "Unknown"}
            </span>
            <span className={textSecondary}>
              Code: <strong>{miniSite?.campaignCode || "—"}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {renderActiveTab()}
      </main>

      {/* Edit Wizard Modal */}
      {isEditClicked && (
        <MinisiteCreateWizard
          onClose={() => setIsEditClicked(false)}
          editingMiniSite={miniSite}
        />
      )}
    </div>
  );
}
