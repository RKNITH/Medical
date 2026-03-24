import { useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";

// BUG FIX: original always fetched even when url was null/falsy.
// Dashboard uses useFetch(null) while waiting for a profileId — without this
// guard it fires a GET /null request that errors and fills the error state.
const useFetch = (url, params = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!!url); // start loading only if url exists
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!url) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data: res } = await api.get(url, { params });
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

export default useFetch;
