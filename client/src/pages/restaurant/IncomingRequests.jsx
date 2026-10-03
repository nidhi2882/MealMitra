import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import Loader from "../../components/common/Loader";
import StatusTracker from "../../components/pickup/StatusTracker";

const STATUS_CLASSES = {
    Requested: "bg-pending/15 text-pending border-pending/30",
    Accepted: "bg-accent/15 text-accent border-accent/30",
    Rejected: "bg-alert/15 text-alert border-alert/30",
    "Picked Up": "bg-accent/20 text-accent border-accent/40",
    Completed: "bg-verified/20 text-verified border-verified/40",
};

export default function IncomingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actingId, setActingId] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/pickups/incoming");
            setRequests(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRespond = async (id, decision) => {
        setActingId(id);
        setError("");
        try {
            await api.put(`/pickups/${id}/respond`, { decision });
            fetchRequests();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setActingId(null);
        }
    };

    if (loading) return <Loader />;

    if (requests.length === 0) {
        return (
            <div className="bg-white p-12 text-center rounded-2xl border border-line">
                <p className="text-ink/60 text-sm">No pickup requests yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && <p className="text-sm text-alert">{error}</p>}

            {requests.map((req) => {
                const donation = req.donationId;
                const ngo = req.ngoId;

                return (
                    <div key={req._id} className="bg-white rounded-2xl border border-line p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-display text-lg font-semibold text-ink">
                                    {donation?.foodName || "Donation removed"}
                                </h3>
                                <p className="text-xs text-ink/60 mt-1">
                                    Requested by{" "}
                                    <span className="font-medium text-ink">
                                        {ngo?.ngoName || ngo?.name || "an NGO"}
                                    </span>
                                </p>
                            </div>
                            <span
                                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                                    STATUS_CLASSES[req.status] || "bg-surface text-ink"
                                }`}
                            >
                                {req.status}
                            </span>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-ink/70 border-t border-line pt-3">
                            {donation && (
                                <>
                                    <div><span className="font-medium text-ink">Quantity:</span> {donation.quantity}</div>
                                    <div><span className="font-medium text-ink">Pickup at:</span> {donation.pickupAddress}</div>
                                </>
                            )}
                            {req.pickupTime && (
                                <div>
                                    <span className="font-medium text-ink">Planned pickup:</span>{" "}
                                    {new Date(req.pickupTime).toLocaleString()}
                                </div>
                            )}
                            {req.note && <div><span className="font-medium text-ink">Note:</span> {req.note}</div>}
                            {ngo?.phone && <div><span className="font-medium text-ink">Contact:</span> {ngo.phone}</div>}
                        </div>

                        {req.status === "Requested" && (
                            <div className="mt-4 pt-4 border-t border-line flex gap-2 justify-end">
                                <button
                                    onClick={() => handleRespond(req._id, "Rejected")}
                                    disabled={actingId === req._id}
                                    className="px-4 py-1.5 rounded-lg bg-alert/10 text-alert border border-alert/30 text-xs font-medium hover:bg-alert hover:text-white transition-all disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleRespond(req._id, "Accepted")}
                                    disabled={actingId === req._id}
                                    className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {actingId === req._id ? "Processing..." : "Accept"}
                                </button>
                            </div>
                        )}

                        {["Accepted", "Picked Up", "Completed"].includes(req.status) && (
                            <StatusTracker request={req} onUpdated={fetchRequests} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}