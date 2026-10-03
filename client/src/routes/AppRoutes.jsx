import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Profile from "../pages/auth/Profile";
import VerifyUsers from "../pages/admin/VerifyUsers";
import AllUsers from "../pages/admin/AllUsers";
import RestaurantDashboard from "../pages/restaurant/RestaurantDashboard";
import History from "../pages/History";
import BrowseDonations from "../pages/ngo/BrowseDonations";
import NgoDashboard from "../pages/ngo/NgoDashboard";
import AdminReports from "../pages/admin/AdminReports";
import ModerateDonations from "../pages/admin/ModerateDonations";
import Home from "../pages/Home";

// --- Placeholder pages for Jiya's upcoming topics (Topics 5, 6, 7, 8) ---
function Placeholder({ title }) {
    return (
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
            <h1 className="font-display text-3xl text-ink mb-2">{title}</h1>
            <p className="text-ink/60">This page will be implemented in Jiya's topics.</p>
        </div>
    );
}

// Removed inline Home component
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
                        <BrowseDonations />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-requests"
                element={
                    <ProtectedRoute allowedRoles={["NGO"]}>
                        <NgoDashboard />
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
                path="/admin/donations"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <ModerateDonations />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <AdminReports />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
    );
}