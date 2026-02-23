import { useRef } from "react";
import { setLanguage } from "@/features/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useTranslation } from "react-i18next";
import { useCommon } from "@/hooks/useCommon";
import { ReactSelect } from "../form-fields";

export const LanguageSelector = () => {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation("common");
  const { languages } = useCommon();
  const { language } = useAppSelector((state) => state.settings);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lng: Language) => {
    dispatch(setLanguage(lng));
    i18n.changeLanguage(lng);
  };

  return (
    <div className="absolute left-9 z-50 ">
      {/* Language Dropdown */}
      <div ref={dropdownRef} className="absolute mt-2 z-50">
        <ReactSelect
          value={language}
          onChange={(val) => handleLanguageChange(val as Language)}
          placeholder="Select Language"
          items={languages.map((lang) => ({
            _id: lang.value,
            name: lang.label,
            logo: lang.flag,
          }))}
          minWidth={150}
          logoSize={{ width: 24, height: 16 }}
          optionGap={12}
        />
      </div>
    </div>
  );
};
