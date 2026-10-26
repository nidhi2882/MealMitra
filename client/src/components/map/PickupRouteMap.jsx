import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Custom SVG Icons for Origin, Destination, and Delivery Vehicle
const createPinIcon = (label, color, emoji) => {
    return L.divIcon({
        className: "custom-pin",
        html: `
            <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            ">
                <span style="transform: rotate(45deg); font-size: 14px;">${emoji}</span>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const createVehicleIcon = () => {
    return L.divIcon({
        className: "custom-vehicle-icon",
        html: `
            <div style="
                background-color: #2B6CB0;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(43, 108, 176, 0.5);
                animation: pulse 2s infinite;
            ">
                <span style="font-size: 18px;">🚐</span>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

// Auto-fit map viewport to bounds of route
function MapBoundsFitter({ path }) {
    const map = useMap();
    useEffect(() => {
        if (path && path.length > 0) {
            const bounds = L.latLngBounds(path);
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [path, map]);
    return null;
}

export default function PickupRouteMap({ request }) {
    const donation = request?.donationId;
    const ngo = request?.ngoId;

    // Donor origin coordinates (Ahmedabad city base with real coordinates if pinned)
    const origin = [
        donation?.location?.lat || 23.0225,
        donation?.location?.lng || 72.5714,
    ];

    // NGO destination coordinates (approx 3-4km away on real city map)
    const destination = [
        origin[0] + 0.025,
        origin[1] + 0.032,
    ];

    const [roadPath, setRoadPath] = useState([]);
    const [distanceKm, setDistanceKm] = useState(null);
    const [durationMins, setDurationMins] = useState(null);

    // Fetch real-world road driving geometry from Open Source Routing Machine (OSRM)
    useEffect(() => {
        let isCancelled = false;

        const fetchRealRoadRoute = async () => {
            try {
                // OSRM coordinates format: {longitude},{latitude}
                const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
                const res = await fetch(url);
                const data = await res.json();

                if (!isCancelled && data.code === "Ok" && data.routes?.[0]) {
                    const route = data.routes[0];
                    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng] points
                    const pathCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                    setRoadPath(pathCoords);
                    setDistanceKm((route.distance / 1000).toFixed(1));
                    setDurationMins(Math.ceil(route.duration / 60));
                }
            } catch {
                // Fallback to direct path handled automatically
            }
        };

        fetchRealRoadRoute();

        return () => {
            isCancelled = true;
        };
    }, [origin[0], origin[1], destination[0], destination[1]]);

    const activeRoute = roadPath.length > 0 ? roadPath : [origin, destination];

    // Compute active vehicle position along the real road path
    const getVehiclePosition = () => {
        if (request?.status === "Accepted") {
            return activeRoute[0]; // at restaurant origin
        }
        if (request?.status === "Picked Up") {
            // Midway along the actual driving road path
            const midIndex = Math.floor(activeRoute.length * 0.55);
            return activeRoute[midIndex] || origin;
        }
        if (request?.status === "Completed") {
            return activeRoute[activeRoute.length - 1] || destination; // at NGO destination
        }
        return activeRoute[0];
    };

    const vehiclePos = getVehiclePosition();

    const originIcon = createPinIcon("Donor", "#C3722A", "🏪");
    const destIcon = createPinIcon("NGO", "#38A169", "🏢");
    const vehicleIcon = createVehicleIcon();

    return (
        <div className="mt-4 rounded-2xl overflow-hidden border border-line shadow-sm relative">
            <div className="bg-surface/90 backdrop-blur-sm px-4 py-2.5 border-b border-line flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-ink flex items-center gap-1.5">
                        <span>📍</span> Real Road Route Navigation
                    </span>
                    {distanceKm && (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-line text-ink/80 font-semibold shadow-xs flex items-center gap-1">
                            <span>🚗</span>
                            <span>{distanceKm} km</span>
                            <span className="text-ink/40">•</span>
                            <span>~{durationMins} mins drive</span>
                        </span>
                    )}
                </div>
                <span className="text-ink/60">
                    Status: <strong className="text-accent">{request?.status}</strong>
                </span>
            </div>

            <div className="h-64 w-full relative z-0">
                <MapContainer
                    center={origin}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="w-full h-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapBoundsFitter path={activeRoute} />

                    {/* Real Driving Road Route Polyline */}
                    <Polyline
                        positions={activeRoute}
                        pathOptions={{
                            color: "#2B6CB0",
                            weight: 5,
                            opacity: 0.85,
                            lineJoin: "round",
                        }}
                    />

                    {/* Donor Origin Marker */}
                    <Marker position={origin} icon={originIcon}>
                        <Popup>
                            <div className="text-xs">
                                <strong>Pickup Origin (Donor):</strong>
                                <p className="text-ink/70 mt-0.5">{donation?.pickupAddress || "Donor Location"}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* NGO Destination Marker */}
                    <Marker position={destination} icon={destIcon}>
                        <Popup>
                            <div className="text-xs">
                                <strong>Destination (NGO):</strong>
                                <p className="text-ink/70 mt-0.5">{ngo?.ngoName || ngo?.name || "NGO Drop-off Point"}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Live Vehicle Marker */}
                    {["Accepted", "Picked Up", "Completed"].includes(request?.status) && (
                        <Marker position={vehiclePos} icon={vehicleIcon}>
                            <Popup>
                                <div className="text-xs">
                                    <strong>Delivery Progress:</strong>
                                    <p className="text-ink/70 mt-0.5">
                                        {request?.status === "Accepted" && "Pickup confirmed. Awaiting collection."}
                                        {request?.status === "Picked Up" && `Food collected. En route to NGO (~${durationMins || 10} mins).`}
                                        {request?.status === "Completed" && "Delivered successfully to NGO."}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
