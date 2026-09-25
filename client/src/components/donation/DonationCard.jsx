import React from "react";

const STATUS_CLASSES = {
    Available: "bg-verified/15 text-verified border-verified/30",
    Requested: "bg-pending/15 text-pending border-pending/30",
    Accepted: "bg-accent/15 text-accent border-accent/30",
    "Picked Up": "bg-accent/20 text-accent border-accent/40",
    Completed: "bg-verified/20 text-verified border-verified/40",
    Cancelled: "bg-alert/15 text-alert border-alert/30",
};

export default function DonationCard({ donation, onEdit, onDelete, onRequest, currentUserId, userRole }) {
    const isOwner = donation.donorId?._id === currentUserId || donation.donorId === currentUserId;
    const isAvailable = donation.status === "Available";

    const formattedExpiry = new Date(donation.expiryTime).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });

    const isExpired = new Date(donation.expiryTime) <= new Date();

    return (
        <div className="bg-white rounded-2xl border border-line p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                {/* Header: Title & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <h3 className="font-display text-lg font-semibold text-ink leading-snug">
                            {donation.foodName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface text-ink/70 font-medium">
                                {donation.foodType}
                            </span>
                            <span className="text-xs text-ink/60 font-medium">
                                {donation.quantity} servings
                            </span>
                        </div>
                    </div>

                    <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            STATUS_CLASSES[donation.status] || "bg-surface text-ink"
                        }`}
                    >
                        {donation.status}
                    </span>
                </div>

                {/* Description */}
                {donation.description && (
                    <p className="text-sm text-ink/70 mb-4 line-clamp-2">{donation.description}</p>
                )}

                {/* Metadata details */}
                <div className="space-y-1.5 text-xs text-ink/70 border-t border-line pt-3 mb-4">
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium text-ink">Expires:</span>
                        <span className={isExpired ? "text-alert font-medium" : ""}>{formattedExpiry}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium text-ink">Pickup:</span>
                        <span className="truncate">{donation.pickupAddress}</span>
                    </div>
                    {donation.donorId?.organizationName && (
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium text-ink">Donor:</span>
                            <span>{donation.donorId.organizationName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-line pt-3 flex items-center justify-end gap-2">
                {isOwner && isAvailable && (
                    <>
                        <button
                            onClick={() => onEdit(donation)}
                            className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(donation._id)}
                            className="px-3 py-1.5 rounded-lg bg-alert/10 text-alert border border-alert/30 text-xs font-medium hover:bg-alert hover:text-white transition-all"
                        >
                            Delete
                        </button>
                    </>
                )}

                {/* NGO action hook (used by Jiya in Topic 5) */}
                {userRole === "NGO" && isAvailable && onRequest && (
                    <button
                        onClick={() => onRequest(donation)}
                        className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                        Request Pickup
                    </button>
                )}
            </div>
        </div>
    );
}
