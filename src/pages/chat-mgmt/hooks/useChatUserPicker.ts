import { useEffect, useRef, useState } from "react";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useChatUsersQuery } from "@/store/api/chatSystemApi";
import { CHAT_USERS_PAGE_LIMIT } from "../components/sub-components";
import {
  EMPTY_CHAT_USERS_FILTERS,
  countAppliedChatUsersFilters,
  type ChatUsersFilters,
} from "../components/ChatUsersFilterPopover";

// Server-side search/filter/pagination over /chats/users, shared by every
// "pick members" surface (New Group, New Broadcast) so they behave like the
// main chats sidebar instead of filtering a locally-loaded page of users.
export function useChatUserPicker(
  currentUser: IChatUser | null,
  isOpen: boolean,
) {
  const lockDmo =
    currentUser?.role === "dmo" || currentUser?.role === "authority";
  const lockAuthority = currentUser?.role === "authority";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [filters, setFilters] = useState<ChatUsersFilters>(() => ({
    ...EMPTY_CHAT_USERS_FILTERS,
    dmoId: lockDmo ? currentUser?.dmoId || "" : "",
    authorityId: lockAuthority ? currentUser?.authorityId || "" : "",
  }));

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<IChatUser[]>([]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.dmoId, filters.authorityId, filters.role]);

  // Modals stay mounted while closed (visibility is just `isOpen`) - reset
  // the picker each time it opens instead of leaking the previous session's
  // search/filters/selection state into the next one.
  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setDebouncedSearch("");
    setShowFilterPopover(false);
    setPage(1);
  }, [isOpen]);

  const {
    data: usersRes,
    isFetching,
    isError,
  } = useChatUsersQuery(
    {
      page,
      limit: CHAT_USERS_PAGE_LIMIT,
      search:
        debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined,
      dmoId: filters.dmoId || undefined,
      authorityId: filters.authorityId || undefined,
      role: filters.role ? [filters.role] : undefined,
    },
    { skip: !isOpen },
  );

  useEffect(() => {
    if (!usersRes) return;
    const resPage = Array.isArray(usersRes) ? 1 : usersRes?.meta?.page;
    const newUsers = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];

    if (!resPage || resPage === 1) {
      setUsers(newUsers);
    } else {
      setUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u._id));
        const uniqueNewUsers = newUsers.filter((u) => !existingIds.has(u._id));
        return [...prev, ...uniqueNewUsers];
      });
    }
  }, [usersRes]);

  const hasMore =
    !isError && !Array.isArray(usersRes) && !!usersRes?.meta?.hasNextPage;

  const listRef = useRef<HTMLDivElement | null>(null);
  const fetchMore = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  };
  useInfiniteScroll({
    ref: listRef,
    hasMore,
    isLoading: isFetching,
    onLoadMore: fetchMore,
  });

  const appliedFilterCount = countAppliedChatUsersFilters(filters, {
    lockDmo,
    lockAuthority,
  });

  return {
    users,
    isFetching,
    listRef,
    search,
    setSearch,
    filters,
    setFilters,
    showFilterPopover,
    setShowFilterPopover,
    appliedFilterCount,
    lockDmo,
    lockAuthority,
  };
}
