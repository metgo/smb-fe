import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef } from "react";
import { X, Crown, Landmark, MapPin, Backpack } from "lucide-react";

import { ReactSelect } from "@/components/form-fields";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";

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

const ALL_ROLES: TUserRole[] = ["dmo", "authority", "traveller"];

const roleIcons: Record<TUserRole, LucideIcon> = {
  superadmin: Crown,
  authority: Landmark,
  dmo: MapPin,
  traveller: Backpack,
};

interface ChatUsersFilterPopoverProps {
  filters: ChatUsersFilters;
  onChange: (filters: ChatUsersFilters) => void;
  onClose: () => void;
  // DMO users can't change their own DMO; Authority users can't change
  // either their DMO or their Authority.
  lockDmo?: boolean;
  lockAuthority?: boolean;
}

export const ChatUsersFilterPopover: React.FC<ChatUsersFilterPopoverProps> = ({
  filters,
  onChange,
  onClose,
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
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const selectedDmo = dmosAuthorities?.find((d) => d._id === filters.dmoId);
  const appliedCount = countAppliedChatUsersFilters(filters, {
    lockDmo,
    lockAuthority,
  });

  const selectRole = (role: TUserRole) => {
    onChange({ ...filters, role: filters.role === role ? "" : role });
  };

  return (
    <div
      ref={popoverRef}
      className={clsx(
        "absolute z-50 top-full mt-2 w-94 max-w-[calc(100vw-1rem)] rounded-xl border shadow-lg px-2 py-4 space-y-3",
        isRTL ? "left-0" : "right-0",
        borderColor,
        bgPrimary,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className={clsx("text-sm font-bold", textPrimary)}>
          {t("filters")}
        </h3>
        <div className="flex items-center gap-2">
          {appliedCount > 0 && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...EMPTY_CHAT_USERS_FILTERS,
                  dmoId: lockDmo ? filters.dmoId : "",
                  authorityId: lockAuthority ? filters.authorityId : "",
                })
              }
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
            >
              {t("clear_all")}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              "p-1 rounded-full cursor-pointer transition-colors",
              textTertiary,
              hoverBg,
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p
              className={clsx(
                "text-[11px] font-semibold uppercase tracking-wider mb-1.5",
                textTertiary,
              )}
            >
              {t("dmo")}
            </p>
            <ReactSelect
              value={filters.dmoId}
              onChange={(v) =>
                onChange({ ...filters, dmoId: v, authorityId: "" })
              }
              placeholder={t("dmo")}
              isClearable={!lockDmo}
              isDisabled={lockDmo}
              minWidth={0}
              items={dmosAuthorities?.map((d) => ({
                _id: d._id,
                name: d.name,
                logo: d.logoPath,
              }))}
            />
          </div>

          <div>
            <p
              className={clsx(
                "text-[11px] font-semibold uppercase tracking-wider mb-1.5",
                textTertiary,
              )}
            >
              {t("authority")}
            </p>
            <ReactSelect
              value={filters.authorityId}
              onChange={(v) => onChange({ ...filters, authorityId: v })}
              placeholder={t("authority")}
              isClearable={!lockAuthority}
              isDisabled={lockAuthority || !selectedDmo}
              minWidth={0}
              items={selectedDmo?.authorities?.map((a) => ({
                _id: a._id,
                name: a.name,
                logo: a.logoPath,
              }))}
            />
          </div>
        </div>

        <div>
          <p
            className={clsx(
              "text-[11px] font-semibold uppercase tracking-wider mb-1.5",
              textTertiary,
            )}
          >
            {t("role")}
          </p>
          <div className="flex flex-wrap gap-1.5">
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
        </div>
      </div>
    </div>
  );
};
