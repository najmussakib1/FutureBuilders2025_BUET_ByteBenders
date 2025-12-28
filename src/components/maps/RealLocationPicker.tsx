'use client';

import { useState } from 'react';
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

function LocationMarker({ initialLocation, onLocationSelect }: RealLocationPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        initialLocation ? L.latLng(initialLocation.lat, initialLocation.lng) : null
    );

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

export default function RealLocationPicker({ initialLocation, onLocationSelect }: RealLocationPickerProps) {
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
            <LocationMarker initialLocation={initialLocation} onLocationSelect={onLocationSelect} />
        </MapContainer>
    );
}
