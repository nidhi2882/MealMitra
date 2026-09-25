import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while we check for an existing session on first load

    // On first mount, check if a token+user was already saved from a previous session
    useEffect(() => {
        const savedUser = localStorage.getItem("mealmitra_user");
        const savedToken = localStorage.getItem("mealmitra_token");
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Called by the Login page after a successful POST /api/auth/login
    const login = (token, userData) => {
        localStorage.setItem("mealmitra_token", token);
        localStorage.setItem("mealmitra_user", JSON.stringify(userData));
        setUser(userData);
    };

    // Called by the Navbar's logout button (or automatically by api.js on a 401)
    const logout = async () => {
        try {
            await api.post("/auth/logout"); // best-effort; backend has nothing to invalidate server-side
        } catch (err) {
            // Ignore — logging out locally should succeed even if this call fails
        } finally {
            localStorage.removeItem("mealmitra_token");
            localStorage.removeItem("mealmitra_user");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

// Usage in any component: const { user, login, logout } = useAuth();
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside an <AuthProvider>");
    }
    return context;
}