import clsx from "clsx";
import type React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { ReordableDataTable } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatLastLogin, getAvatarColor } from "@/helpers";

interface UserListViewProps {
  users: IUser[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
}

const UserListView: React.FC<UserListViewProps> = ({
  users,
  isLoading,
  hasMore,
  fetchNextPage,
  onEdit,
  onDelete,
}) => {
  const { textPrimary, textSecondary, textTertiary } = useThemeClasses();

  const columns = [
    {
      key: "name",
      label: "Name",
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
      label: "Email",
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
      label: "Phone",
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
      label: "Address",
      render: (user: IUser) => (
        <span className={clsx("text-xs", textTertiary)}>{user.address}</span>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (user: IUser) => (
        <span className={clsx("text-xs", textTertiary)}>
          {formatLastLogin(user.lastLogin)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (user: IUser) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(user);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title="Edit user"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(user);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Delete user"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

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
