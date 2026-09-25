import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Profile from "../pages/auth/Profile";
import VerifyUsers from "../pages/admin/VerifyUsers";
import AllUsers from "../pages/admin/AllUsers";
import RestaurantDashboard from "../pages/restaurant/RestaurantDashboard";
import History from "../pages/History";

// --- Placeholder pages for Jiya's upcoming topics (Topics 5, 6, 7, 8) ---
function Placeholder({ title }) {
    return (
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
            <h1 className="font-display text-3xl text-ink mb-2">{title}</h1>
            <p className="text-ink/60">This page will be implemented in Jiya's topics.</p>
        </div>
    );
}

function Home() {
    return (
        <div className="max-w-3xl mx-auto px-5 py-20 text-center">
            <h1 className="font-display text-4xl text-ink mb-3">MealMitra</h1>
            <p className="text-ink/70 mb-8">Connecting surplus food with the people who need it.</p>
            <div className="flex items-center justify-center gap-4">
                <a
                    href="/register"
                    className="px-6 py-3 rounded-xl bg-accent text-white font-medium hover:opacity-90 transition-opacity"
                >
                    Get Started
                </a>
                <a
                    href="/login"
                    className="px-6 py-3 rounded-xl border border-line bg-white text-ink font-medium hover:bg-surface transition-colors"
                >
                    Log In
                </a>
            </div>
        </div>
    );
}

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Any authenticated user */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                }
            />

            {/* Restaurant / EventOrganizer only */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["Restaurant", "EventOrganizer"]}>
                        <RestaurantDashboard />
                    </ProtectedRoute>
                }
            />

            {/* NGO only (Jiya's Topic 5) */}
            <Route
                path="/browse"
                element={
                    <ProtectedRoute allowedRoles={["NGO"]}>
                        <Placeholder title="Browse Donations" />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-requests"
                element={
                    <ProtectedRoute allowedRoles={["NGO"]}>
                        <Placeholder title="My Requests" />
                    </ProtectedRoute>
                }
            />

            {/* Admin only (Nidhi's Topic 2 & Jiya's Topic 8) */}
            <Route
                path="/admin/pending"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <VerifyUsers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <AllUsers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <Placeholder title="Reports" />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
    );
}