import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DatesEditorProps {
  event: IEventSession;
  onAddDate: () => void;
  onPatchDate: (dateIndex: number, patch: Partial<IEventDate>) => void;
  onRemoveDate: (dateIndex: number) => void;
  onAddSlot: (dateIndex: number) => void;
  onPatchSlot: (
    dateIndex: number,
    slotIndex: number,
    patch: Partial<IEventSlot>,
  ) => void;
  onRemoveSlot: (dateIndex: number, slotIndex: number) => void;
  labels: {
    datesTitle: string;
    addDate: string;
    groupSizeHelp: string;
    groupSizeHelpRoom: string;
    removeDate: string;
    colTime: string;
    colGroupSize: string;
    addSlot: string;
  };
}

export function DatesEditor({
  event,
  onAddDate,
  onPatchDate,
  onRemoveDate,
  onAddSlot,
  onPatchSlot,
  onRemoveSlot,
  labels,
}: DatesEditorProps) {
  const { isDark, textTertiary, inputClasses, cardClasses } = useThemeClasses();

  const INPUT = clsx(
    "w-full px-3 py-2.5 text-sm rounded-[9px] transition-[border-color,box-shadow] focus:outline-none focus:ring-2",
    inputClasses,
    isDark
      ? "focus:border-blue-400 focus:ring-blue-400/10"
      : "focus:border-blue-500 focus:ring-blue-500/10",
  );
  const BTN_SOLID_XS = clsx(
    "px-2.75 py-1.5 text-[12.5px] rounded-[9px] font-bold text-white hover:brightness-110 transition-[transform,filter] active:translate-y-px",
    isDark ? "bg-blue-500" : "bg-blue-600",
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

  return (
    <div className={clsx(cardClasses, "rounded-[14px] p-5")}>
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="m-0 text-[15.5px] font-extrabold tracking-tight">
          {labels.datesTitle}
        </h3>
        <button className={BTN_SOLID_XS} onClick={onAddDate}>
          {labels.addDate}
        </button>
      </div>
      <p
        className={clsx("text-sm leading-relaxed -mt-1.5 mb-3.5", textTertiary)}
      >
        {(event.rooms || []).length
          ? labels.groupSizeHelpRoom
          : labels.groupSizeHelp}
      </p>
      {event.dates.map((d, di) => (
        <div
          key={di}
          className={clsx(
            "border rounded-[11px] p-3.5 mb-3 last-of-type:mb-3.5",
            isDark
              ? "border-gray-700 bg-gray-900/50"
              : "border-gray-200 bg-gray-50",
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <input
              type="date"
              className={clsx(INPUT, "max-w-50")}
              value={d.date}
              onChange={(e) => onPatchDate(di, { date: e.target.value })}
            />
            {event.dates.length > 1 ? (
              <button
                className={BTN_DANGER_XS}
                onClick={() => onRemoveDate(di)}
              >
                {labels.removeDate}
              </button>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <div
              className={clsx(
                "grid grid-cols-[1fr_1fr_34px] gap-2 items-center text-[11.5px] font-bold uppercase tracking-[0.04em] px-0.5",
                textTertiary,
              )}
            >
              <span>{labels.colTime}</span>
              <span>{labels.colGroupSize}</span>
              <span />
            </div>
            {d.slots.map((s, si) => (
              <div
                key={si}
                className="grid grid-cols-[1fr_1fr_34px] gap-2 items-center"
              >
                <input
                  type="time"
                  className={INPUT}
                  value={s.time}
                  onChange={(e) =>
                    onPatchSlot(di, si, { time: e.target.value })
                  }
                />
                <input
                  type="number"
                  min="1"
                  className={INPUT}
                  value={s.capacity}
                  onChange={(e) =>
                    onPatchSlot(di, si, {
                      capacity: Math.max(1, +e.target.value || 1),
                    })
                  }
                />
                {d.slots.length > 1 ? (
                  <button
                    className={clsx(BTN_DANGER_XS, "justify-self-center")}
                    onClick={() => onRemoveSlot(di, si)}
                  >
                    ×
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
            <button className={BTN_GHOST_XS} onClick={() => onAddSlot(di)}>
              {labels.addSlot}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
