import { GOOGLE_API_KEY } from "@/constant/envConstants";

// Utility: Decode polyline
export const decodePolyline = (encoded: string): google.maps.LatLng[] => {
  const poly: google.maps.LatLng[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let result = 0,
      shift = 0,
      b;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push(new google.maps.LatLng(lat / 1e5, lng / 1e5));
  }
  return poly;
};

// Utility: Fetch route segment between two stations
export const fetchSegmentRoute = async (
  from: GeoLocation,
  to: GeoLocation,
  signal: AbortSignal,
) => {
  const modes: Array<"DRIVE" | "BICYCLE" | "WALK"> = [
    "DRIVE",
    "BICYCLE",
    "WALK",
  ];

  for (const mode of modes) {
    try {
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_API_KEY!,
            "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: parseFloat(from.lat),
                  longitude: parseFloat(from.long),
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: parseFloat(to.lat),
                  longitude: parseFloat(to.long),
                },
              },
            },
            travelMode: mode,
          }),
          signal,
        },
      );

      if (signal.aborted) return [];

      const data: RouteResponse = await response.json();

      if (data.routes?.[0]) {
        return decodePolyline(data.routes[0].polyline.encodedPolyline);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(`Error with travelMode ${mode}:`, error);
      }
    }
  }

  // If all modes fail
  return [];
};

export const centerIseral = { lat: 31.0461, lng: 34.8516 };
