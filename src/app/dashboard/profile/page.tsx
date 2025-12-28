'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Home,
    MapPin,
    ChevronLeft,
    Save,
    Activity,
    Shield,
    Users
} from 'lucide-react';
import LocationPicker from '@/components/alert/LocationPicker';
import { getWorkerData, updateWorkerLocation } from '@/app/actions/worker';
import { motion } from 'framer-motion';
import Link from 'next/link';
import WorkerSidebar from '@/components/layout/WorkerSidebar';

export default function WorkerProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [worker, setWorker] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedLoc, setSelectedLoc] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (session?.user?.id) {
            fetchWorkerData();
        }
    }, [session, status]);

    const fetchWorkerData = async () => {
        // Need to get worker ID from session or fetch by email
        // For simplicity assuming session.user.id is the worker ID as per current setup
        const result = await getWorkerData(session!.user!.id!);
        if (result.success && result.worker) {
            const w = result.worker as any;
            setWorker(w);
            if (w.lat && w.lng) {
                setSelectedLoc({ lat: w.lat, lng: w.lng });
            }
        }
        setLoading(false);
    };

    const handleLocationSave = async () => {
        if (!selectedLoc || !session?.user?.id) return;
        setSaving(true);
        const result = await updateWorkerLocation(session.user.id, selectedLoc.lat, selectedLoc.lng);
        setSaving(false);
        if (result.success) {
            window.alert('Base location updated successfully!');
        } else {
            window.alert('Failed to update location');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Worker Sidebar */}
            <WorkerSidebar
                workerName={worker?.name || 'Worker'}
                assignedArea={worker?.assignedArea || ''}
            />

            <main className="flex-1 lg:pl-72 relative transition-all duration-300">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-3xl -z-10" />

                <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-slate-500 hover:text-teal-600 transition-colors font-medium"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900">Worker Profile</h1>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Profile Info Card */}
                        <div className="md:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-6 text-center"
                            >
                                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-4 border-4 border-white shadow-xl">
                                    <Users size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{worker?.name}</h3>
                                <p className="text-sm text-teal-600 font-bold uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                                    <Shield size={14} />
                                    Community Staff
                                </p>

                                <div className="mt-8 space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Mail size={18} className="text-teal-500" />
                                        <span className="text-sm truncate font-medium">{worker?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Home size={18} className="text-teal-500" />
                                        <span className="text-sm font-medium">{worker?.village} ({worker?.assignedArea})</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Location Management */}
                        <div className="md:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-panel p-8"
                            >
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <MapPin className="text-teal-600" size={20} />
                                        Home / Village Base
                                    </h3>
                                    <button
                                        onClick={handleLocationSave}
                                        disabled={saving || !selectedLoc}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-teal-200"
                                    >
                                        {saving ? 'Saving...' : (
                                            <>
                                                <Save size={16} />
                                                Set My Base
                                            </>
                                        )}
                                    </button>
                                </div>

                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    Setting your base location helps doctors find you and your patients quickly during emergencies.
                                    Please pin your primary reporting spot or home on the map.
                                </p>

                                <div className="h-[400px]">
                                    <LocationPicker
                                        initialLocation={selectedLoc}
                                        onLocationSelect={(loc) => setSelectedLoc(loc)}
                                        label="Village Base Location"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
