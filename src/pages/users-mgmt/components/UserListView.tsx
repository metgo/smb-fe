import clsx from "clsx";
import type React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ReordableDataTable } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatLastLogin, getAvatarColor } from "@/helpers";
import { UserRole } from "@/enums/user.types";

interface UserListViewProps {
  users: IUser[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
  activeRole?: string;
}

const UserListView: React.FC<UserListViewProps> = ({
  users,
  isLoading,
  hasMore,
  fetchNextPage,
  onEdit,
  onDelete,
  activeRole,
}) => {
  const { t } = useTranslation("user");
  const { textPrimary, textSecondary, textTertiary } = useThemeClasses();

  const baseColumns = [
    {
      key: "name",
      label: t("name"),
      render: (user: IUser) => {
        const fullName = `${user.firstName} ${user.lastName}`;
        const initials =
          `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
        const avatarColor = getAvatarColor(fullName);
        return (
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0",
                avatarColor,
              )}
            >
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <p className={clsx("text-sm font-medium truncate", textPrimary)}>
                {fullName}
              </p>
              <span className="inline-block px-1.5 py-0.5 text-xs rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 capitalize leading-tight">
                {user.role}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      label: t("email"),
      render: (user: IUser) =>
        user.email ? (
          <a
            href={`mailto:${user.email}`}
            className={clsx(
              "text-sm truncate hover:text-teal-500 transition-colors",
              textSecondary,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {user.email}
          </a>
        ) : (
          <span className={clsx("text-sm", textTertiary)}>—</span>
        ),
    },
    {
      key: "phone",
      label: t("phone"),
      render: (user: IUser) =>
        user.phoneNumber ? (
          <a
            href={`tel:${user.countryCode}${user.phoneNumber}`}
            className={clsx(
              "text-sm hover:text-teal-500 transition-colors",
              textSecondary,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {user.countryCode} {user.phoneNumber}
          </a>
        ) : (
          <span className={clsx("text-sm", textTertiary)}>—</span>
        ),
    },
    {
      key: "address",
      label: t("address"),
      render: (user: IUser) => (
        <span className={clsx("text-xs", textTertiary)}>{user.address}</span>
      ),
    },
  ];

  const dmoColumn = {
    key: "dmo",
    label: t("dmo"),
    render: (user: IUser) =>
      user.dmo?.name ? (
        <div className="flex items-center gap-2">
          {user.dmo.logoPath && (
            <img
              src={user.dmo.logoPath}
              alt={user.dmo.name}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
          )}
          <span className={clsx("text-sm truncate", textSecondary)}>
            {user.dmo.name}
          </span>
        </div>
      ) : (
        <span className={clsx("text-sm", textTertiary)}>—</span>
      ),
  };

  const authorityColumn = {
    key: "authority",
    label: t("authority"),
    render: (user: IUser) =>
      user.authority?.name ? (
        <div className="flex items-center gap-2">
          {user.authority.logoPath && (
            <img
              src={user.authority.logoPath}
              alt={user.authority.name}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
          )}
          <span className={clsx("text-sm truncate", textSecondary)}>
            {user.authority.name}
          </span>
        </div>
      ) : (
        <span className={clsx("text-sm", textTertiary)}>—</span>
      ),
  };

  const lastLoginColumn = {
    key: "lastLogin",
    label: t("last_login"),
    render: (user: IUser) => (
      <span className={clsx("text-xs", textTertiary)}>
        {formatLastLogin(user.lastLogin)}
      </span>
    ),
  };

  const actionsColumn = {
    key: "actions",
    label: t("actions"),
    render: (user: IUser) => (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(user);
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          title={t("edit_user_action")}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(user);
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          title={t("delete_user_action")}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  };

  let columns: any[] = baseColumns;

  if (activeRole === UserRole.DMO) {
    columns = [...baseColumns, dmoColumn, lastLoginColumn, actionsColumn];
  } else if (activeRole === UserRole.AUTHORITY) {
    columns = [...baseColumns, authorityColumn, lastLoginColumn, actionsColumn];
  } else {
    columns = [...baseColumns, lastLoginColumn, actionsColumn];
  }

  return (
    <ReordableDataTable
      rowKey="_id"
      data={users}
      isDataLoading={isLoading}
      columns={columns}
      storageKey="usersTableColumnOrder"
      hasMore={hasMore}
      next={fetchNextPage}
    />
  );
};

export default UserListView;
