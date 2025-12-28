'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    History,
    User,
    LogOut,
    Activity
} from 'lucide-react';

interface DoctorSidebarProps {
    doctorName: string;
    specialization: string;
}

export default function DoctorSidebar({ doctorName, specialization }: DoctorSidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/doctor/dashboard' },
        { icon: Activity, label: 'Live Alerts', href: '/doctor/cases' }, // Future route
        { icon: History, label: 'Case History', href: '/doctor/history' }, // Future route
        { icon: User, label: 'My Profile', href: '/doctor/profile' }, // Future route
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 z-50 hidden lg:flex flex-col">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl text-slate-800 tracking-tight">Doctor Portal</span>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{doctorName}</p>
                        <p className="text-xs text-slate-500 truncate">{specialization}</p>
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
