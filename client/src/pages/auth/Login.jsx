import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await api.post("/auth/login", form);
            const { token, user } = res.data;
            login(token, user);

            // Redirect user according to their role
            if (user.role === "Admin") {
                navigate("/admin/pending");
            } else if (user.role === "NGO") {
                navigate("/browse");
            } else {
                // Restaurant or EventOrganizer
                navigate("/dashboard");
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Please check your credentials and try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-5 py-16">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl text-ink mb-2">Welcome back</h1>
                <p className="text-ink/60 text-sm">Log in to your MealMitra account to continue.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-alert/10 border border-alert/30 text-alert text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Email address</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none transition-colors text-sm"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-ink">Password</label>
                    </div>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none transition-colors text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 px-4 py-3 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-sm text-sm"
                >
                    {submitting ? "Logging in…" : "Log In"}
                </button>
            </form>

            <p className="text-sm text-ink/60 mt-6 text-center">
                Don't have an account yet?{" "}
                <Link to="/register" className="text-accent font-medium hover:underline">
                    Create an account
                </Link>
            </p>
        </div>
    );
}
