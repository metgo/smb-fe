import * as XLSX from "xlsx";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";

export interface IMinisiteVoucherAssignee {
  id: string;
  assigneeName: string;
  assigneeEmail: string;
  assigneeCountryCode: string;
  assigneePhone: string;
}

export function makeMinisiteVoucherAssignee(): IMinisiteVoucherAssignee {
  return {
    id: crypto.randomUUID(),
    assigneeName: "",
    assigneeEmail: "",
    assigneeCountryCode: "+972",
    assigneePhone: "",
  };
}

// ─── XLSX import helpers ─────────────────────────────────────────────────────
type XlsxField = "name" | "email" | "countryCode" | "phone";

const XLSX_COLUMN_ALIASES: Record<XlsxField, string[]> = {
  name: ["name", "assigneename", "assignee name"],
  email: ["email", "assigneeemail", "assignee email"],
  countryCode: ["countrycode", "country code", "assigneecountrycode"],
  phone: ["phone", "mobile", "assigneephone", "assignee phone"],
};

const XLSX_REQUIRED_FIELDS: XlsxField[] = ["name"];

interface MinisitePurchaserInfo {
  contactName: string;
  email: string;
  phoneNumber: string;
}

interface MinisiteVoucherCreationProps {
  purchaser: MinisitePurchaserInfo;
  assignees: IMinisiteVoucherAssignee[];
  setAssignees: React.Dispatch<
    React.SetStateAction<IMinisiteVoucherAssignee[]>
  >;
  errors?: Record<string, string>;
  revealAllErrors?: boolean;
  downloadSampleXLS: () => void;
}

export const MinisiteVoucherCreation: React.FC<
  MinisiteVoucherCreationProps
