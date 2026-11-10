import { useState } from "react";
import { useTranslation } from "react-i18next";

import ModalWrapper from "@/components/wrapper/ModalWrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getDataStudioReportUrl } from "@/lib/utils";

interface UtmAnalyticsModalProps {
  gaDataStudioId: string;
  pageId: string;
  onClose: () => void;
}

const UtmAnalyticsModal = ({
  gaDataStudioId,
  pageId,
  onClose,
}: UtmAnalyticsModalProps) => {
  const { t } = useTranslation("utm_campaign");
  const { isRTL, language } = useThemeClasses();
  const [isLoaded, setIsLoaded] = useState(false);

  const reportUrl = getDataStudioReportUrl(gaDataStudioId, pageId);

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={!isLoaded}
      maxWidth="max-w-6xl"
    >
      <iframe
        title={t("utm_campaign_results_title")}
        dir={isRTL ? "rtl" : "ltr"}
        lang={language}
        src={reportUrl}
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full ${isLoaded ? "opacity-100" : "opacity-0"}`}
      />
    </ModalWrapper>
  );
};

export default UtmAnalyticsModal;
