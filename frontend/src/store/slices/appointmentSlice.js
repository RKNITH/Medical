import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const fetchAppointments = createAsyncThunk("appointments/fetchAll", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/appointments", { params });
        return data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments.");
    }
});

export const createAppointment = createAsyncThunk("appointments/create", async (appointmentData, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/appointments", appointmentData);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to create appointment.");
    }
});

const appointmentSlice = createSlice({
    name: "appointments",
    initialState: {
        list: [],
        total: 0,
        loading: false,
        error: null,
    },
    reducers: {
        clearAppointmentError: (state) => { state.error = null; },
        updateAppointmentInList: (state, action) => {
            const index = state.list.findIndex((a) => a._id === action.payload._id);
            if (index !== -1) state.list[index] = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAppointments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAppointments.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.appointments;
                state.total = action.payload.total;
            })
            .addCase(fetchAppointments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createAppointment.fulfilled, (state, action) => { state.list.unshift(action.payload); state.total += 1; });
    },
});

export const { clearAppointmentError, updateAppointmentInList } = appointmentSlice.actions;
export default appointmentSlice.reducer;