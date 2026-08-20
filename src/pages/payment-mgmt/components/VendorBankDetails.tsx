import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  MessageSquare,
  Building2,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import {
  useSendEmailSmsMutation,
  useUpdateProfileInfoMutation,
} from "@/store/api/userMutationApi";
import { InputField, ReactSelect } from "@/components/form-fields";

interface VendorBankDetailsOwnerInfo {
  _id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface VendorBankDetailsProps {
  userId: string;
  adminView: boolean;
  setIsOpen: (v: boolean) => void;
  savedBankAccount: BankAccount | undefined;
  ownerInfo: VendorBankDetailsOwnerInfo;
}

const VendorBankDetails = ({
  userId,
  adminView,
  setIsOpen,
  savedBankAccount,
  ownerInfo,
}: VendorBankDetailsProps) => {
  const { t } = useTranslation("profile");
  const { t: tBank } = useTranslation("banks");
  const { t: tVouchers } = useTranslation("vouchers");
  const { t: tToast } = useTranslation("toast");
  const banks = useMemo(
    () => tBank("banks", { returnObjects: true }) as Bank[],
    [tBank],
  );

  const { isDark, textSecondary, textPrimary } = useThemeClasses();

  const [updateProfileInfo, { isLoading }] = useUpdateProfileInfoMutation();
  const [sendEmailSms, { isLoading: isSendingEmailSms }] =
    useSendEmailSmsMutation();

  const [selectedBankNumber, setSelectedBankNumber] = useState("");

  const [selectedBranchNumber, setSelectedBranchNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const selectedBank = useMemo(
    () => banks.find((b) => b.bankId === selectedBankNumber),
    [banks, selectedBankNumber],
  );

  // Convert banks to ReactSelect format
  const bankOptions = useMemo(
    () =>
      banks.map((bank) => ({
        _id: bank.bankId,
        name: `${bank.bankId} - ${bank.bankName}`,
      })),
    [banks],
  );

  // Convert branches to ReactSelect format
  const branchOptions = useMemo(
    () =>
      selectedBank?.branches.map((branch) => ({
        _id: branch.branchId,
        name: `${branch.branchId} - ${branch.branchName}`,
      })) || [],
    [selectedBank],
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
        bankNumber: savedBankAccount.bankNumber,
        branchNumber: savedBankAccount.branchNumber,
      });
    }
  }, [savedBankAccount, banks]);

  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const errorClass = "text-red-500 text-xs font-normal ml-1";

  // Input classes for InputField component
  const getInputFieldClasses = () =>
    clsx(
      isDark
        ? "bg-gray-700/60 border-gray-600 text-gray-100 placeholder-gray-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400",
    );

  const notifyUserHandler = async (type: "email" | "sms") => {
    try {
      await sendEmailSms({
        type,
        userId: ownerInfo?._id,
      });
      // Show success toast
      if (type === "email") {
        toast.success(tToast("vendor_email_sent_success"));
      } else {
        toast.success(tToast("vendor_sms_sent_success"));
      }
    } catch (error) {
      console.error(`Failed to send ${type}:`, error);

      // Show error toast
      if (type === "email") {
        toast.error(tToast("vendor_email_sent_failed"));
      } else {
        toast.error(tToast("vendor_sms_sent_failed"));
      }
    }
  };

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
        <div className="px-3 py-5 space-y-4">
          {/* Owner Info */}
          <div
            className={clsx(
              "rounded-xl border p-4 space-y-2",
              isDark
                ? "bg-gray-700/40 border-gray-600"
                : "bg-gray-50 border-gray-200",
            )}
          >
            <div className="flex items-center gap-2">
              <User
                className={clsx(
                  "w-4 h-4 shrink-0",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              />
              <span
                className={clsx(
                  "text-sm font-medium",
                  isDark ? "text-gray-100" : "text-gray-900",
                )}
              >
                {ownerInfo.name}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {ownerInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail
                    className={clsx(
                      "w-4 h-4 shrink-0",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-sm",
                      isDark ? "text-gray-300" : "text-gray-600",
                    )}
                  >
                    {ownerInfo.email}
                  </span>
                </div>
              )}
              {ownerInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone
                    className={clsx(
                      "w-4 h-4 shrink-0",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-sm",
                      isDark ? "text-gray-300" : "text-gray-600",
                    )}
                  >
                    {ownerInfo.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            className={clsx(
              "rounded-xl border p-4 space-y-2",
              isDark
                ? "bg-gray-700/40 border-gray-600"
                : "bg-gray-50 border-gray-200",
            )}
          >
            {!adminView ? (
              <div className="space-y-4">
                {/* Bank Name - ReactSelect */}
                <div>
                  <label className={labelClass}>
                    {t("bank_name")} *
                    {errors.bankNumber && (
                      <span className={errorClass}>{errors.bankNumber}</span>
                    )}
                  </label>
                  <ReactSelect
                    items={bankOptions}
                    value={selectedBankNumber}
                    onChange={(value) => {
                      setSelectedBankNumber(value);
                      setSelectedBranchNumber("");
                      setBankAccountData((prev) => ({
                        ...prev,
                        bankNumber: value,
                        branchNumber: "",
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        bankNumber: undefined,
                      }));
                    }}
                    placeholder={
                      t("select_bank") || "Search by bank name or ID..."
                    }
                    isClearable
                  />
                </div>

                {/* Branch Name - ReactSelect */}
                <div>
                  <label className={labelClass}>
                    {t("branch_name")} *
                    {errors.branchNumber && (
                      <span className={errorClass}>{errors.branchNumber}</span>
                    )}
                  </label>
                  <ReactSelect
                    items={branchOptions}
                    value={selectedBranchNumber}
                    onChange={(value) => {
                      setSelectedBranchNumber(value);
                      setBankAccountData((prev) => ({
                        ...prev,
                        branchNumber: value,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        branchNumber: undefined,
                      }));
                    }}

                    placeholder={
                      !selectedBank
                        ? t("select_bank_first") || "Select a bank first..."
                        : t("select_branch") || "Search by branch name or ID..."
                    }
                    isClearable
                    isDisabled={!selectedBank}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Account Number */}
                  <div>
                    <label className={labelClass}>
                      {t("account_number")} *
                      {errors.accountNumber && (
                        <span className={errorClass}>
                          {errors.accountNumber}
                        </span>
                      )}
                    </label>
                    <InputField
                      value={bankAccountData.accountNumber}
                      onChange={(value) => {
                        handleBankChange("accountNumber", value);
                        setErrors((prev) => ({
                          ...prev,
                          accountNumber: undefined,
                        }));
                      }}
                      placeholder="123456789"
                      inputClasses={getInputFieldClasses()}
                      error={errors.accountNumber}
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
                    <InputField
                      value={bankAccountData.bnNumber}
                      onChange={(value) => {
                        handleBankChange("bnNumber", value);
                        setErrors((prev) => ({ ...prev, bnNumber: undefined }));
                      }}
                      placeholder="123456789"
                      inputClasses={getInputFieldClasses()}
                      error={errors.bnNumber}
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
                  <InputField
                    value={bankAccountData.invoiceName}
                    onChange={(value) => {
                      handleBankChange("invoiceName", value);
                      setErrors((prev) => ({
                        ...prev,
                        invoiceName: undefined,
                      }));
                    }}
                    placeholder="MetGo LTD"
                    inputClasses={getInputFieldClasses()}
                    error={errors.invoiceName}
                  />
                </div>
              </div>
            ) : adminView && !isEditing ? (
              // Admin view (read-only)
              savedBankAccount ? (
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`p-3 rounded-lg ${isDark ? "bg-teal-900/30" : "bg-teal-50"}`}
                    >
                      <Building2
                        className={`w-6 h-6 ${isDark ? "text-teal-400" : "text-teal-600"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-lg ${textPrimary}`}>
                        {savedBankAccount.invoiceName || "Business Name"}
                      </h4>
                      <p className={`text-sm ${textSecondary}`}>
                        {t("bank_account_details") || "Bank Account Details"}
                      </p>
                    </div>
                  </div>

                  {/* Bank Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank Number */}
                    <div
                      className={`p-4 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-wide mb-1 ${textSecondary}`}
                      >
                        {t("bank_name") || "Bank Name"}
                      </div>
                      <div className={`font-medium ${textPrimary}`}>
                        {(() => {
                          const bank = banks.find(
                            (b) => b.bankId === savedBankAccount.bankNumber,
                          );
                          return bank
                            ? `${bank.bankId} - ${bank.bankName}`
                            : savedBankAccount.bankNumber;
                        })()}
                      </div>
                    </div>

                    {/* Branch Number */}
                    <div
                      className={`p-4 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-wide mb-1 ${textSecondary}`}
                      >
                        {t("branch_name") || "Branch Name"}
                      </div>
                      <div className={`font-medium ${textPrimary}`}>
                        {(() => {
                          const bank = banks.find(
                            (b) => b.bankId === savedBankAccount.bankNumber,
                          );
                          const branch = bank?.branches.find(
                            (br) =>
                              br.branchId === savedBankAccount.branchNumber,
                          );
                          return branch
                            ? `${branch.branchId} - ${branch.branchName}`
                            : savedBankAccount.branchNumber;
                        })()}
                      </div>
                    </div>

                    {/* Account Number */}
                    <div
                      className={`p-4 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-wide mb-1 ${textSecondary}`}
                      >
                        {t("account_number") || "Account Number"}
                      </div>
                      <div className={`font-medium ${textPrimary}`}>
                        {savedBankAccount.accountNumber}
                      </div>
                    </div>

                    {/* BN Number */}
                    <div
                      className={`p-4 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-wide mb-1 ${textSecondary}`}
                      >
                        {t("bn_number") || "Business Number"}
                      </div>
                      <div className={`font-medium ${textPrimary}`}>
                        {savedBankAccount.businessNumberByGovt}
                      </div>
                    </div>
                  </div>

                  {/* Action Button for Admin */}
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        // Pre-fill the form with existing data
                        if (savedBankAccount) {
                          setSelectedBankNumber(savedBankAccount.bankNumber);
                          setSelectedBranchNumber(
                            savedBankAccount.branchNumber,
                          );
                          setBankAccountData({
                            bankNumber: savedBankAccount.bankNumber,
                            branchNumber: savedBankAccount.branchNumber,
                            accountNumber: savedBankAccount.accountNumber,
                            bnNumber: savedBankAccount.businessNumberByGovt,
                            invoiceName: savedBankAccount.invoiceName,
                          });
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {t("edit_bank_account") || "Edit Bank Account"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className={`mb-6 text-sm ${textSecondary}`}>
                    {t("vendor_no_bank_details") ||
                      "This vendor does not have bank account details. Please send them an email or SMS to update their information."}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => notifyUserHandler("email")}
                      disabled={isSendingEmailSms}
                      className={clsx(
                        "flex items-center gap-2 px-5 py-2.5 cursor-pointer rounded-lg text-sm font-medium transition-colors border border-teal-400",
                        isDark
                          ? "bg-teal-900/50 hover:bg-teal-800 text-teal-400"
                          : "bg-teal-50 hover:bg-teal-100 text-teal-700",
                      )}
                    >
                      <Mail className="w-4 h-4" />
                      {tVouchers("send_email") || "Send Email"}
                    </button>
                    <button
                      type="button"
                      disabled={isSendingEmailSms}
                      onClick={() => notifyUserHandler("sms")}
                      className={clsx(
                        "flex items-center gap-2 px-5 py-2.5  cursor-pointer rounded-lg text-sm font-medium transition-colors border border-blue-400",
                        isDark
                          ? "bg-blue-900/50 hover:bg-blue-800 text-blue-400"
                          : "bg-blue-50 hover:bg-blue-100 text-blue-700",
                      )}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {tVouchers("send_sms") || "Send SMS"}
                    </button>
                  </div>
                </div>
              )
            ) : (
              // Non-admin view - show email/SMS buttons when no bank account
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className={`mb-6 text-sm ${textSecondary}`}>
                  {t("vendor_no_bank_details") ||
                    "This vendor does not have bank account details. Please send them an email or SMS to update their information."}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => notifyUserHandler("email")}
                    disabled={isSendingEmailSms}
                    className={clsx(
                      "flex items-center gap-2 px-5 py-2.5 cursor-pointer rounded-lg text-sm font-medium transition-colors border border-teal-400",
                      isDark
                        ? "bg-teal-900/50 hover:bg-teal-800 text-teal-400"
                        : "bg-teal-50 hover:bg-teal-100 text-teal-700",
                    )}
                  >
                    <Mail className="w-4 h-4" />
                    {tVouchers("send_email") || "Send Email"}
                  </button>
                  <button
                    type="button"
                    disabled={isSendingEmailSms}
                    onClick={() => notifyUserHandler("sms")}
                    className={clsx(
                      "flex items-center gap-2 px-5 py-2.5  cursor-pointer rounded-lg text-sm font-medium transition-colors border border-blue-400",
                      isDark
                        ? "bg-blue-900/50 hover:bg-blue-800 text-blue-400"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-700",
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {tVouchers("send_sms") || "Send SMS"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        {!adminView || isEditing ? (
          <div
            className={clsx(
              "sticky bottom-0 px-6 py-4 flex items-center justify-end gap-3 border-t",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-100",
            )}
          >
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className={clsx(
                  "px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer",
                  isDark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100",
                )}
              >
                {t("cancel") || "Cancel"}
              </button>
            )}
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
        ) : (
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
              {t("close") || "Close"}
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default VendorBankDetails;
