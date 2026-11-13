const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export const getWeatherInfo = async () => {
  const location = "31.4095,34.8032";
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather info");
    }

    const data = await response.json();

    return {
      temperature: data.current?.temp_c,
      condition: data.current.condition?.text,
      icon: data.current.condition?.icon,
      location: data.location?.name,
      code: data.current.condition?.code,
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
};

export async function getApproxUserLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return {
      lat: data.latitude || 0,
      lng: data.longitude || 0,
      city: data.city || "",
      country: data.country_name || "",
    };
  } catch (err) {
    console.error("Failed to get approximate location:", err);
    return null;
  }
}
