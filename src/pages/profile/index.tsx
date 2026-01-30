import { Activity, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  CreditCard,
  Plus,
  Building2,
  User,
} from "lucide-react";

import { routes } from "@/lib/routes";
import { useAppSelector } from "@/hooks/hooks";
import { AssignBankAccountModal } from "./components";
import { useNavigate } from "react-router-dom";
import { useGetUserInfoQuery } from "@/store/api/userQueryApi";
import { formatDate } from "@/helpers/formatter";
import { Spinner } from "@/components/shared";

export function getInitials(fullName: string): string {
  if (!fullName) return "";

  return fullName
    .trim()
    .split(/\s+/) // split by one or more spaces
    .map((word) => word[0]) // take first letter
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation("profile");
  const { t: tBank } = useTranslation("banks");
  const language = i18n.language;

  const banks = tBank("banks", { returnObjects: true }) as Bank[];

  const { theme } = useAppSelector((state) => state.settings);
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const {
    data: userInfo,
    refetch,
    isLoading,
    isFetching,
  } = useGetUserInfoQuery();

  const [showBankModal, setShowBankModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("user");
    navigate(routes.auth);
  };

  const bank = banks?.find(
    (bank) => bank.bankId === userInfo?.bankAccount?.bankNumber,
  );

  const branchName = bank?.branches?.find(
    (branch) => branch.branchId === userInfo?.bankAccount?.branchNumber,
  )?.branchName;

  return (
    <>
      <Spinner isLoading={isFetching || isLoading} />
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div
          className={`${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } rounded-2xl shadow-lg p-8 mb-6`}
        >
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full object-cover border-4 border-teal-500 flex items-center justify-center ">
              <div className="text-6xl font-bold text-teal-600">
                {getInitials(`${user?.firstName + " " + user?.lastName}`)}
              </div>
            </div>

            <div className="flex-1">
              <h1
                className={`text-3xl mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {user?.firstName + " " + user?.lastName}
              </h1>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-teal-400" : "text-teal-600"
                }`}
              >
                {user?.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              {t("logout")}
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div
          className={`${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } rounded-2xl shadow-lg p-8 mb-6`}
        >
          <h2 className="text-2xl mb-6">{t("contact_information")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<Mail />}
              label={t("email")}
              value={userInfo?.email || ""}
              theme={theme}
            />
            <InfoItem
              icon={<Phone />}
              label={t("phone")}
              value={userInfo?.phoneDetails.phoneNumber || ""}
              theme={theme}
            />
            <InfoItem
              icon={<MapPin />}
              label={t("location")}
              value={userInfo?.address || ""}
              theme={theme}
            />
            <InfoItem
              icon={<Calendar />}
              label={t("member_since")}
              value={formatDate(userInfo?.createdAt || "", language) || ""}
              theme={theme}
            />
          </div>
        </div>

        {/* Bank Account */}
        <div
          className={`${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } rounded-2xl shadow-lg p-8`}
        >
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl">{t("bank_account_details")}</h2>

            <button
              onClick={() => setShowBankModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg cursor-pointer"
            >
              {userInfo?.bankAccount?.accountNumber ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  {t("edit_bank_account")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t("add_bank_account")}
                </>
              )}
            </button>
          </div>

          {userInfo?.bankAccount ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <CreditCard
                    className={`w-6 h-6 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("bank_name") || "Bank Name"}
                  </p>
                  <p
                    className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {bank?.bankName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <Building2
                    className={`w-6 h-6 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("branch_name") || "Branch Name"}
                  </p>
                  <p
                    className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {branchName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <User
                    className={`w-6 h-6 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("account_number") || "Account Number"}
                  </p>
                  <p
                    className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {userInfo?.bankAccount?.accountNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <Building2
                    className={`w-6 h-6 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("bn_number") || "BN Number (ח.פ.)"}
                  </p>
                  <p
                    className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {userInfo?.bankAccount?.businessNumberByGovt}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 md:col-span-2">
                <div
                  className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <User
                    className={`w-6 h-6 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("name_on_invoice") || "Name on Invoice"}
                  </p>
                  <p
                    className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {userInfo?.bankAccount?.invoiceName}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg">{t("no_bank_account_added")}</p>
              <p className="text-sm">{t("click_add_bank_account")}</p>
            </div>
          )}
        </div>
      </div>

      <Activity mode={showBankModal ? "visible" : "hidden"}>
        <AssignBankAccountModal
          theme={theme}
          banks={banks}
          refetch={refetch}
          userId={userInfo?.id || ""}
          setIsOpen={setShowBankModal}
          savedBankAccount={userInfo?.bankAccount}
        />
      </Activity>
    </>
  );
}

/* Reusable info item */
function InfoItem({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: string;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`p-3 rounded-lg ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm">{label}</p>
        <p>{value}</p>
      </div>
    </div>
  );
}
