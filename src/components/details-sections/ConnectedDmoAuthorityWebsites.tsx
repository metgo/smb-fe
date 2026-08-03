import clsx from "clsx";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ExternalLink,
  Globe,
  Landmark,
  LocateFixed,
  QrCodeIcon,
} from "lucide-react";

import { CopyableId, ImageWithFallback } from "../shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { QRWebsiteModal } from "../shared/QRWebsiteModal";
import { useCommon } from "@/hooks/useCommon";

interface ConnectedDmoAuthorityWebsitesProps {
  dmoId?: string;
  authorityId?: string;
  websiteIds: string[];
}

const ConnectedDmoAuthorityWebsites = ({
  dmoId,
  authorityId,
  websiteIds,
}: ConnectedDmoAuthorityWebsitesProps) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  const { dmosAuthorities, allWebsites } = useCommon();

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

  const dmo = useMemo(
    () => dmosAuthorities?.find((item) => item._id === dmoId),
    [dmosAuthorities, dmoId],
  );

  const authority = useMemo(
    () => dmo?.authorities?.find((item: any) => item._id === authorityId),
    [dmo, authorityId],
  );

  const associatedWebsites = useMemo(() => {
    if (!allWebsites?.length || !websiteIds?.length) return [];
    return allWebsites
      .filter((website) => websiteIds.includes(website._id))
      .map((website) => ({ ...website, url: website.websiteUrl }));
  }, [allWebsites, websiteIds]);

  if (!dmo && !authority && associatedWebsites.length === 0) {
    return (
      <div
        className={clsx(
          "rounded-xl border p-2 md:p-6 transition-all duration-200",
          isDark
            ? "bg-linear-to-br from-gray-800 to-gray-800/50 border-gray-700"
            : "bg-linear-to-br from-blue-50 to-purple-50 border-blue-200",
        )}
      >
        <p
          className={clsx(
            "text-sm font-medium text-center",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {t("no_connected_dmo_authority_websites")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className={clsx(
          "rounded-xl border p-2 md:p-6 transition-all duration-200",
          isDark
            ? "bg-linear-to-br from-gray-800 to-gray-800/50 border-gray-700"
            : "bg-linear-to-br from-blue-50 to-purple-50 border-blue-200",
        )}
      >
        {(dmo || authority) && (
          <div className="mb-5">
            <div className="flex items-center gap-3  mb-4">
              <div
                className={clsx(
                  "p-2 rounded-lg",
                  isDark ? "bg-purple-500/20" : "bg-purple-100",
                )}
              >
                <LocateFixed
                  className={clsx(
                    "w-5 h-5",
                    isDark ? "text-purple-400" : "text-purple-600",
                  )}
                />
              </div>
              <h3
                className={clsx(
                  "text-sm font-semibold uppercase tracking-wide mb-2",
                  isDark ? "text-gray-300" : "text-gray-700",
                )}
              >
                {t("selected_dmo_authority")}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {dmo && (
                <div
                  className={clsx(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5",
                    isDark
                      ? "bg-gray-900/50 border-gray-700"
                      : "bg-white border-gray-200",
                  )}
                >
                  <ImageWithFallback
                    src={dmo.logoPath}
                    alt={dmo.name}
                    className="w-8 h-8 object-contain shrink-0"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={clsx(
                        "font-medium text-sm",
                        isDark ? "text-gray-200" : "text-gray-800",
                      )}
                    >
                      {dmo.name}
                    </span>
                    <CopyableId id={dmo._id} />
                  </div>
                </div>
              )}

              {authority && (
                <div
                  className={clsx(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5",
                    isDark
                      ? "bg-gray-900/50 border-gray-700"
                      : "bg-white border-gray-200",
                  )}
                >
                  {authority.logoPath ? (
                    <ImageWithFallback
                      src={authority.logoPath}
                      alt={authority.name}
                      className="w-8 h-8 object-contain shrink-0"
                    />
                  ) : (
                    <Landmark
                      className={clsx(
                        "w-6 h-6 shrink-0",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={clsx(
                        "font-medium text-sm",
                        isDark ? "text-gray-200" : "text-gray-800",
                      )}
                    >
                      {authority.name}
                    </span>
                    <CopyableId id={authority._id} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <hr />
        {associatedWebsites?.length > 0 && (
          <>
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

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-5">
              {associatedWebsites?.map((website: any, index: number) => (
                <div
                  key={index}
                  className={clsx(
                    "flex flex-col items-center text-center rounded-xl border p-0 md:px-2 transition-all duration-200",
                    isDark
                      ? "bg-gray-900/50 border-gray-700 hover:border-gray-600"
                      : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100/60",
                  )}
                >
                  {/* icon + name + arrow */}
                  <button
                    title={`Open ${website.name}`}
                    className="group flex w-full items-center justify-between gap-3 py-2 rounded-lg transition-colors"
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
          </>
        )}
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

export default ConnectedDmoAuthorityWebsites;
