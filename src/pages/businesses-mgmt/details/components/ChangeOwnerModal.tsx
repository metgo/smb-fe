import { toast } from "sonner";
import { useState } from "react";

import { Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import {
  useLazyGetUserByEmailQuery,
  usePatchBusinessOwnerMutation,
  usePostUserAdminMutation,
} from "@/store/api/masterDataApi";
import { useSearchParams } from "react-router-dom";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ModalWrapper } from "@/components/wrapper";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";

interface ChangeOwnerModalProps {
  setIsOpen: (v: boolean) => void;
  currentOwner?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function ChangeOwnerModal({
  setIsOpen,
  currentOwner,
}: ChangeOwnerModalProps) {
  const { userRole } = useAppSelector((state) => state.auth);
  const { isDark } = useThemeClasses();
  const { t } = useTranslation("common");
  const [getUserByEmail] = useLazyGetUserByEmailQuery();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "create-user">("email");
  const [isChecking, setIsChecking] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);

  const [postUserAdmin] = usePostUserAdminMutation();
  const [updateOwner] = usePatchBusinessOwnerMutation();

  //get id from params to send when updating owner
  const [searchParams] = useSearchParams();
  const businessIdParams = searchParams.get("businessId");
  const businessId = businessIdParams ? [businessIdParams] : [];

  // New user form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState("en");

  const handleEmailCheck = async () => {
    if (!email || !email.includes("@")) {
      toast.error(t("invalid_email"), {
        description: t("invalid_email_description"),
      });
      return;
    }

    try {
      setIsChecking(true);
      const user = await getUserByEmail({ email }).unwrap();
      setFoundUser(user);
      toast.success(t("user_found"), {
        description: t("user_found_description", {
          firstName: user.firstName,
          lastName: user.lastName,
        }),
      });
    } catch (err) {
      setFoundUser(null);
      setStep("create-user");

      toast.info(t("new_user"), {
        description: t("new_user_description"),
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setIsChecking(false);
    setFoundUser(null);
    setFirstName("");
    setLastName("");
    setPhone("");
    setAddress("");
    setLanguage("en");
    setIsOpen(false);
  };

  const handleAssignExistingUser = () => {
    if (foundUser) {
      updateOwner({ userId: foundUser?.id, businessesId: businessId });
      toast.success(t("owner_changed"), {
        description: t("owner_changed_description", {
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
        }),
      });
      setFoundUser("");
      handleClose();
      setEmail("");
    }
  };

  const handleCreateAndAssign = async () => {
    if (!firstName || !lastName || !phone) {
      toast.error(t("missing_information"), {
        description: t("missing_information_description"),
      });
      return;
    } else {
      await postUserAdmin({
        email,
        firstName,
        lastName,
        phoneNumber: phone,
        address,
        languagePreference: language,
        role: userRole,
      });
    }

    toast.success(t("new_owner_created"), {
      description: t("new_owner_created_description", {
        firstName,
        lastName,
      }),
    });
    handleClose();
  };

  return (
    <ModalWrapper onClose={handleClose} maxWidth="max-w-2xl" height="h-max">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-6 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div>
          <h2 className={`text-xl ${isDark ? "text-white" : "text-gray-900"}`}>
            {t("change_business_owner")}{" "}
          </h2>
          {currentOwner && (
            <p
              className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("current_owner")}: {currentOwner.name} ({currentOwner.email})
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {step === "email" && (
          <div className="space-y-6">
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("owner_email_address")}{" "}
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("owner_email_placeholder")}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                  />
                </div>
                <button
                  onClick={handleEmailCheck}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("checking")}{" "}
                    </>
                  ) : (
                    t("check_email")
                  )}
                </button>
              </div>
              <p
                className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-600"}`}
              >
                {t("email_helper_text")}
              </p>
            </div>

            {foundUser && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  isDark
                    ? "bg-green-900/20 border-green-800"
                    : "bg-green-50 border-green-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className={`w-5 h-5 mt-0.5 ${
                      isDark ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium mb-2 ${
                        isDark ? "text-green-400" : "text-green-900"
                      }`}
                    >
                      {t("user_found_in_system")}{" "}
                    </h3>
                    <div
                      className={`space-y-1 text-sm ${
                        isDark ? "text-green-300" : "text-green-800"
                      }`}
                    >
                      <p>
                        <strong>{t("user_name_label")}</strong>{" "}
                        {foundUser.firstName} {foundUser.lastName}
                      </p>
                      <p>
                        <strong>{t("user_email_label")}</strong>{" "}
                        {foundUser.email}
                      </p>
                      <p>
                        <strong>{t("user_phone_label")}</strong>{" "}
                        {foundUser.phoneDetails?.phoneNumber}
                      </p>
                      <p>
                        <strong>{t("user_location_label")}</strong>{" "}
                        {foundUser.address}
                      </p>
                    </div>
                    <button
                      onClick={handleAssignExistingUser}
                      className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
                        isDark
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {t("assign_as_owner")}{" "}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "create-user" && (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-lg border ${
                isDark
                  ? "bg-blue-900/20 border-blue-800"
                  : "bg-blue-50 border-blue-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <div>
                  <h3
                    className={`font-medium mb-1 ${
                      isDark ? "text-blue-400" : "text-blue-900"
                    }`}
                  >
                    {t("create_new_user")}{" "}
                  </h3>
                  <p
                    className={`text-sm ${
                      isDark ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    {t("create_new_user_description", { email })}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label
                  className={`block text-sm mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("first_name_required")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("first_name_placeholder")}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  className={`block text-sm mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("last_name_required")}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("last_name_placeholder")}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("email")}{" "}
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-gray-400"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } cursor-not-allowed`}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("phone_number_required")}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phone_number_placeholder")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
              />
            </div>

            {/* Address */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("address")}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("address_placeholder")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
              />
            </div>

            {/* Language */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("language")}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:border-teal-500"
                    : "bg-white border-gray-300 text-gray-900 focus:border-teal-500"
                } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
              >
                <option value="en">English</option>
                <option value="he">עברית (Hebrew)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setStep("email");
                  setEmail("");
                }}
                className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                  isDark
                    ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {t("back")}
              </button>
              <button
                onClick={handleCreateAndAssign}
                className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                {t("create_and_assign_as_owner")}{" "}
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
