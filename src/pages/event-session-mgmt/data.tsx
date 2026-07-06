// Persistence + seed data for the event-booking prototype.
// Three localStorage keys:
//   lumen.config   -> admin-authored events + landing settings + theme
//   lumen.bookings -> { [slotKey]: count }  (drives live availability)
//   lumen.records  -> [ booking record ]    (admin "Registrations" table)
// slotKey = `${eventId}|${dateId}|${slotId}|${room}`

export const LS = {
  config: "lumen.config.v2",
  bookings: "lumen.bookings.v2",
  records: "lumen.records.v2",
  view: "lumen.view.v2",
  guest: "lumen.guestcode.v2",
  holds: "lumen.holds.v1",
  invites: "lumen.invites.v1",
} as const;

// How long a slot is held the moment a customer selects it (plan §5.1).
export const HOLD_TTL_MS = 7 * 60 * 1000;

let _uid = 0;
export function uid(p: string): string {
  return `${p}_${Date.now().toString(36)}_${(_uid++).toString(36)}`;
}

export function slotKey(
  eventId: string,
  dateId: string,
  slotId: string,
  room?: string,
): string {
  return `${eventId}|${dateId}|${slotId}|${room ?? ""}`;
}

export const DEFAULT_CONFIG: IAdminConfig = {
  eventId: "",
  brand: "לומן סטודיו",
  themeId: "terra",
  selectionMode: "radio",
  headline: "שמרו את מקומכם",
  subhead:
    "מפגשים בקבוצות קטנות בהנחיית הצוות שלנו. בחרו תאריך ושעה שמתאימים לכם — מספר המקומות מוגבל.",
  images: [],
  sessions: [
    {
      name: "אמבט צלילים ומנוחה עמוקה",
      tagline: "מסע בן 75 דקות דרך צלילים מהדהדים ושקט.",
      description:
        "שקעו במצב של רגיעה עמוקה בזמן שגלי צליל מקערות קריסטל, גונגים ופעמונים שוטפים אתכם. לא נדרש ניסיון — פשוט מגיעים, נשכבים ומשחררים. מזרנים, כריות ושמיכות מחכים במקום.",
      images: [],
      imagesLables: [
        "אווירת הסטודיו",
        "קערות קריסטל",
        "אורחים במנוחה",
        "חלל לאור נרות",
      ],
      roomLabel: "מטפל/ת",
      rooms: ["מאיה ר.", "יונה פ."],
      instructors: [
        { name: "מאיה רייס", role: "מטפלת בצליל" },
        { name: "יונה פז", role: "נשימה ותנועה" },
      ],
      dates: [
        {
          date: "2026-07-25",
          slots: [
            { time: "13:00", capacity: 8 },
            { time: "18:30", capacity: 12 },
          ],
        },
      ],
      isActive: true,
    },
    {
      name: "נשימה מחדש",
      tagline: "נשימה אקטיבית לשחרור מתח והעלאת אנרגיה.",
      description:
        "מפגש מודרך בשיטת נשימה מעגלית רציפה, לשחרור אנרגיה תקועה ויציאה עם ראש צלול. צפו לחוויה עוצמתית. מתאים לרוב האנשים — נא לציין מצבים רפואיים בהערות.",
      imagesLables: ["סטודיו פתוח", "מעגל קבוצתי", "אור זריחה"],
      images: [],
      isActive: true,
      roomLabel: "חדר",
      rooms: ["אולם א׳", "אולם ב׳"],
      instructors: [{ name: "יונה פז", role: "מנחה נשימה" }],
      dates: [
        {
          date: "2026-07-12",
          slots: [
            { time: "09:00", capacity: 10 },
            { time: "17:00", capacity: 10 },
          ],
        },
        {
          date: "2026-07-19",
          slots: [{ time: "09:00", capacity: 10 }],
        },
      ],
    },
    {
      name: "יוגה זורמת ורכה",
      tagline: "תנועה עדינה ומקרקעת לכל גוף.",
      description:
        "זרימה איטית וקשובה המחברת בין נשימה לתנועה, ומסתיימת בשהייה משקמת וארוכה. כל הרמות מוזמנות. הביאו מזרן משלכם או השאילו אחד שלנו.",
      imagesLables: ["סטודיו בבוקר", "פרט מזרן", "תנוחת מתיחה"],
      images: [],
      isActive: true,
      roomLabel: "חדר",
      rooms: ["אולם א׳"],
      instructors: [{ name: "אריה דונובן", role: "מורה ליוגה" }],
      dates: [
        {
          date: "2026-07-13",
          slots: [
            { time: "08:00", capacity: 14 },
            { time: "12:00", capacity: 14 },
          ],
        },
      ],
    },
  ],
  isActive: true,
  liveEventIds: ["ev_soundbath", "ev_breath", "ev_yoga"],
  ticketIds: [],
};

