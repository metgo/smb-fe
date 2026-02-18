import {
  useGetAccessibilityQuery,
  useGetAllSocialMediaQuery,
  useGetCategoriesQuery,
  useGetGroupTypesQuery,
  useGetAllWebsitesQuery,
  useGetDmosQuery,
  useGetSubCategoriesQuery,
} from "@/store/api/masterDataApi";
import { useTranslation } from "react-i18next";

export function useCommon() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language as Language;
  const { data } = useGetDmosQuery();
  const { data: primaryCategories } = useGetCategoriesQuery({ locale });
  const { data: accessibility } = useGetAccessibilityQuery({ locale });
  const { data: groupTypes } = useGetGroupTypesQuery({ locale });
  const { data: subCategories } = useGetSubCategoriesQuery({ locale });

  const { data: socialMedia } = useGetAllSocialMediaQuery();

  const dmosAuthorities: IDmo[] = data?.data;
  const { data: allWebsites } = useGetAllWebsitesQuery();

  const websites = [
    { value: "all", label: t("all_websites") },
    { value: "visitnegev", label: "visitnegev.co.il" },
    { value: "goisrael", label: "goisrael.com" },
    { value: "visiteilat", label: "visiteilat.co.il" },
    { value: "beersheva", label: "tour-beersheva.co.il" },
  ];

  const dateRanges = [
    { value: "last_7_days", label: t("last_7_days") },
    { value: "last_30_days", label: t("last_30_days") },
    { value: "last_90_days", label: t("last_90_days") },
    { value: "last_year", label: t("last_year") },
    { value: "all_time", label: t("all_time") },
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
    dmosAuthorities,
    socialMedia,
    allWebsites,
    groupTypes: groupTypes?.datas?.data,
    accessibility: accessibility?.datas?.data,
    categories: primaryCategories?.datas?.data,
    subCategories: subCategories?.datas?.data,
  };
}
