import clsx from "clsx";
import { toast } from "sonner";
import { type FC } from "react";
import { useState } from "react";
import {
  AlignLeft,
  ExternalLink,
  FileText,
  Globe,
  QrCodeIcon,
} from "lucide-react";
import { QRWebsiteModal } from "@/components/shared/QRWebsiteModal";
import { UserRole } from "@/enums/user.types";
import { useAppSelector } from "@/hooks/hooks";
import { ImageWithFallback } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import DescriptionCard from "@/components/shared/DescriptionCard";

interface Business {
  shortDescription: string;
  shortDescriptionAr: string;
  shortDescriptionHe: string;
  description: string;
  descriptionHe: string;
  descriptionAr: string;
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

/* ---------- Component ---------- */

const BusinessInfoDetails: FC<BusinessInfoDetailsProps> = ({ t, business }) => {
  const { isDark } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);

  const [selectedWebsite, setSelectedWebsite] = useState<any | null>(null);
  const handleWebsiteClick = (website: any) => {
    if (website.url) {
      window.open(website.url, "_blank");
    }
    toast.success(`${website.name} site opened`, {
      description: `Redirecting to ${website.name}...`,
      duration: 2000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Short Description */}
      <DescriptionCard
        title={t("short_description")}
        content={
          business?.shortDescriptionHe ||
          business?.shortDescription ||
          business?.shortDescriptionAr ||
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
      {/* Full Description */}
      <DescriptionCard
        title={t("full_description")}
        content={
          business?.descriptionHe ||
          business?.description ||
          business?.descriptionAr ||
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
            <div className="flex items-center gap-3 mb-5">
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
                  {business.associatedWebsites.length}{" "}
                  {business.associatedWebsites.length === 1
                    ? "website"
                    : "websites"}{" "}
                  connected
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {business.associatedWebsites.map(
                (website: any, index: number) => (
                  <div
                    key={index}
                    className={clsx(
                      "flex flex-col items-center text-center rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
                      isDark
                        ? "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100/60",
                    )}
                  >
                    {/* icon + name + arrow */}
                    <button
                      onClick={() => handleWebsiteClick(website)}
                      className="group  flex w-full items-center justify-between gap-3 px-2 py-2.5 rounded-lg transition-colors"
                      title={`Open ${website.name}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={clsx(
                            "p-2 rounded-lg shrink-0",
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
                            "font-medium text-sm truncate text-left flex-1",
                            isDark ? "text-gray-200" : "text-gray-800",
                          )}
                        >
                          {website.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWebsite(website);
                          }}
                          className={clsx(
                            "w-4 h-4 shrink-0 transition-colors duration-200",
                            isDark
                              ? "text-gray-500 group-hover:text-blue-400"
                              : "text-gray-400 group-hover:text-blue-600",
                          )}
                        >
                          <QrCodeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <ExternalLink
                            className={clsx(
                              "w-4 h-4 shrink-0 transition-colors duration-200",
                              isDark
                                ? "text-gray-500 group-hover:text-blue-400"
                                : "text-gray-400 group-hover:text-blue-600",
                            )}
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
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
      <QRWebsiteModal
        open={!!selectedWebsite}
        website={selectedWebsite}
        setSelectedWebsite={setSelectedWebsite}
        isDark={isDark}
      />{" "}
    </div>
  );
};

export default BusinessInfoDetails;
