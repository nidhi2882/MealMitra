import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import DonationCard from "../../components/donation/DonationCard";
import DonationForm from "../../components/donation/DonationForm";
import IncomingRequests from "./IncomingRequests";

export default function RestaurantDashboard() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState("All");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formModal, setFormModal] = useState({ open: false, initialData: null });
    const [section, setSection] = useState("donations"); // "donations" | "incoming"

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
        <div className="max-w-6xl mx-auto px-5 py-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 bg-white/60 p-8 rounded-3xl border border-line shadow-sm backdrop-blur-sm">
                <div>
                    <h1 className="font-display text-4xl text-ink mb-2">Donor Dashboard</h1>
                    <p className="text-ink/70 text-base max-w-lg leading-relaxed">
                        Manage your surplus food donations and track incoming pickup requests from verified NGOs.
                    </p>
                </div>

                <button
                    onClick={() => setFormModal({ open: true, initialData: null })}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-accent to-[#dca255] text-white font-medium hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 text-sm flex items-center gap-2 self-start sm:self-auto group"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Post Food Listing
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

            {/* Section switcher: My Donations vs Incoming Requests */}
            <div className="flex items-center gap-2 mb-10 bg-surface/50 p-1.5 rounded-2xl w-fit border border-line shadow-inner">
                <button
                    onClick={() => setSection("donations")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        section === "donations" 
                        ? "bg-white text-ink shadow-md border-line/50" 
                        : "text-ink/60 hover:text-ink hover:bg-white/40"
                    }`}
                >
                    My Donations
                </button>
                <button
                    onClick={() => setSection("incoming")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        section === "incoming" 
                        ? "bg-white text-ink shadow-md border-line/50" 
                        : "text-ink/60 hover:text-ink hover:bg-white/40"
                    }`}
                >
                    Incoming Requests
                </button>
            </div>

            {section === "donations" ? (
                <>
                    {/* Metrics cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {/* Card 1 */}
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm text-ink/70 font-medium">Total Listed</div>
                                <div className="p-2 bg-surface rounded-lg group-hover:bg-accent/10 transition-colors">
                                    <svg className="w-5 h-5 text-ink/50 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </div>
                            </div>
                            <div className="font-display text-4xl text-ink font-semibold">{donations.length}</div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm text-ink/70 font-medium">Available Now</div>
                                <div className="p-2 bg-verified/10 rounded-lg">
                                    <svg className="w-5 h-5 text-verified" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="font-display text-4xl text-verified font-semibold">
                                {availableDonations.length}
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm text-ink/70 font-medium">In Progress</div>
                                <div className="p-2 bg-pending/10 rounded-lg">
                                    <svg className="w-5 h-5 text-pending" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="font-display text-4xl text-pending font-semibold">
                                {inProgressDonations.length}
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm text-ink/70 font-medium">Completed</div>
                                <div className="p-2 bg-accent/10 rounded-lg">
                                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="font-display text-4xl text-accent font-semibold">
                                {completedDonations.length}
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-line mb-8 pb-4">
                        {[
                            { id: "All", label: `All (${donations.length})` },
                            { id: "Available", label: `Available (${availableDonations.length})` },
                            { id: "InProgress", label: `In Progress (${inProgressDonations.length})` },
                            { id: "Completed", label: `Completed (${completedDonations.length})` },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterTab(tab.id)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                    filterTab === tab.id
                                        ? "bg-ink text-white shadow-md shadow-ink/20 transform scale-105"
                                        : "bg-white border border-line text-ink/70 hover:text-ink hover:border-ink/30 hover:bg-surface"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Listings Grid */}
                    {displayedDonations.length === 0 ? (
                        <div className="bg-white/60 backdrop-blur-sm p-16 flex flex-col items-center justify-center text-center rounded-3xl border border-line border-dashed shadow-sm">
                            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="font-display text-xl text-ink mb-2">No donations found</h3>
                            <p className="text-ink/60 text-sm max-w-sm mb-6 leading-relaxed">
                                You don't have any food listings in this view. Post a new listing to share surplus food.
                            </p>
                            <button
                                onClick={() => setFormModal({ open: true, initialData: null })}
                                className="px-6 py-3 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink/90 hover:shadow-lg transition-all duration-300"
                            >
                                Create First Listing
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
                </>
            ) : (
                <IncomingRequests />
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