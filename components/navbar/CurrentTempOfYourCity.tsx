"use client";

import { useEffect, useState } from "react";

import { NextImage } from "@/components/ui";
import { getWeatherInfo } from "@/actions/getWether";
import { weatherIcons } from "@/lib/utils";

const CurrentTempOfYourCity = () => {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await getWeatherInfo();
      setWeather(data);
    })();
  }, []);

  if (!weather) {
    return <div className="w-24"></div>;
  }

  return (
    <div className={`flex items-center gap-1 bg-white rounded-[12px] px-2`}>
      <span className="font-normal text-2xl text-theme">
        {Math.trunc(weather?.temperature) || 0.0}°C
      </span>
      <NextImage
        width={20}
        height={20}
        imgSrc={`/images/weather/${weatherIcons[weather.code]}.svg`}
        alt={weather?.condition}
        className="block"
      />
    </div>
  );
};

export default CurrentTempOfYourCity;
