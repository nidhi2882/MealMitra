import { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

export default function VerifyUsers() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [decisionModal, setDecisionModal] = useState({ open: false, type: "", user: null });
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/users/pending");
            setPendingUsers(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load pending users.");
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (user, type) => {
        setDecisionModal({ open: true, type, user });
        setRemarks("");
        setError("");
    };

    const handleConfirmDecision = async (e) => {
        e.preventDefault();
        if (!decisionModal.user) return;

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            await api.put(`/admin/users/${decisionModal.user._id}/verify`, {
                decision: decisionModal.type,
                remarks: remarks.trim() || undefined,
            });

            setSuccess(`User "${decisionModal.user.name}" has been ${decisionModal.type.toLowerCase()}.`);
            setPendingUsers((prev) => prev.filter((u) => u._id !== decisionModal.user._id));
            setDecisionModal({ open: false, type: "", user: null });
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${decisionModal.type.toLowerCase()} user.`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-6xl mx-auto px-5 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl text-ink mb-1">Verify Pending Registrations</h1>
                    <p className="text-ink/60 text-sm">
                        Review and approve accounts registered by Restaurants, Event Organizers, and NGOs.
                    </p>
                </div>
                <div className="bg-surface px-4 py-2 rounded-xl border border-line text-sm text-ink/80">
                    Pending Review: <span className="font-semibold text-accent">{pendingUsers.length}</span>
                </div>
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

            {pendingUsers.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-line">
                    <div className="w-12 h-12 rounded-full bg-verified/10 text-verified flex items-center justify-center mx-auto mb-3 text-xl">
                        ✓
                    </div>
                    <h3 className="font-display text-xl text-ink mb-1">All clear!</h3>
                    <p className="text-ink/60 text-sm">There are currently no pending registration requests.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-ink">
                            <thead className="bg-surface text-ink/70 font-medium border-b border-line">
                                <tr>
                                    <th className="px-6 py-4">User / Organization</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Verification Info</th>
                                    <th className="px-6 py-4">Submitted Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {pendingUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-background/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-ink">{u.name}</div>
                                            <div className="text-xs text-ink/60">{u.email}</div>
                                            {u.organizationName || u.ngoName ? (
                                                <div className="text-xs text-accent mt-0.5 font-medium">
                                                    {u.organizationName || u.ngoName}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-surface text-ink border border-line">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-ink/80">
                                            {u.licenseNo && <div>License: <span className="font-mono">{u.licenseNo}</span></div>}
                                            {u.registrationNo && <div>Reg No: <span className="font-mono">{u.registrationNo}</span></div>}
                                            {u.location && <div>Location: {u.location}</div>}
                                            {u.eventType && <div>Event: {u.eventType}</div>}
                                            {!u.licenseNo && !u.registrationNo && !u.location && <span className="text-ink/40">N/A</span>}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-ink/60">
                                            {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleActionClick(u, "Verified")}
                                                    className="px-3.5 py-1.5 rounded-lg bg-verified text-white text-xs font-medium hover:opacity-90 transition-opacity"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleActionClick(u, "Rejected")}
                                                    className="px-3.5 py-1.5 rounded-lg bg-alert/10 text-alert border border-alert/30 text-xs font-medium hover:bg-alert hover:text-white transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal for Remarks & Confirmation */}
            {decisionModal.open && (
                <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white max-w-md w-full rounded-2xl border border-line p-6 shadow-xl space-y-4">
                        <h3 className="font-display text-xl text-ink">
                            {decisionModal.type === "Verified" ? "Approve Account" : "Reject Account"}
                        </h3>
                        <p className="text-sm text-ink/70">
                            You are about to <span className="font-semibold">{decisionModal.type.toLowerCase()}</span>{" "}
                            the account for <span className="font-medium text-ink">{decisionModal.user?.name}</span> ({decisionModal.user?.email}).
                        </p>

                        <form onSubmit={handleConfirmDecision} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-ink mb-1">
                                    Remarks / Internal Notes (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter reason or approval note..."
                                    className="w-full px-3 py-2 rounded-lg border border-line bg-white text-ink text-sm focus:border-accent focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDecisionModal({ open: false, type: "", user: null })}
                                    className="px-4 py-2 rounded-lg border border-line text-ink/70 hover:text-ink text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                                        decisionModal.type === "Verified"
                                            ? "bg-verified hover:opacity-90"
                                            : "bg-alert hover:opacity-90"
                                    }`}
                                >
                                    {submitting ? "Processing..." : `Confirm ${decisionModal.type}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
