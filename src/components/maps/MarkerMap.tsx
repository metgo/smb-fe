
import { endpoints } from '@/lib/endpoints';
import { envKeys } from '@/lib/envKeys';
import { googlePointOfInterest } from '@/lib/utils';
import { LocateIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';


interface MarkerMapProps {
  setGeo: (v: { lat: string, long: string }) => void,
  setAddress: (v: string) => void,
  address: string,
  geolocation: { lat: string, long: string },
  businessCategoryPinIcon: string,
}

const MarkerMap = ({
  setGeo,
  setAddress,
  address,
  geolocation,
  businessCategoryPinIcon = '',
}: MarkerMapProps) => {
  const { t, i18n } = useTranslation('maps');
  const locale = i18n.language;

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const inputRef = useRef(null);
  const scriptRef = useRef(null);

  const [map, setMap] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (address) {
      setInputValue(address);
    }
  }, [address]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${endpoints.googleMap}?key=${envKeys.googleMapApiKey}&language=${locale}`;
    script.async = true;
    script.onload = () => {
      setIsMapLoaded(true);
      initializeMap();
    };
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [locale]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) return;

    const defaultCenter = { lat: 31.304167, lng: 34.521977 };
    // Compute mapCenter with validation in one step
    const mapCenter = (() => {
      if (!geolocation) return defaultCenter;
      const lat = parseFloat(geolocation.lat);
      const lng = parseFloat(geolocation.long);
      if (isNaN(lat) || isNaN(lng)) {
        console.error('Invalid geolocation values:', geolocation);
        return defaultCenter;
      }
      return { lat, lng };
    })();

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: 'greedy',
      zoomControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: window?.google?.maps?.ControlPosition?.RIGHT_BOTTOM,
      },
      styles: userRole !== 'superadmin' ? googlePointOfInterest : [],
    });

    // Custom control for map type
    const mapTypeControlDiv = document.createElement('div');
    mapTypeControlDiv.style.backgroundColor = '#fff';
    mapTypeControlDiv.style.border = '2px solid #fff';
    mapTypeControlDiv.style.borderRadius = '3px';
    mapTypeControlDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    mapTypeControlDiv.style.margin = '10px';
    mapTypeControlDiv.style.textAlign = 'center';
    mapTypeControlDiv.style.display = 'flex';

    const streetButton = document.createElement('button');
    streetButton.textContent = locale === 'he' ? 'רְחוֹב' : 'Street';
    streetButton.style.padding = '8px 15px';
    streetButton.style.fontSize = '16px';
    streetButton.style.border = 'none';
    streetButton.style.cursor = 'pointer';
    streetButton.style.backgroundColor =
      googleMap.getMapTypeId() === window.google.maps.MapTypeId.ROADMAP
        ? '#4f92f5'
        : '#fff';
    streetButton.style.color =
      googleMap.getMapTypeId() === window.google.maps.MapTypeId.ROADMAP
        ? '#fff'
        : '#000';
    streetButton.style.transition = 'background-color 0.3s, color 0.3s';

    const satelliteButton = document.createElement('button');
    satelliteButton.textContent = locale === 'he' ? 'לוויין' : 'Satellite';
    satelliteButton.style.padding = '8px 15px';
    satelliteButton.style.fontSize = '16px';
    satelliteButton.style.border = 'none';
    satelliteButton.style.cursor = 'pointer';
    satelliteButton.style.backgroundColor =
      googleMap.getMapTypeId() === window.google.maps.MapTypeId.HYBRID
        ? '#4f92f5'
        : '#fff';
    satelliteButton.style.color =
      googleMap.getMapTypeId() === window.google.maps.MapTypeId.HYBRID
        ? '#fff'
        : '#000';
    satelliteButton.style.transition = 'background-color 0.3s, color 0.3s';

    const updateButtonStyles = () => {
      const isRoadmap =
        googleMap.getMapTypeId() === window.google.maps.MapTypeId.ROADMAP;
      streetButton.style.backgroundColor = isRoadmap ? '#4f92f5' : '#fff';
      streetButton.style.color = isRoadmap ? '#fff' : '#000';
      satelliteButton.style.backgroundColor = !isRoadmap ? '#4f92f5' : '#fff';
      satelliteButton.style.color = !isRoadmap ? '#fff' : '#000';
    };

    streetButton.addEventListener('click', (e) => {
      e.preventDefault();
      googleMap.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      updateButtonStyles();
    });

    satelliteButton.addEventListener('click', (e) => {
      e.preventDefault();
      googleMap.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
      updateButtonStyles();
    });

    googleMap.addListener('maptypeid_changed', updateButtonStyles);

    mapTypeControlDiv.appendChild(streetButton);
    mapTypeControlDiv.appendChild(satelliteButton);

    const controlPosition = window.google.maps.ControlPosition.BOTTOM_CENTER;

    googleMap.controls[controlPosition].push(mapTypeControlDiv);

    setMap(googleMap);

    // Place marker if geolocation is provided and valid
    if (geolocation && !isNaN(mapCenter.lat) && !isNaN(mapCenter.lng)) {
      placeMarker(mapCenter.lat, mapCenter.lng, googleMap);
    }

    googleMap.addListener('dblclick', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      placeMarker(lat, lng, googleMap);
      fetchAddress(lat, lng);
    });

    // Trigger resize to ensure map renders
    setTimeout(() => {
      window.google.maps.event.trigger(googleMap, 'resize');
      googleMap.setCenter(mapCenter);
    }, 100);
  };

  const fetchAddress = async (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
        setInputValue(results[0].formatted_address);
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${endpoints.googlePlaceAutoComplete}:autocomplete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': envKeys.googleMapApiKey,
          },
          body: JSON.stringify({
            input: value,
            locationBias: {
              circle: {
                center: {
                  latitude: geolocation
                    ? parseFloat(geolocation.lat)
                    : 31.304167,
                  longitude: geolocation
                    ? parseFloat(geolocation.long)
                    : 34.521977,
                },
                radius: 50000,
              },
            },
            languageCode: locale,
          }),
        }
      );

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
  };

  const handleSuggestionSelect = async (placeId: string) => {
    try {
      const response = await fetch(
        `${endpoints.googlePlaceAutoComplete}/${placeId}?fields=location,formattedAddress`,
        {
          method: 'GET',
          headers: {
            'X-Goog-Api-Key': envKeys.googleMapApiKey,
          },
        }
      );

      const data = await response.json();
      const lat = data.location.latitude;
      const lng = data.location.longitude;
      const formattedAddress = data.formattedAddress;

      setGeo({ lat, long: lng });
      setAddress(formattedAddress);
      setInputValue(formattedAddress);
      setSuggestions([]);
      placeMarker(lat, lng, map);
      map.panTo({ lat, lng });
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const placeMarker = (lat, lng, googleMap) => {
    if (!googleMap) return;

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMap,
      draggable: true,
      icon: {
        url: businessCategoryPinIcon
          ? businessCategoryPinIcon
          : '/assets/img/metgo/map-pin.png',
        scaledSize: new window.google.maps.Size(30, 40),
      },
    });

    setGeo({ lat, long: lng });

    markerRef.current.addListener('dragend', async (e) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setGeo({ lat: newLat, long: newLng });
      fetchAddress(newLat, newLng);
    });

    googleMap.panTo({ lat, lng });
    window.google.maps.event.trigger(googleMap, 'resize');
  };

  const findMyLocation = (e) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setGeo({ lat, long: lng });

        if (map) {
          placeMarker(lat, lng, map);
          fetchAddress(lat, lng);
          map.setCenter({ lat, lng });
          map.setZoom(15);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div style={{ width: '100%', height: '60vh', position: 'relative' }}>
      <div className={`absolute top-2 w-full z-50 px-4`}>
        <input
          type="text"
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={t('search_placeholder')}
          style={{
            width: '100%',
            height: '45px',
            padding: '10px',
            borderRadius: '19px',
            border: '1px solid rgba(0, 0, 0, 0.4)',
            background:
              'radial-gradient(231% 135.8% at 0.9% 2.98%, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.00) 100%)',
            boxShadow: '0px 1px 8px 0px rgba(0, 0, 0, 0.07)',
            backdropFilter: 'blur(21px)',
            fontSize: '16px',
            color: '#333',
            direction: locale === 'he' ? 'rtl' : 'ltr',
          }}
        />

        {suggestions?.length > 0 ? (
          <ul
            style={{
              position: 'absolute',
              top: '50px',
              width: '97%',
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 100,
            }}
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.placePrediction.placeId}
                onClick={() =>
                  handleSuggestionSelect(suggestion.placePrediction.placeId)
                }
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#f0f0f0')
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = 'white')}
              >
                {suggestion.placePrediction.text.text}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Tooltip title={t('findMyLocation')}>
        <button
          type="button"
          onClick={(e) => findMyLocation(e)}
          className="absolute bottom-2 left-2 bg-white rounded-md p-1 z-30"
        >
          <LocateIcon size={28} />
        </button>
      </Tooltip>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%', zIndex: '10' }}
      />
    </div>
  );
};

export default MarkerMap;
