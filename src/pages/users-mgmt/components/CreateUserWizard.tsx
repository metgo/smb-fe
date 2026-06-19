import { useState, useRef, useEffect } from "react";
import { Loader, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/store/api/userMutationApi";
import { UserRole } from "@/enums/user.types";
import { useAppSelector } from "@/hooks/hooks";
import { useCommon } from "@/hooks/useCommon";

const CREATABLE_ROLES: Partial<Record<UserRole, UserRole[]>> = {
  [UserRole.SUPERADMIN]: [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.DMO,
    UserRole.AUTHORITY,
    UserRole.TRAVELLER,
  ],
  [UserRole.ADMIN]: [
    UserRole.ADMIN,
    UserRole.DMO,
    UserRole.AUTHORITY,
    UserRole.TRAVELLER,
  ],
  [UserRole.DMO]: [UserRole.DMO, UserRole.AUTHORITY, UserRole.TRAVELLER],
  [UserRole.AUTHORITY]: [UserRole.AUTHORITY, UserRole.TRAVELLER],
};

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  role: string;
  languagePreference: string;
  authorityId: string;
  dmoId: string;
}

interface CreateUserWizardProps {
  onClose: () => void;
  editUser?: IUser | null;
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "he", label: "Hebrew" },
];

const ROLE_OPTIONS = [
  { value: UserRole.SUPERADMIN, label: "Super Admin" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.DMO, label: "DMO" },
  { value: UserRole.AUTHORITY, label: "Authority" },
  { value: UserRole.TRAVELLER, label: "Traveller" },
];

