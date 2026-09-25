import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Each role sees a different set of nav links, since a Restaurant and an
// NGO have almost nothing in common in what they need quick access to.
const roleLinks = {
    Restaurant: [
        { to: "/dashboard", label: "My Donations" },
        { to: "/history", label: "History" },
    ],
    EventOrganizer: [
        { to: "/dashboard", label: "My Donations" },
        { to: "/history", label: "History" },
    ],
    NGO: [
        { to: "/browse", label: "Browse" },
        { to: "/my-requests", label: "My Requests" },
        { to: "/history", label: "History" },
    ],
    Admin: [
        { to: "/admin/pending", label: "Verify Users" },
        { to: "/admin/users", label: "All Users" },
        { to: "/admin/reports", label: "Reports" },
    ],
};

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const links = user ? roleLinks[user.role] || [] : [];

    return (
        <header className="border-b border-line bg-background sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                <Link to="/" className="font-display text-xl font-semibold text-ink tracking-tight">
                    MealMitra
                </Link>

                {isAuthenticated && (
                    <nav className="hidden sm:flex items-center gap-6">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                )}

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            {/* NOTIFICATION_BELL_SLOT — Jiya: mount <NotificationBell /> here (Topic 7) */}
                            <Link
                                to="/profile"
                                className="text-sm text-ink/70 hover:text-ink transition-colors hidden sm:inline"
                            >
                                {user.name}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium px-4 py-2 rounded-md border border-line text-ink hover:bg-surface transition-colors"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-ink">
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-medium px-4 py-2 rounded-md bg-accent text-white hover:opacity-90 transition-opacity"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}