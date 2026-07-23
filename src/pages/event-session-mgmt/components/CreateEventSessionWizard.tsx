import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Image as ImageIcon,
  Users,
  DoorOpen,
  CalendarDays,
  Eye,
  Pencil,
} from "lucide-react";
import { ImageWithFallback } from "@/components/shared";

import { AField } from "./AField";
import { DatesEditor } from "./DatesEditor";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ModalWrapper } from "@/components/wrapper";
import { WizardStepper, WizardFooter } from "@/components/shared";
import ImageUploadSection from "./ImageUploadSection";

type Instructor = { name: string; role: string };

interface CreateEventSessionWizardProps {
  config: IAdminConfig;
  onChange: (config: IAdminConfig) => void;
  setIsOpen: (v: boolean) => void;
  editIndex: number;
  ticketDateTime: ITicketDayTimeForSession[];
}

interface IEventSessionDate {
  date: string;
  slots: {
    time: string;
    capacity: number;
  }[];
}

// Transform ticketDateTime to dates format
function transformTicketDateTimeToDates(
  ticketDateTime: ITicketDayTimeForSession[],
): IEventSessionDate[] {
  const dateMap = new Map<string, Set<string>>();

  ticketDateTime.forEach((item) => {
    const dateOnly = item.date.split("T")[0];
    if (!dateMap.has(dateOnly)) {
      dateMap.set(dateOnly, new Set());
    }
    dateMap.get(dateOnly)!.add(item.startTime);
  });

  const result: IEventSessionDate[] = [];
  dateMap.forEach((times, date) => {
    result.push({
      date: `${date}`,
      slots: Array.from(times).map((time) => ({
        time: time,
        capacity: 8,
      })),
    });
  });
  return result;
}

