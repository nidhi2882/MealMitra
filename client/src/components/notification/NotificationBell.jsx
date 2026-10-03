import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import NotificationList from "./NotificationList";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const wrapperRef = useRef(null);

    const fetchNotifications = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/notifications");
            setNotifications(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Initial load, then refresh every 30s so the badge stays current
    // even if the user never opens the dropdown.
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close the dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleMarkRead = async (id) => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
        try {
            await api.put(`/notifications/${id}/read`);
        } catch (err) {
            fetchNotifications(); // revert by refetching if it failed
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
            await api.put("/notifications/read-all");
        } catch (err) {
            fetchNotifications();
        }
    };

    const handleDelete = async (id) => {
        const prev = notifications;
        setNotifications((p) => p.filter((n) => n._id !== id));
        try {
            await api.delete(`/notifications/${id}`);
        } catch (err) {
            setNotifications(prev); // revert on failure
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-md hover:bg-surface transition-colors"
                aria-label="Notifications"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-ink/70"
                >
                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-alert text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <NotificationList
                    notifications={notifications}
                    loading={loading}
                    error={error}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    onMarkAllRead={handleMarkAllRead}
                />
            )}
        </div>
    );
}