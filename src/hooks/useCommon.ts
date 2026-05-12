import {
  useGetAccessibilityQuery,
  useGetAllSocialMediaQuery,
  useGetCategoriesQuery,
  useGetGroupTypesQuery,
  useGetDmosQuery,
  useGetSubCategoriesQuery,
  useGetAllTagsQuery,
  useGetAllIconsQuery,
} from "@/store/api/masterDataApi";
import { useGetAllWebsitesQuery } from "@/store/api/masterDataApi";
import { useTranslation } from "react-i18next";

export function useCommon() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language as Language;
  const { data } = useGetDmosQuery();
  const { data: primaryCategories } = useGetCategoriesQuery({ locale });
  const { data: accessibility } = useGetAccessibilityQuery({ locale });
  const { data: groupTypes } = useGetGroupTypesQuery({ locale });
  const { data: subCategories } = useGetSubCategoriesQuery({ locale });
  const { data: allIcons } = useGetAllIconsQuery({});

  const { data: socialMedia } = useGetAllSocialMediaQuery();

  const dmosAuthorities: IDmo[] = data?.data;
  const { data: allWebsites } = useGetAllWebsitesQuery();

  const { data: allTags } = useGetAllTagsQuery();

  const dateRanges = [
    { value: "last_7_days", label: t("last_7_days") },
    { value: "last_30_days", label: t("last_30_days") },
    { value: "last_90_days", label: t("last_90_days") },
    { value: "last_year", label: t("last_year") },
    { value: "all_time", label: t("all_time") },
  ];

  return {
    dateRanges,
    dmosAuthorities,
    socialMedia,
    allWebsites,
    allIcons,
    groupTypes: groupTypes?.datas?.data,
    accessibility: accessibility?.datas?.data,
    categories: primaryCategories?.datas?.data,
    subCategories: subCategories?.datas?.data,
    allTags,
  };
}
