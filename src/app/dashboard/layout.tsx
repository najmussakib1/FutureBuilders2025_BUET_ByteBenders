'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WorkerSidebar from '@/components/layout/WorkerSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeAlerts, setActiveAlerts] = useState(0);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (session?.user?.role === 'DOCTOR') {
            router.push('/doctor/dashboard');
        } else if (session?.user?.role === 'AMBULANCE') {
            router.push('/ambulance/dashboard');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || (session.user?.role !== 'WORKER' && session.user?.role !== 'COMMUNITY_WORKER')) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <WorkerSidebar
                workerName={session.user.name || 'Worker'}
                assignedArea={(session.user as any).assignedArea || 'Loading...'}
                activeAlerts={activeAlerts}
            />
            {children}
        </div>
    );
}
