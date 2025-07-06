"use client";

import React, { useEffect, useState } from "react";
import { NextImage } from "@/components/ui";
import { getWeatherInfo } from "@/actions/getWether";
import { usePathname } from "next/navigation";

const getUserCity = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error("Failed to fetch location");
    }

    const data = await response.json();
    return data.city || "Tel Aviv";
  } catch (error) {
    console.error("Location API error:", error);
    return "Tel Aviv"; // Fallback city on error
  }
};

const CurrentTempOfYourCity = () => {
  const pathname = usePathname();
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let city;
      if (!city) {
        city = await getUserCity();
      }
      const data = await getWeatherInfo(city);
      setWeather(data);
    })();
  }, []);

  if (!weather) {
    return <div className="w-24"></div>;
  }

  const isFeedPage = pathname === "/events" || pathname === "/businesses";
  return (
    <div className={`flex items-center bg-white rounded-[12px] px-2`}>
      <span className="font-normal text-2xl text-theme">
        {Math.trunc(weather?.temperature) || 0.0}°C
      </span>
      <NextImage
        width={40}
        height={40}
        imgSrc={`https:${weather?.icon}`}
        alt={weather?.condition}
        className="block"
      />
      {isFeedPage && <div className="w-8" />}
    </div>
  );
};

export default CurrentTempOfYourCity;
