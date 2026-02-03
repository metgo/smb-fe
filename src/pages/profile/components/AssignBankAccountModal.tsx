import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUpdateProfileInfoMutation } from "@/store/api/userMutationApi";
import { toast } from "sonner";
import clsx from "clsx";

interface AssignBankAccountModalProps {
  isDark: boolean;
  userId: string;
  banks: Bank[];
  refetch: () => void;
  setIsOpen: (v: boolean) => void;
  savedBankAccount: BankAccount | undefined;
}

const AssignBankAccountModal = ({
  isDark,
  userId,
  banks,
  refetch,
  setIsOpen,
  savedBankAccount,
}: AssignBankAccountModalProps) => {
  const { t } = useTranslation("profile");

  const [updateProfileInfo, { isLoading }] = useUpdateProfileInfoMutation();

  const [selectedBankNumber, setSelectedBankNumber] = useState("");
  const [selectedBranchNumber, setSelectedBranchNumber] = useState("");

  const selectedBank = useMemo(
    () => banks.find((b) => b.bankId === selectedBankNumber),
    [banks, selectedBankNumber],
  );

  const [errors, setErrors] = useState<BankAccountErrors>({});

  const validate = (): boolean => {
    const newErrors: BankAccountErrors = {};

    if (!selectedBankNumber) newErrors.bankNumber = t("required") || "Required";
    if (!selectedBranchNumber)
      newErrors.branchNumber = t("required") || "Required";
    if (!bankAccountData.accountNumber)
      newErrors.accountNumber = t("required") || "Required";
    if (!bankAccountData.bnNumber)
      newErrors.bnNumber = t("required") || "Required";
    if (!bankAccountData.invoiceName)
      newErrors.invoiceName = t("required") || "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [bankAccountData, setBankAccountData] = useState<BankAccountDetails>({
    branchNumber: "",
    bankNumber: "",
    accountNumber: "",
    bnNumber: "",
    invoiceName: "",
  });

  const handleSaveBankAccount = async () => {
    if (!validate() && !userId) return;

    const payload = {
      bankNumber: bankAccountData.bankNumber,
      branchNumber: bankAccountData.branchNumber,
      accountNumber: bankAccountData.accountNumber,
      businessNumberByGovt: bankAccountData.bnNumber,
      invoiceName: bankAccountData.invoiceName,
    };

    const res = await updateProfileInfo({ body: payload, userId }).unwrap();

    if (res?.message) {
      refetch();
      toast.success(res.message || "Bank Info updated successfully");
      setIsOpen(false);
    }
  };

  const handleBankChange = (field: keyof BankAccountDetails, value: string) => {
    setBankAccountData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "bankNumber" ? { branchName: "" } : {}),
    }));
  };

  const handleCloseBankModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (savedBankAccount) {
      setSelectedBankNumber(savedBankAccount.bankNumber);
      setSelectedBranchNumber(savedBankAccount.branchNumber);
      setBankAccountData({
        accountNumber: savedBankAccount.accountNumber,
        bnNumber: savedBankAccount.businessNumberByGovt,
        invoiceName: savedBankAccount.invoiceName,
        bankNumber: savedBankAccount?.bankNumber,
        branchNumber: savedBankAccount?.branchNumber,
      });
    }
  }, [savedBankAccount]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Modal Header */}
        <div
          className={`sticky top-0 ${isDark ? "bg-gray-800" : "bg-white"} border-b ${isDark ? "border-gray-700" : "border-gray-200"} p-6 flex items-center justify-between`}
        >
          <h3 className={`text-2xl ${isDark ? "text-white" : "text-gray-900"}`}>
            {savedBankAccount
              ? t("edit_bank_account") || "Edit Bank Account"
              : t("add_bank_account") || "Add Bank Account"}
          </h3>
          <button
            onClick={handleCloseBankModal}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}
          >
            <X
              className={`w-6 h-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Bank Name */}
          <div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <span>{t("bank_name")} *</span>
              {errors.bankNumber && (
                <span className="text-red-500 text-xs">
                  {errors.bankNumber}
                </span>
              )}
            </label>

            <select
              value={selectedBankNumber}
              onChange={(e) => {
                const bankNumber = e.target.value;
                setSelectedBankNumber(bankNumber);
                setSelectedBranchNumber("");
                setBankAccountData((prev) => ({
                  ...prev,
                  bankNumber,
                  branchName: "",
                }));
                setErrors((prev) => ({ ...prev, bankNumber: undefined }));
              }}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">{t("select_bank")}</option>
              {banks.map((bank) => (
                <option
                  key={bank.bankId}
                  value={bank.bankId}
                  className="capitalize"
                >
                  {bank.bankName}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Name */}
          <div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <span>{t("branch_name")} *</span>
              {errors.branchNumber && (
                <span className="text-red-500 text-xs">
                  {errors.branchNumber}
                </span>
              )}
            </label>

            <select
              value={selectedBranchNumber}
              onChange={(e) => {
                const branchNumber = e.target.value;
                setSelectedBranchNumber(branchNumber);
                setBankAccountData((prev) => ({
                  ...prev,
                  branchNumber,
                }));
                setErrors((prev) => ({ ...prev, branchNumber: undefined }));
              }}
              disabled={!selectedBank || selectedBank.branches.length === 0}
              className={`w-full px-4 py-3 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">{t("select_branch")}</option>
              {selectedBank?.branches.map((branch) => (
                <option
                  key={branch.branchId}
                  value={branch.branchId}
                  className=" capitalize"
                >
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <span>{t("account_number")} *</span>
              {errors.accountNumber && (
                <span className="text-red-500 text-xs">
                  {errors.accountNumber}
                </span>
              )}
            </label>

            <input
              type="text"
              value={bankAccountData.accountNumber}
              onChange={(e) => {
                handleBankChange("accountNumber", e.target.value);
                setErrors((prev) => ({ ...prev, accountNumber: undefined }));
              }}
              placeholder="123456789"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          {/* BN Number */}
          <div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <span>{t("bn_number")} *</span>
              {errors.bnNumber && (
                <span className="text-red-500 text-xs">{errors.bnNumber}</span>
              )}
            </label>
            <input
              type="text"
              value={bankAccountData.bnNumber}
              onChange={(e) => {
                handleBankChange("bnNumber", e.target.value);
                setErrors((prev) => ({ ...prev, bnNumber: undefined }));
              }}
              placeholder="123456789"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          {/* Name on Invoice */}
          <div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <span>{t("name_on_invoice")} *</span>
              {errors.invoiceName && (
                <span className="text-red-500 text-xs">
                  {errors.invoiceName}
                </span>
              )}
            </label>

            <input
              type="text"
              value={bankAccountData.invoiceName}
              onChange={(e) => {
                handleBankChange("invoiceName", e.target.value);
                setErrors((prev) => ({ ...prev, invoiceName: undefined }));
              }}
              placeholder="MetGo LTD"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`sticky bottom-0 ${isDark ? "bg-gray-800" : "bg-white"} border-t ${isDark ? "border-gray-700" : "border-gray-200"} p-6 flex items-center justify-end gap-3`}
        >
          <button
            onClick={handleCloseBankModal}
            className={`px-6 py-3 rounded-lg ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            } transition-colors cursor-pointer`}
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            onClick={handleSaveBankAccount}
            disabled={
              !selectedBankNumber ||
              !selectedBranchNumber ||
              !bankAccountData.accountNumber ||
              !bankAccountData.bnNumber ||
              !bankAccountData.invoiceName
            }
            className={clsx(
              "flex items-center gap-2 cursor-pointer px-6 py-3 rounded-lg transition-colors",
              isLoading
                ? "disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                : " bg-teal-600 hover:bg-teal-700 text-white",
            )}
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <Save className="w-5 h-5" />
            <span>{t("save") || "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBankAccountModal;
