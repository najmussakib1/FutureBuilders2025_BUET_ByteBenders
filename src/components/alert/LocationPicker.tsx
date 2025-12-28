'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Info, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Location {
    lat: number;
    lng: number;
}

interface LocationPickerProps {
    initialLocation?: Location | null;
    onLocationSelect: (loc: Location) => void;
    label?: string;
}

import dynamic from 'next/dynamic';

const RealLocationPicker = dynamic(
    () => import('@/components/maps/RealLocationPicker'),
    {
        ssr: false,
        loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl" />
    }
);

export default function LocationPicker({ initialLocation, onLocationSelect, label = 'Select Location' }: LocationPickerProps) {
    const [selectedLoc, setSelectedLoc] = useState<Location | null>(initialLocation || null);

    useEffect(() => {
        if (!initialLocation && !selectedLoc) {
            handleDetectLocation();
        }
    }, []);
    const [detecting, setDetecting] = useState(false);

    useEffect(() => {
        if (initialLocation) {
            setSelectedLoc(initialLocation);
        }
    }, [initialLocation]);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLoc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setSelectedLoc(newLoc);
                onLocationSelect(newLoc);
                setDetecting(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setDetecting(false);
                alert('Failed to get your location. Please ensure location permissions are granted.');
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Navigation size={16} className="text-indigo-600" />
                    {label}
                </label>
                <div className="flex items-center gap-3">
                    {selectedLoc && (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <Check size={10} />
                            PINNED
                        </span>
                    )}
                    <button
                        onClick={handleDetectLocation}
                        disabled={detecting}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 transition-colors flex items-center gap-1"
                    >
                        <Navigation size={10} className={detecting ? 'animate-spin' : ''} />
                        {detecting ? 'Detecting...' : 'Detect My Location'}
                    </button>
                </div>
            </div>

            <div className="relative w-full h-[300px] bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner">
                <RealLocationPicker
                    initialLocation={selectedLoc}
                    onLocationSelect={(loc) => {
                        setSelectedLoc(loc);
                        onLocationSelect(loc);
                    }}
                />
            </div>

            {selectedLoc && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Latitude</p>
                        <p className="text-sm font-mono font-bold text-slate-700">{selectedLoc.lat.toFixed(6)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Longitude</p>
                        <p className="text-sm font-mono font-bold text-slate-700">{selectedLoc.lng.toFixed(6)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
