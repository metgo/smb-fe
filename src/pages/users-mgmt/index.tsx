import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ROLE_TABS } from "@/lib/utils";
import { UserRole } from "@/enums/user.types";
import EmptyState from "@/components/shared/EmptyState";
import SearchInput from "@/components/shared/SearchInput";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetUsersQuery } from "@/store/api/userQueryApi";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useDeleteUserMutation } from "@/store/api/userMutationApi";
import {
  UserCard,
  UserCardSkeleton,
  UserListView,
  CreateUserWizard,
} from "./components";
import { TabsSection, PageHeader, ViewModeToggle } from "@/components/shared";
import { useAppSelector } from "@/hooks/hooks";
import { useResetLoginAttemptMutation } from "@/store/api/authApi";
import { toast } from "sonner";

const ROLE_ORDER: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.ADMIN,
  UserRole.DMO,
  UserRole.AUTHORITY,
  UserRole.TRAVELLER,
];

const ROLE_TAB_LABEL_KEYS: Partial<Record<UserRole, string>> = {
  [UserRole.SUPERADMIN]: "super_admins_tab",
  [UserRole.ADMIN]: "admins_tab",
  [UserRole.DMO]: "dmos_tab",
  [UserRole.AUTHORITY]: "authorities_tab",
  [UserRole.TRAVELLER]: "travellers_tab",
};

const LIMIT = 1000;

