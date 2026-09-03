import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BadgePercent, ExternalLink, QrCodeIcon } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "../shared";
import { QRWebsiteModal } from "../shared/QRWebsiteModal";

interface DiscountSite {
  _id: string;
  name: string;
  websiteUrl: string;
  logo?: string;
  purpose?: string;
}

interface DiscountWebsiteQRProps {
  businessId?: string;
  discountWebsites?: DiscountSite[];
}

const FALLBACK_DISCOUNT_URL = "https://tav8.metgo.app/";

const DiscountWebsiteQR = ({
  businessId,
  discountWebsites = [],
}: DiscountWebsiteQRProps) => {
  const { t } = useTranslation("businesses");
  const { isDark } = useThemeClasses();
  const [qrOpen, setQrOpen] = useState(false);

  if (!businessId) return null;

  // The discount site the business supplies (populated by the API). QR points at
  // <siteUrl>businessId=<id>.
  const site = discountWebsites[0];
  const baseUrl = (site?.websiteUrl || FALLBACK_DISCOUNT_URL).replace(
    /\/?$/,
    "/",
  );

  const website = {
    name: site?.name || t("discount_website"),
    url: `${baseUrl}businessId=`,
    logo: site?.logo || "",
  };
  const fullUrl = `${website.url}${businessId}`;

  const openSite = () => {
    window.open(fullUrl, "_blank");
    toast.success(`${website.name} opened`, { duration: 2000 });
  };

  return (
    <>
      <div
        className={clsx(
          "rounded-xl flex flex-col md:flex-row border-2 p-2 md:p-3 gap-6 transition-all duration-200",
          isDark
            ? "bg-linear-to-br from-amber-950/30 to-yellow-900/10 border-amber-600/60"
            : "bg-linear-to-br from-amber-50 to-yellow-50 border-amber-300",
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-5">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-amber-500/20" : "bg-amber-100",
              )}
            >
              <BadgePercent
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-amber-400" : "text-amber-600",
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
                {t("supplier_business")}
              </h3>
              <p
                className={clsx(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {t("supplier_business_desc")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-5">
            <div
              className={clsx(
                "flex flex-col items-center text-center rounded-xl border p-0 md:px-2 transition-all duration-200",
                isDark
                  ? "bg-gray-900/50 border-amber-700/50 hover:border-amber-600"
                  : "bg-white border-amber-200 hover:border-amber-300 hover:shadow-amber-100/60",
              )}
            >
              <div className="flex w-full items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={clsx(
                      "p-2 rounded-lg shrink-0",
                      isDark ? "bg-gray-800" : "bg-gray-100",
                    )}
                  >
                    {site?.logo ? (
                      <ImageWithFallback
                        src={site.logo}
                        alt={website.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <BadgePercent
                        className={clsx(
                          "w-6 h-6",
                          isDark ? "text-amber-400" : "text-amber-600",
                        )}
                      />
                    )}
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
                    onClick={() => setQrOpen(true)}
                    className={clsx(
                      "shrink-0 transition-colors duration-200 cursor-pointer",
                      isDark
                        ? "text-gray-500 hover:text-violet-400"
                        : "text-gray-400 hover:text-violet-600",
                    )}
                  >
                    <QrCodeIcon className="w-5 h-5" />
                  </div>
                  <div
                    onClick={openSite}
                    className={clsx(
                      "shrink-0 transition-colors duration-200 cursor-pointer",
                      isDark
                        ? "text-gray-500 hover:text-blue-400"
                        : "text-gray-400 hover:text-blue-600",
                    )}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QRWebsiteModal
        open={qrOpen}
        website={qrOpen ? website : null}
        setSelectedWebsite={() => setQrOpen(false)}
        isDark={isDark}
        pathname={businessId}
        
      />
    </>
  );
};

export default DiscountWebsiteQR;
