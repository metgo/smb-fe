import { MarkerMap } from "@/components/maps";
import { MapPin } from "lucide-react";
import { useEffect, useState, type FC } from "react";

interface BusinessLocationDetailsProps {
  isDark: boolean;
  t: (key: string) => string;
  business: any;
}

/* ---------- Component ---------- */

const BusinessLocationDetails: FC<BusinessLocationDetailsProps> = ({
  t,
  isDark,
  business,
}) => {
  const [address, setAddress] = useState("");
  const [geo, setGeo] = useState<Geo>({ lat: "", lng: "" });

  useEffect(() => {
    if (!business) return;

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
  }, [business]);
  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <h3
          className={`text-sm mb-2 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {t("address")}
        </h3>

        <p
          className={`flex items-center gap-2 ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          <MapPin className="w-5 h-5" />
          {[
            business?.address?.country,
            business?.address?.city,
            business?.address?.location,
          ]
            .filter(Boolean) // remove falsy values like null
            .join(", ")}
        </p>
      </div>

      {/* Coordinates */}
      <div>
        <h3
          className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {t("geo_coordinates")}
        </h3>
        <p className={isDark ? "text-gray-300" : "text-gray-700"}>
          {t("latitude")}:{" "}
          {business?.geoLocation?.lat ? business.geoLocation.lat : "-"},{" "}
          {t("longitude")}:{" "}
          {business?.geoLocation?.long ? business?.geoLocation?.long : "-"}
        </p>
      </div>

      {/* Map Placeholder */}
      <div>
        <label className={`block text-sm mb-2 `}>
          {t("location_address")} <span className="text-red-500">*</span>
        </label>
        <MarkerMap
          geo={geo}
          setGeo={setGeo}
          address={address}
          setAddress={setAddress}
          drag={false}
        />
      </div>
    </div>
  );
};

export default BusinessLocationDetails;
