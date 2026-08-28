import { useState, useRef, useCallback } from "react";
import {
  User,
  Mail,
  Phone,
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  Loader,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllCampaignsQuery } from "@/store/api/masterDataApi";
import { useCreateVoucherMutation } from "@/store/api/voucherMutationApi";

const COUNTRY_CODES = [
  { code: "+972", flag: "🇮🇱", label: "IL" },
  { code: "+1", flag: "🇺🇸", label: "US" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+33", flag: "🇫🇷", label: "FR" },
  { code: "+49", flag: "🇩🇪", label: "DE" },
];

interface Campaign {
  _id: string;
  name: string;
  defaultAmount?: number;
}

interface Assignee {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  campaignId: string;
  amount: string;
}

function makeAssignee(): Assignee {
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

type PurchaseType = "single" | "multiple";
type MultiMode = "manual" | "upload";

export default function OfflineVouchersMgmtPage() {
  const {
    isDark,
    isRTL,
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    language,
  } = useThemeClasses();

  const { data: campaignsResp } = useGetAllCampaignsQuery({ type: "CASH_IN" });
  const campaigns: Campaign[] = campaignsResp?.datas?.data ?? [];

  const [createVoucher] = useCreateVoucherMutation();

  // Purchaser
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [purchaserCountry, setPurchaserCountry] = useState("+972");
  const [purchaserPhone, setPurchaserPhone] = useState("");

  // Mode
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("single");
  const [multiMode, setMultiMode] = useState<MultiMode>("manual");

  // Assignees
  const [assignees, setAssignees] = useState<Assignee[]>([makeAssignee()]);

  // Greeting
  const [greeting, setGreeting] = useState("");

  // Expiration (applies to every voucher in this purchase)
  const [expireDate, setExpireDate] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");

  // Theme tokens
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

  // Derived
  const activeAssignees =
    purchaseType === "single" ? assignees.slice(0, 1) : assignees;
  const isValid =
    purchaserName.trim() !== "" &&
    expireDate !== "" &&
    activeAssignees.length > 0 &&
    activeAssignees.every(
      (a) => a.name.trim() && a.email.trim() && a.campaignId && a.amount,
    );

  const campaignName = (id: string) =>
    campaigns.find((c) => c._id === id)?.name ?? "—";

  // Assignee helpers
  const updateAssignee = useCallback(
    (id: string, field: keyof Assignee, value: string) => {
      setAssignees((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
      );
    },
    [],
  );

  const addAssignee = () => setAssignees((prev) => [...prev, makeAssignee()]);
  const removeAssignee = (id: string) =>
    setAssignees((prev) => prev.filter((a) => a.id !== id));

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
        const parsed: Assignee[] = lines.slice(1).map((line) => {
          const [
            name = "",
            email = "",
            countryCode = "+972",
            phone = "",
            campaignLabel = "",
            amount = "",
          ] = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          const campaign = campaigns.find(
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
        setAssignees(parsed);
        setPurchaseType("multiple");
        setMultiMode("upload");
      } catch {
        setUploadError("Could not parse the file. Please use the sample format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Confirm create
  const handleCreate = async () => {
    setCreating(true);
    try {
      const dialCode = (cc: string) => cc.replace(/^\+/, "");
      const payload = activeAssignees.map((a) => ({
        campaignId: a.campaignId,
        amount: Number(a.amount),
        noOfVoucher: 1,
        expireDate: new Date(expireDate).toISOString(),

        purchaserName,
        purchaserEmail,
        purchaserCountryCode: dialCode(purchaserCountry),
        purchaserPhone,

        assigneeName: a.name,
        assigneeEmail: a.email,
        assigneeCountryCode: dialCode(a.countryCode),
        assigneePhone: a.phone,

        languagePreference: language || "en",
        message: greeting || "",
        smsMessage: greeting || "",
        sendEmail: true,
      }));

      await createVoucher(payload).unwrap();
      setCreated(true);
      toast.success("Vouchers created successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create vouchers");
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (created) {
      // Reset form after successful creation
      setPurchaserName("");
      setPurchaserEmail("");
      setPurchaserPhone("");
      setAssignees([makeAssignee()]);
      setGreeting("");
      setExpireDate("");
      setPurchaseType("single");
      setCreated(false);
    }
  };

  return (
    <div
      className={`${bgPrimary} `}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className=" mx-auto space-y-6 pb-10">
        {/* Page title */}
        <div>
          <h1 className={`text-2xl ${textPrimary}`}>Offline Voucher Purchases</h1>
          <p className={`text-sm mt-1 ${textTertiary}`}>
            Purchase and assign vouchers manually on behalf of a customer
          </p>
        </div>

        {/* Purchaser Information */}
        <div className={`rounded-xl border p-6 space-y-4 ${card}`}>
          <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
            Purchaser Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1.5 ${textSecondary}`}>
                Full Name *
              </label>
              <div className="relative">
                <User
                  className={`absolute top-2.5 ${
                    isRTL ? "right-3" : "left-3"
                  } w-4 h-4 ${textTertiary}`}
                />
                <input
                  type="text"
                  value={purchaserName}
                  onChange={(e) => setPurchaserName(e.target.value)}
                  placeholder="Enter purchaser name"
                  className={`${inputCls} ${isRTL ? "pr-9" : "pl-9"}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1.5 ${textSecondary}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className={`absolute top-2.5 ${
                    isRTL ? "right-3" : "left-3"
                  } w-4 h-4 ${textTertiary}`}
                />
                <input
                  type="email"
                  value={purchaserEmail}
                  onChange={(e) => setPurchaserEmail(e.target.value)}
                  placeholder="purchaser@example.com"
                  className={`${inputCls} ${isRTL ? "pr-9" : "pl-9"}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1.5 ${textSecondary}`}>
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={purchaserCountry}
                  onChange={(e) => setPurchaserCountry(e.target.value)}
                  className={`${selectCls} shrink-0`}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone
                    className={`absolute top-2.5 ${
                      isRTL ? "right-3" : "left-3"
                    } w-4 h-4 ${textTertiary}`}
                  />
                  <input
                    type="tel"
                    value={purchaserPhone}
                    onChange={(e) => setPurchaserPhone(e.target.value)}
                    placeholder="50-000-0000"
                    className={`${inputCls} ${isRTL ? "pr-9" : "pl-9"}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Type */}
        <div className={`rounded-xl border p-6 space-y-4 ${card}`}>
          <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
            Purchase Type
          </h2>
          <div className="flex gap-3">
            {(["single", "multiple"] as PurchaseType[]).map((type) => (
              <button
                key={type}
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
                  ? "🎫  Single Voucher"
                  : "🎟  Multiple Vouchers"}
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
                {(["manual", "upload"] as MultiMode[]).map((mode) => (
                  <button
                    key={mode}
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
                      ? "Enter Manually"
                      : "Upload Excel / CSV"}
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
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                        isDark
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </button>
                    <button
                      onClick={downloadSample}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                        isDark
                          ? "bg-teal-900/40 hover:bg-teal-900/60 text-teal-300 border border-teal-700"
                          : "bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      Download Sample
                    </button>
                  </div>
                  <p className={`text-xs ${textTertiary}`}>
                    Supports .csv — use the sample for correct column order
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
                ? "Assignee Details"
                : `Assignees (${activeAssignees.length})`}
            </h2>
            {purchaseType === "multiple" && multiMode === "manual" && (
              <button
                onClick={addAssignee}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Assignee
              </button>
            )}
          </div>

          {/* Apply to all — only shown in multiple mode with 2+ rows */}
          {purchaseType === "multiple" && activeAssignees.length >= 2 && (
            <BulkApplyBar
              campaigns={campaigns}
              onApplyCampaign={(id) =>
                setAssignees((prev) =>
                  prev.map((a) => ({ ...a, campaignId: id })),
                )
              }
              onApplyAmount={(amt) =>
                setAssignees((prev) => prev.map((a) => ({ ...a, amount: amt })))
              }
              inputCls={inputCls}
              selectCls={selectCls}
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
                  <th className="px-4 py-3 text-left min-w-[160px]">Name *</th>
                  <th className="px-4 py-3 text-left min-w-[180px]">Email *</th>
                  <th className="px-4 py-3 text-left min-w-[200px]">Phone</th>
                  <th className="px-4 py-3 text-left min-w-[180px]">
                    Campaign *
                  </th>
                  <th className="px-4 py-3 text-left min-w-[120px]">
                    Amount (₪) *
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
                        placeholder="Full name"
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
                          {COUNTRY_CODES.map((c) => (
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
                        <option value="">Select campaign...</option>
                        {campaigns.map((c) => (
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
        </div>

        {/* Expiration */}
        <div className={`rounded-xl border p-6 space-y-3 ${card}`}>
          <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
            Expiration Date *
          </h2>
          <input
            type="date"
            value={expireDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setExpireDate(e.target.value)}
            className={`${inputCls} max-w-xs`}
          />
          <p className={`text-xs ${textTertiary}`}>
            Applies to every voucher in this purchase.
          </p>
        </div>

        {/* Greeting */}
        <div className={`rounded-xl border p-6 space-y-3 ${card}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-sm uppercase tracking-wider ${textTertiary}`}>
              Greeting Message
            </h2>
            <span
              className={`text-xs ${
                greeting.length > 450 ? "text-orange-500" : textTertiary
              }`}
            >
              {greeting.length} / 500
            </span>
          </div>
          <textarea
            value={greeting}
            onChange={(e) => setGreeting(e.target.value.slice(0, 500))}
            placeholder="Add a personal greeting message that will be sent with the voucher..."
            rows={4}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Create button */}
        <div className="flex justify-end gap-3 pb-6">
          <button
            onClick={() => {
              setCreated(false);
              setShowModal(true);
            }}
            disabled={!isValid}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-sm transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <FileText className="w-4 h-4" />
            Create Vouchers
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            className={`w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl ${
              isDark ? "bg-gray-900" : "bg-white"
            }`}
          >
            {/* Modal header */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isDark ? "border-gray-800" : "border-gray-100"
              }`}
            >
              <div>
                <h3 className={`text-lg ${textPrimary}`}>
                  Confirm Voucher Creation
                </h3>
                <p className={`text-sm mt-0.5 ${textTertiary}`}>
                  Review the {activeAssignees.length} voucher
                  {activeAssignees.length !== 1 ? "s" : ""} below before
                  confirming
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal table */}
            <div className="flex-1 overflow-auto">
              {created ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-teal-500" />
                  </div>
                  <p className={`text-lg ${textPrimary}`}>
                    Vouchers Created Successfully!
                  </p>
                  <p className={`text-sm ${textTertiary}`}>
                    {activeAssignees.length} voucher
                    {activeAssignees.length !== 1 ? "s" : ""} have been issued
                    and will be sent to assignees.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead
                    className={`sticky top-0 text-xs uppercase tracking-wide ${
                      isDark
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    <tr>
                      <th className="px-4 py-3 text-left">Assignee Name</th>
                      <th className="px-4 py-3 text-left">Campaign</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Country</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-center">Vouchers</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y text-sm ${
                      isDark ? "divide-gray-800" : "divide-gray-100"
                    }`}
                  >
                    {activeAssignees.map((a) => (
                      <tr
                        key={a.id}
                        className={`transition-colors ${
                          isDark ? "hover:bg-gray-800/40" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className={`px-4 py-3 ${textPrimary}`}>
                          {a.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isDark
                                ? "bg-blue-900/30 text-blue-300"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {campaignName(a.campaignId)}
                          </span>
                        </td>
                        <td className={`px-4 py-3 ${textPrimary}`}>
                          {a.amount
                            ? `₪${Number(a.amount).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className={`px-4 py-3 ${textSecondary}`}>
                          {a.email || "—"}
                        </td>
                        <td className={`px-4 py-3 ${textSecondary}`}>
                          {a.countryCode}
                        </td>
                        <td className={`px-4 py-3 ${textSecondary}`}>
                          {a.phone || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              isDark
                                ? "bg-teal-900/40 text-teal-300"
                                : "bg-teal-100 text-teal-700"
                            }`}
                          >
                            1
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal footer */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-t gap-3 ${
                isDark ? "border-gray-800" : "border-gray-100"
              }`}
            >
              {!created && (
                <>
                  <div className={`text-sm ${textTertiary}`}>
                    Purchaser:{" "}
                    <span className={textSecondary}>{purchaserName}</span>
                    {greeting && (
                      <span className="ml-3">· Greeting included</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseModal}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        isDark
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={creating}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white transition-all disabled:opacity-60"
                    >
                      {creating ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {creating ? "Creating..." : "Confirm & Create"}
                    </button>
                  </div>
                </>
              )}
              {created && (
                <div className="flex w-full justify-center">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-500 text-white"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bulk Apply Bar ───────────────────────────────────────────────────────────

interface BulkApplyBarProps {
  campaigns: Campaign[];
  onApplyCampaign: (id: string) => void;
  onApplyAmount: (amt: string) => void;
  inputCls: string;
  selectCls: string;
}

function BulkApplyBar({
  campaigns,
  onApplyCampaign,
  onApplyAmount,
  inputCls,
  selectCls,
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
        Apply to all:
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
          <option value="">Same campaign...</option>
          {campaigns.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
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
          {campaignApplied ? "Applied" : "Apply"}
        </button>
      </div>

      <div
        className={`h-4 w-px ${isDark ? "bg-gray-700" : "bg-gray-300"}`}
      />

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
            placeholder="Same amount..."
            className={`${inputCls} pl-6 text-xs py-1.5`}
            style={{ width: 140 }}
          />
        </div>
        <button
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
          {amountApplied ? "Applied" : "Apply"}
        </button>
      </div>
    </div>
  );
}