> = ({
  purchaser,
  assignees,
  setAssignees,
  revealAllErrors = false,
  downloadSampleXLS,
}) => {
  const { t } = useTranslation("minisites");
  const { isDark, textTertiary, textPrimary, bgSecondary } = useThemeClasses();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const shouldScrollToLast = useRef(false);

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
  const labelCls = `block text-xs mb-1 ${
    isDark ? "text-gray-400" : "text-gray-500"
  }`;

  const isAssigneeEmpty = (a: IMinisiteVoucherAssignee) =>
    !a.assigneeName.trim() &&
    !a.assigneeEmail.trim() &&
    !a.assigneePhone.trim();

  const hasEmptyAssignee = assignees.some(isAssigneeEmpty);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^\d{9,10}$/;
  type RequiredField = "assigneeName" | "assigneeEmail" | "assigneePhone";

  const hasContact = (a: IMinisiteVoucherAssignee) =>
    a.assigneeEmail.trim().length > 0 || a.assigneePhone.trim().length > 0;

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (id: string, field: RequiredField) =>
    setTouched((prev) => ({ ...prev, [`${id}:${field}`]: true }));

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleCollapsed = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const fieldError = (
    a: IMinisiteVoucherAssignee,
    field: RequiredField,
  ): string => {
    switch (field) {
      case "assigneeName":
        return a.assigneeName.trim()
          ? ""
          : t("error_name_required") || "Name is required";
      case "assigneeEmail": {
        if (!hasContact(a))
          return t("error_contact_required") || "Provide email or phone";
        if (!a.assigneeEmail.trim()) return "";
        return EMAIL_RE.test(a.assigneeEmail.trim())
          ? ""
          : t("error_email_invalid") || "Invalid email";
      }
      case "assigneePhone": {
        if (!hasContact(a))
          return t("error_contact_required") || "Provide email or phone";
        if (!a.assigneePhone.trim()) return "";
        return PHONE_RE.test(a.assigneePhone.replace(/\D/g, ""))
          ? ""
          : t("error_phone_invalid") || "Invalid phone";
      }
      default:
        return "";
    }
  };

  const shownError = (
    a: IMinisiteVoucherAssignee,
    field: RequiredField,
  ): string => {
    const isTouched =
      field === "assigneeEmail" || field === "assigneePhone"
        ? touched[`${a.id}:assigneeEmail`] || touched[`${a.id}:assigneePhone`]
        : touched[`${a.id}:${field}`];
    return revealAllErrors || isTouched ? fieldError(a, field) : "";
  };

  const errInputCls = isDark
    ? "border-red-500/70 focus:ring-red-500"
    : "border-red-500 focus:ring-red-500";
  const errText = "mt-1 text-xs text-red-500";

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
    field: keyof IMinisiteVoucherAssignee,
    value: string,
  ) =>
    setAssignees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );

  const addAssignee = () => {
    if (hasEmptyAssignee) {
      toast.error(
        t("fill_current_assignee_first") ||
          "Please fill the current assignee first",
      );
      return;
    }
    shouldScrollToLast.current = true;
    setAssignees((prev) => [...prev, makeMinisiteVoucherAssignee()]);
  };

  const removeAssignee = (id: string) =>
    setAssignees((prev) => prev.filter((a) => a.id !== id));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
          defval: "",
        });

        if (rows.length < 2) {
          setUploadError(
            "File must have a header row and at least one data row.",
          );
          return;
        }

        const header = rows[0].map((h) => String(h).trim().toLowerCase());
        const colIndex: Partial<Record<XlsxField, number>> = {};
        (Object.keys(XLSX_COLUMN_ALIASES) as XlsxField[]).forEach((field) => {
          const idx = header.findIndex((h) =>
            XLSX_COLUMN_ALIASES[field].includes(h),
          );
          if (idx !== -1) colIndex[field] = idx;
        });

        const missing = XLSX_REQUIRED_FIELDS.filter(
          (f) => colIndex[f] === undefined,
        );
        if (missing.length) {
          setUploadError(
            `Missing required column(s): ${missing.join(", ")}. ` +
              `Use "Download sample" for the expected format.`,
          );
          return;
        }

        const cell = (cells: string[], field: XlsxField) => {
          const idx = colIndex[field];
          return idx === undefined ? "" : String(cells[idx] ?? "").trim();
        };

        const parsed: IMinisiteVoucherAssignee[] = rows
          .slice(1)
          .filter((cells) => cells.some((c) => String(c).trim()))
          .map((cells) => {
            const rawCc = cell(cells, "countryCode") || "+972";
            return {
              id: crypto.randomUUID(),
              assigneeName: cell(cells, "name"),
              assigneeEmail: cell(cells, "email"),
              assigneeCountryCode: rawCc.startsWith("+") ? rawCc : `+${rawCc}`,
              assigneePhone: cell(cells, "phone"),
            };
          });

        setAssignees((prev) => {
          const manual = prev.filter((a) => !isAssigneeEmpty(a));
          return [...manual, ...parsed];
        });
      } catch {
        setUploadError(
          "Could not parse the file. Please use the sample format.",
        );
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Voucher Sender Info – read-only from previous step */}
      <div className={`${bgSecondary} rounded-lg p-4`}>
        <h4 className={`${textPrimary} mb-3`}>
          {t("voucher_sender_info") || "Voucher Sender Info"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>{t("name") || "Name"}</label>
            <p className={textPrimary}>{purchaser.contactName || "-"}</p>
          </div>
          <div>
            <label className={labelCls}>{t("email") || "Email"}</label>
            <p className={textPrimary}>{purchaser.email || "-"}</p>
          </div>
          <div>
            <label className={labelCls}>{t("phone") || "Phone"}</label>
            <p className={textPrimary}>{purchaser.phoneNumber || "-"}</p>
          </div>
        </div>
      </div>

      <div className={`border ${card}`}>
        <div
          className={`sticky -top-4 z-20 ${
            isDark ? "bg-gray-900" : "bg-white"
          }`}
        >
          <div
            className={`px-6 py-1 pb-2 border-b ${
              isDark ? "border-gray-800" : "border-gray-100"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                className={`text-sm uppercase tracking-wider ${textTertiary}`}
              >
                {`${t("assignees") || "Assignees"} (${assignees.length})`}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadSampleXLS}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isDark
                      ? "bg-teal-900/40 hover:bg-teal-900/60 text-teal-300 border border-teal-700"
                      : "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  {t("download_sample") || "Download sample"}
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
                  {t("upload_sample") || "Upload"}
                </button>
                <button
                  type="button"
                  onClick={addAssignee}
                  disabled={hasEmptyAssignee}
                  title={
                    hasEmptyAssignee
                      ? t("fill_current_assignee_first") ||
                        "Fill the current assignee first"
                      : ""
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-linear-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-teal-500 disabled:hover:to-blue-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("add_assignee") || "Add assignee"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
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
        </div>

        {/* Assignee cards */}
        <div className="p-4 md:p-2 space-y-4">
          {assignees.map((a, idx) => {
            const hasError =
              revealAllErrors &&
              (
                [
                  "assigneeName",
                  "assigneeEmail",
                  "assigneePhone",
                ] as RequiredField[]
              ).some((f) => fieldError(a, f));
            const isCollapsed = Boolean(collapsed[a.id]) && !hasError;
            const summary = [
              a.assigneeName.trim(),
              a.assigneeEmail.trim(),
              a.assigneePhone.trim()
                ? `${a.assigneeCountryCode} ${a.assigneePhone.trim()}`
                : "",
            ]
              .filter(Boolean)
              .join("  ·  ");
            return (
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
                {/* Card header — click to collapse / expand */}
                <div
                  className={`flex items-center justify-between px-4 py-2.5 ${
                    isCollapsed ? "" : "border-b"
                  } ${isDark ? "border-gray-800" : "border-gray-200"}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(a.id)}
                    aria-expanded={!isCollapsed}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 flex-1 text-left"
                  >
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isCollapsed ? "-rotate-90" : ""
                      } ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <span
                      className={`grid place-items-center w-6 h-6 rounded-full text-[11px] shrink-0 ${
                        isDark
                          ? "bg-teal-900/50 text-teal-200"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider shrink-0 ${
                        isDark ? "text-teal-300" : "text-teal-700"
                      }`}
                    >
                      {t("assignee") || "Assignee"} {idx + 1}
                    </span>
                    {isCollapsed && summary && (
                      <span
                        title={summary}
                        className={`min-w-0 wrap-break-word text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        — {summary}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => assignees.length > 1 && removeAssignee(a.id)}
                    disabled={assignees.length <= 1}
                    className={`ml-2 p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                      isDark
                        ? "hover:bg-red-900/30 text-red-400"
                        : "hover:bg-red-50 text-red-500"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card body — Name / Email / Phone */}
                {!isCollapsed && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-[2.5fr_2.5fr_3.5fr] gap-3">
                      <div>
                        <label className={labelCls}>
                          {t("name") || "Name"} *
                        </label>
                        <input
                          type="text"
                          value={a.assigneeName}
                          onChange={(e) =>
                            updateAssignee(a.id, "assigneeName", e.target.value)
                          }
                          onBlur={() => markTouched(a.id, "assigneeName")}
                          placeholder={t("name") || "Name"}
                          className={`${inputCls} ${
                            shownError(a, "assigneeName") ? errInputCls : ""
                          }`}
                        />
                        {shownError(a, "assigneeName") && (
                          <p className={errText}>
                            {shownError(a, "assigneeName")}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelCls}>
                          {t("email") || "Email"} *
                        </label>
                        <input
                          type="email"
                          value={a.assigneeEmail}
                          onChange={(e) =>
                            updateAssignee(
                              a.id,
                              "assigneeEmail",
                              e.target.value,
                            )
                          }
                          onBlur={() => markTouched(a.id, "assigneeEmail")}
                          placeholder="email@example.com"
                          className={`${inputCls} ${
                            shownError(a, "assigneeEmail") ? errInputCls : ""
                          }`}
                        />
                        {shownError(a, "assigneeEmail") && (
                          <p className={errText}>
                            {shownError(a, "assigneeEmail")}
                          </p>
                        )}
                      </div>
                      <div className="min-w-0">
                        <label className={labelCls}>
                          {t("phone") || "Phone"} *
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={a.assigneePhone}
                          onChange={(e) =>
                            updateAssignee(
                              a.id,
                              "assigneePhone",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          onBlur={() => markTouched(a.id, "assigneePhone")}
                          placeholder="0500000000"
                          className={`${inputCls} ${
                            shownError(a, "assigneePhone") ? errInputCls : ""
                          }`}
                        />
                        {shownError(a, "assigneePhone") && (
                          <p className={errText}>
                            {shownError(a, "assigneePhone")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
