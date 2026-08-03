import { useState, useRef, useEffect } from "react";
import { Loader, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/store/api/userMutationApi";
import { UserRole } from "@/enums/user.types";
import { useAppSelector } from "@/hooks/hooks";
import { useCommon } from "@/hooks/useCommon";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { useUserRoles } from "@/hooks/useUserRoles";

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
  // Authority users may create Authority users, but only within their own
  // authority — the picker below locks the authority to their own.
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
  onSuccess?: () => void;
}

const LANGUAGE_OPTIONS = [
  { value: "en", labelKey: "lang_english" },
  { value: "ar", labelKey: "lang_arabic" },
  { value: "he", labelKey: "lang_hebrew" },
];

const ROLE_OPTIONS = [
  { value: UserRole.SUPERADMIN, labelKey: "role_super_admin" },
  { value: UserRole.ADMIN, labelKey: "role_admin" },
  { value: UserRole.DMO, labelKey: "role_dmo" },
  { value: UserRole.AUTHORITY, labelKey: "role_authority" },
  { value: UserRole.TRAVELLER, labelKey: "role_traveller" },
];

const CreateUserWizard = ({
  onClose,
  editUser,
  onSuccess,
}: CreateUserWizardProps) => {
  const { t } = useTranslation("user");
  const { isSuperadmin } = useUserRoles();

  const { isDark, borderColor } = useThemeClasses();
  const isEdit = !!editUser;

  const { userRole, user } = useAppSelector((state) => state.auth);
  const { dmosAuthorities } = useCommon();

  const allAuthorities = (dmosAuthorities ?? []).flatMap(
    (dmo) => dmo.authorities ?? [],
  );

  // An Authority user may only create Authority users within their own
  // authority, so the authority picker is locked to their own authority
  // instead of listing every authority in the system.
  const isAuthorityCaller =
    userRole === UserRole.AUTHORITY || userRole === UserRole.AUTHORITY_ADMIN;
  const ownAuthorityId = user?.authority?.id ?? "";

  const getDefaultAuthorityId = (role: string) =>
    isAuthorityCaller && role === UserRole.AUTHORITY ? ownAuthorityId : "";

  const creatableRoles =
    CREATABLE_ROLES[userRole as UserRole] ??
    ROLE_OPTIONS.map((r) => r.value as UserRole);

  const allowedRoleOptions = ROLE_OPTIONS.filter((r) =>
    creatableRoles.includes(r.value as UserRole),
  );

  const [formData, setFormData] = useState<UserFormData>({
    firstName: editUser?.firstName ?? "",
    lastName: editUser?.lastName ?? "",
    email: editUser?.email ?? "",
    countryCode: editUser?.countryCode ?? "",
    phoneNumber: editUser?.phoneNumber ?? "",
    address: editUser?.address ?? "",
    role: editUser?.role ?? allowedRoleOptions[0]?.value ?? UserRole.TRAVELLER,
    languagePreference: editUser?.languagePreference ?? "en",
    authorityId:
      editUser?.authority?._id ??
      getDefaultAuthorityId(
        editUser?.role ?? allowedRoleOptions[0]?.value ?? UserRole.TRAVELLER,
      ),
    dmoId: editUser?.dmo?._id ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dmoDropdownOpen, setDmoDropdownOpen] = useState(false);
  const [authorityDropdownOpen, setAuthorityDropdownOpen] = useState(false);
  const dmoDropdownRef = useRef<HTMLDivElement>(null);
  const authorityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editUser) {
      setFormData({
        firstName: editUser.firstName ?? "",
        lastName: editUser.lastName ?? "",
        email: editUser.email ?? "",
        countryCode: editUser.countryCode ?? "",
        phoneNumber: editUser.phoneNumber ?? "",
        address: editUser.address ?? "",
        role: editUser.role ?? UserRole.TRAVELLER,
        languagePreference: editUser.languagePreference ?? "en",
        authorityId: editUser.authority?._id ?? "",
        dmoId: editUser.dmo?._id ?? "",
      });
    }
  }, [editUser]);

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
      ? "text-white border-gray-600 placeholder-gray-500 bg-gray-900"
      : "bg-white text-black border-gray-300"
  }`;
  const disabledInputClass = `w-full px-3 py-2 border rounded-lg text-sm ${
    isDark
      ? "text-gray-500 border-gray-700 placeholder-gray-600 bg-gray-800 cursor-not-allowed"
      : "bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed"
  }`;
  const labelClass = `block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const errorClass = "text-red-500 text-xs mt-1";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = t("required");
    if (!formData.lastName.trim()) e.lastName = t("required");
    if (!formData.email.trim()) e.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = t("invalid_email");
    if (!formData.countryCode.trim()) e.countryCode = t("required");
    if (!formData.phoneNumber.trim()) e.phoneNumber = t("required");
    if (!formData.role) e.role = t("required");
    if (formData.role === UserRole.DMO && !formData.dmoId)
      e.dmoId = t("required");
    if (formData.role === UserRole.AUTHORITY && !formData.authorityId)
      e.authorityId = t("required");
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
      languagePreference: formData.languagePreference,
    };

    if (!isEdit) {
      payload.role = formData.role;

      if (formData.role === UserRole.DMO && formData.dmoId) {
        payload.dmoId = formData.dmoId;
      }

      if (formData.role === UserRole.AUTHORITY && formData.authorityId) {
        payload.authorityId = formData.authorityId;
      }
    } else {
      // Allow Super Admin to change role while editing
      if (isSuperadmin) {
        payload.role = formData.role;
      }

      switch (formData.role) {
        case UserRole.DMO:
          if (formData.dmoId) {
            payload.dmoId = formData.dmoId;
          }
          break;

        case UserRole.AUTHORITY:
          if (formData.authorityId) {
            payload.authorityId = formData.authorityId;
          }
          break;
      }

      // Optional: if backend expects empty values when changing role
      if (formData.role !== UserRole.DMO) {
        payload.dmoId = "";
      }

      if (formData.role !== UserRole.AUTHORITY) {
        payload.authorityId = "";
      }
    }

    try {
      if (isEdit && editUser) {
        await updateUser({
          userId: editUser._id,
          body: payload,
        }).unwrap();

        toast.success(t("user_updated_success"));

        onSuccess?.();

        setTimeout(() => {
          onClose();
        }, 50);
      } else {
        await createUser(payload).unwrap();

        toast.success(t("user_created_success"));

        onSuccess?.();

        onClose();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || t("something_went_wrong"));
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
          {isEdit ? t("edit_user") : t("create_user")}
        </h2>
      </div>

      {/* Form */}
      <div className="px-6 py-6 space-y-4 overflow-y-auto">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("first_name")} *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={field("firstName")}
              className={inputClass}
              placeholder={t("first_name_placeholder")}
            />
            {errors.firstName && (
              <p className={errorClass}>{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>{t("last_name")} *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={field("lastName")}
              className={inputClass}
              placeholder={t("last_name_placeholder")}
            />
            {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>
            {t("email")} *{" "}
            {isEdit && (
              <span className="text-xs text-gray-500">{t("locked")}</span>
            )}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={field("email")}
            className={isEdit ? disabledInputClass : inputClass}
            placeholder={t("email_placeholder")}
            disabled={isEdit}
          />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">
              {t("email_locked_hint")}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>{t("country_code")} *</label>
            <input
              type="text"
              value={formData.countryCode}
              onChange={field("countryCode")}
              className={inputClass}
              placeholder={t("country_code_placeholder")}
            />
            {errors.countryCode && (
              <p className={errorClass}>{errors.countryCode}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className={labelClass}>{t("phone_number")} *</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={field("phoneNumber")}
              className={inputClass}
              placeholder={t("phone_number_placeholder")}
            />
            {errors.phoneNumber && (
              <p className={errorClass}>{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>{t("address")}</label>
          <input
            type="text"
            value={formData.address}
            onChange={field("address")}
            className={inputClass}
            placeholder={t("address_placeholder")}
          />
        </div>

        {/* Role & Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              {t("role")} *{" "}
              {isEdit && !isSuperadmin && (
                <span className="text-xs text-gray-500">{t("locked")}</span>
              )}
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                if (!isEdit || isSuperadmin) {
                  const nextRole = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    role: nextRole,
                    authorityId: getDefaultAuthorityId(nextRole),
                    dmoId: "",
                  }));
                }
              }}
              disabled={isEdit && !isSuperadmin}
              className={
                isEdit && !isSuperadmin ? disabledInputClass : inputClass
              }
            >
              {allowedRoleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.labelKey)}
                </option>
              ))}
            </select>
            {errors.role && <p className={errorClass}>{errors.role}</p>}
            {isEdit && !isSuperadmin && (
              <p className="text-xs text-gray-500 mt-1">
                {t("role_locked_hint")}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>{t("language_preference")}</label>
            <select
              value={formData.languagePreference}
              onChange={field("languagePreference")}
              className={inputClass}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {t(l.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DMO — shown only when role is DMO */}
        {formData.role === UserRole.DMO && (
          <div ref={dmoDropdownRef}>
            <label className={labelClass}>{t("dmo")} *</label>
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
                    const dmoData = selected || editUser?.dmo;
                    return (
                      <span className="flex items-center gap-2">
                        <ImageWithFallback
                          src={dmoData?.logoPath}
                          alt={dmoData?.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        {dmoData?.name}
                      </span>
                    );
                  })()
                ) : (
                  <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                    {t("select_dmo_placeholder")}
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
                      <ImageWithFallback
                        src={dmo.logoPath}
                        alt={dmo.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
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
            <label className={labelClass}>
              {t("authority")} *{" "}
              {isAuthorityCaller && (
                <span className="text-xs text-gray-500">{t("locked")}</span>
              )}
            </label>
            {isAuthorityCaller ? (
              <div className={disabledInputClass}>
                <span className="flex items-center gap-2">
                  <ImageWithFallback
                    src={undefined}
                    alt={user?.authority?.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                  {user?.authority?.name}
                </span>
              </div>
            ) : (
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
                      const authorityData = selected || editUser?.authority;
                      return (
                        <span className="flex items-center gap-2">
                          <ImageWithFallback
                            src={authorityData?.logoPath}
                            alt={authorityData?.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                          {authorityData?.name}
                        </span>
                      );
                    })()
                  ) : (
                    <span
                      className={isDark ? "text-gray-500" : "text-gray-400"}
                    >
                      {t("select_authority_placeholder")}
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
                        <ImageWithFallback
                          src={a.logoPath}
                          alt={a.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        {a.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
          {t("cancel")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> {t("saving")}
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />{" "}
              {isEdit ? t("save_changes") : t("create_user")}
            </>
          )}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default CreateUserWizard;
