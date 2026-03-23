import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { ExternalLink, Globe, QrCodeIcon } from "lucide-react";

import { ImageWithFallback } from "../shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { QRWebsiteModal } from "../shared/QRWebsiteModal";

interface ConnectedWebsitesProps {
  t: (key: string) => string;
  associatedWebsites: any;
}

const ConnectedWebsites = ({
  t,
  associatedWebsites,
}: ConnectedWebsitesProps) => {
  const { isDark } = useThemeClasses();

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
    <>
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
              {associatedWebsites.length}{" "}
              {associatedWebsites.length === 1 ? "website" : "websites"}{" "}
              connected
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {associatedWebsites?.map((website: any, index: number) => (
            <div
              key={index}
              className={clsx(
                "flex flex-col items-center text-center rounded-xl border p-4 transition-all duration-200",
                isDark
                  ? "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100/60",
              )}
            >
              {/* icon + name + arrow */}
              <button
                title={`Open ${website.name}`}
                className="group flex w-full items-center justify-between gap-3 px-2 py-2.5 rounded-lg transition-colors"
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
                    onClick={() => setSelectedWebsite(website)}
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
                    onClick={() => handleWebsiteClick(website)}
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
              </button>
            </div>
          ))}
        </div>
      </div>

      <QRWebsiteModal
        open={!!selectedWebsite}
        website={selectedWebsite}
        setSelectedWebsite={setSelectedWebsite}
        isDark={isDark}
      />
    </>
  );
};

export default ConnectedWebsites;
