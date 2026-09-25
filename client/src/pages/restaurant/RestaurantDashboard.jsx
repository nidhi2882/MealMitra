import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import DonationCard from "../../components/donation/DonationCard";
import DonationForm from "../../components/donation/DonationForm";

export default function RestaurantDashboard() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState("All");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formModal, setFormModal] = useState({ open: false, initialData: null });

    useEffect(() => {
        fetchMyDonations();
    }, []);

    const fetchMyDonations = async () => {
        try {
            setLoading(true);
            const res = await api.get("/donations/my-donations");
            setDonations(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load donations.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this donation listing?")) return;

        try {
            await api.delete(`/donations/${id}`);
            setSuccess("Donation listing removed successfully.");
            setDonations((prev) => prev.filter((d) => d._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete donation.");
        }
    };

    const handleEdit = (donation) => {
        setFormModal({ open: true, initialData: donation });
    };

    // Filtered lists
    const availableDonations = donations.filter((d) => d.status === "Available");
    const inProgressDonations = donations.filter((d) =>
        ["Requested", "Accepted", "Picked Up"].includes(d.status)
    );
    const completedDonations = donations.filter((d) => d.status === "Completed");

    const displayedDonations =
        filterTab === "Available"
            ? availableDonations
            : filterTab === "InProgress"
            ? inProgressDonations
            : filterTab === "Completed"
            ? completedDonations
            : donations;

    if (loading) return <Loader />;

    return (
        <div className="max-w-6xl mx-auto px-5 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl text-ink mb-1">Donor Dashboard</h1>
                    <p className="text-ink/60 text-sm">
                        Manage your surplus food donations and track incoming pickup requests.
                    </p>
                </div>

                <button
                    onClick={() => setFormModal({ open: true, initialData: null })}
                    className="px-5 py-3 rounded-xl bg-accent text-white font-medium hover:opacity-90 transition-all text-sm shadow-sm flex items-center gap-2 self-start sm:self-auto"
                >
                    <span className="text-lg leading-none">+</span> Post Food Listing
                </button>
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

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-line shadow-sm">
                    <div className="text-xs text-ink/60 font-medium mb-1">Total Listed</div>
                    <div className="font-display text-3xl text-ink font-semibold">{donations.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-line shadow-sm">
                    <div className="text-xs text-ink/60 font-medium mb-1">Available Now</div>
                    <div className="font-display text-3xl text-verified font-semibold">
                        {availableDonations.length}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-line shadow-sm">
                    <div className="text-xs text-ink/60 font-medium mb-1">In Progress</div>
                    <div className="font-display text-3xl text-pending font-semibold">
                        {inProgressDonations.length}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-line shadow-sm">
                    <div className="text-xs text-ink/60 font-medium mb-1">Completed</div>
                    <div className="font-display text-3xl text-accent font-semibold">
                        {completedDonations.length}
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-line mb-6 pb-2">
                {[
                    { id: "All", label: `All (${donations.length})` },
                    { id: "Available", label: `Available (${availableDonations.length})` },
                    { id: "InProgress", label: `In Progress (${inProgressDonations.length})` },
                    { id: "Completed", label: `Completed (${completedDonations.length})` },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterTab === tab.id
                                ? "bg-accent/10 text-accent font-semibold"
                                : "text-ink/60 hover:text-ink"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Listings Grid */}
            {displayedDonations.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-line">
                    <p className="text-ink/60 text-sm mb-4">No donation listings found in this view.</p>
                    <button
                        onClick={() => setFormModal({ open: true, initialData: null })}
                        className="px-4 py-2 rounded-lg bg-surface border border-line text-ink text-sm font-medium hover:bg-line/40 transition-colors"
                    >
                        Create your first donation
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedDonations.map((donation) => (
                        <DonationCard
                            key={donation._id}
                            donation={donation}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            currentUserId={user?.id || user?._id}
                            userRole={user?.role}
                        />
                    ))}
                </div>
            )}

            {/* Donation Form Modal */}
            <DonationForm
                open={formModal.open}
                initialData={formModal.initialData}
                onClose={() => setFormModal({ open: false, initialData: null })}
                onSuccess={() => {
                    setSuccess("Donation saved successfully!");
                    fetchMyDonations();
                }}
            />
        </div>
    );
}
