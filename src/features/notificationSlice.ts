// src/features/notificationSlice.ts
import type { Notification, NotificationState } from "@/types/notifications";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// interface Notification {
//   _id: string;
//   title: string;
//   message: string;
//   notifType: string;
//   status: string;
//   item: {
//     itemType: string;
//   };
//   authority: {
//     _id: string;
//     name: string;
//   };
//   dmo?: {
//     _id: string;
//     name: string;
//   };
//   actionedBy: {
//     _id: string;
//     name: string;
//     email: string;
//   };
//   actionedAt: string; // ISO date string
// }

// interface NotificationState {
//   notifications: Notification[];
// }

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Called when new notification arrives via socket
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
  },
});

export const { addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
