import { useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
  };
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

  const { purchaseType, multiMode, assignees } = formData;

  const activeAssignees =
    purchaseType === "single" ? assignees.slice(0, 1) : assignees;

  const setPurchaseType = (type: VoucherPurchaseType) =>
    setFormData((prev) => ({ ...prev, purchaseType: type }));

  const setMultiMode = (mode: VoucherMultiMode) =>
    setFormData((prev) => ({ ...prev, multiMode: mode }));

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

  const addAssignee = () =>
    setFormData((prev) => ({
      ...prev,
      assignees: [...prev.assignees, makeVoucherAssignee()],
    }));

  const removeAssignee = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.filter((a) => a.id !== id),
    }));

  const applyToAll = (field: "campaignId" | "amount", value: string) =>
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.map((a) => ({ ...a, [field]: value })),
    }));

  // Sample CSV download
  const downloadSample = () => {
    const csv =
      "Name,Email,CountryCode,Phone,Campaign,Amount\nJohn Doe,john@example.com,+972,501234567,Summer Sale 2024,200\nJane Smith,jane@example.com,+1,2125550100,VIP Members,500";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voucher-assignees-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV parse (client-side, plain CSV only)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length < 2) {
          setUploadError(
            "File must have a header row and at least one data row.",
          );
          return;
        }
        const parsed: IVoucherAssignee[] = lines.slice(1).map((line) => {
          const [
            name = "",
            email = "",
            countryCode = "+972",
            phone = "",
            campaignLabel = "",
            amount = "",
          ] = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          const campaign = campaignList.find(
            (c) => c.name.toLowerCase() === campaignLabel.toLowerCase(),
          );
          return {
            id: crypto.randomUUID(),
            name,
            email,
            countryCode,
            phone,
            campaignId: campaign?._id || "",
            amount,
          };
        });
        setFormData((prev) => ({
          ...prev,
          assignees: parsed,
          purchaseType: "multiple",
          multiMode: "upload",
        }));
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
    <div className="space-y-6">
      {/* Purchase Type */}
      <div className={`rounded-xl border p-6 space-y-4 ${card}`}>
        <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
          {t("purchase_type")}
        </h2>
        <div className="flex gap-3">
          {(["single", "multiple"] as VoucherPurchaseType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPurchaseType(type)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm transition-all ${
                purchaseType === type
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                  : `border-transparent ${
                      isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`
              }`}
            >
              {type === "single"
                ? `🎫  ${t("single_voucher")}`
                : `🎟  ${t("multiple_vouchers")}`}
            </button>
          ))}
        </div>

        {/* Multiple sub-options */}
        {purchaseType === "multiple" && (
          <div className="space-y-4 pt-2">
            <div
              className={`flex gap-2 p-1 rounded-lg w-fit ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              {(["manual", "upload"] as VoucherMultiMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMultiMode(mode)}
                  className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                    multiMode === mode
                      ? `${
                          isDark
                            ? "bg-gray-700 text-gray-100"
                            : "bg-white text-gray-900"
                        } shadow-sm`
                      : textTertiary
                  }`}
                >
                  {mode === "manual"
                    ? t("enter_manually")
                    : t("upload_excel_csv")}
                </button>
              ))}
            </div>

            {multiMode === "upload" && (
              <div
                className={`flex flex-wrap items-center gap-4 p-4 rounded-xl border-2 border-dashed ${
                  isDark ? "border-gray-700" : "border-gray-300"
                }`}
              >
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {t("choose_file")}
                  </button>
                  <button
                    type="button"
                    onClick={downloadSample}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                      isDark
                        ? "bg-teal-900/40 hover:bg-teal-900/60 text-teal-300 border border-teal-700"
                        : "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    {t("download_sample")}
                  </button>
                </div>
                <p className={`text-xs ${textTertiary}`}>
                  {t("supports_csv_sample_hint")}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
            {uploadError && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uploadError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assignees Table */}
      <div className={`rounded-xl border overflow-hidden ${card}`}>
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
            {purchaseType === "single"
              ? t("assignee_details")
              : `${t("assignees")} (${activeAssignees.length})`}
          </h2>
          {purchaseType === "multiple" && multiMode === "manual" && (
            <button
              type="button"
              onClick={addAssignee}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("add_assignee")}
            </button>
          )}
        </div>

        {/* Apply to all — only shown in multiple mode with 2+ rows */}
        {purchaseType === "multiple" && activeAssignees.length >= 2 && (
          <BulkApplyBar
            campaigns={campaignList}
            onApplyCampaign={(id) => applyToAll("campaignId", id)}
            onApplyAmount={(amt) => applyToAll("amount", amt)}
            inputCls={inputCls}
            selectCls={selectCls}
            t={t}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={`text-xs uppercase tracking-wide ${
                  isDark
                    ? "bg-gray-800/50 text-gray-400"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                {purchaseType === "multiple" && (
                  <th className="px-4 py-3 text-left w-10">#</th>
                )}
                <th className="px-4 py-3 text-left min-w-[160px]">
                  {t("name")} *
                </th>
                <th className="px-4 py-3 text-left min-w-[180px]">
                  {t("email")} *
                </th>
                <th className="px-4 py-3 text-left min-w-[200px]">
                  {t("phone")}
                </th>
                <th className="px-4 py-3 text-left min-w-[180px]">
                  {t("campaign")} *
                </th>
                <th className="px-4 py-3 text-left min-w-[120px]">
                  {t("amount")} (₪) *
                </th>
                {purchaseType === "multiple" && (
                  <th className="px-4 py-3 w-12"></th>
                )}
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-gray-800" : "divide-gray-100"
              }`}
            >
              {activeAssignees.map((a, idx) => (
                <tr
                  key={a.id}
                  className={`transition-colors ${
                    isDark ? "hover:bg-gray-800/40" : "hover:bg-gray-50"
                  }`}
                >
                  {purchaseType === "multiple" && (
                    <td className={`px-4 py-2 text-sm ${textTertiary}`}>
                      {idx + 1}
                    </td>
                  )}
                  {/* Name */}
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={a.name}
                      onChange={(e) =>
                        updateAssignee(a.id, "name", e.target.value)
                      }
                      placeholder={t("name")}
                      className={inputCls}
                    />
                  </td>
                  {/* Email */}
                  <td className="px-4 py-2">
                    <input
                      type="email"
                      value={a.email}
                      onChange={(e) =>
                        updateAssignee(a.id, "email", e.target.value)
                      }
                      placeholder="email@example.com"
                      className={inputCls}
                    />
                  </td>
                  {/* Country + Phone */}
                  <td className="px-4 py-2">
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
                  </td>
                  {/* Campaign */}
                  <td className="px-4 py-2">
                    <select
                      value={a.campaignId}
                      onChange={(e) =>
                        updateAssignee(a.id, "campaignId", e.target.value)
                      }
                      className={`${selectCls} w-full`}
                    >
                      <option value="">{t("select_campaign")}</option>
                      {campaignList.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Amount */}
                  <td className="px-4 py-2">
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
                        placeholder="0"
                        className={`${inputCls} ${isRTL ? "pr-7" : "pl-7"}`}
                      />
                    </div>
                  </td>
                  {/* Delete */}
                  {purchaseType === "multiple" && (
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          assignees.length > 1 && removeAssignee(a.id)
                        }
                        disabled={assignees.length <= 1}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                          isDark
                            ? "hover:bg-red-900/30 text-red-400"
                            : "hover:bg-red-50 text-red-500"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {errors.assignees && (
          <p className="text-red-500 text-xs px-6 py-3">{errors.assignees}</p>
        )}
      </div>

      {/* Expiration */}
      <div className={`rounded-xl border p-6 space-y-3 ${card}`}>
        <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
          {t("expiration_date")} *
        </h2>
        <input
          type="date"
          value={formData.expirationDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, expirationDate: e.target.value }))
          }
          className={`${inputCls} max-w-xs`}
        />
        <p className={`text-xs ${textTertiary}`}>
          {t("expiration_applies_to_all")}
        </p>
        {errors.expirationDate && (
          <p className="text-red-500 text-xs">{errors.expirationDate}</p>
        )}
      </div>

      {/* Greeting */}
      <div className={`rounded-xl border p-6 space-y-3 ${card}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
            {t("greeting_message")}
          </h2>
          <span
            className={`text-xs ${
              formData.greeting.length > 450 ? "text-orange-500" : textTertiary
            }`}
          >
            {formData.greeting.length} / 500
          </span>
        </div>
        <textarea
          value={formData.greeting}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              greeting: e.target.value.slice(0, 500),
            }))
          }
          placeholder={t("greeting_placeholder")}
          rows={4}
          className={`${inputCls} resize-none`}
        />
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
  inputCls: string;
  selectCls: string;
  t: (key: string) => string;
}

function BulkApplyBar({
  campaigns,
  onApplyCampaign,
  onApplyAmount,
  inputCls,
  selectCls,
  t,
}: BulkApplyBarProps) {
  const { isDark, textTertiary } = useThemeClasses();
  const [bulkCampaign, setBulkCampaign] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");
  const [campaignApplied, setCampaignApplied] = useState(false);
  const [amountApplied, setAmountApplied] = useState(false);

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

  return (
    <div
      className={`px-6 py-3 flex flex-wrap items-center gap-4 border-b ${
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
    </div>
  );
}
