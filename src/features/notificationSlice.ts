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
  },
});

export const { setNotifications, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
