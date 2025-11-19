"use client";

import { ReactNode, useEffect } from "react";
import useGeneralStore from "@/stores/generalStore";
import useMarkersStore from "@/stores/markersStore";
import { getApproxUserLocation } from "@/actions/getWether";
import {
  getAllLocations,
  getFilters,
  getPromotionsList,
  getSiteInfo,
} from "@/actions/commonActions";

export const SiteInfoClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    setUserLiveLocation,
    setSiteInfo,
    setPromotionalItems,
    setFilterItems,
  } = useGeneralStore();

  const { setBusinessMarkers } = useMarkersStore();

  async function fetchSiteinfo() {
    const res = await getSiteInfo();
    setSiteInfo(res);
  }

  async function fetchBusinessMarkers() {
    const res = await getAllLocations();
    setBusinessMarkers(res);
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

  async function fetchPromotionalItems() {
    try {
      const res = await getPromotionsList();
      setPromotionalItems(res?.allPromotionalItems);
    } catch (error) {
      console.error("Failed to get promotional items:", error);
    }
  }

  async function fetchFilters() {
    try {
      const res = await getFilters();
      setFilterItems(res);
    } catch (error) {
      console.error("Failed to get filters:", error);
    }
  }

  useEffect(() => {
    fetchFilters();
    fetchSiteinfo();
    fetchUserCurrentLocation();
    fetchBusinessMarkers();
    fetchPromotionalItems();
  }, []);

  return <div>{children}</div>;
};
