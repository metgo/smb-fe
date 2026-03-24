import clsx from "clsx";
import { Share2 } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: SiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (
    field: keyof SiteSettingsFormData,
    value: string | boolean,
  ) => void;
}

const SOCIAL_FIELDS: {
  field: keyof SiteSettingsFormData;
  label: string;
  placeholder: string;
  color: string;
}[] = [
  {
    field: "facebookUrl",
    label: "Facebook URL",
    placeholder: "https://facebook.com/yourpage",
    color: "text-blue-500",
  },
  {
    field: "instagramUrl",
    label: "Instagram URL",
    placeholder: "https://instagram.com/yourhandle",
    color: "text-pink-500",
  },
  {
    field: "twitterUrl",
    label: "X (Twitter) URL",
    placeholder: "https://x.com/yourhandle",
    color: "text-sky-500",
  },
  {
    field: "youtubeUrl",
    label: "YouTube Channel URL",
    placeholder: "https://youtube.com/@yourchannel",
    color: "text-red-500",
  },
  {
    field: "linkedinUrl",
    label: "LinkedIn URL",
    placeholder: "https://linkedin.com/company/yourcompany",
    color: "text-blue-600",
  },
  {
    field: "tiktokUrl",
    label: "TikTok URL (optional)",
    placeholder: "https://tiktok.com/@yourhandle",
    color: "text-gray-800",
  },
];

function Toggle({
  label,
  description,
  checked,
  onChange,
  textPrimary,
  textSecondary,
  isDark,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  textPrimary: string;
  textSecondary: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={clsx("text-sm font-medium", textPrimary)}>{label}</p>
        {description && (
          <p className={clsx("text-xs mt-0.5", textSecondary)}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative w-12 h-6 rounded-full transition-colors",
          checked ? "bg-teal-500" : isDark ? "bg-gray-700" : "bg-gray-300",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export default function Step03SocialMedia({
  formData,
  errors,
  onChange,
}: Props) {
  const { textPrimary, textSecondary, inputClasses, borderColor, isDark } =
    useThemeClasses();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Share2 className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          Social Media Integration
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {SOCIAL_FIELDS.map(({ field, label, placeholder, color }) => (
          <div key={field} className="flex flex-col gap-2">
            <label className={clsx("text-sm font-medium", textPrimary)}>
              {label}
            </label>
            <input
              type="url"
              value={formData[field] as string}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              className={clsx(
                "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
                inputClasses,
                errors[field] && "border-red-500",
              )}
            />
            {errors[field] && (
              <span className="text-xs text-red-500">{errors[field]}</span>
            )}
          </div>
        ))}
      </div>

      <div className={clsx("flex flex-col gap-4 pt-4 border-t", borderColor)}>
        <Toggle
          label="Show Social Icons on Website"
          description="Display social icons in header/footer"
          checked={formData.showSocialIcons}
          onChange={(v) => onChange("showSocialIcons", v)}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          isDark={isDark}
        />
        <Toggle
          label="Open Links in New Tab"
          checked={formData.socialLinksNewTab}
          onChange={(v) => onChange("socialLinksNewTab", v)}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
