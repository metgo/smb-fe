export const LS = {
  config: "lumen.config.v2",
} as const;

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
  brand: "",
  themeId: "terra",
  selectionMode: "radio",
  headline: "",
  subhead: "",
  images: [],
  sessions: [],
  isActive: true,
  liveEventIds: [],
  ticketIds: [],
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
