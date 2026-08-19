import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef } from "react";
import { X, Crown, Landmark, MapPin, Backpack, ChevronDown } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import { ImageWithFallback } from "@/components/shared";

export interface ChatUsersFilters {
  dmoId: string;
  authorityId: string;
  role: TUserRole | "";
}

export const EMPTY_CHAT_USERS_FILTERS: ChatUsersFilters = {
  dmoId: "",
  authorityId: "",
  role: "",
};

export const countAppliedChatUsersFilters = (
  filters: ChatUsersFilters,
  locks?: { lockDmo?: boolean; lockAuthority?: boolean },
): number =>
  (filters.dmoId && !locks?.lockDmo ? 1 : 0) +
  (filters.authorityId && !locks?.lockAuthority ? 1 : 0) +
  (filters.role ? 1 : 0);

const ALL_ROLES: TUserRole[] = ["superadmin", "dmo", "authority", "traveller"];

const roleIcons: Record<TUserRole, LucideIcon> = {
  superadmin: Crown,
  authority: Landmark,
  dmo: MapPin,
  traveller: Backpack,
};

interface ChatUsersFilterDropdownProps {
  filters: ChatUsersFilters;
  onChange: (filters: ChatUsersFilters) => void;
  lockDmo?: boolean;
  lockAuthority?: boolean;
}

