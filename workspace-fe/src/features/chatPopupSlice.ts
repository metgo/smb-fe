import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ChatPopupEntry {
  receiver: IChatUser;
  minimized: boolean;
}

interface ChatPopupState {
  popups: ChatPopupEntry[];
}

const initialState: ChatPopupState = {
  popups: [],
};

const MAX_OPEN_POPUPS = 3;

const chatPopupSlice = createSlice({
  name: "chatPopup",
  initialState,
  reducers: {
    openChatPopup: (state, action: PayloadAction<IChatUser>) => {
      const receiver = action.payload;
      const existing = state.popups.find(
        (p) => p.receiver._id === receiver._id,
      );
      if (existing) {
        existing.minimized = false;
        return;
      }
      state.popups.push({ receiver, minimized: false });
      if (state.popups.length > MAX_OPEN_POPUPS) {
        state.popups.shift();
      }
    },
    closeChatPopup: (state, action: PayloadAction<string>) => {
      state.popups = state.popups.filter(
        (p) => p.receiver._id !== action.payload,
      );
    },
    setChatPopupMinimized: (
      state,
      action: PayloadAction<{ userId: string; minimized: boolean }>,
    ) => {
      const popup = state.popups.find(
        (p) => p.receiver._id === action.payload.userId,
      );
      if (popup) popup.minimized = action.payload.minimized;
    },
    closeAllChatPopups: (state) => {
      state.popups = [];
    },
  },
});

export const {
  openChatPopup,
  closeChatPopup,
  setChatPopupMinimized,
  closeAllChatPopups,
} = chatPopupSlice.actions;

export default chatPopupSlice.reducer;
