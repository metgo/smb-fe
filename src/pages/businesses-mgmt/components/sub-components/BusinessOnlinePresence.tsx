import type { FC } from "react";
import { Globe, Facebook, Instagram, Youtube, Music } from "lucide-react";

/* ---------- Types ---------- */

interface OnlinePresenceData {
  website: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

interface OnlinePresenceFormData {
  online_presence: OnlinePresenceData;
}

interface BusinessOnlinePresenceProps {
  theme: Theme;
  isRTL: boolean;
  t: (key: string) => string;
  formData: OnlinePresenceFormData;
  setFormData: (data: OnlinePresenceFormData) => void;
}
interface SocialMediaItem {
  socialMediaId: string;
  url: string;
}

interface OnlinePresenceFormData {
  socialMedia: SocialMediaItem[];
}

/* ---------- Component ---------- */

const BusinessOnlinePresence: FC<BusinessOnlinePresenceProps> = ({
  theme,
  isRTL,
  t,
  formData,
  setFormData,
}) => {
  
  const inputClasses = `w-full ${
    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
  } py-2 rounded-lg border ${
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-200"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-teal-500`;

  return (
    <div className="space-y-6">
      <h3
        className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
      >
        {t("online_presence") || "Online Presence & Social Media"}
      </h3>

      {/* Website */}
      <SocialInput
        label={t("website_url")}
        icon={<Globe className="w-5 h-5 text-gray-400" />}
        value={formData.online_presence?.website || ""}
        placeholder="https://example.com"
        inputClasses={inputClasses}
        isRTL={isRTL}
        onChange={(value) =>
          setFormData({
            ...formData,
            online_presence: { ...formData.online_presence, website: value },
          })
        }
      />

      {/* Facebook */}
      <SocialInput
        label={t("facebook")}
        icon={<Facebook className="w-5 h-5 text-gray-400" />}
        value={formData.online_presence?.facebook}
        placeholder="https://facebook.com/example"
        inputClasses={inputClasses}
        isRTL={isRTL}
        onChange={(value) =>
          setFormData({
            ...formData,
            online_presence: { ...formData.online_presence, facebook: value },
          })
        }
      />

      {/* Instagram */}
      <SocialInput
        label={t("instagram")}
        icon={<Instagram className="w-5 h-5 text-gray-400" />}
        value={formData.online_presence?.instagram}
        placeholder="https://instagram.com/example"
        inputClasses={inputClasses}
        isRTL={isRTL}
        onChange={(value) =>
          setFormData({
            ...formData,
            online_presence: { ...formData.online_presence, instagram: value },
          })
        }
      />

      {/* YouTube */}
      <SocialInput
        label={t("youtube")}
        icon={<Youtube className="w-5 h-5 text-gray-400" />}
        value={formData.online_presence?.youtube}
        placeholder="https://youtube.com/example"
        inputClasses={inputClasses}
        isRTL={isRTL}
        onChange={(value) =>
          setFormData({
            ...formData,
            online_presence: { ...formData.online_presence, youtube: value },
          })
        }
      />

      {/* TikTok */}
      <SocialInput
        label={t("tiktok")}
        icon={<Music className="w-5 h-5 text-gray-400" />}
        value={formData.online_presence?.tiktok}
        placeholder="https://tiktok.com/example"
        inputClasses={inputClasses}
        isRTL={isRTL}
        onChange={(value) =>
          setFormData({
            ...formData,
            online_presence: { ...formData.online_presence, tiktok: value },
          })
        }
      />
    </div>
  );
};

export default BusinessOnlinePresence;

/* ---------- Reusable Social Input ---------- */

interface SocialInputProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  isRTL: boolean;
  inputClasses: string;
  onChange: (value: string) => void;
}

const SocialInput: FC<SocialInputProps> = ({
  label,
  icon,
  value,
  placeholder,
  isRTL,
  inputClasses,
  onChange,
}) => (
  <div>
    <label className="block text-sm mb-2 text-gray-500">{label}</label>
    <div className="relative">
      <div
        className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`}
      >
        {icon}
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClasses}
      />
    </div>
  </div>
);
