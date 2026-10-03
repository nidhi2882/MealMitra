export default function NotificationList({ notifications, loading, error, onMarkRead, onDelete, onMarkAllRead }) {
    const hasUnread = notifications.some((n) => !n.isRead);

    const formatTime = (date) =>
        new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-line shadow-lg z-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                <h3 className="font-display text-sm font-semibold text-ink">Notifications</h3>
                {hasUnread && (
                    <button
                        onClick={onMarkAllRead}
                        className="text-xs font-medium text-accent hover:underline"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <p className="text-sm text-ink/60 text-center py-6">Loading...</p>
                ) : error ? (
                    <p className="text-sm text-alert text-center py-6">{error}</p>
                ) : notifications.length === 0 ? (
                    <p className="text-sm text-ink/60 text-center py-6">No notifications yet.</p>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`px-4 py-3 border-b border-line last:border-b-0 flex items-start gap-2 ${
                                n.isRead ? "bg-white" : "bg-accent/5"
                            }`}
                        >
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${n.isRead ? "text-ink/70" : "text-ink font-medium"}`}>
                                    {n.message}
                                </p>
                                <p className="text-[11px] text-ink/40 mt-1">{formatTime(n.createdAt)}</p>
                            </div>

                            <div className="flex flex-col gap-1 shrink-0">
                                {!n.isRead && (
                                    <button
                                        onClick={() => onMarkRead(n._id)}
                                        title="Mark as read"
                                        className="w-2.5 h-2.5 rounded-full bg-accent"
                                    />
                                )}
                                <button
                                    onClick={() => onDelete(n._id)}
                                    title="Delete"
                                    className="text-ink/30 hover:text-alert text-xs leading-none"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}