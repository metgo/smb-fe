import { loadUserInfo } from "@/lib/storage";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneDetails: {
    countryCode: string;
    phoneNumber: string;
  };
  dmo: {
    id: string;
    name: string;
  } | null;
  authority: {
    id: string;
    name: string;
  } | null;
}

interface ITimeFrame {
  startDate: string;
  endDate: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userRole: string;
  dmoId: string;
  authorityId: string;
  websiteId: string;
  startDate: string;
  endDate: string;
  timeFrame: string;
}

const persisted = loadUserInfo();

const initialState: AuthState = {
  isAuthenticated: persisted?.user ? true : false,
  user: persisted?.user,
  userRole: persisted?.userRole || "superadmin",
  dmoId: persisted?.dmoId ?? "",
  authorityId: persisted?.authorityId ?? "",
  websiteId: persisted?.websiteId ?? "",
  startDate: persisted?.startDate ?? "",
  endDate: persisted?.endDate ?? "",
  timeFrame: persisted?.timeFrame ?? "all_time",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.userRole = action.payload.role;
      state.dmoId = action.payload.dmo?.id || "";
      state.authorityId = action.payload.authority?.id || "";
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("user_info");
        localStorage.removeItem("access_token");
      }
    },
    setDmo: (state, action: PayloadAction<string>) => {
      state.dmoId = action.payload;

      if (!action.payload) {
        state.authorityId = "";
        state.websiteId = "";
      }
    },
    setAuthority: (state, action: PayloadAction<string>) => {
      state.authorityId = action.payload;
    },
    setWebsite: (state, action: PayloadAction<string>) => {
      state.websiteId = action.payload;
    },
    setTimeFrame: (state, action: PayloadAction<ITimeFrame>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setTimeFrameValue: (state, action: PayloadAction<string>) => {
      state.timeFrame = action.payload;
    },
  },
});

export const {
  loginSuccess,
  logout,
  setDmo,
  setAuthority,
  setWebsite,
  setTimeFrame,
  setTimeFrameValue,
} = authSlice.actions;
export default authSlice.reducer;
