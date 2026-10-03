import { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

export default function AdminReports() {
    const [summary, setSummary] = useState(null);
    const [donationTrend, setDonationTrend] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");
            const [summaryRes, donationsRes, usersRes] = await Promise.all([
                api.get("/admin/reports/summary"),
                api.get("/admin/reports/donations"),
                api.get("/admin/reports/users"),
            ]);
            setSummary(summaryRes.data);
            setDonationTrend(donationsRes.data.monthly || []);
            setUserStats(usersRes.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load reports.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    const maxCount = Math.max(1, ...donationTrend.map((m) => m.count));

    return (
        <div className="max-w-6xl mx-auto px-5 py-12">
            <div className="mb-8">
                <h1 className="font-display text-3xl text-ink mb-1">Platform Reports</h1>
                <p className="text-ink/60 text-sm">Overall stats, donation trends, and user growth.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-alert/10 border border-alert/30 text-alert text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Summary stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-line shadow-sm">
                    <div className="text-xs text-ink/60 font-medium mb-1">Total Users</div>
                    <div className="font-display text-3xl text-ink font-semibold">{summary?.totalUsers ?? 0}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-line shadow-sm">
                    <div className="text-xs text-ink/60 font-medium mb-1">Total Donations</div>
                    <div className="font-display text-3xl text-accent font-semibold">
                        {summary?.totalDonations ?? 0}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-line shadow-sm">
                    <div className="text-xs text-ink/60 font-medium mb-1">Completed Pickups</div>
                    <div className="font-display text-3xl text-verified font-semibold">
                        {summary?.completedPickups ?? 0}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donation trend bar chart */}
                <div className="bg-white p-6 rounded-2xl border border-line shadow-sm">
                    <h3 className="font-display text-lg text-ink mb-4">Donation Trend</h3>

                    {donationTrend.length === 0 ? (
                        <p className="text-sm text-ink/60">No donation data yet.</p>
                    ) : (
                        <div className="flex items-end gap-3 h-44">
                            {donationTrend.map((m) => (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs font-medium text-ink">{m.count}</span>
                                    <div
                                        className="w-full bg-accent rounded-t-md transition-all"
                                        style={{ height: `${(m.count / maxCount) * 100}%`, minHeight: "4px" }}
                                    />
                                    <span className="text-xs text-ink/60">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* User breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-line shadow-sm">
                    <h3 className="font-display text-lg text-ink mb-4">User Growth & Verification</h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-ink/70">Restaurants</span>
                                <span className="font-medium text-ink">{userStats?.totalRestaurants ?? 0}</span>
                            </div>
                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full"
                                    style={{
                                        width: `${
                                            userStats?.totalRestaurants
                                                ? (userStats.totalRestaurants /
                                                      (userStats.totalRestaurants + userStats.totalNGOs || 1)) *
                                                  100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-ink/70">NGOs</span>
                                <span className="font-medium text-ink">{userStats?.totalNGOs ?? 0}</span>
                            </div>
                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-verified rounded-full"
                                    style={{
                                        width: `${
                                            userStats?.totalNGOs
                                                ? (userStats.totalNGOs /
                                                      (userStats.totalRestaurants + userStats.totalNGOs || 1)) *
                                                  100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="pt-3 border-t border-line flex justify-between text-sm">
                            <span className="text-ink/70">Pending Verification</span>
                            <span className="font-semibold text-pending">{userStats?.pendingVerification ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}