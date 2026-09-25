import { useState, useEffect } from "react";
import api from "../../services/api";

const FOOD_TYPES = [
    "Cooked Meal",
    "Raw Ingredients",
    "Packaged Food",
    "Bakery/Sweets",
    "Beverages",
    "Other",
];

export default function DonationForm({ open, onClose, onSuccess, initialData = null }) {
    const isEdit = !!initialData;

    const [form, setForm] = useState({
        foodName: "",
        foodType: "Cooked Meal",
        quantity: "",
        description: "",
        expiryTime: "",
        pickupAddress: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialData) {
            // Format expiryTime string for datetime-local input (YYYY-MM-THH:mm)
            const d = new Date(initialData.expiryTime);
            const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);

            setForm({
                foodName: initialData.foodName || "",
                foodType: initialData.foodType || "Cooked Meal",
                quantity: initialData.quantity || "",
                description: initialData.description || "",
                expiryTime: isoLocal,
                pickupAddress: initialData.pickupAddress || "",
            });
        } else {
            setForm({
                foodName: "",
                foodType: "Cooked Meal",
                quantity: "",
                description: "",
                expiryTime: "",
                pickupAddress: "",
            });
        }
        setError("");
    }, [initialData, open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            if (!form.expiryTime) {
                setError("Please select a valid expiry date and time.");
                setSubmitting(false);
                return;
            }

            const expiryDate = new Date(form.expiryTime);
            if (isNaN(expiryDate.getTime())) {
                setError("Invalid expiry date format.");
                setSubmitting(false);
                return;
            }

            if (expiryDate <= new Date()) {
                setError("Expiry date and time must be in the future.");
                setSubmitting(false);
                return;
            }

            const payload = {
                ...form,
                quantity: Number(form.quantity),
                expiryTime: expiryDate.toISOString(),
            };

            if (isEdit) {
                await api.put(`/donations/${initialData._id}`, payload);
            } else {
                await api.post("/donations", payload);
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save donation listing.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white max-w-lg w-full rounded-2xl border border-line p-6 shadow-xl my-8">
                <div className="flex items-center justify-between mb-6 border-b border-line pb-4">
                    <h2 className="font-display text-2xl text-ink">
                        {isEdit ? "Edit Food Donation" : "Create Food Donation"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-ink/40 hover:text-ink text-xl font-bold transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-5 p-4 rounded-xl bg-alert/10 border border-alert/30 text-alert text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-ink mb-1">Food Item Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Vegetable Biryani, Mixed Sandwiches"
                            value={form.foodName}
                            onChange={(e) => setForm({ ...form, foodName: e.target.value })}
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink text-sm focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1">Food Category *</label>
                            <select
                                value={form.foodType}
                                onChange={(e) => setForm({ ...form, foodType: e.target.value })}
                                required
                                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink text-sm focus:border-accent focus:outline-none"
                            >
                                {FOOD_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ink mb-1">Quantity (Servings) *</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 25"
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                required
                                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink text-sm focus:border-accent focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink mb-1">Expiry Date & Time *</label>
                        <input
                            type="datetime-local"
                            value={form.expiryTime}
                            onChange={(e) => setForm({ ...form, expiryTime: e.target.value })}
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink text-sm focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink mb-1">Pickup Address *</label>
                        <textarea
                            rows="2"
                            placeholder="Full address where NGO can collect the food..."
                            value={form.pickupAddress}
                            onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink text-sm focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink mb-1">Additional Details (Optional)</label>
                        <textarea
                            rows="2"
                            placeholder="Packaging details, storage conditions, dietary info..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-ink text-sm focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div className="border-t border-line pt-4 flex items-center justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-lg border border-line text-ink/70 hover:text-ink text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-all text-sm disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : isEdit ? "Update Listing" : "Post Donation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