const CreateUserWizard = ({ onClose, editUser }: CreateUserWizardProps) => {
  const { isDark, borderColor } = useThemeClasses();
  const isEdit = !!editUser;

  const { userRole } = useAppSelector((state) => state.auth);
  const { dmosAuthorities } = useCommon();

  const allAuthorities = (dmosAuthorities ?? []).flatMap(
    (dmo) => dmo.authorities ?? [],
  );

  const creatableRoles =
    CREATABLE_ROLES[userRole as UserRole] ??
    ROLE_OPTIONS.map((r) => r.value as UserRole);

  const allowedRoleOptions = ROLE_OPTIONS.filter((r) =>
    creatableRoles.includes(r.value as UserRole),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dmoDropdownOpen, setDmoDropdownOpen] = useState(false);
  const [authorityDropdownOpen, setAuthorityDropdownOpen] = useState(false);
  const dmoDropdownRef = useRef<HTMLDivElement>(null);
  const authorityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dmoDropdownRef.current &&
        !dmoDropdownRef.current.contains(e.target as Node)
      ) {
        setDmoDropdownOpen(false);
      }
      if (
        authorityDropdownRef.current &&
        !authorityDropdownRef.current.contains(e.target as Node)
      ) {
        setAuthorityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollFieldIntoView = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [formData, setFormData] = useState<UserFormData>({
    firstName: editUser?.firstName ?? "",
    lastName: editUser?.lastName ?? "",
    email: editUser?.email ?? "",
    countryCode: editUser?.countryCode ?? "",
    phoneNumber: editUser?.phoneNumber ?? "",
    address: editUser?.address ?? "",
    role: editUser?.role ?? allowedRoleOptions[0]?.value ?? UserRole.TRAVELLER,
    languagePreference: editUser?.languagePreference ?? "en",
    authorityId: "",
    dmoId: "",
  });

  // For admin/superadmin who have no dmoId, let them pick a DMO to scope the authority list

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isSaving = isCreating || isUpdating;

  // The DMO used to derive the authority list
  const field =
    (key: keyof UserFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const inputClass = `w-full px-3 py-2 border rounded-lg text-sm ${
    isDark
      ? "text-white border-gray-600 placeholder-gray-500"
      : "bg-white text-black border-gray-300"
  }`;
  const labelClass = `block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const errorClass = "text-red-500 text-xs mt-1";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = "Required";
    if (!formData.lastName.trim()) e.lastName = "Required";
    if (!formData.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Invalid email";
    if (!formData.countryCode.trim()) e.countryCode = "Required";
    if (!formData.phoneNumber.trim()) e.phoneNumber = "Required";
    if (!formData.role) e.role = "Required";
    if (formData.role === UserRole.DMO && !formData.dmoId) e.dmoId = "Required";
    if (formData.role === UserRole.AUTHORITY && !formData.authorityId)
      e.authorityId = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: Record<string, string> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      countryCode: formData.countryCode,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      role: formData.role,
      languagePreference: formData.languagePreference,
    };

    if (formData.role === UserRole.DMO && formData.dmoId) {
      payload.dmoId = formData.dmoId;
    }
    if (formData.role === UserRole.AUTHORITY && formData.authorityId) {
      payload.authorityId = formData.authorityId;
    }

    try {
      if (isEdit && editUser) {
        await updateUser({ userId: editUser._id, body: payload }).unwrap();
        toast.success("User updated successfully");
      } else {
        await createUser(payload).unwrap();
        toast.success("User created successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <ModalWrapper
      onClose={onClose}
      showSpinner={isSaving}
      maxWidth="max-w-2xl"
      height="h-auto"
    >
      {/* Header */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${borderColor}`}
      >
        <h2 className={`text-xl ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          {isEdit ? "Edit User" : "Create User"}
        </h2>
      </div>

      {/* Form */}
      <div className="px-6 py-6 space-y-4 overflow-y-auto">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={field("firstName")}
              className={inputClass}
              placeholder="John"
            />
            {errors.firstName && (
              <p className={errorClass}>{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={field("lastName")}
              className={inputClass}
              placeholder="Doe"
            />
            {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={field("email")}
            className={inputClass}
            placeholder="john.doe@example.com"
            disabled={isEdit}
          />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Country Code *</label>
            <input
              type="text"
              value={formData.countryCode}
              onChange={field("countryCode")}
              className={inputClass}
              placeholder="+1"
            />
            {errors.countryCode && (
              <p className={errorClass}>{errors.countryCode}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Phone Number *</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={field("phoneNumber")}
              className={inputClass}
              placeholder="5551234567"
            />
            {errors.phoneNumber && (
              <p className={errorClass}>{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={field("address")}
            className={inputClass}
            placeholder="123 Main St, City, Country"
          />
        </div>

        {/* Role & Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Role *</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value,
                  authorityId: "",
                  dmoId: "",
                }))
              }
              className={inputClass}
            >
              {allowedRoleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.role && <p className={errorClass}>{errors.role}</p>}
          </div>
          <div>
            <label className={labelClass}>Language Preference</label>
            <select
              value={formData.languagePreference}
              onChange={field("languagePreference")}
              className={inputClass}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DMO — shown only when role is DMO */}
        {formData.role === UserRole.DMO && (
          <div ref={dmoDropdownRef}>
            <label className={labelClass}>DMO *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDmoDropdownOpen((o) => !o);
                  scrollFieldIntoView(dmoDropdownRef);
                }}
                className={`${inputClass} flex items-center justify-between gap-2 text-left`}
              >
                {formData.dmoId ? (
                  (() => {
                    const selected = dmosAuthorities?.find(
                      (d) => d._id === formData.dmoId,
                    );
                    return (
                      <span className="flex items-center gap-2">
                        {selected?.logoPath ? (
                          <img
                            src={selected.logoPath}
                            alt={selected.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                            <svg
                              className="w-3 h-3 text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                            </svg>
                          </span>
                        )}
                        {selected?.name}
                      </span>
                    );
                  })()
                ) : (
                  <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                    Select DMO...
                  </span>
                )}
                <svg
                  className={`w-4 h-4 shrink-0 transition-transform ${dmoDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dmoDropdownOpen && (
                <ul
                  className={`absolute z-50 w-full bottom-full mb-1 rounded-lg border shadow-lg max-h-52 overflow-y-auto ${
                    isDark
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {(dmosAuthorities ?? []).map((dmo) => (
                    <li
                      key={dmo._id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, dmoId: dmo._id }));
                        setDmoDropdownOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm transition-colors ${
                        formData.dmoId === dmo._id
                          ? isDark
                            ? "bg-teal-700 text-white"
                            : "bg-teal-50 text-teal-700"
                          : isDark
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {dmo.logoPath ? (
                        <img
                          src={dmo.logoPath}
                          alt={dmo.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                          <svg
                            className="w-3 h-3 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                          </svg>
                        </span>
                      )}
                      {dmo.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.dmoId && <p className={errorClass}>{errors.dmoId}</p>}
          </div>
        )}

        {/* Authority — shown only when role is Authority */}
        {formData.role === UserRole.AUTHORITY && (
          <div ref={authorityDropdownRef}>
            <label className={labelClass}>Authority *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAuthorityDropdownOpen((o) => !o);
                  scrollFieldIntoView(authorityDropdownRef);
                }}
                className={`${inputClass} flex items-center justify-between gap-2 text-left`}
              >
                {formData.authorityId ? (
                  (() => {
                    const selected = allAuthorities.find(
                      (a) => a._id === formData.authorityId,
                    );
                    return (
                      <span className="flex items-center gap-2">
                        {selected?.logoPath ? (
                          <img
                            src={selected.logoPath}
                            alt={selected.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                            <svg
                              className="w-3 h-3 text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                            </svg>
                          </span>
                        )}
                        {selected?.name}
                      </span>
                    );
                  })()
                ) : (
                  <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                    Select authority...
                  </span>
                )}
                <svg
                  className={`w-4 h-4 shrink-0 transition-transform ${authorityDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {authorityDropdownOpen && (
                <ul
                  className={`absolute z-50 w-full bottom-full mb-1 rounded-lg border shadow-lg max-h-52 overflow-y-auto ${
                    isDark
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {allAuthorities.map((a) => (
                    <li
                      key={a._id}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          authorityId: a._id,
                        }));
                        setAuthorityDropdownOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm transition-colors ${
                        formData.authorityId === a._id
                          ? isDark
                            ? "bg-teal-700 text-white"
                            : "bg-teal-50 text-teal-700"
                          : isDark
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {a.logoPath ? (
                        <img
                          src={a.logoPath}
                          alt={a.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                          <svg
                            className="w-3 h-3 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                          </svg>
                        </span>
                      )}
                      {a.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errors.authorityId && (
              <p className={errorClass}>{errors.authorityId}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`px-6 py-4 border-t flex justify-end gap-3 ${borderColor}`}
      >
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
            isDark
              ? "border-gray-700 hover:bg-gray-800 text-gray-300"
              : "border-gray-300 hover:bg-gray-100"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />{" "}
              {isEdit ? "Save Changes" : "Create User"}
            </>
          )}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default CreateUserWizard;
