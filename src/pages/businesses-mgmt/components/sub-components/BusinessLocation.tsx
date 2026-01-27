import { useEffect, type FC } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { MarkerMap } from "@/components/maps";

/* ---------- Types ---------- */

type Theme = "light" | "dark";

interface Coordinates {
  lat: string;
  long: string;
}

interface Address {
  country: string;
  city: string;
  location: string;
}

interface LocationFormData {
  address: Address;
  geoLocation: Coordinates;
}

interface LocationErrors {
  address?: Address;
}

/* ---------- Props ---------- */
type View = "list" | "details" | "create" | "edit" | undefined;

interface BusinessLocationProps {
  theme: Theme;
  isRTL: boolean;
  t: (key: string) => string; // snake_case translation function
  formData: LocationFormData;
  errors: LocationErrors;
  setFormData: (data: LocationFormData) => void;
  geo: Geo;
  setGeo: (v: Geo) => void;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  business: any;
  currentView: View;
}

/* ---------- Component ---------- */

const BusinessLocation: FC<BusinessLocationProps> = ({
  // theme,
  // isRTL,
  t,
  // formData,
  // errors,
  // setFormData,
  geo,
  currentView,
  setGeo,
  address,
  setAddress,
  business,
}) => {
  const { textSecondary } = useThemeClasses();
  console.log("geo", business?.geoLocation);
  useEffect(() => {
    if (!business || currentView !== "edit") return;

    // Set geo location
    if (business?.geoLocation) {
      setGeo({
        lat: String(business.geoLocation.lat),
        lng: String(business.geoLocation.lng),
      });
    }

    // Set formatted address
    if (business.address) {
      const formatted = [
        business.address.location,
        business.address.city,
        business.address.country,
      ]
        .filter(Boolean)
        .join(", ");

      setAddress(formatted);
    }
  }, [business, currentView]);

  return (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>
          {t("location_address")} <span className="text-red-500">*</span>
        </label>
        <MarkerMap
          geo={geo}
          setGeo={setGeo}
          address={address}
          setAddress={setAddress}
        />
      </div>
    </div>
  );
};

export default BusinessLocation;
