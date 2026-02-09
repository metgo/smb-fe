import { useState } from "react";
import { Mail, User, Phone, UserPlus, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import { ModalWrapper } from "@/components/wrapper";

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (collaborator: {
    email: string;
    name?: string;
    phone?: string;
    role: string;
    status: string;
  }) => void;
}

// Mock database of existing users
const EXISTING_USERS = [
  { email: "john.doe@example.com", name: "John Doe", phone: "+972-50-1234567" },
  {
    email: "sarah.cohen@example.com",
    name: "Sarah Cohen",
    phone: "+972-52-7654321",
  },
  {
    email: "david.levi@example.com",
    name: "David Levi",
    phone: "+972-54-9876543",
  },
];

export default function InviteCollaboratorModal({
  isOpen,
  onClose,
  onInvite,
}: InviteCollaboratorModalProps) {
  const { t } = useTranslation("businesses");
  const { t: tc } = useTranslation("common");

  const { isDark } = useThemeClasses();

  const { isRTL } = useAppSelector((state) => state.settings);

  const [step, setStep] = useState<"email" | "details">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState("");

  const handleEmailCheck = () => {
    setError("");

    if (!email.trim()) {
      setError(t("email_required") || "Email address is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("email_invalid") || "Please enter a valid email address");
      return;
    }

    // Check if user exists in database
    const existingUser = EXISTING_USERS.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingUser) {
      // User exists, invite directly
      onInvite({
        email: existingUser.email,
        name: existingUser.name,
        phone: existingUser.phone,
        role: role,
        status: "pending",
      });
      handleClose();
    } else {
      // User doesn't exist, ask for details
      setStep("details");
    }
  };

  const handleInviteWithDetails = () => {
    setError("");

    if (!name.trim()) {
      setError(t("name_required") || "Full name is required");
      return;
    }

    if (!phone.trim()) {
      setError(t("phone_required") || "Phone number is required");
      return;
    }

    onInvite({
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      role: role,
      status: "pending",
    });
    handleClose();
  };

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setName("");
    setPhone("");
    setRole("editor");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-md" height="h-max">
      <div
        className={`flex items-center justify-between p-6 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2
              className={`text-lg font-semibold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {step === "email"
                ? t("invite_collaborator") || "Invite Collaborator"
                : t("user_details") || "User Details"}
            </h2>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {step === "email"
                ? t("enter_email_prompt") ||
                  "Enter the email address of the person you want to invite"
                : t("user_not_in_system_prompt") ||
                  "This user is not in our system. Please provide their details."}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {step === "email" ? (
          <>
            {/* Email Input */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("email_address") || "Email Address"} *
              </label>
              <div className="relative">
                <Mail
                  className={`absolute ${
                    isRTL ? "right-3" : "left-3"
                  } top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEmailCheck();
                    }
                  }}
                  placeholder="colleague@example.com"
                  className={`w-full ${
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  } py-2.5 rounded-lg border ${
                    error
                      ? "border-red-500 focus:ring-red-500"
                      : isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                  } focus:outline-none focus:ring-2`}
                  autoFocus
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("role") || "Role"} *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-200"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              >
                <option value="viewer">
                  {t("viewer_read_only") || "Viewer (Read Only)"}
                </option>
                <option value="editor">{t("editor") || "Editor"}</option>
                <option value="admin">{t("admin") || "Admin"}</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Alert */}
            <div
              className={`flex items-start gap-3 p-4 rounded-lg ${
                isDark
                  ? "bg-amber-900/20 border border-amber-800"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-amber-200" : "text-amber-900"
                  }`}
                >
                  {t("new_user") || "New User"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-amber-300" : "text-amber-800"
                  }`}
                >
                  {email}{" "}
                  {t("user_not_in_system_alert") ||
                    "is not in our system. Please provide their information to send an invitation."}
                </p>
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("email_address") || "Email Address"}
              </label>
              <div className="relative">
                <Mail
                  className={`absolute ${
                    isRTL ? "right-3" : "left-3"
                  } top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`}
                />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className={`w-full ${
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  } py-2.5 rounded-lg border ${
                    isDark
                      ? "bg-gray-800/50 border-gray-700 text-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-600"
                  } cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("full_name") || "Full Name"} *
              </label>
              <div className="relative">
                <User
                  className={`absolute ${
                    isRTL ? "right-3" : "left-3"
                  } top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="John Doe"
                  className={`w-full ${
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  } py-2.5 rounded-lg border ${
                    error && !name.trim()
                      ? "border-red-500 focus:ring-red-500"
                      : isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                  } focus:outline-none focus:ring-2`}
                  autoFocus
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("phone_number") || "Phone Number"} *
              </label>
              <div className="relative">
                <Phone
                  className={`absolute ${
                    isRTL ? "right-3" : "left-3"
                  } top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  placeholder="+972-XX-XXXXXXX"
                  className={`w-full ${
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  } py-2.5 rounded-lg border ${
                    error && !phone.trim()
                      ? "border-red-500 focus:ring-red-500"
                      : isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        : "bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500"
                  } focus:outline-none focus:ring-2`}
                />
              </div>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              isDark
                ? "bg-red-900/20 border border-red-800"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`flex items-center justify-end gap-3 p-6 border-t ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        {step === "details" && (
          <button
            onClick={() => {
              setStep("email");
              setName("");
              setPhone("");
              setError("");
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {tc("back") || "Back"}
          </button>
        )}
        <button
          onClick={handleClose}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {tc("cancel") || "Cancel"}
        </button>
        <button
          onClick={
            step === "email" ? handleEmailCheck : handleInviteWithDetails
          }
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {step === "email" ? (
            <>{tc("continue") || "Continue"}</>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              {tc("send_invite") || "Send Invite"}
            </>
          )}
        </button>
      </div>
    </ModalWrapper>
  );
}
