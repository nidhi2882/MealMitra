import { useState, useEffect } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// Clean Custom Tooltip for Donation Trends (Without fulfillment field)
function CustomDonationTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-line shadow-xl text-xs space-y-2 min-w-[170px]">
                <div className="font-display font-semibold text-ink text-sm border-b border-line/60 pb-1.5">
                    {data.label || label || data.month}
                </div>
                <div className="flex items-center justify-between text-ink/80 gap-3">
                    <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
                        Donations Listed:
                    </span>
                    <span className="font-bold text-accent">{data.donations ?? data.count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-ink/80 gap-3">
                    <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-verified inline-block"></span>
                        Completed Pickups:
                    </span>
                    <span className="font-bold text-verified">{data.pickups ?? data.completed ?? 0}</span>
                </div>
            </div>
        );
    }
    return null;
}

export default function AdminReports() {
    const [summary, setSummary] = useState(null);
    const [donationTrend, setDonationTrend] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [chartMode, setChartMode] = useState("bars"); // 'bars' | 'area'
    const [activeUserHover, setActiveUserHover] = useState(null);

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
            const response = await api.get("/admin/reports/pdf", {
                responseType: "blob",
            });

            // Create download link and trigger
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const dateStr = new Date().toISOString().slice(0, 10);
            link.setAttribute("download", `MealMitra_Platform_Summary_Report_${dateStr}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download PDF report", error);
            setError("Failed to download PDF report.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <Loader />;

    // Prepare chart data ensuring each item has numbers for both donations and pickups
    const formattedDonationData = donationTrend.map((d) => ({
        ...d,
        donations: d.donations ?? d.count ?? 0,
        pickups: d.pickups ?? d.completed ?? 0,
    }));

    // Prepare User Growth Donut Data
    const totalCommunity = (userStats?.totalRestaurants || 0) + (userStats?.totalNGOs || 0);
    const userDonutData = [
        {
            name: "Restaurants & Donors",
            shortName: "Restaurants",
            value: userStats?.totalRestaurants || 0,
            color: "#C98A3B",
            percentage: totalCommunity > 0 ? Math.round(((userStats?.totalRestaurants || 0) / totalCommunity) * 100) : 0,
        },
        {
            name: "Verified NGOs",
            shortName: "Verified NGOs",
            value: userStats?.totalNGOs || 0,
            color: "#4B7F52",
            percentage: totalCommunity > 0 ? Math.round(((userStats?.totalNGOs || 0) / totalCommunity) * 100) : 0,
        },
    ];

    if ((userStats?.pendingVerification || 0) > 0) {
        userDonutData.push({
            name: "Pending Verification",
            shortName: "Pending",
            value: userStats.pendingVerification,
            color: "#B08D3E",
            percentage: totalCommunity > 0 ? Math.round((userStats.pendingVerification / (totalCommunity + userStats.pendingVerification)) * 100) : 0,
        });
    }

    // Dynamic Donut Center Info (Reactive to hover, with zero overlapping boxes)
    const activeItem = activeUserHover !== null ? userDonutData[activeUserHover] : null;
    const centerCount = activeItem ? activeItem.value : (userStats?.totalUsers || totalCommunity);
    const centerTitle = activeItem ? activeItem.shortName : "Total Users";
    const centerSub = activeItem?.percentage !== undefined ? `${activeItem.percentage}% Share` : "Community";
    const centerColor = activeItem ? activeItem.color : "#1F2E1C";

    return (
        <div className="max-w-6xl mx-auto px-5 py-12 animate-fade-in">
            {/* Header section with PDF download */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10 bg-white/60 p-8 rounded-3xl border border-line shadow-sm backdrop-blur-sm">
                <div>
                    <h1 className="font-display text-4xl text-ink mb-2">Platform Reports</h1>
                    <p className="text-ink/70 text-base">Overall platform statistics, donation trends, and community growth.</p>
                </div>
                <button
                    onClick={downloadReport}
                    disabled={isDownloading}
                    className="px-6 py-3.5 bg-gradient-to-r from-accent to-[#dca255] text-white rounded-2xl text-sm font-semibold hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300 flex items-center gap-2 group"
                >
                    {isDownloading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
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

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-ink/70 font-medium">Total Users</div>
                        <div className="p-2.5 bg-surface rounded-xl group-hover:bg-accent/15 transition-colors">
                            <svg className="w-5 h-5 text-ink/60 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="font-display text-4xl text-ink font-semibold">{summary?.totalUsers ?? 0}</div>
                    <div className="text-xs text-ink/50 mt-2">Verified food donors & community NGOs</div>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-ink/70 font-medium">Total Donations</div>
                        <div className="p-2.5 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                    </div>
                    <div className="font-display text-4xl text-accent font-semibold">
                        {summary?.totalDonations ?? 0}
                    </div>
                    <div className="text-xs text-ink/50 mt-2">Total surplus food listings posted</div>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-line shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-ink/70 font-medium">Completed Pickups</div>
                        <div className="p-2.5 bg-verified/10 rounded-xl group-hover:bg-verified/20 transition-colors">
                            <svg className="w-5 h-5 text-verified" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="font-display text-4xl text-verified font-semibold">
                        {summary?.completedPickups ?? 0}
                    </div>
                    <div className="text-xs text-ink/50 mt-2">
                        Successfully completed food donation handovers
                    </div>
                </div>
            </div>

            {/* Interactive Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Interactive Donation Trends Chart */}
                <div className="bg-white/70 backdrop-blur-md p-7 rounded-3xl border border-line shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="font-display text-2xl text-ink">Donation Trend</h3>
                                <p className="text-xs text-ink/60 mt-0.5">Interactive monthly listings vs completed handovers</p>
                            </div>

                            {/* View Mode Toggle: Bar vs Area */}
                            <div className="flex items-center bg-surface p-1 rounded-xl border border-line/60 self-start sm:self-auto">
                                <button
                                    onClick={() => setChartMode("bars")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                                        chartMode === "bars"
                                            ? "bg-white text-ink shadow-sm"
                                            : "text-ink/60 hover:text-ink"
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Bars
                                </button>
                                <button
                                    onClick={() => setChartMode("area")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                                        chartMode === "area"
                                            ? "bg-white text-ink shadow-sm"
                                            : "text-ink/60 hover:text-ink"
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Trend Area
                                </button>
                            </div>
                        </div>

                        {/* Interactive Chart Container */}
                        {formattedDonationData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center border-2 border-dashed border-line rounded-2xl">
                                <p className="text-sm text-ink/50 font-medium">No donation trends logged yet.</p>
                            </div>
                        ) : (
                            <div className="h-64 w-full pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartMode === "bars" ? (
                                        <BarChart
                                            data={formattedDonationData}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4DDC9" />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fill: "#667264", fontSize: 12, fontWeight: 500 }}
                                                axisLine={{ stroke: "#E4DDC9" }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fill: "#667264", fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip content={<CustomDonationTooltip />} />
                                            <Legend
                                                wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                                                formatter={(val) => <span className="text-ink/80 font-medium">{val}</span>}
                                            />
                                            <Bar
                                                name="Donations Listed"
                                                dataKey="donations"
                                                fill="#C98A3B"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={32}
                                            />
                                            <Bar
                                                name="Completed Pickups"
                                                dataKey="pickups"
                                                fill="#4B7F52"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={32}
                                            />
                                        </BarChart>
                                    ) : (
                                        <AreaChart
                                            data={formattedDonationData}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#C98A3B" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#C98A3B" stopOpacity={0.0} />
                                                </linearGradient>
                                                <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4B7F52" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#4B7F52" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4DDC9" />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fill: "#667264", fontSize: 12, fontWeight: 500 }}
                                                axisLine={{ stroke: "#E4DDC9" }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fill: "#667264", fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip content={<CustomDonationTooltip />} />
                                            <Legend
                                                wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                                                formatter={(val) => <span className="text-ink/80 font-medium">{val}</span>}
                                            />
                                            <Area
                                                type="monotone"
                                                name="Donations Listed"
                                                dataKey="donations"
                                                stroke="#C98A3B"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#goldArea)"
                                            />
                                            <Area
                                                type="monotone"
                                                name="Completed Pickups"
                                                dataKey="pickups"
                                                stroke="#4B7F52"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#greenArea)"
                                            />
                                        </AreaChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-ink/60">
                        <span>💡 Hover over bars or curves for detailed metrics</span>
                        <span className="font-medium text-ink/80">{formattedDonationData.length} Active Periods</span>
                    </div>
                </div>

                {/* 2. Interactive User Growth & Community Distribution */}
                <div className="bg-white/70 backdrop-blur-md p-7 rounded-3xl border border-line shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-display text-2xl text-ink">User Growth</h3>
                                <p className="text-xs text-ink/60 mt-0.5">Interactive community distribution & verification status</p>
                            </div>
                            <div className="p-2.5 bg-surface rounded-xl text-ink/60">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Clean Donut with Dynamic Hub in Center (NO overlapping tooltips) */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
                            <div className="w-48 h-48 relative flex-shrink-0 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={userDonutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={74}
                                            paddingAngle={4}
                                            dataKey="value"
                                            onMouseEnter={(_, index) => setActiveUserHover(index)}
                                            onMouseLeave={() => setActiveUserHover(null)}
                                        >
                                            {userDonutData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    stroke="#FFFFFF"
                                                    strokeWidth={activeUserHover === index ? 3 : 1}
                                                    className="transition-all duration-200 cursor-pointer"
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Dynamic, Non-Overlapping Center Display */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                                    <span
                                        className="font-display text-3xl font-bold leading-none transition-colors duration-200"
                                        style={{ color: centerColor }}
                                    >
                                        {centerCount}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-ink/70 tracking-wider mt-1 transition-all duration-200">
                                        {centerTitle}
                                    </span>
                                    <span className="text-[9px] font-medium text-ink/40 mt-0.5">
                                        {centerSub}
                                    </span>
                                </div>
                            </div>

                            {/* Synchronized breakdown legend cards */}
                            <div className="flex-1 w-full space-y-3">
                                <div
                                    onMouseEnter={() => setActiveUserHover(0)}
                                    onMouseLeave={() => setActiveUserHover(null)}
                                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                        activeUserHover === 0
                                            ? "bg-accent/15 border-accent shadow-sm scale-[1.01]"
                                            : "bg-surface/50 border-line/60 hover:bg-surface"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
                                            <span className="text-xs font-semibold text-ink uppercase tracking-wider">Restaurants & Donors</span>
                                        </div>
                                        <span className="font-display text-lg font-bold text-ink">{userStats?.totalRestaurants ?? 0}</span>
                                    </div>
                                    <div className="h-2 bg-white/80 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent rounded-full transition-all duration-700"
                                            style={{
                                                width: `${totalCommunity > 0 ? ((userStats?.totalRestaurants || 0) / totalCommunity) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    onMouseEnter={() => setActiveUserHover(1)}
                                    onMouseLeave={() => setActiveUserHover(null)}
                                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                        activeUserHover === 1
                                            ? "bg-verified/15 border-verified shadow-sm scale-[1.01]"
                                            : "bg-surface/50 border-line/60 hover:bg-surface"
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-verified"></span>
                                            <span className="text-xs font-semibold text-ink uppercase tracking-wider">Verified NGOs</span>
                                        </div>
                                        <span className="font-display text-lg font-bold text-ink">{userStats?.totalNGOs ?? 0}</span>
                                    </div>
                                    <div className="h-2 bg-white/80 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-verified rounded-full transition-all duration-700"
                                            style={{
                                                width: `${totalCommunity > 0 ? ((userStats?.totalNGOs || 0) / totalCommunity) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Verification Callout */}
                        <div
                            onMouseEnter={() => setActiveUserHover(2)}
                            onMouseLeave={() => setActiveUserHover(null)}
                            className={`mt-3 p-3.5 border rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                                activeUserHover === 2
                                    ? "bg-pending/20 border-pending shadow-sm"
                                    : "bg-pending/10 border-pending/30 hover:bg-pending/15"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-pending animate-pulse"></span>
                                <span className="text-xs font-medium text-ink/80">Pending Identity Approvals</span>
                            </div>
                            <span className="text-xs font-bold text-pending bg-white px-3 py-1 rounded-full border border-pending/30 shadow-xs">
                                {userStats?.pendingVerification ?? 0} Pending
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-ink/60">
                        <span>💡 Hover over donut or cards to inspect category</span>
                        <span className="font-medium text-verified">
                            {userStats?.verifiedUsers ?? (userStats?.totalRestaurants || 0) + (userStats?.totalNGOs || 0)} Verified
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}