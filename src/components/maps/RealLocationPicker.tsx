'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface RealLocationPickerProps {
    initialLocation?: { lat: number; lng: number } | null;
    onLocationSelect: (loc: { lat: number; lng: number }) => void;
}

function MapEvents({ onLocationSelect, initialLocation }: RealLocationPickerProps) {
    const map = useMapEvents({
        click(e) {
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (initialLocation) {
            map.flyTo([initialLocation.lat, initialLocation.lng], 15);
        }
    }, [initialLocation, map]);

    return null;
}

export default function RealLocationPicker({ initialLocation, onLocationSelect }: RealLocationPickerProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialLocation || null);

    useEffect(() => {
        if (initialLocation) {
            setPosition(initialLocation);
        }
    }, [initialLocation]);

    const center = initialLocation || { lat: 23.8103, lng: 90.4125 };

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && <Marker position={[position.lat, position.lng]} />}
            <MapEvents initialLocation={initialLocation} onLocationSelect={(loc) => {
                setPosition(loc);
                onLocationSelect(loc);
            }} />
        </MapContainer>
    );
}
