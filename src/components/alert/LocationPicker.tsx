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
        if (initialLocation) {
            setSelectedLoc(initialLocation);
        }
    }, [initialLocation]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Navigation size={16} className="text-indigo-600" />
                    {label}
                </label>
                {selectedLoc && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        <Check size={10} />
                        PINNED
                    </span>
                )}
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
