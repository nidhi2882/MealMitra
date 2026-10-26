import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Custom Leaflet Pin Icons using SVG DivIcons (avoids leaflet asset path issues in Vite)
const createCustomIcon = (isExpiringSoon = false) => {
    const bgColor = isExpiringSoon ? "#E53E3E" : "#C3722A";
    const svgHtml = `
        <div style="
            background-color: ${bgColor};
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        ">
            <span style="
                transform: rotate(45deg);
                font-size: 16px;
                color: white;
            ">🍲</span>
        </div>
    `;

    return L.divIcon({
        className: "custom-leaflet-marker",
        html: svgHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
    });
};

// Helper component to auto-recenter map when donations list changes
function MapAutoRecenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function DonationMap({ donations = [], onRequest }) {
    // Default city center (e.g. Ahmedabad, Gujarat: 23.0225, 72.5714)
    const defaultCenter = [23.0225, 72.5714];

    // Compute coordinate positions with slight deterministic offset if coordinates match
    const getCoordinates = (donation, index) => {
        if (donation.location?.lat && donation.location?.lng) {
            return [donation.location.lat, donation.location.lng];
        }
        // Fallback spread across Ahmedabad city area based on ID hash
        const angle = (index * (360 / Math.max(1, donations.length))) * (Math.PI / 180);
        const radius = 0.02 + ((index % 3) * 0.015);
        const lat = defaultCenter[0] + radius * Math.cos(angle);
        const lng = defaultCenter[1] + radius * Math.sin(angle);
        return [lat, lng];
    };

    const firstCoord = donations.length > 0 ? getCoordinates(donations[0], 0) : defaultCenter;

    return (
        <div className="w-full h-[580px] rounded-3xl overflow-hidden border border-line shadow-md relative z-0">
            <MapContainer
                center={firstCoord}
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapAutoRecenter center={firstCoord} />

                {donations.map((donation, idx) => {
                    const coords = getCoordinates(donation, idx);
                    const expiryDate = new Date(donation.expiryTime);
                    const isExpiringSoon = expiryDate.getTime() - Date.now() < 3 * 60 * 60 * 1000;
                    const markerIcon = createCustomIcon(isExpiringSoon);

                    return (
                        <Marker key={donation._id || idx} position={coords} icon={markerIcon}>
                            <Popup className="custom-leaflet-popup">
                                <div className="p-1 max-w-[240px]">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                                            {donation.foodType || "Food"}
                                        </span>
                                        {isExpiringSoon && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-alert/15 text-alert">
                                                Expiring Soon
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="font-bold text-ink text-sm leading-tight mb-1">
                                        {donation.foodName}
                                    </h4>

                                    <div className="text-xs text-ink/70 space-y-1 mb-3">
                                        <p><span className="font-medium text-ink">Quantity:</span> {donation.quantity} servings</p>
                                        <p className="truncate"><span className="font-medium text-ink">Pickup:</span> {donation.pickupAddress}</p>
                                        {donation.donorId?.organizationName && (
                                            <p><span className="font-medium text-ink">Donor:</span> {donation.donorId.organizationName}</p>
                                        )}
                                    </div>

                                    {onRequest && (
                                        <button
                                            onClick={() => onRequest(donation)}
                                            className="w-full py-2 px-3 bg-accent text-white rounded-xl text-xs font-semibold hover:opacity-95 transition-opacity shadow-sm"
                                        >
                                            Request Pickup
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
