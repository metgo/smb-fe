import { LocateIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

import { envKeys } from "@/lib/envKeys";
import { endpoints } from "@/lib/endpoints";
import { googlePointOfInterest } from "@/lib/utils";
import { extractAddressParts, type ParsedAddressParts } from "@/helpers";

interface MarkerMapProps {
  setGeo: (v: Geo) => void;
  setAddress: (v: string) => void;
  address: string;
  geo: Geo;
  drag?: boolean;
  onAddressParts?: (parts: ParsedAddressParts) => void;
}

interface PlaceSuggestion {
  placePrediction: {
    placeId: string;
    text: {
      text: string;
    };
  };
}

/* ---------------- Component ---------------- */
const MarkerMap = ({
  setGeo,
  setAddress,
  address,
  geo,
  drag,
  onAddressParts,
}: MarkerMapProps) => {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;

  /* ---------------- Refs ---------------- */
  const mapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const markerRef = useRef<any>(null);

  /* ---------------- State ---------------- */
  const [map, setMap] = useState<any>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [_isMapLoaded, _setIsMapLoaded] = useState<boolean>(false);

  /* ---------------- Helpers ---------------- */

  const placeMarker = (lat: number, lng: number, googleMap: any): void => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMap,
      draggable: drag ? false : true,
      icon: {
        url: "/assets/images/map-pin.png",
        scaledSize: new window.google.maps.Size(30, 40),
      },
    });

    setGeo({ lat: lat.toString(), long: lng.toString() });

    markerRef.current.addListener("dragend", (e: any) => {
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setGeo({ lat: newLat.toString(), long: newLng.toString() });
      fetchAddress(newLat, newLng);
    });

    googleMap.panTo({ lat, lng });
  };

  const fetchAddress = (lat: number, lng: number): void => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: string) => {
        if (status === "OK" && results?.[0]) {
          setAddress(results[0].formatted_address);
          setInputValue(results[0].formatted_address);
          const components = (results[0].address_components ?? []).map(
            (c: any) => ({ text: c.long_name, types: c.types }),
          );
          onAddressParts?.(extractAddressParts(components));
        }
      },
    );
  };

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (address) setInputValue(address);
  }, [address]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeMap = (): void => {
      if (!mapRef.current || !window.google?.maps) return;

      const defaultCenter = { lat: 31.304167, lng: 34.521977 };

      const parsedLat = parseFloat(geo?.lat);
      const parsedLng = parseFloat(geo?.long);
      const hasValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng);

      const center = hasValidCoords
        ? { lat: parsedLat, lng: parsedLng }
        : defaultCenter;

      const googleMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: hasValidCoords ? 15 : 10,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        fullscreenControl: true,
        gestureHandling: "greedy",
        styles: googlePointOfInterest,
      });

      setMap(googleMap);

      if (hasValidCoords) {
        placeMarker(center.lat, center.lng, googleMap);
      } else if (address) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results: any, status: string) => {
          if (status === "OK" && results?.[0]) {
            const geoLat = results[0].geometry.location.lat();
            const geoLng = results[0].geometry.location.lng();
            googleMap.setCenter({ lat: geoLat, lng: geoLng });
            googleMap.setZoom(15);
            placeMarker(geoLat, geoLng, googleMap);
          }
        });
      }

      googleMap.addListener("dblclick", (e: any) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        placeMarker(lat, lng, googleMap);
        fetchAddress(lat, lng);
      });
    };

    const script = document.createElement("script");
    script.src = `${endpoints.googleMap}?key=${envKeys.googleMapApiKey}&language=${locale}`;
    script.async = true;

    script.onload = () => {
      initializeMap();
    };

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  /* ---------------- Handlers ---------------- */
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const response = await fetch(
      `${endpoints.googlePlaceAutoComplete}:autocomplete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": envKeys.googleMapApiKey,
        },
        body: JSON.stringify({
          input: value,
          languageCode: locale,
        }),
      },
    );

    const data = await response.json();
    setSuggestions(data.suggestions ?? []);
  };

  const handleSuggestionSelect = async (placeId: string) => {
    const response = await fetch(
      `${endpoints.googlePlaceAutoComplete}/${placeId}?fields=location,formattedAddress,addressComponents`,
      {
        headers: {
          "X-Goog-Api-Key": envKeys.googleMapApiKey,
        },
      },
    );

    const data = await response.json();
    const lat = data.location.latitude;
    const lng = data.location.longitude;

    setGeo({ lat: lat.toString(), long: lng.toString() });
    setAddress(data.formattedAddress);
    setInputValue(data.formattedAddress);
    setSuggestions([]);

    const components = (data.addressComponents ?? []).map((c: any) => ({
      text: c.longText,
      types: c.types,
    }));
    onAddressParts?.(extractAddressParts(components));

    if (map) {
      placeMarker(lat, lng, map);
      map.setZoom(15);
    }
  };

  const findMyLocation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setGeo({ lat: lat.toString(), long: lng.toString() });

      if (map) {
        placeMarker(lat, lng, map);
        fetchAddress(lat, lng);
        map.setCenter({ lat, lng });
        map.setZoom(15);
      }
    });
  };

  /* ---------------- Render ---------------- */

  return (
    <div style={{ width: "100%", height: "50vh", position: "relative" }}>
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={t("search_placeholder")}
        className="absolute top-2 left-2 z-50 w-[95%] h-12 px-3 rounded-xl bg-white/60"
      />

      {suggestions.length > 0 && (
        <ul className="absolute top-14 left-2 z-50 bg-white w-[95%] rounded shadow">
          {suggestions.map((s) => (
            <li
              key={s.placePrediction.placeId}
              onClick={() => handleSuggestionSelect(s.placePrediction.placeId)}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {s.placePrediction.text.text}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={findMyLocation}
        className="absolute bottom-2 left-2 bg-white p-2 rounded z-50"
      >
        <LocateIcon />
      </button>

      <div ref={mapRef} className="w-full h-full rounded" />
    </div>
  );
};

export default MarkerMap;
