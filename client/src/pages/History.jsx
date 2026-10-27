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
    const [downloadingId, setDownloadingId] = useState(null);

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

    const downloadReceipt = async (recordId, foodName) => {
        try {
            setDownloadingId(recordId);
            setError("");
            const response = await api.get(`/history/${recordId}/certificate`, {
                responseType: "blob",
            });

            // Trigger file download
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const safeName = (foodName || "Donation").replace(/[^a-zA-Z0-9_-]/g, "_");
            link.setAttribute("download", `MealMitra_Receipt_${safeName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download receipt", err);
            setError("Failed to download donation receipt. Please try again.");
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredItems = historyItems.filter((item) => {
        const foodName = item.foodName || item.donationId?.foodName || "";
        return foodName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return <Loader />;

    return (
        <div className="max-w-5xl mx-auto px-5 py-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl text-ink mb-1">Completed History</h1>
                    <p className="text-ink/60 text-sm">
                        Record of all successfully completed food donations, handovers, and certified receipts.
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
                            const completedDate = new Date(item.completedAt || item.updatedAt || item.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            );

                            const partnerText = item.ngoId?.ngoName || item.ngoId?.name
                                ? `Claimed by: ${item.ngoId.ngoName || item.ngoId.name}`
                                : item.donationId?.donorId?.organizationName || item.donationId?.donorId?.name
                                ? `Donated by: ${item.donationId?.donorId?.organizationName || item.donationId?.donorId?.name}`
                                : null;

                            return (
                                <div key={item._id} className="p-6 hover:bg-background/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3 flex-wrap">
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
                                        {(item.pickupAddress || item.donationId?.pickupAddress) && (
                                            <p className="text-xs text-ink/70">
                                                Pickup Location: {item.pickupAddress || item.donationId?.pickupAddress}
                                            </p>
                                        )}
                                        {partnerText && (
                                            <p className="text-xs font-medium text-accent">
                                                {partnerText}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center sm:flex-col sm:items-end gap-3 shrink-0">
                                        <button
                                            onClick={() => downloadReceipt(item._id, foodName)}
                                            disabled={downloadingId === item._id}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent text-accent hover:text-white text-xs font-semibold transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group"
                                            title="Download Official MealMitra Handover Receipt"
                                        >
                                            {downloadingId === item._id ? (
                                                <>
                                                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Generating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5 text-accent group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span>Receipt PDF</span>
                                                </>
                                            )}
                                        </button>
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
