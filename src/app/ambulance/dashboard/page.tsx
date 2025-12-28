'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Truck,
    MapPin,
    Phone,
    Navigation,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    LogOut,
    User,
    Activity,
    Search,
    History as HistoryIcon
} from 'lucide-react';
import { getAmbulanceTasks, updateTaskStatus, getAmbulanceHistory, updateAmbulanceLocation } from '@/app/actions/ambulance';
import { motion, AnimatePresence } from 'framer-motion';
import MapLoader from '@/components/maps/MapLoader';
import { signOut } from 'next-auth/react';

export default function AmbulanceDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sharingLocation, setSharingLocation] = useState(false);
    const [lastLocUpdate, setLastLocUpdate] = useState<Date | null>(null);
    const [driverMessage, setDriverMessage] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (session?.user?.role !== 'AMBULANCE') {
            // Optional: Redirect back if not ambulance
        } else {
            fetchData();
        }
    }, [session, status]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sharingLocation && session?.user?.id) {
            // Initial update
            updateLocation();
            // Periodic update every 10 seconds (mock real-time)
            interval = setInterval(updateLocation, 10000);
        }
        return () => clearInterval(interval);
    }, [sharingLocation, session]);

    const updateLocation = async () => {
        const userId = session?.user?.id;
        if (!userId) return;

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const result = await updateAmbulanceLocation(userId, latitude, longitude);
                if (result.success) {
                    setLastLocUpdate(new Date());
                }
            }, (error) => {
                console.error("Geolocation error:", error);
                // Fallback to mock for demo fluency if GPS fails
                const baseLat = 23.8103;
                const baseLng = 90.4125;
                const offset = (Date.now() % 10000) / 100000;
                updateAmbulanceLocation(userId, baseLat + offset, baseLng + offset * 0.5);
                setLastLocUpdate(new Date());
            });
        }
    };

    const fetchData = async () => {
        if (session?.user?.id) {
            const [tasksRes, historyRes] = await Promise.all([
                getAmbulanceTasks(session.user.id),
                getAmbulanceHistory(session.user.id)
            ]);
            if (tasksRes.success) setTasks(tasksRes.tasks || []);
            if (historyRes.success) setHistory(historyRes.history || []);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId: string, newStatus: string) => {
        setUpdating(taskId);
        const finalNotes = driverMessage.trim() ? `${driverMessage} (Status: ${newStatus})` : `Status updated to ${newStatus} by driver.`;
        const result = await updateTaskStatus(taskId, newStatus, finalNotes);
        if (result.success) {
            setDriverMessage('');
            fetchData();
        } else {
            alert('Failed to update status');
        }
        setUpdating(null);
    };

    const filteredTasks = tasks.filter(t =>
        t.assessment.alert.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assessment.alert.patient.village.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
            {/* Header */}
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Truck className="text-slate-900" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Ambulance Portal</h1>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            On Duty
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-rose-400 transition-colors border border-slate-700"
                >
                    <LogOut size={20} />
                </button>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-6">
                {/* Location Sharing Controller */}
                <div className={`p-4 rounded-[2rem] border transition-all duration-500 ${sharingLocation ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${sharingLocation ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                                <Navigation size={24} className={sharingLocation ? 'animate-pulse' : ''} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Real-time Positioning</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    {sharingLocation ? (
                                        <span className="text-emerald-500 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                                            Broadcasting Active • {lastLocUpdate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    ) : 'Location Sharing Paused'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSharingLocation(!sharingLocation)}
                            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${sharingLocation ? 'bg-emerald-500' : 'bg-slate-700'}`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sharingLocation ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>
                {/* Search / Filter */}
                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
                    <Search className="text-slate-500 w-5 h-5 ml-1" />
                    <input
                        type="text"
                        placeholder="Search patient or village..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 focus:ring-0"
                    />
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-10 text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 relative">
                                <Activity className="text-slate-700 w-10 h-10" />
                                <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-ping" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">No Active Tasks</h3>
                                <p className="text-slate-500 text-xs mt-1">Stay alert. New emergencies appear here.</p>
                            </div>
                            <button
                                onClick={fetchData}
                                className="px-5 py-2 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-700 active:scale-95 transition-all"
                            >
                                Refresh Feed
                            </button>
                        </motion.div>
                    ) : (
                        filteredTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-4 pt-6 border-t border-slate-900 first:pt-0 first:border-0"
                            >
                                <div className="bg-emerald-600 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="w-24 h-24 transform rotate-12" />
                                    </div>
                                    <div className="relative z-10 flex justify-between items-start mb-6">
                                        <div className="flex flex-col">
                                            <span className={`px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 ${task.status === 'INITIATED' ? 'animate-pulse' : ''
                                                }`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] text-emerald-100/60 mt-2 font-mono ml-2">ID: {task.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <div>
                                            <p className="text-emerald-50/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Emergency Patient</p>
                                            <h2 className="text-3xl font-black text-white">{task.assessment.alert.patient.name}</h2>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-white/10 backdrop-blur rounded-3xl p-3 border border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin size={10} className="text-emerald-100" />
                                                    <p className="text-emerald-100 text-[10px] font-bold uppercase">Village</p>
                                                </div>
                                                <p className="font-bold text-sm truncate text-white">{task.assessment.alert.patient.village}</p>
                                            </div>
                                            <div className="flex-1 bg-white/10 backdrop-blur rounded-3xl p-3 border border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Phone size={10} className="text-emerald-100" />
                                                    <p className="text-emerald-100 text-[10px] font-bold uppercase">Contact</p>
                                                </div>
                                                <p className="font-bold text-sm text-white">{task.assessment.alert.patient.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-5 border border-slate-800 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 px-2">Driver Updates</h4>
                                    <textarea
                                        value={driverMessage}
                                        onChange={(e) => setDriverMessage(e.target.value)}
                                        placeholder="Add a manual update (e.g., 'Traffic heavy', 'Patient stabilized')..."
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-4 text-sm text-slate-300 placeholder:text-slate-700 focus:ring-2 focus:ring-emerald-500/50 outline-none min-h-[100px] transition-all"
                                    />
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-1 h-[280px] border border-slate-800 shadow-2xl relative overflow-hidden">
                                    <MapLoader
                                        center={{ lat: task.assessment.alert.patient.lat || 23.8103, lng: task.assessment.alert.patient.lng || 90.4125 }}
                                        markers={[
                                            { lat: task.assessment.alert.patient.lat || 23.8103, lng: task.assessment.alert.patient.lng || 90.4125, name: task.assessment.alert.patient.name, type: 'PATIENT' },
                                            { lat: (session?.user as any)?.lat || 23.81, lng: (session?.user as any)?.lng || 90.41, name: 'You', type: 'AMBULANCE' },
                                            task.assessment.alert.doctorId ? { lat: (task.assessment.alert.doctor as any)?.lat || 23.82, lng: (task.assessment.alert.doctor as any)?.lng || 90.42, name: 'Medical Center', type: 'DOCTOR' } : null
                                        ].filter(Boolean)}
                                        waypoints={[
                                            { lat: (session?.user as any)?.lat || 23.81, lng: (session?.user as any)?.lng || 90.41 },
                                            { lat: task.assessment.alert.patient.lat || 23.81, lng: task.assessment.alert.patient.lng || 90.41 },
                                            { lat: (task.assessment.alert.doctor as any)?.lat || 23.82, lng: (task.assessment.alert.doctor as any)?.lng || 90.42 }
                                        ]}
                                    />
                                    <div className="absolute bottom-6 right-6 z-10">
                                        <button className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all ring-4 ring-indigo-600/20">
                                            <Navigation className="text-white" size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {task.status === 'INITIATED' && (
                                        <button
                                            onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                                            disabled={!!updating}
                                            className="w-full py-5 bg-indigo-600 rounded-full font-black text-lg shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-indigo-500/50"
                                        >
                                            {updating === task.id ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : 'Accept Mission'}
                                            {!updating && <ArrowRight size={24} />}
                                        </button>
                                    )}

                                    {task.status === 'IN_PROGRESS' && (
                                        <button
                                            onClick={() => handleStatusUpdate(task.id, 'PICKED_UP')}
                                            disabled={!!updating}
                                            className="w-full py-5 bg-emerald-600 rounded-full font-black text-lg shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-emerald-500/50"
                                        >
                                            {updating === task.id ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : 'Confirm Patient Pickup'}
                                            {!updating && <CheckCircle2 size={24} />}
                                        </button>
                                    )}

                                    {task.status === 'PICKED_UP' && (
                                        <button
                                            onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                                            disabled={!!updating}
                                            className="w-full py-5 bg-blue-600 rounded-full font-black text-lg shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-blue-500/50"
                                        >
                                            {updating === task.id ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : 'Complete Medical Transport'}
                                            {!updating && <CheckCircle2 size={24} />}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="pt-10 space-y-5">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3 text-slate-500">
                                <HistoryIcon size={18} />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Recent Transport History</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700">{history.length} cases</span>
                        </div>
                        <div className="space-y-4">
                            {history.filter(h =>
                                h.assessment.alert.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                h.assessment.alert.patient.village.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((h) => (
                                <motion.div
                                    key={h.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-slate-900/40 rounded-3xl p-5 border border-slate-800/50 flex items-center justify-between group hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-200">{h.assessment.alert.patient.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{h.assessment.alert.patient.village} • {new Date(h.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">Delivered</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Nav Mock */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-900/50 p-5 flex justify-around items-center z-50">
                <button className="text-emerald-500 flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                    <div className="relative">
                        <Truck size={24} />
                        {tasks.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950" />}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Missions</span>
                </button>
                <button className="text-slate-600 flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                    <MapPin size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Zone</span>
                </button>
                <button className="text-slate-600 flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                    <Activity size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Vitals</span>
                </button>
            </nav>
        </div>
    );
}
