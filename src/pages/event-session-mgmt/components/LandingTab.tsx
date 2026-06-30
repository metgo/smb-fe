import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState, useEffect } from "react";
import { Pencil, Trash, Upload, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AField } from "./AField";
import { THEMES } from "../themes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { CreateEventSessionWizard } from "./CreateEventSessionWizard";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  useCreateEventSessionMutation,
  useUpdateEventSessionMutation,
  useGetEventSessionByIdQuery,
} from "@/store/api/eventSessionApi";
import { routes } from "@/lib/routes";
import { PublishButton } from "@/components/btns";

interface LandingTabProps {
  config: IAdminConfig;
  onChange: (config: IAdminConfig) => void;
}

const CARD_HEAD = "flex items-center justify-between mb-3.5";

export function LandingTab({ config, onChange }: LandingTabProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("event_session");
  const { isDark, textTertiary, inputClasses, cardClasses } = useThemeClasses();
  const update = (patch: Partial<IAdminConfig>) =>
    onChange({ ...config, ...patch });

  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") || "";
  const sessionId = searchParams.get("sessionId") || "";

  const [createEventSession, { isLoading: isCreating }] =
    useCreateEventSessionMutation();
  const [updateEventSession, { isLoading: isUpdating }] =
    useUpdateEventSessionMutation();

  const { data: existingSession } = useGetEventSessionByIdQuery(sessionId, {
    skip: !sessionId,
  });

  useEffect(() => {
    if (existingSession) {
      onChange(existingSession);
    }
  }, [existingSession]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { previewUrl, gcsUrl, progress, status, handleFileSelect, deleteFile } =
    useFileUpload({
      initialUrl: config.images?.[0]?.image,
    });

  useEffect(() => {
    const currentUrl = config.images?.[0]?.image ?? "";
    if (gcsUrl !== currentUrl) {
      update({ images: gcsUrl ? [{ image: gcsUrl }] : [] });
    }
  }, [gcsUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const [editIndex, setEditIndex] = useState<number>(0);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  const CARD = clsx(cardClasses, "rounded-[14px] p-5");
  const INPUT = clsx(
    "w-full px-3 py-2.5 text-sm rounded-[9px] transition-[border-color,box-shadow] focus:outline-none focus:ring-2",
    inputClasses,
    isDark
      ? "focus:border-blue-400 focus:ring-blue-400/10"
      : "focus:border-blue-500 focus:ring-blue-500/10",
  );

  const modeBtn = (active: boolean) =>
    clsx(
      "text-start px-3.5 py-3.5 rounded-[11px] border-[1.5px] flex flex-col gap-0.5 transition-colors",
      active
        ? isDark
          ? "border-blue-400 bg-blue-950/50"
          : "border-blue-600 bg-blue-50"
        : isDark
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white",
    );

  function addEvent() {
    const nv: IEventSession = {
      name: t("new_session_name"),
      tagline: "",
      description: "",
      images: [],
      imagesLables: [],
      roomLabel: t("default_room_label"),
      rooms: [],
      instructors: [],
      isActive: true,
      dates: [{ date: "2026-08-01", slots: [{ time: "10:00", capacity: 8 }] }],
    };
    const newIndex = config.sessions.length;
    update({ sessions: [...config.sessions, nv] });
    setIsCreateWizardOpen(true);
    setEditIndex(newIndex);
  }

  function deleteEvent(index: number) {
    if (config.sessions.length <= 1) return;
    const sessions = config.sessions.filter((_, i) => i !== index);
    update({ sessions });
    setEditIndex(0);
  }

  async function handleSubmit() {
    try {
      if (sessionId) {
        await updateEventSession({ sessionId, body: config }).unwrap();
        toast.success(t("toast_session_updated"));
      } else {
        await createEventSession({ ...config, eventId }).unwrap();
        toast.success(t("toast_session_created"));
      }
    } catch {
      toast.error(
        t(
          sessionId
            ? "toast_session_update_error"
            : "toast_session_create_error",
        ),
      );
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        <div className="space-y-4">
          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("page_header_title")}
              </h3>
            </div>
            <AField label={t("brand_name_field")}>
              <input
                className={INPUT}
                value={config.brand}
                onChange={(e) => update({ brand: e.target.value })}
              />
            </AField>
            <AField label={t("main_heading_field")}>
              <input
                className={INPUT}
                value={config.headline}
                onChange={(e) => update({ headline: e.target.value })}
              />
            </AField>
            <AField label={t("subtitle_field")}>
              <textarea
                className={clsx(INPUT, "resize-y leading-relaxed")}
                rows={2}
                value={config.subhead}
                onChange={(e) => update({ subhead: e.target.value })}
              />
            </AField>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("hero_image_title")}
              </h3>
            </div>
            <p className={clsx("text-xs mb-3 -mt-1", textTertiary)}>
              {t("hero_image_help")}
            </p>

            {previewUrl ? (
              <div
                className="relative rounded-xl overflow-hidden border group aspect-video"
                style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}
              >
                <img
                  src={previewUrl}
                  alt="hero"
                  className="w-full h-full object-cover"
                />
                {status === "uploading" ? (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    <span className="text-white text-xs font-bold">
                      {progress}%
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <button
                      onClick={() => deleteFile()}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all shadow-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t("remove_btn")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                  isDark
                    ? "border-gray-700 hover:border-blue-400"
                    : "border-gray-200 hover:border-blue-500",
                )}
              >
                <Upload
                  className={clsx("w-8 h-8 mx-auto mb-2", textTertiary)}
                />
                <p className={clsx("text-sm", textTertiary)}>
                  {t("hero_image_placeholder")}
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = "";
              }}
            />
          </div>

          <div className={CARD}>
            <div className="flex items-center gap-4">
              <PublishButton
                onClick={handleSubmit}
                isLoading={isCreating || isUpdating}
              />
              <button
                className="border border-gray-600 rounded-lg  px-4 py-2"
                onClick={() =>
                  navigate(`${routes.eventDetails}?eventId=${eventId}`)
                }
              >
                {t("back_btn")}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("choose_theme_title")}
              </h3>
              {config.themeId && (
                <span
                  className={clsx(
                    "text-xs font-semibold",
                    isDark ? "text-blue-400" : "text-blue-600",
                  )}
                >
                  {THEMES.find((th) => th.id === config.themeId)?.name}
                </span>
              )}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {THEMES.map((th) => {
                const active = config.themeId === th.id;
                return (
                  <button
                    key={th.id}
                    title={`${th.name} — ${th.mood}`}
                    onClick={() => update({ themeId: th.id })}
                    className={clsx(
                      "flex flex-col items-center gap-1.5 p-2 rounded-[10px] border-[1.5px] transition-all hover:-translate-y-0.5",
                      isDark ? "bg-gray-800" : "bg-white",
                      active
                        ? isDark
                          ? "border-blue-400 shadow-[0_0_0_3px_rgb(59_130_246/0.12)]"
                          : "border-blue-600 shadow-[0_0_0_3px_rgb(59_130_246/0.12)]"
                        : isDark
                          ? "border-gray-700"
                          : "border-gray-200",
                    )}
                  >
                    <span className="flex w-full h-4 rounded-md overflow-hidden">
                      {th.swatch.map((c, i) => (
                        <span
                          key={i}
                          className="flex-1"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    <span
                      className={clsx(
                        "text-[10px] font-semibold leading-none truncate w-full text-center",
                        active
                          ? isDark
                            ? "text-blue-400"
                            : "text-blue-600"
                          : textTertiary,
                      )}
                    >
                      {th.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_HEAD}>
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("selection_mode_title")}
              </h3>
            </div>
            <div className="grid grid-cols-2 max-[560px]:grid-cols-1 gap-2.5">
              <button
                className={modeBtn(config.selectionMode === "radio")}
                onClick={() => update({ selectionMode: "radio" })}
              >
                <strong className="text-sm">{t("radio_mode_label")}</strong>
                <span className={clsx("text-[12.5px]", textTertiary)}>
                  {t("radio_mode_desc")}
                </span>
              </button>
              <button
                className={modeBtn(config.selectionMode === "checkbox")}
                onClick={() => update({ selectionMode: "checkbox" })}
              >
                <strong className="text-sm">{t("checkbox_mode_label")}</strong>
                <span className={clsx("text-[12.5px]", textTertiary)}>
                  {t("checkbox_mode_desc")}
                </span>
              </button>
            </div>
          </div>

          <div className={CARD}>
            <div className="flex items-center justify-between">
              <div className={CARD_HEAD}>
                <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                  {t("live_sessions_title")}
                </h3>
              </div>
              <button
                onClick={addEvent}
                className={clsx(
                  "px-2.75 py-1.5 text-[12.5px] rounded-[9px] font-bold text-white hover:brightness-110 transition-[transform,filter] active:translate-y-px",
                  isDark ? "bg-blue-500" : "bg-blue-600",
                )}
              >
                {t("landing_add_session_btn")}
              </button>
            </div>
            <p
              className={clsx(
                "text-sm leading-relaxed -mt-1.5 mb-3.5",
                textTertiary,
              )}
            >
              {t("live_sessions_help")}
            </p>
            {config.sessions.map((e, sessionIdx) => (
              <div
                key={sessionIdx}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2.5 py-2.25 px-0.5 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    className={clsx(
                      "w-4.25 h-4.25",
                      isDark ? "accent-blue-400" : "accent-blue-600",
                    )}
                    checked={e.isActive}
                    onChange={() =>
                      update({
                        sessions: config.sessions.map((s, i) =>
                          i === sessionIdx
                            ? { ...s, isActive: !e.isActive }
                            : s,
                        ),
                      })
                    }
                  />
                  <span>{e.name}</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditIndex(sessionIdx);
                      setIsCreateWizardOpen(true);
                    }}
                    className={clsx(
                      "p-1 rounded-full text-sm font-bold transition-[transform,filter] active:translate-y-px",
                      isDark
                        ? "bg-blue-950/40 text-blue-400 hover:bg-blue-900/40"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100",
                    )}
                  >
                    <Pencil size={16} />
                  </button>
                  {config.sessions.length > 1 ? (
                    <button
                      onClick={() => deleteEvent(sessionIdx)}
                      className={clsx(
                        "p-1 rounded-full text-sm font-bold transition-[transform,filter] active:translate-y-px",
                        isDark
                          ? "bg-red-950/40 text-red-400 hover:bg-red-900/40"
                          : "bg-red-50 text-red-600 hover:bg-red-100",
                      )}
                    >
                      <Trash size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isCreateWizardOpen && (
        <CreateEventSessionWizard
          setIsOpen={setIsCreateWizardOpen}
          onChange={onChange}
          config={config}
          editIndex={editIndex}
        />
      )}
    </>
  );
}
