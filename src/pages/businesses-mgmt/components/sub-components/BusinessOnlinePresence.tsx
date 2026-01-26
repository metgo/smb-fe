import { useEffect, type FC } from "react";
import { Globe, Facebook, Instagram, Youtube } from "lucide-react";
import { useGetAllSocialMediaQuery } from "@/store/api/masterDataApi";

/* ---------- Types ---------- */

interface SocialMediaItem {
  _id: string;
  name: string;
  icon: {
    _id: string;
    name: string;
    iconPath: string;
    iconAlt: string;
  };
}

interface BusinessOnlinePresenceProps {
  theme: "light" | "dark";
  isRTL: boolean;
  t: (key: string) => string;
  formData: {
    socialMedia: Array<{ socialMediaId: string; url: string }>;
    [key: string]: any;
  };
  setFormData: (data: any) => void;
  business: any;
  currentView: View;
}
type View = "list" | "details" | "create" | "edit" | undefined;

/* ---------- Component ---------- */

const BusinessOnlinePresence: FC<BusinessOnlinePresenceProps> = ({
  theme,
  isRTL,
  t,
  business,
  formData,
  setFormData,
  currentView,
}) => {
  const { data: socialMediaRes, isLoading } = useGetAllSocialMediaQuery();

  const allSocialMedia: SocialMediaItem[] = socialMediaRes?.datas?.data ?? [];

  // Helper: get current URL for a given social media id
  const getUrlForId = (id: string) => {
    return (
      formData.socialMedia?.find((item) => item.socialMediaId === id)?.url || ""
    );
  };

  // Update formData.socialMedia array
  const updateSocialUrl = (socialMediaId: string, url: string) => {
    const existing = formData.socialMedia || [];

    const filtered = existing.filter(
      (item) => item.socialMediaId !== socialMediaId,
    );

    const updated =
      url.trim() === ""
        ? filtered
        : [...filtered, { socialMediaId, url: url.trim() }];

    setFormData({
      ...formData,
      socialMedia: updated,
    });
  };

  console.log("social media urls payload", formData);
  const inputClasses = `w-full ${
    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
  } py-2 rounded-lg border ${
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  } focus:outline-none focus:ring-2 focus:ring-teal-500`;

  useEffect(() => {
    if (!business || currentView !== "edit") return;

    const normalizedSocialMedia = (business.socialMedia ?? []).map(
      (item: any) => ({
        socialMediaId:
          typeof item.socialMediaId === "object" && item.socialMediaId?._id
            ? item.socialMediaId._id
            : item.socialMediaId,
        url: item.url || "",
      }),
    );

    setFormData((prev: any) => ({
      ...prev,
      socialMedia: normalizedSocialMedia,
    }));
  }, [business]);

  // Optional: show loading state or skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3
          className={`text-lg ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {t("online_presence") || "Online Presence & Social Media"}
        </h3>
        <div className="text-sm opacity-70">Loading social platforms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3
        className={`text-lg ${
          theme === "dark" ? "text-gray-200" : "text-gray-800"
        }`}
      >
        {t("online_presence") || "Online Presence & Social Media"}
      </h3>

      <div className="grid gap-5 sm:grid-cols-2">
        {allSocialMedia.map((platform) => {
          const isWebsite = platform.name.toLowerCase() === "website";
          const label = platform.name;
          const placeholder = isWebsite
            ? "https://yourwebsite.com"
            : `https://${platform.name.toLowerCase()}.com/yourpage`;

          // You can map known platforms to lucide icons, fallback to globe
          let Icon = Globe;
          if (platform.name.toLowerCase() === "facebook") Icon = Facebook;
          if (platform.name.toLowerCase() === "instagram") Icon = Instagram;
          if (platform.name.toLowerCase() === "youtube") Icon = Youtube;
          // Add more mappings as needed

          return (
            <SocialInput
              key={platform._id}
              label={label}
              icon={<Icon size={20} className="text-teal-500" />}
              value={getUrlForId(platform._id)}
              placeholder={placeholder}
              isRTL={isRTL}
              inputClasses={inputClasses}
              onChange={(value) => updateSocialUrl(platform._id, value)}
            />
          );
        })}
      </div>
    </div>
  );
};

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
        className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 pointer-events-none`}
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

export default BusinessOnlinePresence;
