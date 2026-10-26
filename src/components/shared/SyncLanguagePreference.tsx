import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useGetUserInfoQuery } from "@/store/api/userQueryApi";

export default function SyncLanguagePreference() {
  const { i18n } = useTranslation();
  const { data: userInfo } = useGetUserInfoQuery();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current || !userInfo?.languagePreference) return;
    hasSynced.current = true;

    if (userInfo.languagePreference !== i18n.language) {
      i18n.changeLanguage(userInfo.languagePreference).catch((error) => {
        console.error("Failed to sync language preference", error);
      });
    }
  }, [userInfo?.languagePreference, i18n]);

  return null;
}
