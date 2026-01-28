import {
  useGetAccessibilityQuery,
  useGetAllSocialMediaQuery,
  useGetCategoriesQuery,
  useGetDmosQuery,
  useGetGroupTypesQuery,
} from "@/store/api/masterDataApi";
import { useTranslation } from "react-i18next";

export function useCommon() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language as Language;
  const { data } = useGetDmosQuery();
  const { data: primaryCategories } = useGetCategoriesQuery({ locale });
  const { data: accessibility } = useGetAccessibilityQuery({ locale });
  const { data: groupTypes } = useGetGroupTypesQuery({ locale });
  const { data: socialMedia } = useGetAllSocialMediaQuery();

  const dmosAuthorities: IDmo[] = data?.data;

  const authorities = [
    { value: "all", label: t("all_authorities") },
    { value: "negev", label: "Western Negev Tourism Authority" },
    { value: "southern", label: "Southern District Tourism" },
    { value: "eilat", label: "Eilat Tourism Corporation" },
    { value: "beersheva", label: "Be'er Sheva Development Authority" },
  ];

  const websites = [
    { value: "all", label: t("all_websites") },
    { value: "visitnegev", label: "visitnegev.co.il" },
    { value: "goisrael", label: "goisrael.com" },
    { value: "visiteilat", label: "visiteilat.co.il" },
    { value: "beersheva", label: "tour-beersheva.co.il" },
  ];

  const dateRanges = [
    { value: "last7days", label: t("last_7_days") },
    { value: "last30days", label: t("last_30_days") },
    { value: "last90days", label: t("last_90_days") },
    { value: "custom", label: t("last_year") },
  ];

  const languages: { value: Language; label: string }[] = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
    { value: "he", label: "עברית" },
  ];

  return {
    websites,
    dateRanges,
    languages,
    authorities,
    dmosAuthorities,
    primaryCategories,
    accessibility,
    groupTypes,
    socialMedia,
  };
}
