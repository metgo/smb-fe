"use client";

import { ReactNode, useEffect } from "react";
import useGeneralStore from "@/stores/generalStore";
import { getApproxUserLocation } from "@/actions/getWether";
import {
  getAminitiesInfo,
  getPresetFilters,
  getPromotionsList,
  getSiteInfo,
} from "@/actions/commonActions";

export let initialSelectedFiltersIds: PresetFilterItems;

export const SiteInfoClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    setUserLiveLocation,
    setSiteInfo,
    setPromotionalItems,
    setAminitiesInfo,
  } = useGeneralStore();

  async function fetchSiteinfo() {
    const res = await getSiteInfo();
    setSiteInfo(res);
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

  async function fetchPresetFilterItems() {
    try {
      const res = await getPresetFilters();

      // Filter out 'business' and 'event' from serviceTypes
      const filteredServiceTypes = res.serviceTypes.filter(
        (type: string) => type !== "business" && type !== "event",
      );

      // Return the modified object
      const sanitizedResponse = {
        ...res,
        serviceTypes: filteredServiceTypes,
      };

      initialSelectedFiltersIds = sanitizedResponse;

      return sanitizedResponse; // optionally return it
    } catch (error) {
      console.error("Failed to get filters:", error);
      return null;
    }
  }

  useEffect(() => {
    fetchSiteinfo();
    fetchAminitiesInfo();
    fetchUserCurrentLocation();
    fetchPromotionalItems();
    fetchPresetFilterItems();
  }, []);

  return <div>{children}</div>;
};
