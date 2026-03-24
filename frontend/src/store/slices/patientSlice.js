import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const fetchPatients = createAsyncThunk("patients/fetchAll", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/patients", { params });
        return data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch patients.");
    }
});

export const createPatient = createAsyncThunk("patients/create", async (patientData, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/patients", patientData);
        return data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to create patient.");
    }
});

const patientSlice = createSlice({
    name: "patients",
    initialState: {
        list: [],
        total: 0,
        loading: false,
        error: null,
    },
    reducers: {
        clearPatientError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPatients.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.patients;
                state.total = action.payload.total;
            })
            .addCase(fetchPatients.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createPatient.fulfilled, (state, action) => { state.list.unshift(action.payload); state.total += 1; });
    },
});

export const { clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;