"use client";

import { ReactNode, useEffect } from "react";
import useGeneralStore from "@/stores/generalStore";
import { getAminitiesInfo } from "@/actions/commonActions";
import { getAllCategory } from "@/actions/businessActions";
import useCategoryStore from "@/stores/categoriesStore";

export const SiteInfoClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { setAminitiesInfo, setUserLiveLocation } = useGeneralStore();
  const { categories, setCategories } = useCategoryStore();

  async function fetchAminitiesInfo() {
    const res = await getAminitiesInfo();
    setAminitiesInfo(res);
  }

  async function fetchCategories() {
    const res = await getAllCategory();
    const apiCategories = res?.data ? res?.data : res;
    const updatedCategories = categories?.map((cat) => {
      const match = apiCategories?.find((apiCat: any) => apiCat.id === cat.id);
      return {
        ...cat,
        name: match ? match.name : cat.name,
      };
    });
    setCategories(updatedCategories);
  }

  function getUserLiveLocation() {
    if (!("geolocation" in navigator)) {
      console.log("Geolocation not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLiveLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.log(err.message);
      },
      {
        enableHighAccuracy: true, // use GPS if available
        timeout: 10000, // max time to wait for a position
        maximumAge: 0, // don't use cached location
      },
    );

    // cleanup: stop watching when component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }

  useEffect(() => {
    fetchCategories();
    fetchAminitiesInfo();
    getUserLiveLocation();
  }, []);

  return <div>{children}</div>;
};
