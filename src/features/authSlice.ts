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
  dmo: string | null;
  authority: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

const getInitialAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null };
  }

  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const user: User = JSON.parse(storedUser);

    return {
      isAuthenticated: true,
      user,
    };
  } catch {
    return { isAuthenticated: false, user: null };
  }
};

const initialState: AuthState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("userData");
        localStorage.removeItem("user");
      }
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
