'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DoctorSidebar from '@/components/layout/DoctorSidebar';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (session?.user?.role !== 'DOCTOR') {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading Portal...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user?.role !== 'DOCTOR') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <DoctorSidebar
                doctorName={session.user.name || 'Doctor'}
                specialization="General Medicine"
            />
            {children}
        </div>
    );
}
