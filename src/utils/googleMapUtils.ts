import { envKeys } from "@/lib/envKeys";


export const googlePointOfInterest = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

export const centerIseral = { lat: 31.471959, lng: 34.624 };

export async function getAddressFromLatLng(
  lat: string,
  lng: string
): Promise<string | null> {
  const geoLat = Number(lat);
  const geoLng = Number(lng);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${geoLat},${geoLng}&key=${envKeys.googleMapApiKey}`
    );

    if (!response.ok) throw new Error('Failed to fetch location');

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address; // Plain address
    } else {
      console.warn('No address found for the given coordinates.');
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

const googleMapsScriptLoaded = {
  loaded: false,
  callbacks: [] as (() => void)[],
};

export const goolgeMapControlers = {
  zoom: 13,
  center: centerIseral,
  mapTypeControl: false,
  streetViewControl: false,
  gestureHandling: 'greedy',
  zoomControl: false,
  fullscreenControl: false,
  keyboardShortcuts: false,
  rotateControl: false,
  scaleControl: false,
  styles: googlePointOfInterest,
};

export const loadGoogleMapsScript = (callback: () => void) => {
  if (googleMapsScriptLoaded.loaded) {
    callback();
    return;
  }

  if (googleMapsScriptLoaded.callbacks.length === 0) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${envKeys.googleMapApiKey}&language=he&v=3.54`;
    script.async = true;
    script.onload = () => {
      googleMapsScriptLoaded.loaded = true;
      googleMapsScriptLoaded.callbacks.forEach((cb) => cb());
      googleMapsScriptLoaded.callbacks = [];
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };
    document.body.appendChild(script);
  }

  googleMapsScriptLoaded.callbacks.push(callback);
};

const selectedTheme = { colors: { primary: '#fff' } };

export const addMapTypeControl = (googleMap: google.maps.Map) => {
  const mapTypeControlDiv = document.createElement('div');
  mapTypeControlDiv.style.backgroundColor = '#fff';
  mapTypeControlDiv.style.border = '2px solid #fff';
  mapTypeControlDiv.style.borderRadius = '3px';
  mapTypeControlDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  mapTypeControlDiv.style.margin = '10px';
  mapTypeControlDiv.style.textAlign = 'center';
  mapTypeControlDiv.style.display = 'flex';

  const streetButton = document.createElement('button');
  streetButton.textContent = 'רְחוֹב';
  streetButton.style.padding = '8px 15px';
  streetButton.style.fontSize = '16px';
  streetButton.style.border = 'none';
  streetButton.style.cursor = 'pointer';
  streetButton.style.backgroundColor =
    googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP
      ? selectedTheme.colors.primary
      : '#fff';
  streetButton.style.color =
    googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP
      ? '#fff'
      : '#000';
  streetButton.style.transition = 'background-color 0.3s, color 0.3s';

  const satelliteButton = document.createElement('button');
  satelliteButton.textContent = 'לוויין';
  satelliteButton.style.padding = '8px 15px';
  satelliteButton.style.fontSize = '16px';
  satelliteButton.style.border = 'none';
  satelliteButton.style.cursor = 'pointer';
  satelliteButton.style.backgroundColor =
    googleMap.getMapTypeId() === google.maps.MapTypeId.HYBRID
      ? selectedTheme.colors.primary
      : '#fff';
  satelliteButton.style.color =
    googleMap.getMapTypeId() === google.maps.MapTypeId.HYBRID ? '#fff' : '#000';
  satelliteButton.style.transition = 'background-color 0.3s, color 0.3s';

  const updateButtonStyles = () => {
    const isRoadmap =
      googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP;
    streetButton.style.backgroundColor = isRoadmap
      ? selectedTheme.colors.primary
      : '#fff';
    streetButton.style.color = isRoadmap ? '#fff' : '#000';
    satelliteButton.style.backgroundColor = !isRoadmap
      ? selectedTheme.colors.primary
      : '#fff';
    satelliteButton.style.color = !isRoadmap ? '#fff' : '#000';
  };

  streetButton.addEventListener('click', (e) => {
    e.preventDefault();
    googleMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    updateButtonStyles();
  });

  satelliteButton.addEventListener('click', (e) => {
    e.preventDefault();
    googleMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
    updateButtonStyles();
  });

  googleMap.addListener('maptypeid_changed', updateButtonStyles);

  mapTypeControlDiv.appendChild(streetButton);
  mapTypeControlDiv.appendChild(satelliteButton);

  const controlPosition = google.maps.ControlPosition.LEFT_BOTTOM;
  googleMap.controls[controlPosition].push(mapTypeControlDiv);
};

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
  signal: AbortSignal
) => {
  const modes: Array<'DRIVE' | 'BICYCLE' | 'WALK'> = [
    'DRIVE',
    'BICYCLE',
    'WALK',
  ];

  for (const mode of modes) {
    try {
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': envKeys.googleMapApiKey!,
            'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
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
        }
      );

      if (signal.aborted) return [];

      const data: TRouteResponse = await response.json();

      const encodedPolyline = data.routes?.[0]?.polyline?.encodedPolyline;
      if (encodedPolyline) {
        return decodePolyline(encodedPolyline);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error(`Error with travelMode ${mode}:`, error);
      }
    }
  }

  // If all modes fail
  return [];
};

export const createGradientRoute = async (
  currentStationColor: string,
  nextStationColor: string
) => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 25, g: 118, b: 210 }; // fallback
  };

  const startColor = hexToRgb(currentStationColor);
  const endColor = hexToRgb(nextStationColor);

  // Create gradient in the middle of the segment (50% blend)
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * 0.5);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * 0.5);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * 0.5);

  const segmentColor = `rgb(${r}, ${g}, ${b})`;
  return segmentColor;
};

// -------Mobile ------
const MOBILE_BREAKPOINT = 768;
const SMALL_MOBILE_BREAKPOINT = 640;

export const getScreenDimensions = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isMobile = screenWidth < MOBILE_BREAKPOINT;
  const isSmallMobile = screenWidth < SMALL_MOBILE_BREAKPOINT;

  return { screenWidth, screenHeight, isMobile, isSmallMobile };
};

export const centerMapOnMarker = (
  marker: google.maps.Marker,
  map: google.maps.Map | null
) => {
  if (!map) return;

  const position = marker.getPosition();
  if (!position) return;

  const { screenHeight } = getScreenDimensions();
  const latOffset = (1000 / screenHeight) * 0.01;

  const newCenter = {
    lat: position.lat() + latOffset, // Shift DOWN (positive) to center info window
    lng: position.lng(),
  };

  map.panTo(newCenter);

  const currentZoom = map.getZoom();
  if (currentZoom && currentZoom < 14) {
    const { screenWidth, isMobile, isSmallMobile } = getScreenDimensions();
    const targetZoom = isMobile
      ? isSmallMobile
        ? 12
        : 10
      : isSmallMobile
        ? 15
        : screenWidth < 1024
          ? 14
          : 13;
    map.setZoom(targetZoom);
  }
};
