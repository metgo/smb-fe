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

  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const errorClass = "text-red-500 text-xs font-normal ml-1";

  const inputClass = (hasError?: boolean) =>
    clsx(
      "w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
      isDark
        ? "bg-gray-700/60 border-gray-600 text-gray-100 placeholder-gray-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
      hasError && "border-red-500 focus:ring-red-400",
    );

  const selectClass = (hasError?: boolean) =>
    clsx(
      "w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed",
      isDark
        ? "bg-gray-700/60 border-gray-600 text-gray-100"
        : "bg-white border-gray-300 text-gray-900",
      hasError && "border-red-500 focus:ring-red-400",
    );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={clsx(
          "rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        {/* Modal Header */}
        <div
          className={clsx(
            "sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100",
          )}
        >
          <div>
            <h3
              className={clsx(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {savedBankAccount
                ? t("edit_bank_account") || "Edit Bank Account"
                : t("add_bank_account") || "Add Bank Account"}
            </h3>
            <p
              className={clsx(
                "text-xs mt-0.5",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {t("bank_account_subtitle") || "Fill in the details below"}
            </p>
          </div>
          <button
            onClick={handleCloseBankModal}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              isDark
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Bank Name */}
          <div>
            <label className={labelClass}>
              {t("bank_name")} *
              {errors.bankNumber && (
                <span className={errorClass}>{errors.bankNumber}</span>
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
              className={selectClass(!!errors.bankNumber)}
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
            <label className={labelClass}>
              {t("branch_name")} *
              {errors.branchNumber && (
                <span className={errorClass}>{errors.branchNumber}</span>
              )}
            </label>
            <select
              value={selectedBranchNumber}
              onChange={(e) => {
                const branchNumber = e.target.value;
                setSelectedBranchNumber(branchNumber);
                setBankAccountData((prev) => ({ ...prev, branchNumber }));
                setErrors((prev) => ({ ...prev, branchNumber: undefined }));
              }}
              disabled={!selectedBank || selectedBank.branches.length === 0}
              className={selectClass(!!errors.branchNumber)}
            >
              <option value="">{t("select_branch")}</option>
              {selectedBank?.branches.map((branch) => (
                <option
                  key={branch.branchId}
                  value={branch.branchId}
                  className="capitalize"
                >
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className={labelClass}>
              {t("account_number")} *
              {errors.accountNumber && (
                <span className={errorClass}>{errors.accountNumber}</span>
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
              className={inputClass(!!errors.accountNumber)}
            />
          </div>

          {/* BN Number */}
          <div>
            <label className={labelClass}>
              {t("bn_number")} *
              {errors.bnNumber && (
                <span className={errorClass}>{errors.bnNumber}</span>
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
              className={inputClass(!!errors.bnNumber)}
            />
          </div>

          {/* Name on Invoice */}
          <div>
            <label className={labelClass}>
              {t("name_on_invoice")} *
              {errors.invoiceName && (
                <span className={errorClass}>{errors.invoiceName}</span>
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
              className={inputClass(!!errors.invoiceName)}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={clsx(
            "sticky bottom-0 px-6 py-4 flex items-center justify-end gap-3 border-t",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-100",
          )}
        >
          <button
            onClick={handleCloseBankModal}
            className={clsx(
              "px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer",
              isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100",
            )}
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            onClick={handleSaveBankAccount}
            disabled={
              isLoading ||
              !selectedBankNumber ||
              !selectedBranchNumber ||
              !bankAccountData.accountNumber ||
              !bankAccountData.bnNumber ||
              !bankAccountData.invoiceName
            }
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              "bg-teal-600 hover:bg-teal-700 text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600",
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{t("save") || "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBankAccountModal;
