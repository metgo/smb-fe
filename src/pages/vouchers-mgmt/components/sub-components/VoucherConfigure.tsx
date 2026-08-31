import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { VOUCHER_COUNTRY_CODES } from "./VoucherInformation";

interface Campaign {
  _id: string;
  name: string;
  defaultAmount?: number;
}

interface Props {
  formData: IVoucherFormData;
  setFormData: React.Dispatch<React.SetStateAction<IVoucherFormData>>;
  t: (key: string) => string;
  errors?: Record<string, string>;
  campaigns?: {
    datas?: {
      data?: Campaign[];
    };
  };
}

export function makeVoucherAssignee(): IVoucherAssignee {
  return {
    id: crypto.randomUUID(),
    name: "",
    email: "",
    countryCode: "+972",
    phone: "",
    campaignId: "",
    amount: "",
    expireDate: "",
  };
}

const TODAY = new Date().toISOString().split("T")[0];

// ─── CSV import helpers ──────────────────────────────────────────────────────
// Columns are matched by header name (case-insensitive), NOT by position, so
// the order of columns in the uploaded file does not matter.
type CsvField =
  | "name"
  | "email"
  | "countryCode"
  | "phone"
  | "campaign"
  | "amount"
  | "expireDate";

const CSV_COLUMN_ALIASES: Record<CsvField, string[]> = {
  name: ["name", "assigneename", "assignee name"],
  email: ["email", "assigneeemail", "assignee email"],
  countryCode: ["countrycode", "country code", "assigneecountrycode"],
  phone: ["phone", "mobile", "assigneephone", "assignee phone"],
  campaign: ["campaign", "campaignname", "campaign name"],
  amount: ["amount", "value"],
  expireDate: [
    "expiration",
    "expirationdate",
    "expiration date",
    "expiredate",
    "expire date",
    "expiry",
    "expiry date",
    "expirydate",
    "exp",
    "exp date",
    "valid until",
    "validuntil",
    "end date",
    "enddate",
  ],
};

// Normalize a date cell to yyyy-mm-dd (what <input type="date"> needs).
// Handles ISO, dd/mm/yyyy | dd-mm-yyyy | dd.mm.yyyy (day-first when ambiguous),
// and anything the Date constructor understands. Returns "" if unparseable.
function normalizeDate(raw: string): string {
  const v = raw.trim();
  if (!v) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  const parts = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(v);
  if (parts) {
    let day = parseInt(parts[1], 10);
    let month = parseInt(parts[2], 10);
    let year = parseInt(parts[3], 10);
    if (month > 12 && day <= 12) [day, month] = [month, day]; // clearly mm/dd
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  }
  return "";
}

const CSV_REQUIRED_FIELDS: CsvField[] = ["name", "email", "campaign", "amount"];

// Minimal CSV splitter that understands quoted fields with embedded commas
// and "" escapes — good enough for the sample template and spreadsheet exports.
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

