// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import api from "../../api/axios.js";

// export const loginUser = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
//     try {
//         const res = await api.post("/auth/login", data);
//         return res.data.data;
//     } catch (err) {
//         return rejectWithValue(err.response?.data?.message || "Login failed.");
//     }
// });

// export const getMe = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
//     try {
//         const res = await api.get("/auth/me");
//         return res.data.data;
//     } catch (err) {
//         return rejectWithValue(null);
//     }
// });

// export const logoutUser = createAsyncThunk("auth/logout", async () => {
//     try {
//         await api.post("/auth/logout");
//     } catch (_) { }
//     return null;
// });

// const authSlice = createSlice({
//     name: "auth",
//     initialState: {
//         user: null,
//         loading: false,
//         error: null,
//         initialized: false,
//     },
//     reducers: {
//         clearError: (state) => { state.error = null; },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(loginUser.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(loginUser.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.user = action.payload;
//                 state.initialized = true;
//             })
//             .addCase(loginUser.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//                 state.initialized = true;
//             })
//             .addCase(getMe.fulfilled, (state, action) => {
//                 state.user = action.payload;
//                 state.initialized = true;
//             })
//             .addCase(getMe.rejected, (state) => {
//                 state.user = null;
//                 state.initialized = true;
//             })
//             .addCase(logoutUser.fulfilled, (state) => {
//                 state.user = null;
//             });
//     },
// });

// export const { clearError } = authSlice.actions;
// export default authSlice.reducer;







import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const loginUser = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
    try {
        const res = await api.post("/auth/login", data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Login failed.");
    }
});

export const getMe = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
    try {
        const res = await api.get("/auth/me");
        return res.data.data;
    } catch (err) {
        return rejectWithValue(null);
    }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
    try {
        await api.post("/auth/logout");
    } catch (_) { }
    return null;
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        error: null,
        initialized: false,
    },
    reducers: {
        clearError: (state) => { state.error = null; },
        // called directly by axios interceptor for instant logout
        forceLogout: (state) => {
            state.user = null;
            state.initialized = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.initialized = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.initialized = true;
            })
            // getMe — pending keeps initialized false (shows loading, not login)
            .addCase(getMe.pending, (state) => {
                state.initialized = false;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.user = action.payload;
                state.initialized = true;
            })
            .addCase(getMe.rejected, (state) => {
                state.user = null;
                state.initialized = true;
            })
            // logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.initialized = true;
            });
    },
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;