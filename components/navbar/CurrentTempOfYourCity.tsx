"use client"

import { getWeatherInfo } from '@/actions/getWether';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const getUserCity = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();
    return data.city || 'Tel Aviv';
  } catch (error) {
    console.error('Location API error:', error);
    return 'Tel Aviv'; // Fallback city on error
  }
};

const CurrentTempOfYourCity = () => {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const city = await getUserCity();
      const data = await getWeatherInfo(city);
      setWeather(data);
    })();
  }, []);

  if (!weather)
    return

  return (
    <div className="flex items-center">
      <span className="font-normal text-2xl text-theme">{Math.trunc(weather?.temperature)}°C</span>
      <Image
        width={40}
        height={40}
        src={`https:${weather?.icon}`}
        alt={weather?.condition}
      />
    </div>
  );
};

export default CurrentTempOfYourCity;
