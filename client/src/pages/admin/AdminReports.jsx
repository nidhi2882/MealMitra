import { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

export default function AdminReports() {
    const [summary, setSummary] = useState(null);
    const [donationTrend, setDonationTrend] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);

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

    const downloadReport = async () => {
        try {
            setIsDownloading(true);
            const response = await api.get('/admin/reports/pdf', {
                responseType: 'blob', // Important for handling binary file data
            });
            
            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'MealMitra_Summary_Report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download PDF report", error);
            setError("Failed to download PDF report.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <Loader />;

    const maxCount = Math.max(1, ...donationTrend.map((m) => m.count));

    return (
        <div className="max-w-6xl mx-auto px-5 py-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10 bg-white/60 p-8 rounded-3xl border border-line shadow-sm backdrop-blur-sm">
                <div>
                    <h1 className="font-display text-4xl text-ink mb-2">Platform Reports</h1>
                    <p className="text-ink/70 text-base">Overall platform statistics, donation trends, and user growth.</p>
                </div>
                <button
                    onClick={downloadReport}
                    disabled={isDownloading}
                    className="px-6 py-3.5 bg-gradient-to-r from-accent to-[#dca255] text-white rounded-2xl text-sm font-semibold hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300 flex items-center gap-2 group"
                >
                    {isDownloading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <svg className="h-5 w-5 group-hover:-translate-y-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF Report
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-alert/10 border border-alert/30 text-alert text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Summary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-ink/70 font-medium">Total Users</div>
                        <div className="p-2 bg-surface rounded-lg group-hover:bg-accent/10 transition-colors">
                            <svg className="w-5 h-5 text-ink/50 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="font-display text-4xl text-ink font-semibold">{summary?.totalUsers ?? 0}</div>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-ink/70 font-medium">Total Donations</div>
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                    </div>
                    <div className="font-display text-4xl text-accent font-semibold">
                        {summary?.totalDonations ?? 0}
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-ink/70 font-medium">Completed Pickups</div>
                        <div className="p-2 bg-verified/10 rounded-lg">
                            <svg className="w-5 h-5 text-verified" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="font-display text-4xl text-verified font-semibold">
                        {summary?.completedPickups ?? 0}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donation trend bar chart */}
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-line shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-display text-2xl text-ink">Donation Trend</h3>
                        <div className="p-2 bg-surface rounded-full text-ink/50">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>

                    {donationTrend.length === 0 ? (
                        <div className="h-44 flex items-center justify-center border-2 border-dashed border-line rounded-2xl">
                            <p className="text-sm text-ink/50 font-medium">No donation data available yet.</p>
                        </div>
                    ) : (
                        <div className="flex items-end gap-3 h-56 pt-6 relative border-b border-line">
                            {donationTrend.map((m) => (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-3 group relative">
                                    <span className="text-xs font-semibold text-ink/80 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-white px-2 py-1 rounded shadow-md border border-line z-10">{m.count}</span>
                                    <div
                                        className="w-full bg-gradient-to-t from-accent to-[#dca255] rounded-t-lg transition-all duration-500 hover:opacity-80"
                                        style={{ height: `${(m.count / maxCount) * 100}%`, minHeight: "8px" }}
                                    />
                                    <span className="text-xs text-ink/60 font-medium">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* User breakdown */}
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-line shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-display text-2xl text-ink">User Growth</h3>
                        <div className="p-2 bg-surface rounded-full text-ink/50">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-ink/80 text-sm font-semibold uppercase tracking-wider">Restaurants & Donors</span>
                                <span className="font-display text-2xl text-ink">{userStats?.totalRestaurants ?? 0}</span>
                            </div>
                            <div className="h-3 bg-surface rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-accent to-[#dca255] rounded-full transition-all duration-1000"
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
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-ink/80 text-sm font-semibold uppercase tracking-wider">Verified NGOs</span>
                                <span className="font-display text-2xl text-ink">{userStats?.totalNGOs ?? 0}</span>
                            </div>
                            <div className="h-3 bg-surface rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-verified to-[#5c9864] rounded-full transition-all duration-1000"
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

                        <div className="pt-6 mt-4 border-t border-line/60 flex justify-between items-center bg-surface/30 p-4 rounded-xl">
                            <span className="text-ink/70 font-medium">Pending Verification Requests</span>
                            <span className="font-semibold text-white bg-pending px-3 py-1 rounded-full text-sm shadow-sm">{userStats?.pendingVerification ?? 0} Pending</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}