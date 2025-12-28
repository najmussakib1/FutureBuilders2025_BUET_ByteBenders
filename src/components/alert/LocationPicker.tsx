'use client';

import { useState } from 'react';
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

export default function LocationPicker({ initialLocation, onLocationSelect, label = 'Select Location' }: LocationPickerProps) {
    const [selectedLoc, setSelectedLoc] = useState<Location | null>(initialLocation || null);

    // Mock center for the area
    const center = { lat: 23.8103, lng: 90.4125 };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert screen coordinates back to mock geo-coordinates
        // Based on MockMap's projection logic:
        // const x = (marker.lng - center.lng) * 10000;
        // const y = (center.lat - marker.lat) * 10000;

        // The inverse:
        const relativeX = x - rect.width / 2;
        const relativeY = y - rect.height / 2;

        const lng = center.lng + (relativeX / 10000);
        const lat = center.lat - (relativeY / 10000);

        const newLoc = { lat, lng };
        setSelectedLoc(newLoc);
        onLocationSelect(newLoc);
    };

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

            <div
                className="relative w-full h-[300px] bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner cursor-crosshair group active:scale-[0.99] transition-transform"
                onClick={handleMapClick}
            >
                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Simulated Landmarks */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                    <path d="M-100 200 Q 200 150 400 300 T 800 250" fill="none" stroke="#6366f1" strokeWidth="40" strokeLinecap="round" />
                    <rect x="100" y="100" width="100" height="150" fill="#94a3b8" rx="8" />
                    <circle cx="500" cy="150" r="50" fill="#94a3b8" />
                </svg>

                {/* Instructions Overlay */}
                {!selectedLoc && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-100/40 backdrop-blur-[1px]">
                        <div className="bg-white/90 px-4 py-2 rounded-xl shadow-xl border border-white flex items-center gap-2 animate-bounce">
                            <MapPin size={18} className="text-rose-500" />
                            <span className="text-sm font-bold text-slate-600">Click to pin position</span>
                        </div>
                    </div>
                )}

                {/* Selected Marker */}
                {selectedLoc && (
                    <motion.div
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: `translate(${(selectedLoc.lng - center.lng) * 10000 - 16}px, ${(center.lat - selectedLoc.lat) * 10000 - 32}px)`
                        }}
                    >
                        <div className="relative">
                            <MapPin size={32} className="text-rose-500 drop-shadow-[0_4px_6px_rgba(244,63,94,0.4)]" />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full border-2 border-rose-500 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 text-[9px] font-bold text-slate-400 bg-white/50 backdrop-blur px-2 py-1 rounded-md border border-white/50">
                    MOCK GEOGRAPHIC INTERFACE
                </div>
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
