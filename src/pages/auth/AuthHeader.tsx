import Select from "react-select";
import { useTranslation } from "react-i18next";

import { locales } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/hooks";
import { setLanguage } from "@/features/settingsSlice";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";

interface AuthHeaderProps {
  title: string;
  desc?: string;
  btnText?: string;
  handleCurrentTabChange?: () => void;
}

type ItemOption = {
  value: string;
  label: string;
  flag?: string | undefined;
};

const AuthHeader = ({
  title,
  desc,
  btnText,
  handleCurrentTabChange,
}: AuthHeaderProps) => {
  const { t, i18n } = useTranslation("login");
  const dispatch = useAppDispatch();

  const { language } = useThemeClasses();

  const handleLanguageChange = (lng: Language) => {
    dispatch(setLanguage(lng));
    i18n.changeLanguage(lng);
  };

  return (
    <div className="mb-6 decoration-blue-100 flex items-start justify-between">
      <div>
        <h1 className="text-4xl text-white  ">{t(title)}</h1>

        <p className="text-white/80 mb-8 mt-4">
          {desc && <>{t(desc)} </>}
          {btnText && handleCurrentTabChange && (
            <button
              onClick={handleCurrentTabChange}
              className="text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
            >
              {t(btnText)}
            </button>
          )}
        </p>
      </div>

      <Select
        options={locales}
        value={locales.find((opt: ItemOption) => opt.value === language)}
        onChange={(val) =>
          handleLanguageChange((val as ItemOption).value as Language)
        }
        styles={{
          container: (b) => ({ ...b, minWidth: 150, zIndex: 50 }),

          control: (b, s) => ({
            ...b,
            borderRadius: 12,
            borderColor: s.isFocused ? "#14b8a6" : "rgba(255,255,255,0.3)",
            backgroundColor: "transparent",
            color: "#fff",
            boxShadow: s.isFocused ? "0 0 0 2px #14b8a6" : undefined,
            "&:hover": { borderColor: "#14b8a6" },
          }),

          menu: (b) => ({
            ...b,
            borderRadius: 12,
            backgroundColor: "rgba(31,41,55,0.6)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }),

          menuList: (b) => ({
            ...b,
            backgroundColor: "transparent",
          }),

          option: (b, s) => ({
            ...b,
            backgroundColor: s.isSelected
              ? "rgba(20,184,166,0.35)"
              : s.isFocused
                ? "rgba(255,255,255,0.08)"
                : "transparent",
            color: "#fff",
            cursor: "pointer",
          }),

          singleValue: (b) => ({ ...b, color: "#fff" }),
          input: (b) => ({ ...b, color: "#fff" }),
          placeholder: (b) => ({ ...b, color: "rgba(255,255,255,0.7)" }),
          indicatorSeparator: () => ({ display: "none" }),
          dropdownIndicator: (b) => ({ ...b, color: "rgba(255,255,255,0.7)" }),
        }}
        formatOptionLabel={(option: ItemOption) => (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {option.flag && (
              <ImageWithFallback
                src={option.flag}
                alt={option.label}
                style={{ width: 24, height: 26, objectFit: "contain" }}
              />
            )}
            <span className="font-semibold">{option.label}</span>
          </div>
        )}
      />
    </div>
  );
};

export default AuthHeader;
