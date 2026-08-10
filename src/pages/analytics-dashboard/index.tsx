import { useState } from "react";
import { BarChart3, ExternalLink } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import { useAppSelector } from "@/hooks/hooks";
import { websitesAnalyticsReport } from "@/lib/utils";
import { Spinner } from "@/components/shared";

const AnalyticsDashboardPage = () => {
  const { bgPrimary, textPrimary, textTertiary, borderColor, isRTL, language } =
    useThemeClasses();
  const { websiteId } = useAppSelector((state) => state.auth);
  const [isLoaded, setIsLoaded] = useState(false);

  const website = websitesAnalyticsReport.find(
    (site) => site._id === websiteId,
  );

  if (!websiteId) {
    return (
      <div
        className={`h-[85vh] w-full flex items-center justify-center ${bgPrimary}`}
      >
        <div className="flex flex-col items-center text-center gap-4 max-w-md px-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>
              No Website Selected
            </h2>
            <p className={`text-sm ${textTertiary} mt-1`}>
              Select a website to view its analytics dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (website && !website.gaDataStudioId) {
    return (
      <div
        className={`h-[85vh] w-full flex items-center justify-center ${bgPrimary}`}
      >
        <div className="flex flex-col items-center text-center gap-4 max-w-md px-6">
          <img
            src={website.logo}
            alt={`${website.name} logo`}
            className="w-40 h-40 object-contain rounded-lg"
          />

          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>
              No Analytics Report Available
            </h2>
            <p className={`text-sm ${textTertiary} mt-1`}>
              Create the data studio report for this website to view its
              analytics dashboard.
            </p>
          </div>

          <div
            className={`w-full border-t ${borderColor} pt-4 flex flex-col gap-1`}
          >
            <span className={`text-sm font-semibold ${textPrimary}`}>
              {website.name}
            </span>
            {website.websiteUrl && (
              <a
                href={website.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
              >
                {website.websiteUrl}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const reportUrl =
    website &&
    `https://datastudio.google.com/embed/reporting/${website.gaDataStudioId}/page/kIV1C`;

  return (
    <div className={`relative h-[95vh] w-full ${bgPrimary}`}>
      <Spinner isLoading={!isLoaded} />
      <iframe
        dir={isRTL ? "rtl" : "ltr"}
        lang={language}
        style={{ height: "85vh", width: "100%" }}
        src={reportUrl}
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        onLoad={() => setIsLoaded(true)}
        className={isLoaded ? "opacity-100" : "opacity-0"}
      />
    </div>
  );
};

export default AnalyticsDashboardPage;
