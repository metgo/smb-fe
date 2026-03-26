"use client";

import { ReactNode, useEffect } from "react";
import useGeneralStore from "@/stores/generalStore";
import { getApproxUserLocation } from "@/actions/getWether";
import {
  getAminitiesInfo,
  getPresetFeedConfig,
  getPromotionsList,
  getSiteInfo,
} from "@/actions/commonActions";
import { useSearchParams } from "next/navigation";

export let initialSelectedFiltersIds: PresetFilterItems;

export const SiteInfoClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const params = useSearchParams();
  const isFeed = params.get("isFeed") || "false";
  const {
    setUserLiveLocation,
    setSiteInfo,
    setAminitiesInfo,
    setPromotionalItems,
    setHideFirstTwoSection,
    setPresetFeedFilters,
  } = useGeneralStore();

  async function fetchSiteinfo() {
    const res = await getSiteInfo();
    setSiteInfo(res);
  }

  async function fetchPresetFeedConfig() {
    const res = await getPresetFeedConfig()
    setPresetFeedFilters(res)
  }

  async function fetchUserCurrentLocation() {
    try {
      const res = await getApproxUserLocation();
      if (res) {
        setUserLiveLocation({
          lat: res.lat,
          lng: res.lng,
        });
      }
    } catch (err) {
      console.error("Failed to get user location:", err);
    }
  }

  async function fetchAminitiesInfo() {
    try {
      const res = await getAminitiesInfo();
      setAminitiesInfo(res);
    } catch (error) {
      console.error("Failed to get amenities info:", error);
    }
  }

  async function fetchPromotionalItems() {
    try {
      const res = await getPromotionsList();
      setPromotionalItems(res?.allPromotionalItems);
    } catch (error) {
      console.error("Failed to get promotional items:", error);
    }
  }

  useEffect(() => {
    if (isFeed === "true") setHideFirstTwoSection(true);
  }, [params]);

  useEffect(() => {
    fetchSiteinfo();
    fetchAminitiesInfo();
    fetchUserCurrentLocation();
    fetchPromotionalItems();
    fetchPresetFeedConfig();
  }, []);

  return <div>{children}</div>;
};
