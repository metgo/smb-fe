import { GOOGLE_API_KEY } from "@/constant/envConstants";
import { googlePointOfInterest } from "@/constant/googlePoi";

export async function getAddressFromLatLng(
  lat: string,
  lng: string,
): Promise<string | null> {
  const geoLat = Number(lat);
  const geoLng = Number(lng);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${geoLat},${geoLng}&key=${GOOGLE_API_KEY}`,
    );

    if (!response.ok) throw new Error("Failed to fetch location");

    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address; // Plain address
    } else {
      console.warn("No address found for the given coordinates.");
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

const googleMapsScriptLoaded = {
  loaded: false,
  callbacks: [] as (() => void)[],
};

export const goolgeMapControlers = {
  zoom: 10,
  mapTypeControl: false,
  streetViewControl: false,
  gestureHandling: "greedy",
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
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&language=he&v=3.54`;
    script.async = true;
    script.onload = () => {
      googleMapsScriptLoaded.loaded = true;
      googleMapsScriptLoaded.callbacks.forEach((cb) => cb());
      googleMapsScriptLoaded.callbacks = [];
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.body.appendChild(script);
  }

  googleMapsScriptLoaded.callbacks.push(callback);
};

const selectedTheme = { colors: { primary: "#fff" } };

export const addMapTypeControl = (googleMap: google.maps.Map) => {
  const mapTypeControlDiv = document.createElement("div");
  mapTypeControlDiv.style.backgroundColor = "#fff";
  mapTypeControlDiv.style.border = "2px solid #fff";
  mapTypeControlDiv.style.borderRadius = "3px";
  mapTypeControlDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  mapTypeControlDiv.style.margin = "10px";
  mapTypeControlDiv.style.textAlign = "center";
  mapTypeControlDiv.style.display = "flex";

  const streetButton = document.createElement("button");
  streetButton.textContent = "רְחוֹב";
  streetButton.style.padding = "8px 15px";
  streetButton.style.fontSize = "16px";
  streetButton.style.border = "none";
  streetButton.style.cursor = "pointer";
  streetButton.style.backgroundColor =
    googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP
      ? selectedTheme.colors.primary
      : "#fff";
  streetButton.style.color =
    googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP
      ? "#fff"
      : "#000";
  streetButton.style.transition = "background-color 0.3s, color 0.3s";

  const satelliteButton = document.createElement("button");
  satelliteButton.textContent = "לוויין";
  satelliteButton.style.padding = "8px 15px";
  satelliteButton.style.fontSize = "16px";
  satelliteButton.style.border = "none";
  satelliteButton.style.cursor = "pointer";
  satelliteButton.style.backgroundColor =
    googleMap.getMapTypeId() === google.maps.MapTypeId.HYBRID
      ? selectedTheme.colors.primary
      : "#fff";
  satelliteButton.style.color =
    googleMap.getMapTypeId() === google.maps.MapTypeId.HYBRID ? "#fff" : "#000";
  satelliteButton.style.transition = "background-color 0.3s, color 0.3s";

  const updateButtonStyles = () => {
    const isRoadmap =
      googleMap.getMapTypeId() === google.maps.MapTypeId.ROADMAP;
    streetButton.style.backgroundColor = isRoadmap
      ? selectedTheme.colors.primary
      : "#fff";
    streetButton.style.color = isRoadmap ? "#fff" : "#000";
    satelliteButton.style.backgroundColor = !isRoadmap
      ? selectedTheme.colors.primary
      : "#fff";
    satelliteButton.style.color = !isRoadmap ? "#fff" : "#000";
  };

  streetButton.addEventListener("click", (e) => {
    e.preventDefault();
    googleMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    updateButtonStyles();
  });

  satelliteButton.addEventListener("click", (e) => {
    e.preventDefault();
    googleMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
    updateButtonStyles();
  });

  googleMap.addListener("maptypeid_changed", updateButtonStyles);

  mapTypeControlDiv.appendChild(streetButton);
  mapTypeControlDiv.appendChild(satelliteButton);

  const controlPosition = google.maps.ControlPosition.LEFT_BOTTOM;
  googleMap.controls[controlPosition].push(mapTypeControlDiv);
};