// seed a few existing bookings so availability looks realistic
export const DEFAULT_BOOKINGS: TBookings = {
  "ev_soundbath|d1|s1|מאיה ר.": 6,
  "ev_soundbath|d1|s2|מאיה ר.": 8, // full
  "ev_soundbath|d2|s4|מאיה ר.": 3,
  "ev_breath|d4|s8|אולם א׳": 9,
  "ev_yoga|d6|s11|אולם א׳": 11,
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    return JSON.parse(raw) as T;
  } catch {
    return structuredClone(fallback);
  }
}

function writeJSON<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // storage quota or private mode — silently ignore
  }
}

export const store = {
  getConfig: (): IAdminConfig => readJSON(LS.config, DEFAULT_CONFIG),
  setConfig: (c: IAdminConfig): void => writeJSON(LS.config, c),
  getBookings: (): TBookings => readJSON(LS.bookings, DEFAULT_BOOKINGS),
  setBookings: (b: TBookings): void => writeJSON(LS.bookings, b),
  getRecords: (): IBookingRecord[] => readJSON(LS.records, []),
  setRecords: (r: IBookingRecord[]): void => writeJSON(LS.records, r),
  getView: (): string => {
    try {
      return localStorage.getItem(LS.view) ?? "code";
    } catch {
      return "code";
    }
  },
  setView: (v: string): void => {
    try {
      localStorage.setItem(LS.view, v);
    } catch {
      /* ignore */
    }
  },
  getGuestCode: (): string => {
    try {
      return localStorage.getItem(LS.guest) ?? "";
    } catch {
      return "";
    }
  },
  setGuestCode: (c: string): void => {
    try {
      localStorage.setItem(LS.guest, c ?? "");
    } catch {
      /* ignore */
    }
  },
  getHolds: (): THolds => pruneHolds(readJSON<THolds>(LS.holds, [])),
  setHolds: (h: THolds): void => writeJSON(LS.holds, h),
  getInvites: (): Record<string, unknown> => readJSON(LS.invites, {}),
  setInvites: (m: Record<string, unknown>): void => writeJSON(LS.invites, m),
  resetAll: (): void => {
    writeJSON(LS.config, DEFAULT_CONFIG);
    writeJSON(LS.bookings, DEFAULT_BOOKINGS);
    writeJSON(LS.records, []);
    writeJSON(LS.holds, []);
    writeJSON(LS.invites, {});
  },
};

// ---- holds helpers --------------------------------------------------------

interface Hold {
  slotKey: string;
  expiresAt: number;
  inviteId?: string;
}

export function pruneHolds(holds: THolds): THolds {
  const now = Date.now();
  return (holds as Hold[]).filter((h) => h.expiresAt > now);
}

export function activeHoldCount(
  holds: THolds,
  sKey: string,
  exceptInviteId?: string,
): number {
  const now = Date.now();
  return (holds as Hold[]).filter(
    (h) =>
      h.slotKey === sKey && h.expiresAt > now && h.inviteId !== exceptInviteId,
  ).length;
}

// ---- deep-link token (plan §4) --------------------------------------------
// PROTOTYPE ONLY: a real build signs/encrypts this (JWS/JWE). Here we just
// base64url-encode the JSON so the flow is faithful and inspectable.

function b64urlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return decodeURIComponent(escape(atob(str)));
}

export function encodeToken(payload: Record<string, unknown>): string {
  return b64urlEncode(JSON.stringify(payload));
}

export function decodeToken(token: string): {
  payload?: Record<string, unknown>;
  error?: string;
} {
  try {
    const p = JSON.parse(b64urlDecode(token)) as Record<string, unknown>;
    if (p["exp"] && Date.now() > (p["exp"] as number))
      return { error: "expired", payload: p };
    return { payload: p };
  } catch {
    return { error: "invalid" };
  }
}

export function shortToken(n?: number): string {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < (n ?? 6); i++)
    s += c[Math.floor(Math.random() * c.length)];
  return s;
}

// ---- formatting helpers ---------------------------------------------------

export function fmtDate(
  iso: string,
  opts?: Intl.DateTimeFormatOptions,
  locale?: string,
): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(
      locale ?? "en-US",
      opts ?? { weekday: "short", month: "short", day: "numeric" },
    );
  } catch {
    return iso;
  }
}

// times are stored 24h ("18:30") — show as-is (Israeli convention)
export function fmtTime(t: string): string {
  return t;
}
