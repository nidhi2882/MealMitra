import { useEffect, useState, useCallback } from "react";
import api, { getErrorMessage } from "../../services/api";
import DonationCard from "../../components/donation/DonationCard";
import RequestPickupModal from "../../components/pickup/RequestPickupModal";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import "./ngo.css";

const EMPTY_FILTERS = { foodType: "", location: "", minQuantity: "", expiryBefore: "" };

export default function BrowseDonations() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null); // donation being requested
    const [toast, setToast] = useState("");

    const fetchDonations = useCallback(async (activeFilters) => {
        setLoading(true);
        setError("");
        try {
            const params = {};
            Object.entries(activeFilters).forEach(([key, value]) => {
                if (value === "") return;
                params[key] =
                    key === "expiryBefore" ? new Date(`${value}T23:59:59`).toISOString() : value;
            });

            const { data } = await api.get("/donations", { params });
            setDonations(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDonations(EMPTY_FILTERS);
    }, [fetchDonations]);

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const handleApply = (e) => {
        e.preventDefault();
        fetchDonations(filters);
    };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        fetchDonations(EMPTY_FILTERS);
    };

    const handleRequestSuccess = (message) => {
        setSelected(null);
        setToast(message);
        fetchDonations(filters); // donation is now "Requested", so it drops off this list
        setTimeout(() => setToast(""), 4000);
    };

    return (
        <div className="page">
            <h1>Browse available food</h1>

            <form className="filter-bar" onSubmit={handleApply}>
                <input
                    name="foodType"
                    placeholder="Food type (e.g. Cooked)"
                    value={filters.foodType}
                    onChange={handleChange}
                />
                <input
                    name="location"
                    placeholder="Location (e.g. Ahmedabad)"
                    value={filters.location}
                    onChange={handleChange}
                />
                <input
                    name="minQuantity"
                    type="number"
                    min="1"
                    placeholder="Min quantity"
                    value={filters.minQuantity}
                    onChange={handleChange}
                />
                <label className="inline-label">
                    Expires before
                    <input
                        name="expiryBefore"
                        type="date"
                        value={filters.expiryBefore}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit" className="btn btn-primary">Apply</button>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                    Reset
                </button>
            </form>

            {toast && <div className="toast">{toast}</div>}
            {error && <p className="error">{error}</p>}

            {loading ? (
                <Loader />
            ) : donations.length === 0 ? (
                <p className="muted">No available donations match your filters.</p>
            ) : (
                <div className="card-grid">
                    {donations.map((donation) => (
                        <DonationCard
                            key={donation._id}
                            donation={donation}
                            currentUserId={user?.id}
                            userRole={user?.role}
                            onRequest={(d) => setSelected(d)}
                        />
                    ))}
                </div>
            )}

            {selected && (
                <RequestPickupModal
                    donation={selected}
                    onClose={() => setSelected(null)}
                    onSuccess={handleRequestSuccess}
                />
            )}
        </div>
    );
}