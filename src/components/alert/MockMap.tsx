'use client';

import { MapPin, Navigation, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface Location {
    lat: number;
    lng: number;
    name?: string;
    type: 'PATIENT' | 'DOCTOR' | 'AMBULANCE';
}

interface MockMapProps {
    center: { lat: number, lng: number };
    markers: Location[];
    onMarkerClick?: (loc: Location) => void;
}

export default function MockMap({ center, markers }: MockMapProps) {
    // We'll simulate a map grid with SVG
    return (
        <div className="relative w-full h-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90(#cbd5e1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Simulated River/Road */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                <path d="M-100 200 Q 200 150 400 300 T 800 250" fill="none" stroke="#6366f1" strokeWidth="40" strokeLinecap="round" />
            </svg>

            {/* Indicators */}
            <div className="absolute top-4 right-4 z-10 space-y-2">
                <div className="bg-white/90 backdrop-blur p-2 rounded-lg border border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-wider space-y-1">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Patient</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600" /> You</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Ambulance</div>
                </div>
            </div>

            {/* Map Area */}
            <div className="absolute inset-0 flex items-center justify-center">
                {markers.map((marker, i) => {
                    // Calculate relative position based on center
                    // This is a VERY simplified projection for mock purposes
                    const x = (marker.lng - center.lng) * 10000;
                    const y = (center.lat - marker.lat) * 10000;

                    return (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: i * 0.1 }}
                            style={{
                                position: 'absolute',
                                transform: `translate(${x}px, ${y}px)`
                            }}
                            className="group cursor-pointer"
                        >
                            <div className="relative group">
                                <MapPin
                                    size={32}
                                    className={`drop-shadow-md transition-transform group-hover:scale-110 ${marker.type === 'PATIENT' ? 'text-rose-500' :
                                            marker.type === 'DOCTOR' ? 'text-indigo-600' : 'text-emerald-500'
                                        }`}
                                />
                                {marker.name && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pointer-events-none">
                                        {marker.name}
                                        <Info size={10} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <Navigation size={12} className="text-indigo-600" />
                DHA-NORTH REGION • MOCK MAP VIEW
            </div>
        </div>
    );
}