export function CreateEventSessionWizard({
  config,
  onChange,
  setIsOpen,
  editIndex,
  ticketDateTime,
}: CreateEventSessionWizardProps) {
  const { t } = useTranslation("event_session");
  const {
    isDark,
    textPrimary,
    textTertiary,
    inputClasses,
    cardClasses,
    borderColor,
  } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(1);
  const [newRoomInput, setNewRoomInput] = useState("");

  // Track validation errors for instructors
  const [instructorErrors, setInstructorErrors] = useState<
    Record<number, { name: boolean; role: boolean }>
  >({});

  const CARD = clsx(cardClasses, "rounded-[14px] p-5");
  const INPUT = clsx(
    "w-full px-3 py-2.5 text-sm rounded-[9px] transition-[border-color,box-shadow] focus:outline-none focus:ring-2 border",
    inputClasses,
    isDark
      ? "focus:border-blue-400 focus:ring-blue-400/10"
      : "focus:border-blue-500 focus:ring-blue-500/10",
  );
  const INPUT_ERROR = clsx(
    INPUT,
    "border-red-500 focus:border-red-500 focus:ring-red-500/10",
  );

  const BTN_GHOST_XS = clsx(
    "px-2.75 py-1.5 text-[12.5px] rounded-[9px] font-bold transition-[transform,filter] active:translate-y-px",
    isDark
      ? "bg-blue-950/40 text-blue-400 hover:bg-blue-900/40"
      : "bg-blue-50 text-blue-600 hover:bg-blue-100",
  );
  const BTN_DANGER_XS = clsx(
    "px-2.75 py-1.5 text-[12.5px] rounded-[9px] font-bold transition-[transform,filter] active:translate-y-px",
    isDark
      ? "bg-red-950/40 text-red-400 hover:bg-red-900/40"
      : "bg-red-50 text-red-600 hover:bg-red-100",
  );
  const tagSpan = isDark ? "bg-blue-950/50" : "bg-blue-50";
  const tagInput = isDark ? "text-blue-400" : "text-blue-600";
  const tagRemove = isDark
    ? "text-blue-400 hover:bg-gray-700"
    : "text-blue-600 hover:bg-white";

  function blankSession(
    ticketDateTime: ITicketDayTimeForSession[],
  ): IEventSession {
    const dates =
      ticketDateTime && ticketDateTime.length > 0
        ? transformTicketDateTimeToDates(ticketDateTime)
        : [{ date: "2026-08-01", slots: [{ time: "10:00", capacity: 8 }] }];

    return {
      name: "",
      tagline: "",
      description: "",
      images: [],
      imagesLables: [],
      roomLabel: "",
      rooms: [],
      instructors: [],
      isActive: true,
      dates: dates,
    };
  }

  const isNew = editIndex === -1;
  const [draftSession, setDraftSession] = useState<IEventSession>(() =>
    blankSession(ticketDateTime),
  );

  const ev = isNew ? draftSession : (config.sessions[editIndex] ?? null);
  const update = (patch: Partial<IAdminConfig>) =>
    onChange({ ...config, ...patch });
  const updateSession = (patch: Partial<IEventSession>) => {
    if (isNew) {
      setDraftSession((prev) => ({ ...prev, ...patch }));
      return;
    }
    update({
      sessions: config.sessions.map((e, i) =>
        i === editIndex ? { ...e, ...patch } : e,
      ),
    });
  };

  const validateInstructors = (): boolean => {
    if (!ev?.instructors || ev.instructors.length === 0) return true;

    const errors: Record<number, { name: boolean; role: boolean }> = {};
    let isValid = true;

    ev.instructors.forEach((ins, i) => {
      const nameEmpty = !ins.name?.trim();
      const roleEmpty = !ins.role?.trim();

      errors[i] = { name: nameEmpty, role: roleEmpty };

      if (nameEmpty || roleEmpty) {
        isValid = false;
      }
    });

    setInstructorErrors(errors);
    return isValid;
  };

  function handleDone() {
    if (!validateInstructors()) {
      setCurrentStep(3); // Jump back to instructors step if invalid
      return;
    }

    // Filter out any completely empty instructors just in case
    const validInstructors = (ev?.instructors || []).filter(
      (instructor) =>
        instructor.name?.trim() !== "" || instructor.role?.trim() !== "",
    );

    const sessionToSave = {
      ...(isNew ? draftSession : config.sessions[editIndex]),
      instructors: validInstructors,
    };

    if (isNew) {
      update({ sessions: [...config.sessions, sessionToSave] });
    } else {
      update({
        sessions: config.sessions.map((e, i) =>
          i === editIndex ? sessionToSave : e,
        ),
      });
    }

    setIsOpen(false);
  }

  const handleNext = () => {
    if (currentStep === 3) {
      if (!validateInstructors()) return; // Block navigation if invalid
    }
    setCurrentStep((p) => p + 1);
  };

  function addDate() {
    if (!ev) return;
    updateSession({
      dates: [
        ...ev.dates,
        { date: "2026-08-01", slots: [{ time: "10:00", capacity: 8 }] },
      ],
    });
  }
  function patchDate(dateIndex: number, patch: Partial<IEventDate>) {
    if (!ev) return;
    updateSession({
      dates: ev.dates.map((d, i) => (i === dateIndex ? { ...d, ...patch } : d)),
    });
  }
  function removeDate(dateIndex: number) {
    if (!ev) return;
    updateSession({ dates: ev.dates.filter((_, i) => i !== dateIndex) });
  }
  function addSlot(dateIndex: number) {
    if (!ev) return;
    const d = ev.dates[dateIndex];
    if (!d) return;
    patchDate(dateIndex, {
      slots: [...d.slots, { time: "12:00", capacity: 8 }],
    });
  }
  function patchSlot(
    dateIndex: number,
    slotIndex: number,
    patch: Partial<IEventSlot>,
  ) {
    if (!ev) return;
    const d = ev.dates[dateIndex];
    if (!d) return;
    patchDate(dateIndex, {
      slots: d.slots.map((s, i) => (i === slotIndex ? { ...s, ...patch } : s)),
    });
  }
  function removeSlot(dateIndex: number, slotIndex: number) {
    if (!ev) return;
    const d = ev.dates[dateIndex];
    if (!d) return;
    patchDate(dateIndex, { slots: d.slots.filter((_, i) => i !== slotIndex) });
  }

  function listAdd(val: string) {
    if (!ev) return;
    updateSession({ rooms: [...(ev.rooms || []), val] });
  }
  function listPatch(i: number, val: string) {
    if (!ev) return;
    updateSession({
      rooms: (ev.rooms ?? []).map((x, idx) => (idx === i ? val : x)),
    });
  }
  function listRemove(i: number) {
    if (!ev) return;
    updateSession({ rooms: (ev.rooms ?? []).filter((_, idx) => idx !== i) });
  }

  function insAdd() {
    if (!ev) return;
    updateSession({
      instructors: [
        ...(ev.instructors || []),
        {
          name: "",
          role: "",
        },
      ],
    });
  }

  function insPatch(i: number, patch: Partial<Instructor>) {
    if (!ev) return;
    updateSession({
      instructors: (ev.instructors ?? []).map((x, idx) =>
        idx === i ? { ...x, ...patch } : x,
      ),
    });

    // Clear error for the patched field as user types
    if (instructorErrors[i]) {
      setInstructorErrors((prev) => {
        const newErrors = { ...prev };
        if (patch.name !== undefined)
          newErrors[i] = { ...newErrors[i], name: false };
        if (patch.role !== undefined)
          newErrors[i] = { ...newErrors[i], role: false };
        return newErrors;
      });
    }
  }

  function insRemove(i: number) {
    if (!ev) return;
    updateSession({
      instructors: (ev.instructors ?? []).filter((_, idx) => idx !== i),
    });
    setInstructorErrors({}); // Reset errors, will re-validate on Next/Done
  }

  const steps: IWizardStep[] = [
    { number: 1, title: t("session_details_title"), icon: FileText },
    { number: 2, title: t("images_title"), icon: ImageIcon },
    { number: 3, title: t("instructors_title"), icon: Users },
    { number: 4, title: t("rooms_title"), icon: DoorOpen },
    { number: 5, title: t("dates_title"), icon: CalendarDays },
    { number: 6, title: t("wizard_step_review"), icon: Eye },
  ];

  const reviewSectionHeader = (
    icon: React.ReactNode,
    label: string,
    step: number,
  ) => (
    <div
      className={clsx(
        "flex items-center justify-between px-5 py-3 border-b",
        borderColor,
        isDark ? "bg-white/5" : "bg-gray-50",
      )}
    >
      <div className="flex items-center gap-2">
        <span className={clsx("opacity-60", textTertiary)}>{icon}</span>
        <span
          className={clsx(
            "text-sm font-semibold tracking-wide uppercase",
            textTertiary,
          )}
        >
          {label}
        </span>
      </div>
      <button
        onClick={() => setCurrentStep(step)}
        className={clsx(
          "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors",
          isDark
            ? "text-blue-400 hover:bg-blue-950/40"
            : "text-blue-600 hover:bg-blue-50",
        )}
      >
        <Pencil className="w-3 h-3" />
        {t("wizard_edit_btn")}
      </button>
    </div>
  );

  const renderStepContent = () => {
    if (!ev) return null;
    switch (currentStep) {
      case 1:
        return (
          <div className={CARD}>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("session_details_title")}
              </h3>
            </div>
            <AField label={t("field_name")}>
              <input
                className={INPUT}
                value={ev.name}
                onChange={(e) => updateSession({ name: e.target.value })}
              />
            </AField>
            <AField label={t("field_subtitle")}>
              <input
                className={INPUT}
                value={ev.tagline}
                onChange={(e) => updateSession({ tagline: e.target.value })}
              />
            </AField>
            <AField label={t("field_description")}>
              <textarea
                className={clsx(INPUT, "resize-y leading-relaxed")}
                rows={4}
                value={ev.description}
                onChange={(e) => updateSession({ description: e.target.value })}
              />
            </AField>
          </div>
        );
      case 2:
        return (
          <ImageUploadSection
            key={editIndex}
            id={String(editIndex)}
            images={ev.images || []}
            onImagesChange={(images) => updateSession({ images })}
            title={t("images_title")}
            cardClasses={cardClasses}
          />
        );
      case 3:
        return (
          <div className={CARD}>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("instructors_title")}
              </h3>
            </div>
            {(ev.instructors || []).map((ins, i) => {
              const nameError = instructorErrors[i]?.name;
              const roleError = instructorErrors[i]?.role;

              return (
                <div key={i} className="flex flex-col gap-1 mb-3">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                    <div className="flex flex-col">
                      <input
                        className={nameError ? INPUT_ERROR : INPUT}
                        value={ins.name}
                        onChange={(e) => insPatch(i, { name: e.target.value })}
                        onBlur={() => {
                          if (!ins.name.trim()) {
                            setInstructorErrors((prev) => ({
                              ...prev,
                              [i]: { ...prev[i], name: true },
                            }));
                          }
                        }}
                        placeholder={t("instructor_name_placeholder")}
                      />
                      {nameError && (
                        <span className="text-xs text-red-500 mt-1">
                          {t("field_required", "Name is required")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <input
                        className={roleError ? INPUT_ERROR : INPUT}
                        value={ins.role}
                        onChange={(e) => insPatch(i, { role: e.target.value })}
                        onBlur={() => {
                          if (!ins.role.trim()) {
                            setInstructorErrors((prev) => ({
                              ...prev,
                              [i]: { ...prev[i], role: true },
                            }));
                          }
                        }}
                        placeholder={t("instructor_role_placeholder")}
                      />
                      {roleError && (
                        <span className="text-xs text-red-500 mt-1">
                          {t("field_required", "Role is required")}
                        </span>
                      )}
                    </div>
                    <button
                      className={clsx(BTN_DANGER_XS, "mt-0.5")}
                      onClick={() => insRemove(i)}
                    >
                      {t("remove_btn")}
                    </button>
                  </div>
                </div>
              );
            })}
            <button className={BTN_GHOST_XS} onClick={insAdd}>
              {t("add_instructor_btn")}
            </button>
          </div>
        );
      case 4:
        return (
          <div className={CARD}>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
                {t("rooms_title")}
              </h3>
            </div>
            <p
              className={clsx(
                "text-sm leading-relaxed -mt-1.5 mb-3.5",
                textTertiary,
              )}
            >
              {t("rooms_help")}
            </p>

            <div className="flex gap-2 items-center mb-4">
              <input
                className={clsx(INPUT, "flex-1")}
                placeholder={t(
                  "add_room_placeholder",
                  "Type room name and press Enter...",
                )}
                value={newRoomInput}
                onChange={(e) => setNewRoomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newRoomInput.trim()) {
                      listAdd(newRoomInput.trim());
                      setNewRoomInput("");
                    }
                  }
                }}
              />
              <button
                type="button"
                className={BTN_GHOST_XS}
                onClick={() => {
                  if (newRoomInput.trim()) {
                    listAdd(newRoomInput.trim());
                    setNewRoomInput("");
                  }
                }}
              >
                {t("add_btn", "Add")}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center mb-3">
              {(ev.rooms || []).map((r, i) => (
                <span
                  key={i}
                  className={clsx(
                    "inline-flex items-center rounded-lg py-0.5 pr-0.5 pl-2",
                    tagSpan,
                  )}
                >
                  <input
                    className={clsx(
                      "border-0 bg-transparent text-sm font-semibold w-24 sm:w-32 p-1 focus:outline-none",
                      tagInput,
                    )}
                    value={r}
                    onChange={(e) => listPatch(i, e.target.value)}
                  />
                  <button
                    className={clsx(
                      "text-base w-5 h-5 rounded-md leading-none flex items-center justify-center",
                      tagRemove,
                    )}
                    onClick={() => listRemove(i)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <DatesEditor
            event={ev}
            onAddDate={addDate}
            onPatchDate={patchDate}
            onRemoveDate={removeDate}
            onAddSlot={addSlot}
            onPatchSlot={patchSlot}
            onRemoveSlot={removeSlot}
            labels={{
              datesTitle: t("dates_title"),
              addDate: t("add_date_btn"),
              groupSizeHelp: t("group_size_help"),
              groupSizeHelpRoom: t("group_size_help_room", {
                roomLabel: ev.roomLabel,
              }),
              removeDate: t("remove_date_btn"),
              colTime: t("col_time"),
              colGroupSize: t("col_group_size"),
              addSlot: t("add_slot_btn"),
            }}
          />
        );
      case 6:
        return (
          <div className="flex flex-col gap-4">
            <div
              className={clsx("rounded-xl border overflow-hidden", borderColor)}
            >
              {reviewSectionHeader(
                <FileText className="w-4 h-4" />,
                t("session_details_title"),
                1,
              )}
              <div className="px-5 py-4 flex flex-col gap-2">
                <div>
                  <p
                    className={clsx(
                      "text-xs font-semibold uppercase tracking-wide mb-0.5",
                      textTertiary,
                    )}
                  >
                    {t("field_name")}
                  </p>
                  <p className="text-sm font-semibold">{ev.name || "—"}</p>
                </div>
                {ev.tagline && (
                  <div>
                    <p
                      className={clsx(
                        "text-xs font-semibold uppercase tracking-wide mb-0.5",
                        textTertiary,
                      )}
                    >
                      {t("field_subtitle")}
                    </p>
                    <p className="text-sm">{ev.tagline}</p>
                  </div>
                )}
                {ev.description && (
                  <div>
                    <p
                      className={clsx(
                        "text-xs font-semibold uppercase tracking-wide mb-0.5",
                        textTertiary,
                      )}
                    >
                      {t("field_description")}
                    </p>
                    <p
                      className={clsx("text-sm leading-relaxed", textTertiary)}
                    >
                      {ev.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              className={clsx("rounded-xl border overflow-hidden", borderColor)}
            >
              {reviewSectionHeader(
                <ImageIcon className="w-4 h-4" />,
                t("images_title"),
                2,
              )}
              <div className="px-5 py-4">
                {(ev.images || []).length === 0 ? (
                  <p className={clsx("text-sm", textTertiary)}>
                    {t("wizard_no_images")}
                  </p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {(ev.images || []).map((img, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          "aspect-square rounded-lg overflow-hidden border",
                          borderColor,
                        )}
                      >
                        <ImageWithFallback
                          src={img.image}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className={clsx("rounded-xl border overflow-hidden", borderColor)}
            >
              {reviewSectionHeader(
                <Users className="w-4 h-4" />,
                t("instructors_title"),
                3,
              )}
              <div className="px-5 py-4">
                {(ev.instructors || []).length === 0 ? (
                  <p className={clsx("text-sm", textTertiary)}>
                    {t("wizard_no_instructors")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {(ev.instructors || []).map((ins, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span
                          className={clsx(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            isDark ? "bg-gray-700" : "bg-gray-100",
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold">
                          {ins.name}
                        </span>
                        <span className={clsx("text-xs", textTertiary)}>
                          {ins.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className={clsx("rounded-xl border overflow-hidden", borderColor)}
            >
              {reviewSectionHeader(
                <DoorOpen className="w-4 h-4" />,
                t("rooms_title"),
                4,
              )}
              <div className="px-5 py-4">
                {(ev.rooms || []).length === 0 ? (
                  <p className={clsx("text-sm", textTertiary)}>
                    {t("wizard_no_rooms")}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(ev.rooms || []).map((r, i) => (
                      <span
                        key={i}
                        className={clsx(
                          "px-3 py-1 rounded-lg text-sm font-semibold",
                          tagSpan,
                          tagInput,
                        )}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className={clsx("rounded-xl border overflow-hidden", borderColor)}
            >
              {reviewSectionHeader(
                <CalendarDays className="w-4 h-4" />,
                t("dates_title"),
                5,
              )}
              <div className="px-5 py-4 flex flex-col gap-3">
                {ev.dates.map((d, di) => (
                  <div key={di}>
                    <p className="text-sm font-bold mb-1.5">{d.date}</p>
                    <div className="flex flex-wrap gap-2">
                      {d.slots.map((s, si) => (
                        <span
                          key={si}
                          className={clsx(
                            "px-3 py-1 rounded-lg text-xs font-semibold",
                            isDark ? "bg-gray-700" : "bg-gray-100",
                          )}
                        >
                          {s.time} &mdash; {s.capacity}{" "}
                          {t("col_group_size").toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!ev) return null;

  return (
    <ModalWrapper
      onClose={() => setIsOpen(false)}
      height="max-sm:h-[90vh] md:max-h-[90vh] md:min-h-[60vh]"
    >
      <div
        className={`px-4 py-3 md:p-6 border-b ${borderColor} flex items-center justify-between gap-3`}
      >
        <div className="min-w-0">
          <h2
            className={`text-lg md:text-2xl ${textPrimary} mb-0.5 md:mb-1 truncate`}
          >
            {ev.name}
          </h2>
          <p className={`text-xs md:text-sm ${textTertiary} truncate`}>
            {currentStep} / {steps.length} &mdash;{" "}
            {steps[currentStep - 1]?.title}
          </p>
        </div>
      </div>

      <div className={`px-4 md:px-6 pt-3 md:pt-4 pb-2 border-b ${borderColor}`}>
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={setCurrentStep}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {renderStepContent()}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={steps.length}
        isSaving={false}
        isPublishing={false}
        onPrevious={() => setCurrentStep((p) => p - 1)}
        onNext={handleNext}
        isPublishButton={false}
        onDone={handleDone}
        onPublish={() => {}}
      />
    </ModalWrapper>
  );
}
