import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, User, Mail, Phone } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import { useUpdateProfileInfoMutation } from "@/store/api/userMutationApi";

interface VendorBankDetailsOwnerInfo {
  name: string;
  email: string | null;
  phone: string | null;
}

interface VendorBankDetailsProps {
  userId: string;
  setIsOpen: (v: boolean) => void;
  savedBankAccount: BankAccount | undefined;
  ownerInfo: VendorBankDetailsOwnerInfo;
}

const VendorBankDetails = ({
  userId,
  setIsOpen,
  savedBankAccount,
  ownerInfo,
}: VendorBankDetailsProps) => {
  const { t } = useTranslation("profile");
  const { t: tBank } = useTranslation("banks");
  const banks = useMemo(
    () => tBank("banks", { returnObjects: true }) as Bank[],
    [tBank],
  );

  const { isDark } = useThemeClasses();

  const [updateProfileInfo, { isLoading }] = useUpdateProfileInfoMutation();

  const [selectedBankNumber, setSelectedBankNumber] = useState("");

  const [selectedBranchNumber, setSelectedBranchNumber] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const selectedBank = useMemo(
    () => banks.find((b) => b.bankId === selectedBankNumber),
    [banks, selectedBankNumber],
  );

  const filteredBanks = useMemo(() => {
    const list = !bankSearch.trim()
      ? banks
      : banks.filter((b) => {
        const q = bankSearch.toLowerCase();
        return (
          b.bankId.toLowerCase().includes(q) ||
          b.bankName.toLowerCase().includes(q)
        );
      });
    return [...list].sort((a, b) => Number(a.bankId) - Number(b.bankId));
  }, [banks, bankSearch]);

  const filteredBranches = useMemo(() => {
    const branches = selectedBank?.branches ?? [];
    const list = !branchSearch.trim()
      ? branches
      : branches.filter((br) => {
        const q = branchSearch.toLowerCase();
        return (
          br.branchId.toLowerCase().includes(q) ||
          br.branchName.toLowerCase().includes(q)
        );
      });
    return [...list].sort((a, b) => Number(a.branchId) - Number(b.branchId));
  }, [selectedBank, branchSearch]);
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
    if (field === "bankNumber") {
      setBranchSearch("");
    }
  };

  const handleCloseBankModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (savedBankAccount) {
      setSelectedBankNumber(savedBankAccount.bankNumber);
      setSelectedBranchNumber(savedBankAccount.branchNumber);

      const matchedBank = banks.find(
        (b) => b.bankId === savedBankAccount.bankNumber,
      );
      if (matchedBank) {
        setBankSearch(`${matchedBank.bankId} - ${matchedBank.bankName}`);
        const matchedBranch = matchedBank.branches.find(
          (br) => br.branchId === savedBankAccount.branchNumber,
        );
        if (matchedBranch) {
          setBranchSearch(
            `${matchedBranch.branchId} - ${matchedBranch.branchName}`,
          );
        }
      }

      setBankAccountData({
        accountNumber: savedBankAccount.accountNumber,
        bnNumber: savedBankAccount.businessNumberByGovt,
        invoiceName: savedBankAccount.invoiceName,
        bankNumber: savedBankAccount.bankNumber,
        branchNumber: savedBankAccount.branchNumber,
      });
    }
    // depend on savedBankAccount's fields, not its reference - the caller
    // passes a freshly-built object each render, which would otherwise
    // re-run this effect (and its setState calls) on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    savedBankAccount?.bankNumber,
    savedBankAccount?.branchNumber,
    savedBankAccount?.accountNumber,
    savedBankAccount?.businessNumberByGovt,
    savedBankAccount?.invoiceName,
    banks,
  ]);

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

  return (
    <ModalWrapper
      onClose={handleCloseBankModal}
      maxWidth="max-w-xl"
      height="h-auto max-h-[90vh]"
      closeOnOutsideClick
    >
      <div className="flex flex-col overflow-y-auto">
        {/* Modal Header */}
        <div
          className={clsx(
            "sticky top-0 z-10 px-6 py-4 border-b",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100",
          )}
        >
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

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Owner Info */}
          <div
            className={clsx(
              "rounded-xl border p-4 space-y-2",
              isDark ? "bg-gray-700/40 border-gray-600" : "bg-gray-50 border-gray-200",
            )}
          >
            <div className="flex items-center gap-2">
              <User className={clsx("w-4 h-4 shrink-0", isDark ? "text-gray-400" : "text-gray-500")} />
              <span className={clsx("text-sm font-medium", isDark ? "text-gray-100" : "text-gray-900")}>
                {ownerInfo.name}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {ownerInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className={clsx("w-4 h-4 shrink-0", isDark ? "text-gray-400" : "text-gray-500")} />
                  <span className={clsx("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                    {ownerInfo.email}
                  </span>
                </div>
              )}
              {ownerInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className={clsx("w-4 h-4 shrink-0", isDark ? "text-gray-400" : "text-gray-500")} />
                  <span className={clsx("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                    {ownerInfo.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bank Name - Searchable Combobox */}
          <div className="relative">
            <label className={labelClass}>
              {t("bank_name")} *
              {errors.bankNumber && (
                <span className={errorClass}>{errors.bankNumber}</span>
              )}
            </label>

            <input
              type="text"
              value={bankSearch}
              onChange={(e) => {
                setBankSearch(e.target.value);
                setIsBankDropdownOpen(true);
                // Clear selection when user edits the input
                if (selectedBankNumber) {
                  setSelectedBankNumber("");
                  setSelectedBranchNumber("");
                  setBranchSearch("");
                  setBankAccountData((prev) => ({
                    ...prev,
                    bankNumber: "",
                    branchNumber: "",
                  }));
                }
              }}
              onFocus={() => {
                // setBankSearch("");
                setIsBankDropdownOpen(true);
                if (selectedBankNumber) {
                  setBankSearch(""); // temporarily clear to show full list
                }
              }}
              onBlur={() =>
                setTimeout(() => {
                  setIsBankDropdownOpen(false);
                  if (selectedBankNumber && selectedBank) {
                    setBankSearch(
                      `${selectedBank.bankId} - ${selectedBank.bankName}`,
                    );
                  } else {
                    setBankSearch("");
                  }
                }, 150)
              }
              placeholder={t("select_bank") || "Search by bank name or ID..."}
              className={inputClass(!!errors.bankNumber)}
            />

            {isBankDropdownOpen && banks.length > 0 && (
              <ul
                className={clsx(
                  "absolute z-20 w-full mt-1 rounded-lg border shadow-lg max-h-52 overflow-y-auto text-sm",
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900",
                )}
              >
                {filteredBanks.map((bank) => (
                  <li
                    key={bank.bankId}
                    onMouseDown={() => {
                      setSelectedBankNumber(bank.bankId);
                      setSelectedBranchNumber("");
                      setBankSearch(`${bank.bankId} - ${bank.bankName}`);
                      setBranchSearch("");
                      setBankAccountData((prev) => ({
                        ...prev,
                        bankNumber: bank.bankId,
                        branchNumber: "",
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        bankNumber: undefined,
                      }));
                      setIsBankDropdownOpen(false);
                    }}
                    className={clsx(
                      "px-4 py-2.5 cursor-pointer transition-colors",
                      isDark ? "hover:bg-gray-600" : "hover:bg-teal-50",
                      selectedBankNumber === bank.bankId &&
                      (isDark ? "bg-gray-600" : "bg-teal-50 font-medium"),
                    )}
                  >
                    <span className="font-mono text-teal-500">
                      {bank.bankId}
                    </span>
                    <span className="mx-2">—</span>
                    {bank.bankName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Branch Name */}
          <div className="relative">
            <label className={labelClass}>
              {t("branch_name")} *
              {errors.branchNumber && (
                <span className={errorClass}>{errors.branchNumber}</span>
              )}
            </label>

            <input
              type="text"
              value={branchSearch}
              disabled={!selectedBank || selectedBank.branches.length === 0}
              onChange={(e) => {
                setBranchSearch(e.target.value);
                setIsBranchDropdownOpen(true);
                if (selectedBranchNumber) {
                  setSelectedBranchNumber("");
                  setBankAccountData((prev) => ({
                    ...prev,
                    branchNumber: "",
                  }));
                }
              }}
              onFocus={() => {
                setIsBranchDropdownOpen(true);
                if (selectedBranchNumber) {
                  setBranchSearch("");
                }
              }}
              onBlur={() =>
                setTimeout(() => {
                  setIsBranchDropdownOpen(false);
                  if (selectedBranchNumber && selectedBank) {
                    const b = selectedBank.branches.find(
                      (br) => br.branchId === selectedBranchNumber,
                    );
                    setBranchSearch(b ? `${b.branchId} - ${b.branchName}` : "");
                  } else {
                    setBranchSearch("");
                  }
                }, 150)
              }
              placeholder={
                !selectedBank
                  ? t("select_bank_first") || "Select a bank first..."
                  : t("select_branch") || "Search by branch name or ID..."
              }
              className={inputClass(!!errors.branchNumber)}
            />

            {isBranchDropdownOpen && filteredBranches.length > 0 && (
              <ul
                className={clsx(
                  "absolute z-20 w-full mt-1 rounded-lg border shadow-lg max-h-52 overflow-y-auto text-sm",
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-200 text-gray-900",
                )}
              >
                {filteredBranches.map((branch) => (
                  <li
                    key={branch.branchId}
                    onMouseDown={() => {
                      setSelectedBranchNumber(branch.branchId);
                      setBranchSearch(
                        `${branch.branchId} - ${branch.branchName}`,
                      );
                      setBankAccountData((prev) => ({
                        ...prev,
                        branchNumber: branch.branchId,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        branchNumber: undefined,
                      }));
                      setIsBranchDropdownOpen(false);
                    }}
                    className={clsx(
                      "px-4 py-2.5 cursor-pointer transition-colors",
                      isDark ? "hover:bg-gray-600" : "hover:bg-teal-50",
                      selectedBranchNumber === branch.branchId &&
                      (isDark ? "bg-gray-600" : "bg-teal-50 font-medium"),
                    )}
                  >
                    <span className="font-mono text-teal-500">
                      {branch.branchId}
                    </span>
                    <span className="mx-2">—</span>
                    {branch.branchName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
    </ModalWrapper>
  );
};

export default VendorBankDetails;