const VoucherConfigure = ({
  formData,
  setFormData,
  t,
  errors = {},
  campaigns,
}: Props) => {
  const { isDark, isRTL, textTertiary } = useThemeClasses();

  const campaignList: Campaign[] = campaigns?.datas?.data ?? [];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");

  // Refs to each assignee card so we can scroll a newly added one into view.
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const shouldScrollToLast = useRef(false);

  // Auto-dismiss the upload error message after 6 seconds.
  useEffect(() => {
    if (!uploadError) return;
    const timer = setTimeout(() => setUploadError(""), 6000);
    return () => clearTimeout(timer);
  }, [uploadError]);

  const card = isDark
    ? "bg-gray-900 border-gray-800"
    : "bg-white border-gray-200";
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:ring-1 focus:ring-teal-500 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;
  const selectCls = `px-2 py-2 rounded-lg border text-sm outline-none transition-colors ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;
  const labelCls = `block text-xs mb-1 ${
    isDark ? "text-gray-400" : "text-gray-500"
  }`;

  const { assignees } = formData;

  // Always a "multiple vouchers" flow now — one card per assignee.
  const activeAssignees = assignees;

  // An assignee card with no value entered in any field yet.
  const isAssigneeEmpty = (a: IVoucherAssignee) =>
    !a.name.trim() &&
    !a.email.trim() &&
    !a.phone.trim() &&
    !a.campaignId &&
    !a.amount &&
    !a.expireDate;

  // Block adding another card while an existing one is still completely empty.
  const hasEmptyAssignee = activeAssignees.some(isAssigneeEmpty);

  // ─── Per-field required / format validation ────────────────────────────────
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  type RequiredField = "name" | "email" | "campaignId" | "amount" | "expireDate";

  // Fields touched (blurred) by the user, keyed `${assigneeId}:${field}`.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (id: string, field: RequiredField) =>
    setTouched((prev) => ({ ...prev, [`${id}:${field}`]: true }));

  // When the parent step validation fails it sets `errors.assignees` — that's
  // our cue to reveal every field error, not just the touched ones.
  const revealAllErrors = Boolean(errors.assignees);

  const fieldError = (a: IVoucherAssignee, field: RequiredField): string => {
    switch (field) {
      case "name":
        return a.name.trim() ? "" : t("error_name_required");
      case "email":
        if (!a.email.trim()) return t("error_email_required");
        return EMAIL_RE.test(a.email.trim()) ? "" : t("error_email_invalid");
      case "campaignId":
        return a.campaignId ? "" : t("error_campaign_required");
      case "amount":
        if (String(a.amount).trim() === "") return t("error_amount_required");
        return Number(a.amount) > 0 ? "" : t("error_invalid_amount");
      case "expireDate":
        if (!a.expireDate) return t("error_expiration_required");
        return a.expireDate < TODAY ? t("error_expiration_past") : "";
      default:
        return "";
    }
  };

  // Error to actually display for a field (respects touched / reveal state).
  const shownError = (a: IVoucherAssignee, field: RequiredField): string =>
    revealAllErrors || touched[`${a.id}:${field}`] ? fieldError(a, field) : "";

  const errInputCls = isDark
    ? "border-red-500/70 focus:ring-red-500"
    : "border-red-500 focus:ring-red-500";
  const errText = "mt-1 text-xs text-red-500";

  // After a card is added, scroll it into view (only when there are 2+ cards).
  useEffect(() => {
    if (!shouldScrollToLast.current) return;
    shouldScrollToLast.current = false;
    if (assignees.length <= 1) return;
    const lastId = assignees[assignees.length - 1].id;
    cardRefs.current[lastId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [assignees]);

  const updateAssignee = (
    id: string,
    field: keyof IVoucherAssignee,
    value: string,
  ) =>
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.map((a) =>
        a.id === id ? { ...a, [field]: value } : a,
      ),
    }));

  const addAssignee = () => {
    if (hasEmptyAssignee) {
      toast.error(t("fill_current_assignee_first"));
      return;
    }
    shouldScrollToLast.current = true;
    setFormData((prev) => ({
      ...prev,
      assignees: [...prev.assignees, makeVoucherAssignee()],
    }));
  };

  const removeAssignee = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.filter((a) => a.id !== id),
    }));

  const applyToAll = (
    field: "campaignId" | "amount" | "expireDate",
    value: string,
  ) =>
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.map((a) => ({ ...a, [field]: value })),
    }));

  // Sample CSV download
  const downloadSample = () => {
    const csv =
      "Name,Email,CountryCode,Phone,Campaign,Amount,Expiration\nJohn Doe,john@example.com,+972,501234567,Summer Sale 2024,200,2026-12-31\nJane Smith,jane@example.com,+1,2125550100,VIP Members,500,2026-12-31";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voucher-assignees-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV parse (client-side, plain CSV only). Columns are resolved by header
  // name so re-ordered / extra columns don't silently shift values.
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = (ev.target?.result as string).replace(/^\uFEFF/, "");
        const rows = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (rows.length < 2) {
          setUploadError(
            "File must have a header row and at least one data row.",
          );
          return;
        }

        // Map each expected field to its column index via the header row.
        const header = parseCsvLine(rows[0]).map((h) => h.toLowerCase());
        const colIndex: Partial<Record<CsvField, number>> = {};
        (Object.keys(CSV_COLUMN_ALIASES) as CsvField[]).forEach((field) => {
          const idx = header.findIndex((h) =>
            CSV_COLUMN_ALIASES[field].includes(h),
          );
          if (idx !== -1) colIndex[field] = idx;
        });

        const missing = CSV_REQUIRED_FIELDS.filter(
          (f) => colIndex[f] === undefined,
        );
        if (missing.length) {
          setUploadError(
            `Missing required column(s): ${missing.join(", ")}. ` +
              `Use "Download sample" for the expected format.`,
          );
          return;
        }

        const cell = (cells: string[], field: CsvField) => {
          const idx = colIndex[field];
          return idx === undefined ? "" : (cells[idx] ?? "").trim();
        };

        const unmatchedCampaigns = new Set<string>();
        const parsed: IVoucherAssignee[] = rows.slice(1).map((line) => {
          const cells = parseCsvLine(line);
          const campaignLabel = cell(cells, "campaign");
          const campaign = campaignList.find(
            (c) => c.name.toLowerCase() === campaignLabel.toLowerCase(),
          );
          if (campaignLabel && !campaign) unmatchedCampaigns.add(campaignLabel);
          const rawCc = cell(cells, "countryCode") || "+972";
          return {
            id: crypto.randomUUID(),
            name: cell(cells, "name"),
            email: cell(cells, "email"),
            countryCode: rawCc.startsWith("+") ? rawCc : `+${rawCc}`,
            phone: cell(cells, "phone"),
            campaignId: campaign?._id || "",
            amount: cell(cells, "amount"),
            expireDate: normalizeDate(cell(cells, "expireDate")),
          };
        });

        // Append the imported rows to whatever the user already entered.
        // Only the untouched placeholder cards are dropped so the list
        // doesn't carry empty entries after an import.
        setFormData((prev) => {
          const manual = prev.assignees.filter((a) => !isAssigneeEmpty(a));
          return {
            ...prev,
            assignees: [...manual, ...parsed],
            purchaseType: "multiple",
          };
        });

        if (unmatchedCampaigns.size) {
          setUploadError(
            `Imported ${parsed.length} row(s). These campaign names didn't ` +
              `match any campaign and were left blank: ` +
              `${[...unmatchedCampaigns].join(", ")}.`,
          );
        }
      } catch {
        setUploadError(
          "Could not parse the file. Please use the sample format.",
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="">
      <div className={`border ${card}`}>
        {/* Sticky block — count, sample/upload/add actions and apply-to-all
            stay visible while scrolling through the assignee cards. */}
        <div
          className={`sticky -top-2 z-20 ${
            isDark ? "bg-gray-900" : "bg-white"
          }`}
        >
        {/* Header: title + sample / upload / add actions */}
        <div
          className={`px-6 py-1 pb-2 border-b ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
              {`${t("assignees")} (${activeAssignees.length})`}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={downloadSample}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isDark
                    ? "bg-teal-900/40 hover:bg-teal-900/60 text-teal-300 border border-teal-700"
                    : "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                {t("download_sample")}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {t("upload_sample")}
              </button>
              <button
                type="button"
                onClick={addAssignee}
                disabled={hasEmptyAssignee}
                title={hasEmptyAssignee ? t("fill_current_assignee_first") : ""}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-teal-500 disabled:hover:to-blue-500"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("add_assignee")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
            {/* <p className={` text-xs ${textTertiary}`}>
              {t("supports_csv_sample_hint")}
            </p> */}
        </div>

        {uploadError && (
          <div
            className={`flex items-center gap-2 text-sm px-6 py-3 border-b text-red-500 ${
              isDark ? "border-gray-800" : "border-gray-100"
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {/* Apply to all — shown Ïth 2+ assignees */}
        {activeAssignees.length >= 2 && (
          <BulkApplyBar
            campaigns={campaignList}
            onApplyCampaign={(id) => applyToAll("campaignId", id)}
            onApplyAmount={(amt) => applyToAll("amount", amt)}
            onApplyExpiration={(d) => applyToAll("expireDate", d)}
            inputCls={inputCls}
            selectCls={selectCls}
            t={t}
          />
        )}
        </div>

        {/* Assignee cards */}
        <div className="p-4 md:p-2 space-y-4">
          {activeAssignees.map((a, idx) => (
            <div
              key={a.id}
              ref={(el) => {
                cardRefs.current[a.id] = el;
              }}
              className={`rounded-xl border transition-colors focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 ${
                isDark
                  ? "border-gray-800 bg-gray-800/30"
                  : "border-gray-200 bg-gray-50/60"
              }`}
            >
              {/* Card header — makes each assignee distinct */}
              <div
                className={`flex items-center justify-between px-4 py-2.5 border-b ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <span
                  className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                    isDark ? "text-teal-300" : "text-teal-700"
                  }`}
                >
                  <span
                    className={`grid place-items-center w-6 h-6 rounded-full text-[11px] ${
                      isDark
                        ? "bg-teal-900/50 text-teal-200"
                        : "bg-teal-100 text-teal-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {t("assignee")} {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => assignees.length > 1 && removeAssignee(a.id)}
                  disabled={assignees.length <= 1}
                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                    isDark
                      ? "hover:bg-red-900/30 text-red-400"
                      : "hover:bg-red-50 text-red-500"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card body */}
              <div className="p-4 space-y-3">
                {/* Line 1: Name / Email / Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>{t("name")} *</label>
                    <input
                      type="text"
                      value={a.name}
                      onChange={(e) =>
                        updateAssignee(a.id, "name", e.target.value)
                      }
                      onBlur={() => markTouched(a.id, "name")}
                      placeholder={t("name")}
                      className={`${inputCls} ${
                        shownError(a, "name") ? errInputCls : ""
                      }`}
                    />
                    {shownError(a, "name") && (
                      <p className={errText}>{shownError(a, "name")}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>{t("email")} *</label>
                    <input
                      type="email"
                      value={a.email}
                      onChange={(e) =>
                        updateAssignee(a.id, "email", e.target.value)
                      }
                      onBlur={() => markTouched(a.id, "email")}
                      placeholder="email@example.com"
                      className={`${inputCls} ${
                        shownError(a, "email") ? errInputCls : ""
                      }`}
                    />
                    {shownError(a, "email") && (
                      <p className={errText}>{shownError(a, "email")}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>{t("phone")}</label>
                    <div className="flex gap-1.5">
                      <select
                        value={a.countryCode}
                        onChange={(e) =>
                          updateAssignee(a.id, "countryCode", e.target.value)
                        }
                        className={`${selectCls} shrink-0`}
                        style={{ minWidth: 80 }}
                      >
                        {VOUCHER_COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={a.phone}
                        onChange={(e) =>
                          updateAssignee(a.id, "phone", e.target.value)
                        }
                        placeholder="50-000-0000"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Line 2: Campaign / Amount / Expiration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>{t("campaign")} *</label>
                    <select
                      value={a.campaignId}
                      onChange={(e) =>
                        updateAssignee(a.id, "campaignId", e.target.value)
                      }
                      onBlur={() => markTouched(a.id, "campaignId")}
                      className={`${selectCls} w-full ${
                        shownError(a, "campaignId") ? errInputCls : ""
                      }`}
                    >
                      <option value="">{t("select_campaign")}</option>
                      {campaignList.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {shownError(a, "campaignId") && (
                      <p className={errText}>{shownError(a, "campaignId")}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>{t("amount")} (₪) *</label>
                    <div className="relative">
                      <span
                        className={`absolute top-2.5 ${
                          isRTL ? "right-3" : "left-3"
                        } text-sm ${textTertiary}`}
                      >
                        ₪
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={a.amount}
                        onChange={(e) =>
                          updateAssignee(a.id, "amount", e.target.value)
                        }
                        onBlur={() => markTouched(a.id, "amount")}
                        placeholder="0"
                        className={`${inputCls} ${isRTL ? "pr-7" : "pl-7"} ${
                          shownError(a, "amount") ? errInputCls : ""
                        }`}
                      />
                    </div>
                    {shownError(a, "amount") && (
                      <p className={errText}>{shownError(a, "amount")}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t("expiration_date")} *
                    </label>
                    <input
                      type="date"
                      value={a.expireDate}
                      min={TODAY}
                      onChange={(e) =>
                        updateAssignee(a.id, "expireDate", e.target.value)
                      }
                      onBlur={() => markTouched(a.id, "expireDate")}
                      className={`${inputCls} ${
                        shownError(a, "expireDate") ? errInputCls : ""
                      }`}
                    />
                    {shownError(a, "expireDate") && (
                      <p className={errText}>{shownError(a, "expireDate")}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoucherConfigure;

// ─── Bulk Apply Bar ──────────────────────────────────────────────────────────

interface BulkApplyBarProps {
  campaigns: Campaign[];
  onApplyCampaign: (id: string) => void;
  onApplyAmount: (amt: string) => void;
  onApplyExpiration: (date: string) => void;
  inputCls: string;
  selectCls: string;
  t: (key: string) => string;
}

function BulkApplyBar({
  campaigns,
  onApplyCampaign,
  onApplyAmount,
  onApplyExpiration,
  inputCls,
  selectCls,
  t,
}: BulkApplyBarProps) {
  const { isDark, textTertiary } = useThemeClasses();
  const [bulkCampaign, setBulkCampaign] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkExpiration, setBulkExpiration] = useState("");
  const [campaignApplied, setCampaignApplied] = useState(false);
  const [amountApplied, setAmountApplied] = useState(false);
  const [expirationApplied, setExpirationApplied] = useState(false);

  const applyBulkCampaign = () => {
    if (!bulkCampaign) return;
    onApplyCampaign(bulkCampaign);
    setCampaignApplied(true);
    setTimeout(() => setCampaignApplied(false), 1500);
  };

  const applyBulkAmount = () => {
    if (!bulkAmount) return;
    onApplyAmount(bulkAmount);
    setAmountApplied(true);
    setTimeout(() => setAmountApplied(false), 1500);
  };

  const applyBulkExpiration = () => {
    if (!bulkExpiration) return;
    onApplyExpiration(bulkExpiration);
    setExpirationApplied(true);
    setTimeout(() => setExpirationApplied(false), 1500);
  };

  return (
    <div
      className={`px-6 py-1 flex flex-wrap items-center gap-4 border-b ${
        isDark
          ? "bg-teal-950/30 border-teal-900/40"
          : "bg-teal-50/70 border-teal-100"
      }`}
    >
      <span
        className={`text-xs font-medium shrink-0 ${
          isDark ? "text-teal-400" : "text-teal-700"
        }`}
      >
        {t("apply_to_all")}
      </span>

      {/* Same Campaign */}
      <div className="flex items-center gap-2">
        <select
          value={bulkCampaign}
          onChange={(e) => {
            setBulkCampaign(e.target.value);
            setCampaignApplied(false);
          }}
          className={`${selectCls} text-xs`}
          style={{ minWidth: 170 }}
        >
          <option value="">{t("same_campaign")}</option>
          {campaigns.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={applyBulkCampaign}
          disabled={!bulkCampaign}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-40 ${
            campaignApplied
              ? "bg-green-500 text-white"
              : isDark
                ? "bg-teal-800 hover:bg-teal-700 text-teal-200"
                : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {campaignApplied ? <CheckCircle className="w-3.5 h-3.5" /> : null}
          {campaignApplied ? t("applied") : t("apply")}
        </button>
      </div>

      <div className={`h-4 w-px ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

      {/* Same Amount */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className={`absolute left-2.5 top-1.5 text-xs ${textTertiary}`}>
            ₪
          </span>
          <input
            type="number"
            min={1}
            value={bulkAmount}
            onChange={(e) => {
              setBulkAmount(e.target.value);
              setAmountApplied(false);
            }}
            placeholder={t("same_amount")}
            className={`${inputCls} pl-6 text-xs py-1.5`}
            style={{ width: 140 }}
          />
        </div>
        <button
          type="button"
          onClick={applyBulkAmount}
          disabled={!bulkAmount}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-40 ${
            amountApplied
              ? "bg-green-500 text-white"
              : isDark
                ? "bg-teal-800 hover:bg-teal-700 text-teal-200"
                : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {amountApplied ? <CheckCircle className="w-3.5 h-3.5" /> : null}
          {amountApplied ? t("applied") : t("apply")}
        </button>
      </div>

      <div className={`h-4 w-px ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />

      {/* Same Expiration */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={bulkExpiration}
          min={TODAY}
          onChange={(e) => {
            setBulkExpiration(e.target.value);
            setExpirationApplied(false);
          }}
          className={`${inputCls} text-xs py-1.5`}
          style={{ width: 150 }}
          aria-label={t("same_expiration")}
        />
        <button
          type="button"
          onClick={applyBulkExpiration}
          disabled={!bulkExpiration}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-40 ${
            expirationApplied
              ? "bg-green-500 text-white"
              : isDark
                ? "bg-teal-800 hover:bg-teal-700 text-teal-200"
                : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {expirationApplied ? <CheckCircle className="w-3.5 h-3.5" /> : null}
          {expirationApplied ? t("applied") : t("apply")}
        </button>
      </div>
    </div>
  );
}
