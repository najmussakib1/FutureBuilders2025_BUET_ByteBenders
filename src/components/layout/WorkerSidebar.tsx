'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    AlertCircle,
    Activity,
    LogOut,
    User,
    Settings
} from 'lucide-react';

interface WorkerSidebarProps {
    workerName: string;
    assignedArea: string;
    activeAlerts?: number;
}

export default function WorkerSidebar({ workerName, assignedArea, activeAlerts = 0 }: WorkerSidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Users, label: 'Patients', href: '/patients' },
        { icon: AlertCircle, label: 'Alerts', href: '/alerts', count: activeAlerts },
        { icon: User, label: 'My Profile', href: '/dashboard/profile' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 z-50 hidden lg:flex flex-col">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl text-slate-800 tracking-tight">Health AI</span>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-100'
                                    : 'text-slate-500 hover:text-teal-600 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                                {item.label}
                                {item.count !== undefined && item.count > 0 && (
                                    <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{workerName}</p>
                        <p className="text-xs text-slate-500 truncate">{assignedArea}</p>
                    </div>
                </div>
                <Link href="/api/auth/signout" className="flex items-center text-slate-500 hover:text-rose-600 transition-colors text-sm font-medium">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Link>
            </div>
        </aside>
    );
}
