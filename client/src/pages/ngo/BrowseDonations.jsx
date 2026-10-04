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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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

            params.page = activeFilters.page || 1;
            params.limit = 10; // Set items per page

            const { data } = await api.get("/donations", { params });
            setDonations(data.donations);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDonations({ ...filters, page });
    }, [page, fetchDonations]);

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const handleApply = (e) => {
        e.preventDefault();
        setPage(1); // Reset to first page on filter change
        fetchDonations({ ...filters, page: 1 });
    };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        setPage(1);
        fetchDonations({ ...EMPTY_FILTERS, page: 1 });
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

            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="btn btn-secondary"
                    >
                        Previous
                    </button>
                    <span className="text-ink/70">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="btn btn-secondary"
                    >
                        Next
                    </button>
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