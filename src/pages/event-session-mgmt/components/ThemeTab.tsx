import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { THEMES } from "../themes";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ThemeTabProps {
  config: IAdminConfig;
  onChange: (config: IAdminConfig) => void;
  onPreview: () => void;
}

export function ThemeTab({ config, onChange, onPreview }: ThemeTabProps) {
  const { t } = useTranslation("event_session");
  const { isDark, textTertiary, cardClasses } = useThemeClasses();
  const update = (patch: Partial<IAdminConfig>) =>
    onChange({ ...config, ...patch });

  return (
    <div className="flex flex-col gap-4.5 max-w-155 mx-auto">
      <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
            {t("choose_theme_title")}
          </h3>
        </div>
        <p
          className={clsx(
            "text-sm leading-relaxed -mt-1.5 mb-3.5",
            textTertiary,
          )}
        >
          {t("choose_theme_help")}
        </p>
        <div className="grid grid-cols-3 max-[920px]:grid-cols-2 max-[560px]:grid-cols-1 gap-3">
          {THEMES.map((th) => (
            <button
              key={th.id}
              className={clsx(
                "text-start border-[1.5px] rounded-[13px] p-3.5 flex flex-col gap-1 relative transition-all hover:-translate-y-0.5 hover:shadow-xl",
                isDark ? "bg-gray-800" : "bg-white",
                config.themeId === th.id
                  ? isDark
                    ? "border-blue-400 shadow-[0_0_0_3px_rgb(59_130_246/0.12)]"
                    : "border-blue-600 shadow-[0_0_0_3px_rgb(59_130_246/0.12)]"
                  : isDark
                    ? "border-gray-700"
                    : "border-gray-200",
              )}
              onClick={() => update({ themeId: th.id })}
            >
              <span className="flex h-8.5 rounded-lg overflow-hidden mb-2">
                {th.swatch.map((c, i) => (
                  <span key={i} className="flex-1" style={{ background: c }} />
                ))}
              </span>
              <span className="font-extrabold text-[14.5px]">{th.name}</span>
              <span className={clsx("text-xs", textTertiary)}>{th.mood}</span>
              {config.themeId === th.id ? (
                <span
                  className={clsx(
                    "absolute top-3 left-3 text-[11px] font-bold",
                    isDark ? "text-blue-400" : "text-blue-600",
                  )}
                >
                  {t("theme_selected_badge")}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <button
          className={clsx(
            "mt-4 px-3.75 py-2.25 text-[13.5px] rounded-[9px] font-bold text-white hover:brightness-110 transition-[transform,filter] active:translate-y-px",
            isDark ? "bg-blue-500" : "bg-blue-600",
          )}
          onClick={onPreview}
        >
          {t("preview_landing_btn")}
        </button>
      </div>
    </div>
  );
}
