import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";
import "./ngo.css";

const STATUS_FILTERS = ["All", "Requested", "Accepted", "Rejected", "Picked Up", "Completed"];

export default function NgoDashboard() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/pickups/my-requests");
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

    const countBy = (status) => requests.filter((r) => r.status === status).length;

    const visible =
        statusFilter === "All" ? requests : requests.filter((r) => r.status === statusFilter);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Welcome{user?.name ? `, ${user.name}` : ""}</h1>
                    <p className="muted">Track the pickup requests you've sent.</p>
                </div>
                <Link to="/ngo/browse" className="btn btn-primary">
                    Browse donations
                </Link>
            </div>

            <div className="stat-row">
                <div className="stat-card"><span>{requests.length}</span>Total</div>
                <div className="stat-card"><span>{countBy("Requested")}</span>Pending</div>
                <div className="stat-card"><span>{countBy("Accepted")}</span>Accepted</div>
                <div className="stat-card"><span>{countBy("Completed")}</span>Completed</div>
            </div>

            <div className="tabs">
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        className={`tab ${statusFilter === s ? "active" : ""}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {error && <p className="error">{error}</p>}

            {loading ? (
                <Loader />
            ) : visible.length === 0 ? (
                <p className="muted">
                    {requests.length === 0
                        ? "You haven't requested any pickups yet."
                        : `No requests with status "${statusFilter}".`}
                </p>
            ) : (
                <div className="request-list">
                    {visible.map((req) => {
                        const donation = req.donationId; // populated by the backend
                        return (
                            <div className="request-card" key={req._id}>
                                <div className="card-header">
                                    <h3>{donation?.foodName || "Donation removed"}</h3>
                                    <span className={`badge badge-${req.status.toLowerCase().replace(" ", "-")}`}>
                                        {req.status}
                                    </span>
                                </div>

                                {donation && (
                                    <ul className="card-meta">
                                        <li><strong>Quantity:</strong> {donation.quantity}</li>
                                        <li><strong>Pickup at:</strong> {donation.pickupAddress}</li>
                                    </ul>
                                )}
                                {req.pickupTime && (
                                    <p><strong>Planned pickup:</strong> {new Date(req.pickupTime).toLocaleString()}</p>
                                )}
                                {req.note && <p className="muted">Note: {req.note}</p>}
                                <p className="muted">
                                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                                </p>

                                {/* Topic 6: drop <StatusTracker request={req} onUpdated={fetchRequests} /> here */}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}