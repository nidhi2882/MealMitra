import { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

export default function AllUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (roleFilter) params.role = roleFilter;
            if (statusFilter) params.verificationStatus = statusFilter;

            const res = await api.get("/admin/users", { params });
            setUsers(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch users list.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Are you sure you want to soft-delete ${user.name}?`)) return;

        setActionLoadingId(user._id);
        setError("");
        setSuccess("");

        try {
            await api.delete(`/admin/users/${user._id}`);
            setSuccess(`User "${user.name}" soft-deleted successfully.`);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete user.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRestoreUser = async (user) => {
        setActionLoadingId(user._id);
        setError("");
        setSuccess("");

        try {
            await api.put(`/admin/users/${user._id}/restore`);
            setSuccess(`User "${user.name}" restored successfully.`);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to restore user.");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-5 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl text-ink mb-1">User Management</h1>
                    <p className="text-ink/60 text-sm">
                        View, filter, soft-delete, and restore user accounts across the platform.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-line bg-white text-sm text-ink focus:border-accent focus:outline-none"
                    >
                        <option value="">All Roles</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="EventOrganizer">Event Organizer</option>
                        <option value="NGO">NGO</option>
                        <option value="Admin">Admin</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-line bg-white text-sm text-ink focus:border-accent focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>
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

            {loading ? (
                <Loader />
            ) : users.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-line">
                    <p className="text-ink/60 text-sm">No users match the selected filter criteria.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-ink">
                            <thead className="bg-surface text-ink/70 font-medium border-b border-line">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Account State</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {users.map((u) => (
                                    <tr
                                        key={u._id}
                                        className={`transition-colors ${
                                            u.isDeleted ? "bg-alert/5 text-ink/50" : "hover:bg-background/50"
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-ink">{u.name}</div>
                                            <div className="text-xs text-ink/60">{u.email}</div>
                                            {(u.organizationName || u.ngoName) && (
                                                <div className="text-xs text-accent mt-0.5 font-medium">
                                                    {u.organizationName || u.ngoName}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-surface text-ink border border-line">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    u.verificationStatus === "Verified"
                                                        ? "bg-verified/15 text-verified"
                                                        : u.verificationStatus === "Rejected"
                                                        ? "bg-alert/15 text-alert"
                                                        : "bg-pending/15 text-pending"
                                                }`}
                                            >
                                                {u.verificationStatus || "Verified"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {u.isDeleted ? (
                                                <span className="text-alert font-medium">Deleted</span>
                                            ) : (
                                                <span className="text-verified font-medium">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== "Admin" && (
                                                <div className="flex items-center justify-end gap-2">
                                                    {u.isDeleted ? (
                                                        <button
                                                            onClick={() => handleRestoreUser(u)}
                                                            disabled={actionLoadingId === u._id}
                                                            className="px-3 py-1.5 rounded-lg border border-line bg-white text-ink text-xs font-medium hover:border-accent hover:text-accent transition-all disabled:opacity-50"
                                                        >
                                                            Restore
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDeleteUser(u)}
                                                            disabled={actionLoadingId === u._id}
                                                            className="px-3 py-1.5 rounded-lg bg-alert/10 text-alert border border-alert/30 text-xs font-medium hover:bg-alert hover:text-white transition-all disabled:opacity-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
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
