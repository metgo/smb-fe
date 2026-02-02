import { toast } from "sonner";
import { useEffect, useState } from "react";

import { X, Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import {
  useGetUserByEmailQuery,
  usePatchBusinessOwnerMutation,
  usePostUserAdminMutation,
} from "@/store/api/masterDataApi";
import { useSearchParams } from "react-router-dom";

interface ChangeOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  currentOwner?: {
    name: string;
    email: string;
    phone: string;
  };
  onOwnerChange: (ownerData: any) => void;
  USER_ROLE: string;
}

export default function ChangeOwnerModal({
  isOpen,
  onClose,
  theme,
  currentOwner,
  onOwnerChange,
  USER_ROLE,
}: ChangeOwnerModalProps) {
  const [step, setStep] = useState<"email" | "create-user">("email");
  const [email, setEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  // const [emailCheck, _setEmailCheck] = useState<boolean>(false);
  const [debouncedEmail, setDebouncedEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(email);
    }, 900);

    return () => clearTimeout(timer);
  }, [email]);

  const { data: userEmailCheck } = useGetUserByEmailQuery(
    { email: debouncedEmail },
    { skip: !debouncedEmail },
  );
  const [userId, setUserId] = useState<string>("");
  useEffect(() => {
    if (userEmailCheck?.id) {
      setUserId(userEmailCheck.id);
    }
  }, [userEmailCheck]);
  //if no users is available in db
  const [postUserAdmin] = usePostUserAdminMutation();
  //change business owner
  const [updateOwner] = usePatchBusinessOwnerMutation();
  //get id from params to send when updating owner
  const [searchParams] = useSearchParams();
  const businessIdParams = searchParams.get("businessId");
  const businessId = businessIdParams ? [businessIdParams] : []; //backend expects an array

  // New user form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [language, setLanguage] = useState("en");
  if (!isOpen) return null;

  const handleEmailCheck = async () => {
    // setEmailCheck(true);
    if (!email || !email.includes("@")) {
      toast.error("Invalid Email", {
        description: "Please enter a valid email address",
      });
      return;
    }

    setIsChecking(true);

    if (userId !== "") {
      setUserFound(true);
      setFoundUser(userEmailCheck);
      toast.success("User Found!", {
        description: `${userEmailCheck?.firstName} ${userEmailCheck?.lastName} is already in the system`,
      });
    } else if (userId === "") {
      setUserFound(false);
      setFoundUser("");
      setStep("create-user");
      toast.info("New User", {
        description:
          "This email is not in the system. Please create a new user.",
      });
    }
    setIsChecking(false);
  };

  const handleAssignExistingUser = () => {
    if (foundUser) {
      updateOwner({ userId: foundUser?.id, businessesId: businessId });
      onOwnerChange({
        name: `${foundUser.firstName} ${foundUser.lastName}`,
        email: foundUser.email,
        phone: foundUser.phoneNumber,
      });
      toast.success("Owner Changed!", {
        description: `${foundUser.firstName} ${foundUser.lastName} is now the owner`,
      });
      setUserFound(false);
      setFoundUser("");
      handleClose();
      setEmail("");
      setUserId("");
    }
  };

  const handleCreateAndAssign = () => {
    if (!firstName || !lastName || !phone) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields",
      });
      return;
    } else {
      postUserAdmin({
        email,
        firstName,
        lastName,
        phoneNumber: phone,
        address,
        languagePreference: language,
        role: USER_ROLE,
      });
    }

    const newOwner = {
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone,
      address: address,
      language: language,
    };

    onOwnerChange(newOwner);
    toast.success("New Owner Created!", {
      description: `${firstName} ${lastName} has been created and assigned as owner`,
    });
    handleClose();
  };
  const handleClose = () => {
    setStep("email");
    setEmail("");
    setIsChecking(false);
    setUserFound(false);
    setFoundUser(null);
    setFirstName("");
    setLastName("");
    setPhone("");
    setAddress("");
    setLanguage("en");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl rounded-xl shadow-2xl ${
          theme === "dark"
            ? "bg-gray-900 border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-xl ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Change Business Owner
            </h2>
            {currentOwner && (
              <p
                className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Current owner: {currentOwner.name} ({currentOwner.email})
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "email" && (
            <div className="space-y-6">
              <div>
                <label
                  className={`block text-sm mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Owner Email Address
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Mail
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@example.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                    />
                  </div>
                  <button
                    // onClick={() => setEmailCheck(true)}
                    onClick={handleEmailCheck}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check Email"
                    )}
                  </button>
                </div>
                <p
                  className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}
                >
                  Enter the email address of the new owner. We'll check if
                  they're already in the system.
                </p>
              </div>

              {userFound && foundUser && (
                <div
                  className={`p-4 rounded-lg border-2 ${
                    theme === "dark"
                      ? "bg-green-900/20 border-green-800"
                      : "bg-green-50 border-green-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      className={`w-5 h-5 mt-0.5 ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-medium mb-2 ${
                          theme === "dark" ? "text-green-400" : "text-green-900"
                        }`}
                      >
                        User Found in System
                      </h3>
                      <div
                        className={`space-y-1 text-sm ${
                          theme === "dark" ? "text-green-300" : "text-green-800"
                        }`}
                      >
                        <p>
                          <strong>Name:</strong> {foundUser.firstName}{" "}
                          {foundUser.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong> {foundUser.email}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {foundUser.phoneDetails?.phoneNumber}
                        </p>
                        <p>
                          <strong>Location:</strong> {foundUser.address}
                        </p>
                      </div>
                      <button
                        onClick={handleAssignExistingUser}
                        className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        Assign as Owner
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
                  theme === "dark"
                    ? "bg-blue-900/20 border-blue-800"
                    : "bg-blue-50 border-blue-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 mt-0.5 ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <div>
                    <h3
                      className={`font-medium mb-1 ${
                        theme === "dark" ? "text-blue-400" : "text-blue-900"
                      }`}
                    >
                      Create New User
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-blue-300" : "text-blue-800"
                      }`}
                    >
                      {email} is not in the system. Please complete the
                      information below to create a new user.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label
                    className={`block text-sm mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    className={`block text-sm mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      theme === "dark"
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
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    theme === "dark"
                      ? "bg-gray-900 border-gray-700 text-gray-400"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } cursor-not-allowed`}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  className={`block text-sm mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              </div>

              {/* Address */}
              <div>
                <label
                  className={`block text-sm mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-teal-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              </div>

              {/* Language */}
              <div>
                <label
                  className={`block text-sm mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    theme === "dark"
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
                    theme === "dark"
                      ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                      : "border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={handleCreateAndAssign}
                  className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  + Create & Assign as Owner
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
