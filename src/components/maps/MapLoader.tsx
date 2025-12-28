'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Use dynamic import to load RealMap only on the client side
const MapLoader = (props: {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: any[];
    waypoints?: { lat: number; lng: number }[];
}) => {
    const RealMap = useMemo(() => dynamic(
        () => import('./RealMap'),
        {
            loading: () => (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ),
            ssr: false
        }
    ), []);

    return <RealMap {...props} />;
};

export default MapLoader;
