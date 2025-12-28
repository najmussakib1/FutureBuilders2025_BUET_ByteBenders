'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Activity,
    Users,
    Clock,
    CheckCircle,
    AlertTriangle,
    Search,
    Bell,
    Menu,
    Calendar,
    ChevronRight,
    Stethoscope,
    MapPin
} from 'lucide-react';
import Link from 'next/link';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import MockMap from '@/components/alert/MockMap';
import { motion } from 'framer-motion';
import { getDoctorData } from '@/app/actions/doctor';
import { getDoctorAlerts } from '@/app/actions/alert';

export default function DoctorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (session?.user?.role !== 'DOCTOR') {
            // Optional: Redirect if not a doctor
            // router.push('/dashboard'); 
        } else {
            fetchAlerts();
        }
    }, [session, status]);

    const [doctor, setDoctor] = useState<any>(null);

    const fetchAlerts = async () => {
        if (session?.user?.id) {
            const [alertsResult, doctorResult] = await Promise.all([
                getDoctorAlerts(session.user.id),
                getDoctorData(session.user.id)
            ]);

            if (alertsResult.success) setAlerts(alertsResult.alerts);
            if (doctorResult.success) setDoctor(doctorResult.doctor);

            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Loading Portal...</p>
            </div>
        </div>
    );

    const pendingCount = alerts.filter(a => a.status === 'ESCALATED').length;
    const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <DoctorSidebar
                doctorName={session?.user?.name || 'Doctor'}
                specialization={session?.user?.id ? 'General Medicine' : ''} // Ideally fetched from DB
            />

            <main className="flex-1 lg:pl-72 relative transition-all duration-300">
                {/* Aurora Background */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                {/* Header */}
                <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between border-b border-white/50">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button className="p-2 -ml-2 text-slate-600 hover:bg-white rounded-lg transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-lg text-slate-800">Doctor Portal</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-3 bg-white/60 px-4 py-2 rounded-full border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all w-96">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search cases by name or symptoms..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:bg-white rounded-full transition-colors hover:text-indigo-600">
                            <Bell className="w-5 h-5" />
                            {pendingCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-50 animate-pulse" />}
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />
                        <div className="hidden lg:block text-right">
                            <p className="text-xs font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Online
                            </p>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
                    {/* Welcome Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                                Welcome back, Dr. {session?.user?.name?.split(' ')[0]}
                            </h1>
                            <p className="text-slate-500 max-w-xl">
                                You have <strong className="text-indigo-600">{pendingCount} active cases</strong> requiring your attention today.
                                Your quick response makes a difference.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn-secondary text-sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule
                            </button>
                            <button className="btn-premium text-sm">
                                <Activity className="w-4 h-4 mr-2" />
                                Statistics
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-panel p-6 relative overflow-hidden group hover:border-indigo-300 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertTriangle className="w-24 h-24 text-indigo-600 transform rotate-12 translate-x-4 -translate-y-4" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 mb-1">Pending Review</p>
                            <h3 className="text-4xl font-bold text-slate-800 mb-2">{pendingCount}</h3>
                            <div className="text-xs font-medium text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-full flex items-center gap-1">
                                {pendingCount > 0 ? 'Action Required' : 'All Caught Up'}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-panel p-6 relative overflow-hidden group hover:border-emerald-300 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle className="w-24 h-24 text-emerald-600 transform rotate-12 translate-x-4 -translate-y-4" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 mb-1">Resolved Today</p>
                            <h3 className="text-4xl font-bold text-slate-800 mb-2">{resolvedCount}</h3>
                            <div className="text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                                Lives Impacted
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-panel p-6 relative overflow-hidden group hover:border-blue-300 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock className="w-24 h-24 text-blue-600 transform rotate-12 translate-x-4 -translate-y-4" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 mb-1">Avg. Response Time</p>
                            <h3 className="text-4xl font-bold text-slate-800 mb-2">15m</h3>
                            <div className="text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full">
                                Top 10% in Region
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Case List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-indigo-600" />
                                    Assigned Cases
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {alerts.length === 0 ? (
                                    <div className="glass-panel p-12 text-center text-slate-400 border-dashed border-2">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <p className="font-medium">No active cases assigned.</p>
                                        <p className="text-sm text-slate-400 mt-1">Enjoy your free time, Doctor!</p>
                                    </div>
                                ) : (
                                    alerts.map((alert, i) => (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 + 0.3 }}
                                        >
                                            <Link href={`/doctor/alert/${alert.id}`}>
                                                <div className="glass-panel p-5 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 justify-between sm:items-center relative overflow-hidden">
                                                    {alert.status === 'ESCALATED' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}

                                                    <div className="flex gap-4 items-center">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${alert.severity === 'SEVERE' ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-200' :
                                                            alert.severity === 'MODERATE' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-200' :
                                                                'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-200'
                                                            }`}>
                                                            {alert.severity === 'SEVERE' ? <AlertTriangle size={24} /> : <Activity size={24} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-700 transition-colors">
                                                                {alert.patient.name}
                                                            </h4>
                                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <span>•</span>
                                                                <span className="truncate max-w-[200px]">{JSON.parse(alert.symptoms).join(', ')}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                                        <div className="text-right">
                                                            <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${alert.status === 'ESCALATED'
                                                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                }`}>
                                                                {alert.status === 'ESCALATED' ? (
                                                                    <>
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                                        Needs Action
                                                                    </>
                                                                ) : 'Resolved'}
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Activity / Updates */}
                        <div className="space-y-6">
                            {/* NEW: Map Visualization */}
                            <div className="glass-panel h-[350px] relative overflow-hidden group">
                                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                            <MapPin size={14} className="text-rose-500" />
                                            Case Locations
                                        </h3>
                                    </div>
                                </div>
                                <MockMap
                                    center={doctor ? { lat: doctor.lat || 23.8103, lng: doctor.lng || 90.4125 } : { lat: 23.8103, lng: 90.4125 }}
                                    markers={[
                                        ...(doctor ? [{ lat: doctor.lat || 23.8103, lng: doctor.lng || 90.4125, name: 'You', type: 'DOCTOR' as const }] : []),
                                        ...alerts.filter(a => a.patient.lat).map(a => ({
                                            lat: a.patient.lat,
                                            lng: a.patient.lng,
                                            name: a.patient.name,
                                            type: 'PATIENT' as const
                                        }))
                                    ]}
                                />
                            </div>

                            <div className="glass-panel p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                <h3 className="font-bold text-lg mb-2 relative z-10">Tele-Consultation</h3>
                                <p className="text-indigo-100 text-sm mb-6 relative z-10">
                                    You have <strong>3 workers</strong> online requesting guidance for non-emergency cases.
                                </p>
                                <button className="w-full py-2.5 bg-white text-indigo-900 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg relative z-10">
                                    Join Queue
                                </button>
                            </div>

                            <div className="glass-panel p-6">
                                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">System Updates</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3 items-start pb-4 border-b border-slate-50">
                                        <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">New Protocol: Dengue Outbreak</p>
                                            <p className="text-xs text-slate-500 mt-1">Updated triage guidelines for fever cases are now active.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Server Maintenance</p>
                                            <p className="text-xs text-slate-500 mt-1">Scheduled for Sunday, 2 AM - 4 AM.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
