import {
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Music,
  ExternalLink,
} from "lucide-react";
import type { FC } from "react";

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
}

interface Business {
  website?: string;
  socialMedia?: SocialMedia;
}

interface BusinessOnlinePresenceDetailsProps {
  isDark: boolean;
  t: (key: string) => string;
  business: Business;
}

/* ---------- Component ---------- */

const BusinessOnlinePresenceDetails: FC<BusinessOnlinePresenceDetailsProps> = ({
  t,
  isDark,
  business,
}) => {
  const socialMediaMap = Array.isArray(business.socialMedia)
    ? business.socialMedia.reduce<
        Record<string, { url: string; iconPath: string; iconAlt: string }>
      >((acc, item) => {
        const name = item.socialMediaId.name.toLowerCase(); // e.g. "facebook"
        acc[name] = {
          url: item.url,
          iconPath: item.socialMediaId.icon.iconPath,
          iconAlt: item.socialMediaId.icon.iconAlt,
        };
        return acc;
      }, {})
    : {};

  const socialLinks = [
    {
      platform: t("website"),
      link: socialMediaMap?.website?.url,
      icon: Globe,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      platform: t("facebook"),
      link: socialMediaMap.facebook?.url,
      icon: Facebook,
      color: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      platform: t("instagram"),
      link: socialMediaMap.instagram?.url,
      icon: Instagram,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-950/30",
    },
    {
      platform: t("youtube"),
      link: socialMediaMap.youtube?.url,
      icon: Youtube,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      platform: t("tiktok"),
      link: socialMediaMap.tiktok?.url,
      icon: Music,
      color: "text-black dark:text-white",
      bg: "bg-black/5 dark:bg-white/5",
    },
  ];

  // rest of your component remains unchanged
  const activeSocialLinks = socialLinks.filter(
    (link) => link.link && link.link.trim() !== "",
  );

  if (activeSocialLinks.length === 0) {
    return (
      <div
        className={`p-8 text-center rounded-lg border ${
          isDark
            ? "bg-gray-800/30 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <Globe
          className={`w-16 h-16 mx-auto mb-4 ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p
          className={`text-lg mb-2 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("no_social_networks")}
        </p>
        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          {t("add_social_networks_description")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3
        className={`text-lg font-semibold ${
          isDark ? "text-gray-100" : "text-gray-800"
        }`}
      >
        {t("online_presence")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeSocialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <div
              key={link.platform}
              className={`group flex flex-col gap-3 p-5 rounded-xl border transition-all
                ${
                  isDark
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-200 hover:border-gray-300"
                }
                ${link.bg} hover:shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    isDark ? "bg-gray-800/70" : "bg-white shadow-sm"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${link.color}`} strokeWidth={2} />
                </div>
                <span
                  className={`font-medium text-base ${
                    isDark ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {link.platform}
                </span>
              </div>

              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm ${link.color} hover:underline group-hover:underline break-all`}
              >
                <span className="truncate">{link.link}</span>
                <ExternalLink className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessOnlinePresenceDetails;
