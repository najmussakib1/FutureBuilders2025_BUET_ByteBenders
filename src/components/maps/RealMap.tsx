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
    routingTo?: { lat: number; lng: number };
}

function Routing({ from, to }: { from: { lat: number, lng: number }, to: { lat: number, lng: number } }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !from || !to) return;

        // @ts-ignore
        const routingControl = (L as any).Routing.control({
            waypoints: [
                L.latLng(from.lat, from.lng),
                L.latLng(to.lat, to.lng)
            ],
            lineOptions: {
                styles: [{ color: '#6366f1', weight: 4 }]
            } as any,
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true
        }).addTo(map);

        return () => {
            map.removeControl(routingControl);
        };
    }, [map, from.lat, from.lng, to.lat, to.lng]);

    return null;
}

export default function RealMap({ center, zoom = 13, markers = [], routingTo }: RealMapProps) {
    const ambulanceMarker = markers.find(m => m.type === 'AMBULANCE');

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
                <Marker key={idx} position={[marker.lat, marker.lng]}>
                    <Popup>
                        <div className="text-xs font-bold font-sans">
                            <p className="text-indigo-600 uppercase tracking-wider text-[10px]">{marker.type}</p>
                            <p className="text-slate-700">{marker.name}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
            {ambulanceMarker && routingTo && (
                <Routing from={ambulanceMarker} to={routingTo} />
            )}
        </MapContainer>
    );
}
