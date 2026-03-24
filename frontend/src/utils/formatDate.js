import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMM yyyy");
};

export const formatDateTime = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMM yyyy, hh:mm a");
};

export const formatTime = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "hh:mm a");
};

export const timeAgo = (date) => {
    if (!date) return "N/A";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const smartDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isToday(d)) return `Today, ${format(d, "hh:mm a")}`;
    if (isYesterday(d)) return `Yesterday, ${format(d, "hh:mm a")}`;
    return format(d, "dd MMM yyyy");
};