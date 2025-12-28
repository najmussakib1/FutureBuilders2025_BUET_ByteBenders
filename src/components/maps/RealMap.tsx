'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MarkerData {
    lat: number;
    lng: number;
    name: string;
    type: 'PATIENT' | 'DOCTOR' | 'AMBULANCE';
}

interface RealMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: MarkerData[];
    waypoints?: { lat: number; lng: number }[];
}

function Routing({ points }: { points: { lat: number, lng: number }[] }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !points || points.length < 2) return;

        // @ts-ignore
        const routingControl = (L as any).Routing.control({
            waypoints: points.map(p => L.latLng(p.lat, p.lng)),
            lineOptions: {
                styles: [
                    { color: '#6366f1', weight: 6, opacity: 0.7 },
                    { color: 'white', weight: 2, opacity: 1 }
                ]
            } as any,
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null // Don't create extra markers, we have our own
        }).addTo(map);

        return () => {
            map.removeControl(routingControl);
        };
    }, [map, JSON.stringify(points)]);

    return null;
}

// Custom Icons
const createCustomIcon = (color: string, type: string) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 15px ${color}88;
                ${type === 'AMBULANCE' ? 'animation: pulse 2s infinite;' : ''}
            ">
                <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
            </div>
            <style>
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 ${color}88; }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 10px ${color}00; }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 ${color}00; }
                }
            </style>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

const icons = {
    AMBULANCE: createCustomIcon('#ef4444', 'AMBULANCE'), // Red
    DOCTOR: createCustomIcon('#3b82f6', 'DOCTOR'),       // Blue
    PATIENT: createCustomIcon('#10b981', 'PATIENT'),     // Green
};

export default function RealMap({ center, zoom = 13, markers = [], waypoints }: RealMapProps) {
    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker, idx) => (
                <Marker
                    key={idx}
                    position={[marker.lat, marker.lng]}
                    icon={icons[marker.type] || icons.PATIENT}
                >
                    <Popup>
                        <div className="text-xs font-bold font-sans">
                            <p className="text-indigo-600 uppercase tracking-wider text-[10px]">{marker.type}</p>
                            <p className="text-slate-700">{marker.name}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
            {waypoints && waypoints.length >= 2 && (
                <Routing points={waypoints} />
            )}
        </MapContainer>
    );
}
