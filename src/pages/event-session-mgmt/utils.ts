import { slotKey } from "./data";

export function eventSlotRows(config: IAdminConfig): ISlotRow[] {
  const rows: ISlotRow[] = [];
  config.sessions.forEach((e, i) => {
    const rooms = (e.rooms || []).length ? e.rooms : [""];
    e.dates.forEach((d, j) =>
      d.slots.forEach((s, k) =>
        rooms?.forEach((room) =>
          rows.push({
            eventId: String(i),
            eventName: e.name,
            date: d.date,
            time: s.time,
            room,
            capacity: s.capacity,
            key: slotKey(String(i), String(j), String(k), room),
          }),
        ),
      ),
    );
  });
  return rows;
}
