import { useState } from "react";
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

        {/* Authority — shown only when role is Authority */}
        {formData.role === UserRole.AUTHORITY && (
          <div>
            <label className={labelClass}>Authority *</label>
            <select
              value={formData.authorityId}
              onChange={field("authorityId")}
              className={inputClass}
            >
              <option value="">Select authority...</option>
              {allAuthorities.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
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
