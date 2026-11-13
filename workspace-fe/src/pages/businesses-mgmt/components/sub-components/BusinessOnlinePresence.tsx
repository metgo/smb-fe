import clsx from "clsx";
import { useEffect } from "react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { IOpMode } from "@/enums/operation.types";

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
  isRTL: boolean;
  t: (key: string) => string;
  formData: {
    socialMedia: Array<{ socialMediaId: string; url: string }>;
    [key: string]: any;
  };
  setFormData: (data: any) => void;
  business: any;
  opMode: TOpMode;
}

const BusinessOnlinePresence: React.FC<BusinessOnlinePresenceProps> = ({
  t,
  isRTL,
  business,
  formData,
  setFormData,
  opMode,
}) => {
  const { socialMedia } = useCommon();
  const { isDark } = useThemeClasses();

  const allSocialMedia: SocialMediaItem[] = socialMedia?.datas?.data ?? [];

  const inputClasses = `w-full ${
    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
  } py-2 rounded-lg border ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  } focus:outline-none focus:ring-2 focus:ring-teal-500`;

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

  useEffect(() => {
    if (!business || opMode === IOpMode.CREATE) return;

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
  }, [business, setFormData, opMode]);

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {t("online_presence") || "Online Presence & Social Media"}
      </h3>

      <div className="grid gap-5 sm:grid-cols-2">
        {allSocialMedia.map((platform) => {
          const isWebsite = platform?.name.toLowerCase() === "website";
          const label = platform?.name;
          const placeholder = isWebsite
            ? "https://yourwebsite.com"
            : `https://${platform.name.toLowerCase()}.com/yourpage`;

          return (
            <SocialInput
              key={platform._id}
              label={label}
              iconPath={platform?.icon?.iconPath}
              value={getUrlForId(platform._id)}
              placeholder={placeholder}
              isRTL={isRTL}
              inputClasses={inputClasses}
              onChange={(value: string) => updateSocialUrl(platform._id, value)}
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
  iconPath: string;
  value: string;
  placeholder: string;
  isRTL: boolean;
  inputClasses: string;
  onChange: (value: string) => void;
}

const SocialInput: React.FC<SocialInputProps> = ({
  label,
  iconPath,
  value,
  placeholder,
  isRTL,
  inputClasses,
  onChange,
}) => {
  const { textPrimary } = useThemeClasses();
  return (
    <div>
      <label className={clsx(textPrimary)}>{label}</label>
      <div className="relative mt-2">
        <div
          className={`absolute ${isRTL ? "right-3" : "left-0"} top-1/2 -translate-y-1/2 pointer-events-none`}
        >
          <img alt={label} src={iconPath} className="w-10 h-10 rounded-md" />
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
};

export default BusinessOnlinePresence;
