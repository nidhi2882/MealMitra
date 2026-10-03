import { useState } from "react";
import api, { getErrorMessage } from "../../services/api";

const STEPS = ["Requested", "Accepted", "Picked Up", "Completed"];

export default function StatusTracker({ request, onUpdated }) {
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    if (request.status === "Rejected") {
        return <div className="mt-3 text-xs font-medium text-alert">This request was rejected.</div>;
    }

    const currentIndex = STEPS.indexOf(request.status);
    const nextStatus =
        request.status === "Accepted" ? "Picked Up" : request.status === "Picked Up" ? "Completed" : null;

    const handleAdvance = async () => {
        if (!nextStatus) return;
        setError("");
        setUpdating(true);
        try {
            await api.put(`/pickups/${request._id}/status`, { status: nextStatus });
            onUpdated?.();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-line">
            <div className="flex items-center">
                {STEPS.map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 ${
                                    i <= currentIndex
                                        ? "bg-accent border-accent text-white"
                                        : "bg-white border-line text-ink/40"
                                }`}
                            >
                                {i < currentIndex ? "✓" : i + 1}
                            </div>
                            <span
                                className={`text-[10px] font-medium whitespace-nowrap ${
                                    i <= currentIndex ? "text-ink" : "text-ink/40"
                                }`}
                            >
                                {step}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 ${i < currentIndex ? "bg-accent" : "bg-line"}`} />
                        )}
                    </div>
                ))}
            </div>

            {error && <p className="text-xs text-alert mt-2">{error}</p>}

            {nextStatus && (
                <button
                    onClick={handleAdvance}
                    disabled={updating}
                    className="mt-3 w-full px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {updating ? "Updating..." : `Mark as ${nextStatus}`}
                </button>
            )}
        </div>
    );
}