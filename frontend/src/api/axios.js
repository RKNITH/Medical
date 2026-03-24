import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    // OPTIMIZATION: set a timeout so hung requests don't pile up under load
    timeout: 30000,
});

let isRefreshing = false;
let failedQueue = [];

// BUG FIX: original processQueue only called resolve() on success, but the
// queued promises were doing .then(() => api(original)) — passing no value to
// resolve is fine. However on error it rejected but never cleared isRefreshing
// properly. Restructured for clarity and correctness.
const processQueue = (error) => {
    failedQueue.forEach((p) => {
        if (error) {
            p.reject(error);
        } else {
            p.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Skip refresh logic for auth endpoints to prevent infinite loops
        const isAuthCall =
            original?.url?.includes("/auth/login") ||
            original?.url?.includes("/auth/refresh-token") ||
            original?.url?.includes("/auth/logout") ||
            original?.url?.includes("/auth/forgot-password") ||
            original?.url?.includes("/auth/reset-password") ||
            original?.url?.includes("/auth/me");

        if (error.response?.status === 401 && !original._retry && !isAuthCall) {

            if (isRefreshing) {
                // BUG FIX: queue the retry and resolve/reject when refresh finishes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(original))
                    .catch((err) => Promise.reject(err));
            }

            original._retry = true;
            isRefreshing = true;

            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                processQueue(null);
                return api(original);

            } catch (refreshError) {
                processQueue(refreshError);
                // Dispatch a custom event so the app can cleanly log out
                window.dispatchEvent(new CustomEvent("auth:logout"));
                return Promise.reject(refreshError);

            } finally {
                // BUG FIX: isRefreshing was not reset in the original catch block
                // if processQueue threw, leaving all subsequent requests permanently
                // stuck in the queue. finally() guarantees it always resets.
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
