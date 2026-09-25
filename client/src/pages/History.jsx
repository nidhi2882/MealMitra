import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/common/Loader";

export default function History() {
    const { user } = useAuth();
    const [historyItems, setHistoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get("/history");
            setHistoryItems(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = historyItems.filter((item) => {
        const foodName = item.foodName || item.donationId?.foodName || "";
        return foodName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return <Loader />;

    return (
        <div className="max-w-5xl mx-auto px-5 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl text-ink mb-1">Completed History</h1>
                    <p className="text-ink/60 text-sm">
                        Record of all successfully completed food donations and pickups.
                    </p>
                </div>

                <div className="w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search by food name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-line bg-white text-ink text-sm placeholder:text-ink/30 focus:border-accent focus:outline-none"
                    />
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-alert/10 border border-alert/30 text-alert text-sm font-medium">
                    {error}
                </div>
            )}

            {filteredItems.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-line">
                    <p className="text-ink/60 text-sm">No completed donation records found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="divide-y divide-line">
                        {filteredItems.map((item) => {
                            const foodName = item.foodName || item.donationId?.foodName || "Food Donation";
                            const foodType = item.foodType || item.donationId?.foodType || "General";
                            const quantity = item.quantity || item.donationId?.quantity || 0;
                            const completedDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            );

                            return (
                                <div key={item._id} className="p-6 hover:bg-background/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-display text-lg text-ink font-semibold">{foodName}</h3>
                                            <span className="text-xs px-2.5 py-0.5 rounded-md bg-surface text-ink/70 font-medium">
                                                {foodType}
                                            </span>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-verified/15 text-verified font-semibold">
                                                Completed
                                            </span>
                                        </div>
                                        <p className="text-xs text-ink/60">
                                            Quantity: <span className="font-medium text-ink">{quantity} servings</span> • Completed on: {completedDate}
                                        </p>
                                        {item.pickupAddress && (
                                            <p className="text-xs text-ink/70">
                                                Pickup Location: {item.pickupAddress}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right text-xs text-ink/60">
                                        {item.ngoId?.ngoName && (
                                            <div>Claimed by: <span className="font-medium text-accent">{item.ngoId.ngoName}</span></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
