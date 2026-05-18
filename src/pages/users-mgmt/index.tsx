import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect, useCallback, useMemo } from "react";

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

const LIMIT = 1000;

const UsersMgmtPage = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.SUPERADMIN);

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

  const { data, isFetching, isLoading } = useGetUsersQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteUser] = useDeleteUserMutation();

  const totalData = data?.datas?.totalData ?? 0;

  const hasMore = data?.datas?.meta?.hasNextPage ?? false;

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

    const users = data.datas?.data ?? [];
    const fetchedPage = data.datas?.meta?.page ?? 1;

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
      className={`flex flex-col overflow-hidden rounded-2xl p-2 ${bgPrimary}`}
      style={{
        height: "calc(100vh - 112px)",
      }}
    >
      {/* Header */}
      <PageHeader
        title="Users Management"
        h1Gradient="text-transparent bg-gradient-to-r from-teal-500 to-cyan-400"
        totalCount={totalData || undefined}
        btnLabel="Create User"
        onClick={() => setWizardUser(null)}
      />

      {/* Tabs */}
      <TabsSection
        tabs={ROLE_TABS}
        activeTab={activeRole}
        setActiveTab={handleRoleChange}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mt-4 relative">
        <div className="flex-1">
          <SearchInput
            placeholder="Search users..."
            searchTerm={search}
            setSearchTerm={handleSearchChange}
          />
        </div>

        <ViewModeToggle
          value={viewMode}
          onChange={(mode) => {
            setViewMode(mode);
            localStorage.setItem("usersViewMode", mode);
          }}
          tableName="usersViewMode"
        />
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
                      All users loaded
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
        />
      )}

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UsersMgmtPage;
