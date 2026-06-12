import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  notifications: INotification[];
}

const initialState: NotificationState = {
  notifications: [],
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
  },
});

export const {
  setNotifications,
  addNotification,
  markNotificationAsRead,
  setNotificationStatus,
  markAllNotificationsAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
