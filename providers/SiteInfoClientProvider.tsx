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
      console.error("Failed to get user location:", error);
    }
  }

  async function fetchFilters() {
    try {
      const res = await getFilters();
      setFilterItems(res);
    } catch (error) {
      console.error("Failed to get user location:", error);
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

// async function fetchCategories() {
//   const res = await getAllCategory();
//   const apiCategories = res?.data ? res?.data : res;
//   const updatedCategories = categories?.map((cat) => {
//     const match = apiCategories?.find((apiCat: any) => apiCat.id === cat.id);
//     return {
//       ...cat,
//       name: match ? match.name : cat.name,
//     };
//   });
//   setCategories(updatedCategories);
// }

// function getUserLiveLocation() {
//   if (!("geolocation" in navigator)) {
//     console.log("Geolocation not supported by this browser.");
//     return;
//   }

//   const watchId = navigator.geolocation.watchPosition(
//     (position) => {
//       setUserLiveLocation({
//         lat: position.coords.latitude,
//         lng: position.coords.longitude,
//       });
//     },
//     (err) => {
//       console.log(err.message);
//     },
//     {
//       enableHighAccuracy: true, // use GPS if available
//       timeout: 10000, // max time to wait for a position
//       maximumAge: 0, // don't use cached location
//     },
//   );

//   // cleanup: stop watching when component unmounts
//   return () => {
//     navigator.geolocation.clearWatch(watchId);
//   };
// }
