import { createSlice } from "@reduxjs/toolkit";

const MAX_NOTIFICATIONS = 20;

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        list: [],
    },
    reducers: {
        addNotification: (state, action) => {
            state.list.unshift({
                id: Date.now(),
                message: action.payload.message,
                type: action.payload.type || "info",  // "info" | "success" | "error"
                read: false,
                createdAt: new Date().toISOString(),
            });
            // cap at 20 so it never grows unbounded
            if (state.list.length > MAX_NOTIFICATIONS) {
                state.list = state.list.slice(0, MAX_NOTIFICATIONS);
            }
        },
        markAsRead: (state, action) => {
            const n = state.list.find((n) => n.id === action.payload);
            if (n) n.read = true;
        },
        markAllAsRead: (state) => {
            state.list.forEach((n) => (n.read = true));
        },
        clearNotifications: (state) => {
            state.list = [];
        },
    },
});

export const {
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;