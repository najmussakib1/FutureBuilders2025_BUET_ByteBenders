import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import {
    LayoutDashboard,
    Users,
    AlertCircle,
    Activity,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu,
    ChevronRight,
    Stethoscope
} from 'lucide-react';
import Link from 'next/link';
import PatientSearch from '@/components/patient/PatientSearch';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/');
    }

    // Get worker data with optimized query
    const worker = await prisma.communityWorker.findUnique({
        where: { email: session.user.email! },
        include: {
            patients: {
                take: 5,
                orderBy: { createdAt: 'desc' },
            },
            medicalAlerts: {
                where: { status: 'PENDING' },
                include: { patient: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });

    if (!worker) redirect('/');

    // Parallel data fetching for stats
    const [totalPatients, activeAlerts, resolvedToday] = await Promise.all([
        prisma.patient.count({ where: { workerId: worker.id } }),
        prisma.medicalAlert.count({ where: { workerId: worker.id, status: 'PENDING' } }),
        prisma.medicalAlert.count({
            where: {
                workerId: worker.id,
                status: 'RESOLVED',
                updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        })
    ]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar Navigation */}
            <aside className="fixed left-0 top-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 z-50 hidden lg:flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 tracking-tight">Health AI</span>
                    </div>

                    <nav className="space-y-2">
                        <Link href="/dashboard" className="nav-item active">
                            <LayoutDashboard className="w-5 h-5 mr-3" />
                            Dashboard
                        </Link>
                        <Link href="/patients" className="nav-item">
                            <Users className="w-5 h-5 mr-3" />
                            Patients
                        </Link>
                        <Link href="/alerts" className="nav-item">
                            <AlertCircle className="w-5 h-5 mr-3" />
                            Alerts
                            {activeAlerts > 0 && (
                                <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {activeAlerts}
                                </span>
                            )}
                        </Link>
                        <Link href="/settings" className="nav-item">
                            <Settings className="w-5 h-5 mr-3" />
                            Settings
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{worker.name}</p>
                            <p className="text-xs text-slate-500 truncate">{worker.assignedArea}</p>
                        </div>
                    </div>
                    <Link href="/api/auth/signout" className="flex items-center text-slate-500 hover:text-rose-600 transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:pl-72 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-lg px-8 py-5 flex items-center justify-between border-b border-white/50">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button className="p-2 -ml-2 text-slate-600">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-lg text-slate-800">Health AI</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 text-slate-400">
                        <Search className="w-4 h-4" />
                        <span className="text-sm">Search patients, alerts, or records...</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:bg-white rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            {activeAlerts > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-50" />}
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />
                        <div className="hidden lg:block text-right">
                            <p className="text-xs font-semibold text-slate-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">System Operational</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 fade-in-up">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Dashboard Overview</h1>
                            <p className="text-slate-500">Here's what's happening in <span className="font-semibold text-teal-600">{worker.village}</span> today.</p>
                        </div>
                        <Link href="/patient/new" className="btn-premium">
                            <ChevronRight className="w-5 h-5 mr-1" />
                            Register New Patient
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 relative overflow-hidden group hover:border-teal-200/50">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users className="w-24 h-24 text-teal-600 transform rotate-12 translate-x-4 -translate-y-4" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-500 mb-1">Total Patients</p>
                                <h3 className="text-4xl font-bold text-slate-800 mb-2">{totalPatients}</h3>
                                <div className="flex items-center text-xs text-teal-600 font-medium bg-teal-50 w-fit px-2 py-1 rounded-full">
                                    <Activity className="w-3 h-3 mr-1" />
                                    +12% from last month
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 relative overflow-hidden group hover:border-rose-200/50">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertCircle className="w-24 h-24 text-rose-600 transform rotate-12 translate-x-4 -translate-y-4" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-slate-500">Active Alerts</p>
                                    {activeAlerts > 0 && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
                                </div>
                                <h3 className="text-4xl font-bold text-slate-800 mb-2">{activeAlerts}</h3>
                                <div className="flex items-center text-xs text-rose-600 font-medium bg-rose-50 w-fit px-2 py-1 rounded-full">
                                    Action Required
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 relative overflow-hidden group hover:border-indigo-200/50">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Stethoscope className="w-24 h-24 text-indigo-600 transform rotate-12 translate-x-4 -translate-y-4" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-500 mb-1">Resolved Today</p>
                                <h3 className="text-4xl font-bold text-slate-800 mb-2">{resolvedToday}</h3>
                                <div className="flex items-center text-xs text-indigo-600 font-medium bg-indigo-50 w-fit px-2 py-1 rounded-full">
                                    Great Job!
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Interaction Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Search Widget */}
                            <div className="glass-panel p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-800">Patient Database</h3>
                                    <button className="text-teal-600 text-sm font-semibold hover:underline">View Full Directory</button>
                                </div>
                                <PatientSearch workerId={worker.id} />
                            </div>

                            {/* Recent Activity / Alerts */}
                            {worker.medicalAlerts.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-800 px-1">Critical Attention Needed</h3>
                                    {worker.medicalAlerts.map((alert) => (
                                        <Link key={alert.id} href={`/alert/${alert.id}`}>
                                            <div className="glass-panel p-5 flex items-center justify-between hover:border-rose-200 group cursor-pointer border border-transparent">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-100 transition-colors">
                                                        <AlertCircle className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 group-hover:text-rose-700 transition-colors">{alert.patient.name}</h4>
                                                        <p className="text-sm text-slate-500">Symptoms: {alert.symptoms.slice(0, 30)}...</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full mb-1">
                                                        {alert.severity}
                                                    </span>
                                                    <p className="text-xs text-slate-400">Just now</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-panel p-12 text-center text-slate-400">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Activity className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p>No critical alerts pending. All clear in {worker.village}.</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column / Quick Links */}
                        <div className="space-y-6">
                            <div className="glass-panel p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none">
                                <h3 className="font-bold text-lg mb-2">Telemedicine Connect</h3>
                                <p className="text-indigo-100 text-sm mb-6">Connect directly with specialist doctors for complex cases.</p>
                                <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl font-semibold transition-all">
                                    Start Consultation
                                </button>
                            </div>

                            <div className="glass-panel p-6">
                                <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "Community Risk Level", val: "Low", color: "text-emerald-600" },
                                        { label: "Pending Follow-ups", val: "5", color: "text-amber-600" },
                                        { label: "Vaccination Drive", val: "Active", color: "text-blue-600" }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-sm text-slate-500">{stat.label}</span>
                                            <span className={`font-bold text-sm ${stat.color}`}>{stat.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
