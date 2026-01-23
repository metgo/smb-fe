import { MapPin } from 'lucide-react'
import type { FC } from 'react'

/* ---------- Types ---------- */

type Theme = 'light' | 'dark'

interface Coordinates {
  lat: number
  lng: number
}

interface Address {
  city : string;
  country: string;
  location: string;
}

interface Business {
  address: Address
  coordinates: Coordinates
}

/* ---------- Props ---------- */

interface BusinessLocationDetailsProps {
  theme: Theme
  t: (key: string) => string
  business: Business
}

/* ---------- Component ---------- */

const BusinessLocationDetails: FC<BusinessLocationDetailsProps> = ({ theme, t, business }) => {
  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
        <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('address')}
        </h3>
        <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          <MapPin className="w-5 h-5" />
          {business?.address?.city}
        </p>
      </div>

      {/* Coordinates */}
      <div>
        <h3 className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('geo_coordinates')}
        </h3>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          {t('latitude')}: {business?.coordinates?.lat?.toFixed(6)}, {t('longitude')}: {business?.coordinates?.lng?.toFixed(6)}
        </p>
      </div>

      {/* Map Placeholder */}
      <div
        className={`h-96 rounded-lg flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'
        }`}
      >
        <div className="text-center">
          <MapPin
            className={`w-12 h-12 mx-auto mb-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
          />
          <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
            {t('google_maps_widget')}
          </p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
            {t('map_placeholder_text')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BusinessLocationDetails
