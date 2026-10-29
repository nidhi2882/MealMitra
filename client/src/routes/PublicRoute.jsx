import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

// Determines the default home route for an authenticated user based on role
export const getRoleDashboard = (role) => {
    switch (role) {
        case "Admin":
            return "/admin/pending";
        case "NGO":
            return "/browse";
        case "Restaurant":
        case "EventOrganizer":
            return "/dashboard";
        default:
            return "/";
    }
};

/**
 * PublicRoute (Guest Route)
 * Prevents authenticated users from accessing guest-only pages like /login and /register.
 * If already logged in, redirects them straight to their respective role dashboard.
 */
export default function PublicRoute({ children }) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (isAuthenticated && user) {
        return <Navigate to={getRoleDashboard(user.role)} replace />;
    }

    return children;
}

