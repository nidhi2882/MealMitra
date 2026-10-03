import { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const STATUS_CLASSES = {
    Available: "bg-verified/15 text-verified",
    Requested: "bg-pending/15 text-pending",
    Accepted: "bg-accent/15 text-accent",
    "Picked Up": "bg-accent/20 text-accent",
    Completed: "bg-verified/20 text-verified",
};

export default function ModerateDonations() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        fetchDonations();
    }, [statusFilter]);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;

            const res = await api.get("/admin/donations", { params });
            setDonations(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch donations.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (donation) => {
        if (!window.confirm(`Remove the listing "${donation.foodName}"? This cannot be undone.`)) return;

        setActionLoadingId(donation._id);
        setError("");
        setSuccess("");

        try {
            await api.delete(`/admin/donations/${donation._id}`);
            setSuccess(`Donation "${donation.foodName}" removed successfully.`);
            setDonations((prev) => prev.filter((d) => d._id !== donation._id));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove donation.");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-5 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl text-ink mb-1">Moderate Donations</h1>
                    <p className="text-ink/60 text-sm">
                        Review all donation listings platform-wide and remove invalid or expired ones.
                    </p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-line bg-white text-sm text-ink focus:border-accent focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Requested">Requested</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-alert/10 border border-alert/30 text-alert text-sm font-medium">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 rounded-xl bg-verified/10 border border-verified/30 text-verified text-sm font-medium">
                    {success}
                </div>
            )}

            {loading ? (
                <Loader />
            ) : donations.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-line">
                    <p className="text-ink/60 text-sm">No donations match the selected filter.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-ink">
                            <thead className="bg-surface text-ink/70 font-medium border-b border-line">
                                <tr>
                                    <th className="px-6 py-4">Food Item</th>
                                    <th className="px-6 py-4">Donor</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Expires</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {donations.map((d) => (
                                    <tr key={d._id} className="hover:bg-background/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-ink">{d.foodName}</div>
                                            <div className="text-xs text-ink/60">{d.foodType}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-ink">{d.donorId?.name || "—"}</div>
                                            <div className="text-xs text-ink/60">{d.donorId?.role}</div>
                                        </td>
                                        <td className="px-6 py-4">{d.quantity}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    STATUS_CLASSES[d.status] || "bg-surface text-ink"
                                                }`}
                                            >
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-ink/60">
                                            {new Date(d.expiryTime).toLocaleString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemove(d)}
                                                disabled={actionLoadingId === d._id}
                                                className="px-3 py-1.5 rounded-lg bg-alert/10 text-alert border border-alert/30 text-xs font-medium hover:bg-alert hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {actionLoadingId === d._id ? "Removing..." : "Remove"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}