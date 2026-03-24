import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import patientReducer from "./slices/patientSlice.js";
import appointmentReducer from "./slices/appointmentSlice.js";
import notificationReducer from "./slices/notificationSlice.js";

const store = configureStore({
    reducer: {
        auth: authReducer,
        patients: patientReducer,
        appointments: appointmentReducer,
        notifications: notificationReducer,
    },
});

export default store;