import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
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
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            
            {/* Guest-only routes (redirects authenticated users to their dashboard) */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />

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

            {/* NGO only */}
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

            {/* Admin only */}
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

            {/* Fallback Catch-All 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
