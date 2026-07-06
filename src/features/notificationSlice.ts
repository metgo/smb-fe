import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<INotification[]>) => {
      state.notifications = action.payload;
    },

    addNotification: (state, action: PayloadAction<INotification>) => {
      state.notifications.unshift(action.payload);
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    incrementUnreadCount: (state) => {
      state.unreadCount = Math.min(state.unreadCount + 1, 999);
    },

    decrementUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(state.unreadCount - action.payload, 0);
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload,
      );

      if (notification) {
        notification.isRead = true;
      }
    },

    setNotificationStatus: (
      state,
      action: PayloadAction<{ notificationId: string; status: TItemStatus }>,
    ) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload.notificationId,
      );

      if (notification) {
        notification.status = action.payload.status;
        notification.isRead = true;
      }
    },

    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
    },

    updateNotificationStatus: (
      state,
      action: PayloadAction<{ notificationId: string; status: TItemStatus }>,
    ) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload.notificationId,
      );
      if (notification) {
        notification.status = action.payload.status;
      }
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markNotificationAsRead,
  setNotificationStatus,
  markAllNotificationsAsRead,
  updateNotificationStatus,
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
