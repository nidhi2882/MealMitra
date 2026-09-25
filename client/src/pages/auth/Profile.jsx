import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

export default function Profile() {
    const { user: authUser, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        organizationName: "",
        location: "",
        licenseNo: "",
        ngoName: "",
        registrationNo: "",
        eventType: "",
        registrationType: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get("/auth/me");
            const user = res.data.user;
            setProfile(user);
            setForm({
                name: user.name || "",
                phone: user.phone || "",
                address: user.address || "",
                organizationName: user.organizationName || "",
                location: user.location || "",
                licenseNo: user.licenseNo || "",
                ngoName: user.ngoName || "",
                registrationNo: user.registrationNo || "",
                eventType: user.eventType || "",
                registrationType: user.registrationType || "",
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            await api.put("/auth/profile", form);
            setSuccess("Profile updated successfully!");

            // Update AuthContext user with updated name/details
            const updatedUser = { ...authUser, name: form.name };
            const token = localStorage.getItem("mealmitra_token");
            if (token) {
                login(token, updatedUser);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!profile) {
        return (
            <div className="max-w-xl mx-auto px-5 py-12 text-center text-alert font-medium">
                {error || "Could not load user profile."}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-5 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl text-ink mb-1">Account Profile</h1>
                    <p className="text-ink/60 text-sm">Manage your personal and organizational details.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                            profile.verificationStatus === "Verified"
                                ? "bg-verified/15 text-verified"
                                : profile.verificationStatus === "Rejected"
                                ? "bg-alert/15 text-alert"
                                : "bg-pending/15 text-pending"
                        }`}
                    >
                        {profile.verificationStatus || "Verified"}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface text-ink/80 border border-line">
                        {profile.role}
                    </span>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-alert/10 border border-alert/30 text-alert text-sm font-medium">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 rounded-xl bg-verified/10 border border-verified/30 text-verified text-sm font-medium">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-line shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Contact Person / Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink focus:border-accent focus:outline-none transition-colors text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-surface text-ink/60 cursor-not-allowed text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Phone Number</label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+91 9876543210"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none transition-colors text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Location / City</label>
                        <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="e.g. Ahmedabad, Gujarat"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none transition-colors text-sm"
                        />
                    </div>
                </div>

                <div className="border-t border-line pt-5">
                    <label className="block text-sm font-medium text-ink mb-1.5">Address</label>
                    <textarea
                        rows="2"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Full street address..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none transition-colors text-sm"
                    />
                </div>

                {/* Role Specific Details */}
                {profile.role === "Restaurant" && (
                    <div className="border-t border-line pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1.5">Organization Name</label>
                            <input
                                type="text"
                                value={form.organizationName}
                                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink focus:border-accent focus:outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1.5">FSSAI License Number</label>
                            <input
                                type="text"
                                value={form.licenseNo}
                                onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink focus:border-accent focus:outline-none text-sm"
                            />
                        </div>
                    </div>
                )}

                {profile.role === "NGO" && (
                    <div className="border-t border-line pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1.5">NGO Name</label>
                            <input
                                type="text"
                                value={form.ngoName}
                                onChange={(e) => setForm({ ...form, ngoName: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink focus:border-accent focus:outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1.5">Registration Number</label>
                            <input
                                type="text"
                                value={form.registrationNo}
                                onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink focus:border-accent focus:outline-none text-sm"
                            />
                        </div>
                    </div>
                )}

                {profile.role === "EventOrganizer" && (
                    <div className="border-t border-line pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1.5">Organization Name</label>
                            <input
                                type="text"
                                value={form.organizationName}
                                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink focus:border-accent focus:outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1.5">Event Type</label>
                            <input
                                type="text"
                                value={form.eventType}
                                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink focus:border-accent focus:outline-none text-sm"
                            />
                        </div>
                    </div>
                )}

                <div className="border-t border-line pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 text-sm shadow-sm"
                    >
                        {saving ? "Saving Changes…" : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
