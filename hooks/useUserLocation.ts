"use client";

import { useEffect, useState } from "react";

type LocationData = {
  lat: number;
  lon: number;
  city: string;
  country: string;
};

const initialLocationData: LocationData = {
  lat: 32.0853,
  lon: 34.7818,
  city: "Tel Aviv",
  country: "Israel",
};

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationData>(initialLocationData);
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(
          "http://ip-api.com/json/token=49278317e106c2",
        );
        const data = await response.json();
        setLocation({
          lat: data.lat,
          lon: data.lon,
          city: data.city,
          country: data.country,
        });
        console.log("location", location);
      } catch (error) {
        console.error("IP location fetch error:", error);
        setLocation(initialLocationData);
      }
    };

    fetchLocation();
  }, []);

  return location;
};
