const BASE_URL = process.env.NEXT_PUBLIC_WEATHER_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export const getWeatherInfo = async (location: string = "Kathmandu") => {
  try {
    const response = await fetch(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${location}&aqi=no`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather info");
    }

    const data = await response.json();

    // Example: return only temperature in Celsius
    return {
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      location: data.location.name,
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
};