export const ChatUsersFilterDropdown: React.FC<ChatUsersFilterDropdownProps> = ({
  filters,
  onChange,
  lockDmo = false,
  lockAuthority = false,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    isRTL,
    borderColor,
    bgPrimary,
    textPrimary,
    textTertiary,
    hoverBg,
  } = useThemeClasses();
  const { dmosAuthorities } = useCommon();

  const [dmoOpen, setDmoOpen] = React.useState(false);
  const [authorityOpen, setAuthorityOpen] = React.useState(false);

  const selectedDmo = dmosAuthorities?.find((d) => d._id === filters.dmoId);
  const selectedAuthority = selectedDmo?.authorities?.find(
    (a) => a._id === filters.authorityId,
  );
  const appliedCount = countAppliedChatUsersFilters(filters, {
    lockDmo,
    lockAuthority,
  });

  const selectRole = (role: TUserRole) => {
    onChange({ ...filters, role: filters.role === role ? "" : role });
  };

  const handleClearAll = () => {
    onChange({
      ...EMPTY_CHAT_USERS_FILTERS,
      dmoId: lockDmo ? filters.dmoId : "",
      authorityId: lockAuthority ? filters.authorityId : "",
    });
  };

  const handleDmoChange = (dmoId: string) => {
    onChange({ ...filters, dmoId, authorityId: "" });
    setDmoOpen(false);
  };

  const handleAuthorityChange = (authorityId: string) => {
    onChange({ ...filters, authorityId });
    setAuthorityOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Roles Filter Section */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {ALL_ROLES.map((role) => {
          const RoleIcon = roleIcons[role];
          const active = filters.role === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => selectRole(role)}
              className={clsx(
                "px-2.5 py-1 text-xs font-semibold rounded-full capitalize flex items-center gap-1.5 border transition-colors cursor-pointer",
                active
                  ? "bg-teal-600 border-teal-600 text-white"
                  : clsx(
                      borderColor,
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-600 hover:bg-gray-100",
                    ),
              )}
            >
              <RoleIcon className="w-3 h-3" />
              {role}
            </button>
          );
        })}
      </div>

      {/* DMO and AUTHORITY on same line for desktop, different lines for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* DMO Section */}
        <div>
          <p
            className={clsx(
              "text-[11px] font-semibold uppercase tracking-wider mb-1.5",
              textTertiary,
            )}
          >
            {t("dmo")}
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={() => !lockDmo && setDmoOpen(!dmoOpen)}
              disabled={lockDmo}
              className={clsx(
                "w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-colors cursor-pointer",
                lockDmo ? "opacity-50 cursor-not-allowed" : "",
                dmoOpen
                  ? isDark
                    ? "border-teal-400 shadow-[0_0_0_2px_#2dd4bf]"
                    : "border-teal-500 shadow-[0_0_0_2px_#14b8a6]"
                  : borderColor,
                isDark ? "bg-gray-800" : "bg-white",
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {selectedDmo?.logoPath && (
                  <ImageWithFallback
                    src={selectedDmo.logoPath}
                    alt={selectedDmo.name}
                    className="w-6 h-6 object-contain flex-shrink-0"
                  />
                )}
                <span
                  className={clsx(
                    "truncate font-semibold",
                    selectedDmo
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-500",
                  )}
                >
                  {selectedDmo?.name || t("dmo")}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!lockDmo && selectedDmo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDmoChange("");
                    }}
                    className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X
                      size={16}
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    />
                  </button>
                )}
                <ChevronDown
                  size={20}
                  className={clsx(
                    "transition-transform duration-200",
                    dmoOpen ? "rotate-180" : "",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                />
              </div>
            </button>

            {dmoOpen && !lockDmo && (
              <div
                className={clsx(
                  "absolute left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-50",
                  isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <div className="overflow-y-auto max-h-60">
                  {dmosAuthorities?.map((dmo) => (
                    <div
                      key={dmo._id}
                      onClick={() => handleDmoChange(dmo._id)}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer",
                        filters.dmoId === dmo._id
                          ? isDark
                            ? "bg-teal-900/50 text-white"
                            : "bg-teal-50 text-gray-900"
                          : isDark
                            ? "hover:bg-gray-800 text-gray-200"
                            : "hover:bg-gray-50 text-gray-900",
                      )}
                    >
                      {dmo.logoPath && (
                        <ImageWithFallback
                          src={dmo.logoPath}
                          alt={dmo.name}
                          className="w-6 h-6 object-contain flex-shrink-0"
                        />
                      )}
                      <span className="font-semibold truncate">{dmo.name}</span>
                      {filters.dmoId === dmo._id && (
                        <span className="ml-auto text-teal-500">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AUTHORITY Section */}
        <div>
          <p
            className={clsx(
              "text-[11px] font-semibold uppercase tracking-wider mb-1.5",
              textTertiary,
            )}
          >
            {t("authority")}
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={() => !lockAuthority && selectedDmo && setAuthorityOpen(!authorityOpen)}
              disabled={lockAuthority || !selectedDmo}
              className={clsx(
                "w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm transition-colors cursor-pointer",
                lockAuthority || !selectedDmo ? "opacity-50 cursor-not-allowed" : "",
                authorityOpen
                  ? isDark
                    ? "border-teal-400 shadow-[0_0_0_2px_#2dd4bf]"
                    : "border-teal-500 shadow-[0_0_0_2px_#14b8a6]"
                  : borderColor,
                isDark ? "bg-gray-800" : "bg-white",
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {selectedAuthority?.logoPath && (
                  <ImageWithFallback
                    src={selectedAuthority.logoPath}
                    alt={selectedAuthority.name}
                    className="w-6 h-6 object-contain flex-shrink-0"
                  />
                )}
                <span
                  className={clsx(
                    "truncate font-semibold",
                    selectedAuthority
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-500",
                  )}
                >
                  {selectedAuthority?.name || t("authority")}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!lockAuthority && selectedAuthority && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAuthorityChange("");
                    }}
                    className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X
                      size={16}
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    />
                  </button>
                )}
                <ChevronDown
                  size={20}
                  className={clsx(
                    "transition-transform duration-200",
                    authorityOpen ? "rotate-180" : "",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                />
              </div>
            </button>

            {authorityOpen && !lockAuthority && selectedDmo && (
              <div
                className={clsx(
                  "absolute left-0 right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-50",
                  isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <div className="overflow-y-auto max-h-60">
                  {selectedDmo?.authorities?.map((authority) => (
                    <div
                      key={authority._id}
                      onClick={() => handleAuthorityChange(authority._id)}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer",
                        filters.authorityId === authority._id
                          ? isDark
                            ? "bg-teal-900/50 text-white"
                            : "bg-teal-50 text-gray-900"
                          : isDark
                            ? "hover:bg-gray-800 text-gray-200"
                            : "hover:bg-gray-50 text-gray-900",
                      )}
                    >
                      {authority.logoPath && (
                        <ImageWithFallback
                          src={authority.logoPath}
                          alt={authority.name}
                          className="w-6 h-6 object-contain flex-shrink-0"
                        />
                      )}
                      <span className="font-semibold truncate">{authority.name}</span>
                      {filters.authorityId === authority._id && (
                        <span className="ml-auto text-teal-500">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear All below DMO and Authority */}
      {appliedCount > 0 && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
          >
            {t("clear_all")}
          </button>
        </div>
      )}
    </div>
  );
};
