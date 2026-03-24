import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice.js";

const useSocket = (user) => {
    const socketRef = useRef(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user) return;

        socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true,
        });

        const socket = socketRef.current;

        // join role-based room so server can target by role
        socket.emit("join_room", user.role);

        const handle = (type) => (data) => {
            dispatch(addNotification({
                message: data.message,
                type: data.type || type,
            }));
        };

        socket.on("appointment_changed", handle("info"));
        socket.on("lab_order_new", handle("info"));
        socket.on("lab_status_changed", handle("info"));
        socket.on("lab_result_ready", handle("success"));
        socket.on("bed_status_changed", handle("info"));
        socket.on("bill_generated", handle("info"));

        return () => {
            socket.disconnect();
        };
    }, [user?._id]);  // ← depend on user._id not the whole user object

    return socketRef.current;
};

export default useSocket;