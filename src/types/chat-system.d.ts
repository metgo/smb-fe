interface IChatUser {
  _id: string;
  name: string;
  email: string;
  role: TUserRole;
  dmoId?: string;
  authorityId?: string;
}

interface IChatUsersRes extends IPagination {
  data: IChatUser[];
}