const UsersMgmtPage = () => {
  const { t } = useTranslation("user");
  const { t: tt } = useTranslation("toast");

  const { userRole } = useAppSelector((state) => state.auth);

  const visibleTabs = useMemo(() => {
    const myIndex = ROLE_ORDER.indexOf(userRole as UserRole);
    const tabs =
      myIndex === -1
        ? ROLE_TABS
        : ROLE_TABS.filter(
            (tab) => ROLE_ORDER.indexOf(tab.id as UserRole) >= myIndex,
          );

    return tabs.map((tab) => ({
      ...tab,
      label: t(ROLE_TAB_LABEL_KEYS[tab.id as UserRole] ?? tab.label),
    }));
  }, [userRole, t]);

  const [activeRole, setActiveRole] = useState<UserRole>(
    () => (userRole as UserRole) ?? UserRole.SUPERADMIN,
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] = useState<"grid" | "list">(
    () => (localStorage.getItem("usersViewMode") as "grid" | "list") ?? "grid",
  );

  const [allUsers, setAllUsers] = useState<IUser[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [wizardUser, setWizardUser] = useState<IUser | null | undefined>(
    undefined,
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const { bgPrimary, textTertiary, isDark } = useThemeClasses();

  /**
   * Query
   */
  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
      role: activeRole,
      search,
    }),
    [page, activeRole, search],
  );

  const { data, isFetching, isLoading, refetch } = useGetUsersQuery(
    queryParams,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const totalData = data?.totalData ?? 0;
  const hasMore = data?.meta?.hasNextPage ?? false;

  const [deleteUser] = useDeleteUserMutation();
  const [resetLoginAttempt, { isLoading: isLoginAttemptReseting }] =
    useResetLoginAttemptMutation();

  const handleLoginAttemptReset = async (userId: string) => {
    const res = await resetLoginAttempt(userId).unwrap();
    if (res.data) {
      toast.success(tt("login_attempt_rest_success"));
      refetch();
    }
  };

  /**
   * Merge paginated users.
   * Uses meta.page from the response (not state page) so
   * data and page are always in sync, even if state page
   * incremented before the fetch resolved.
   */
  useEffect(() => {
    if (!data) {
      if (page === 1) setAllUsers([]);
      return;
    }

    const users = data.data ?? [];
    const fetchedPage = data.meta?.page ?? 1;

    if (!users.length) {
      if (fetchedPage === 1) setAllUsers([]);
      return;
    }

    setAllUsers((prev) => {
      if (fetchedPage === 1) return users;

      const existingIds = new Set(prev.map((u) => u._id));
      return [...prev, ...users.filter((u: IUser) => !existingIds.has(u._id))];
    });
  }, [data, page]);

  /**
   * Reset pagination
   */
  const resetAndFetch = useCallback((role: UserRole, q: string) => {
    setPage(1);
    setActiveRole(role);
    setSearch(q);
  }, []);

  /**
   * Reset scroll position when filters change so InfiniteScroll
   * doesn't immediately re-trigger based on the old scroll offset.
   */
  useEffect(() => {
    const el = document.getElementById("users-scroll-container");
    if (el) el.scrollTop = 0;
  }, [activeRole, search]);

  /**
   * Handlers
   */
  const handleRoleChange = (id: string) => {
    resetAndFetch(id as UserRole, search);
  };

  const handleSearchChange = (q: string) => {
    resetAndFetch(activeRole, q);
  };

  const fetchNextPage = () => {
    if (isFetching || !hasMore) return;

    setPage((prev) => prev + 1);
  };

  const handleEdit = (user: IUser) => {
    setWizardUser(user);
  };

  const handleDelete = (user: IUser) => {
    setDeleteTarget(user);
  };

  /**
   * Delete
   */
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);

      await deleteUser(deleteTarget._id).unwrap();

      setAllUsers((prev) =>
        prev.filter((user) => user._id !== deleteTarget._id),
      );

      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * States
   */
  const isInitialLoad =
    (isLoading || isFetching) && page === 1 && allUsers.length === 0;

  const isRefreshing = isFetching && page === 1 && allUsers.length > 0;

  return (
    <div
      className={`h-[calc(100vh-7rem)] flex flex-col overflow-hidden rounded-2xl px-2 pt-10 md:pt-0 ${bgPrimary}`}
    >
      {/* Header */}
      <div className="shrink-0">
        <PageHeader
          title={t("users_management")}
          h1Gradient="text-transparent bg-gradient-to-r from-teal-500 to-cyan-400"
          totalCount={totalData || undefined}
          btnLabel={t("create_user")}
          onClick={() => setWizardUser(null)}
        />

        {/* Tabs */}
        <TabsSection
          tabs={visibleTabs}
          activeTab={activeRole}
          setActiveTab={handleRoleChange}
        />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <SearchInput
              placeholder={t("search_users_placeholder")}
              searchTerm={search}
              setSearchTerm={handleSearchChange}
            />
          </div>

          <div className="flex justify-end">
            <ViewModeToggle
              value={viewMode}
              onChange={(mode) => {
                setViewMode(mode);
                localStorage.setItem("usersViewMode", mode);
              }}
              tableName="usersViewMode"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 min-h-0 mt-4 transition-opacity duration-200 ${
          isRefreshing ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {viewMode === "list" ? (
          <UserListView
            users={allUsers}
            isLoading={isInitialLoad}
            hasMore={hasMore}
            fetchNextPage={fetchNextPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            activeRole={activeRole}
            handleLoginAttemptReset={handleLoginAttemptReset}
            isLoginAttemptReseting={isLoginAttemptReseting}
          />
        ) : (
          <div id="users-scroll-container" className="h-full overflow-y-auto">
            {isInitialLoad ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <UserCardSkeleton key={i} isDark={isDark} />
                ))}
              </div>
            ) : allUsers.length === 0 ? (
              <EmptyState searchQuery={search} />
            ) : (
              <InfiniteScroll
                key={`${activeRole}-${search}`}
                dataLength={allUsers.length}
                next={fetchNextPage}
                hasMore={hasMore}
                scrollableTarget="users-scroll-container"
                loader={
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                    {Array.from({
                      length: 4,
                    }).map((_, i) => (
                      <UserCardSkeleton key={i} isDark={isDark} />
                    ))}
                  </div>
                }
                endMessage={
                  allUsers.length > LIMIT ? (
                    <p className={`text-center text-xs py-4 ${textTertiary}`}>
                      {t("all_users_loaded")}
                    </p>
                  ) : null
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allUsers?.map((user) => (
                    <UserCard
                      key={user._id}
                      user={user}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      handleLoginAttemptReset={handleLoginAttemptReset}
                      isLoginAttemptReseting={isLoginAttemptReseting}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Wizard */}
      {wizardUser !== undefined && (
        <CreateUserWizard
          editUser={wizardUser}
          onClose={() => setWizardUser(undefined)}
          onSuccess={refetch}
        />
      )}

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title={t("delete_user")}
        message={t("delete_user_confirm", {
          firstName: deleteTarget?.firstName,
          lastName: deleteTarget?.lastName,
        })}
        confirmText="delete"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UsersMgmtPage;
