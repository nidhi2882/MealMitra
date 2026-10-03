import { useState } from "react";
import api, { getErrorMessage } from "../../services/api";

export default function RequestPickupModal({ donation, onClose, onSuccess }) {
    const [note, setNote] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const payload = { donationId: donation._id };
            if (note.trim()) payload.note = note.trim();
            if (pickupTime) payload.pickupTime = new Date(pickupTime).toISOString();

            const { data } = await api.post("/pickups", payload);
            onSuccess(data.message);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Request pickup</h2>
                <p className="muted">
                    {donation.foodName} — {donation.quantity}
                </p>

                <form onSubmit={handleSubmit}>
                    <label>
                        Expected pickup time
                        <input
                            type="datetime-local"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            max={donation.expiryTime ? new Date(donation.expiryTime).toISOString().slice(0, 16) : undefined}
                        />
                    </label>

                    <label>
                        Note to donor (optional)
                        <textarea
                            rows={3}
                            placeholder="e.g. Will arrive by 6 PM"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </label>

                    {error && <p className="error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? "Sending..." : "Send request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}