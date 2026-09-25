import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

// Extra fields required per role — must match the backend's discriminator
// schemas exactly (Restaurant, EventOrganizer, NGO), since these get sent
// straight through to Model.create() there.
const ROLE_FIELDS = {
    Restaurant: [
        { name: "organizationName", label: "Organization name" },
        { name: "location", label: "Location" },
        { name: "licenseNo", label: "FSSAI license number" },
    ],
    EventOrganizer: [
        { name: "organizationName", label: "Organization name" },
        { name: "location", label: "Location" },
        { name: "eventType", label: "Event type" },
        { name: "registrationType", label: "Registration type" },
    ],
    NGO: [
        { name: "ngoName", label: "NGO name" },
        { name: "registrationNo", label: "Registration number" },
    ],
};

const ROLE_OPTIONS = [
    { value: "Restaurant", label: "Restaurant" },
    { value: "EventOrganizer", label: "Event Organizer" },
    { value: "NGO", label: "NGO" },
];

export default function Register() {
    const navigate = useNavigate();
    const [role, setRole] = useState("Restaurant");
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [roleFields, setRoleFields] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setRoleFields({}); // clear role-specific fields when switching roles — old values wouldn't apply anymore
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const payload = { role, ...form, ...roleFields };
            const res = await api.post("/auth/register", payload);
            setSuccess(res.data.message);
            // Don't auto-redirect to login — the account is Pending until an
            // Admin verifies it, so login would just fail right now anyway.
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-5 py-16">
            <h1 className="font-display text-3xl text-ink mb-1">Create an account</h1>
            <p className="text-ink/60 mb-8">Register as a donor or a receiving organization.</p>

            {error && (
                <div className="mb-5 px-4 py-3 rounded-md bg-alert/10 border border-alert/30 text-alert text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-5 px-4 py-3 rounded-md bg-verified/10 border border-verified/30 text-verified text-sm">
                    {success} Redirecting to login…
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role selector */}
                <div>
                    <label className="block text-sm font-medium text-ink mb-2">I am registering as</label>
                    <div className="flex gap-2">
                        {ROLE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleRoleChange(opt.value)}
                                className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                                    role === opt.value
                                        ? "border-accent bg-accent/10 text-accent"
                                        : "border-line text-ink/70 hover:border-ink/30"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Base fields — every role needs these */}
                <Field
                    label="Your name / contact person"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    required
                />
                <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    required
                />
                <Field
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(v) => setForm({ ...form, password: v })}
                    required
                />

                {/* Role-specific fields, rendered dynamically */}
                {ROLE_FIELDS[role].map((f) => (
                    <Field
                        key={f.name}
                        label={f.label}
                        value={roleFields[f.name] || ""}
                        onChange={(v) => setRoleFields({ ...roleFields, [f.name]: v })}
                        required
                    />
                ))}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 px-4 py-2.5 rounded-md bg-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {submitting ? "Creating account…" : "Register"}
                </button>
            </form>

            <p className="text-sm text-ink/60 mt-6 text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-accent font-medium hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}

// Small reusable text input — kept local to this file since Register is
// currently its only user; promote to components/common if Profile or
// other forms end up needing the exact same styling.
function Field({ label, type = "text", value, onChange, required }) {
    return (
        <div>
            <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="w-full px-3 py-2 rounded-md border border-line bg-white text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none transition-colors"
            />
        </div>
    );
}