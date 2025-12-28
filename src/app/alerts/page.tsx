import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { db } from '@/lib/prisma';
import { AlertCircle, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function AlertsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/');

    const worker = await db.communityWorker.findUnique({
        where: { email: session.user.email! },
        include: {
            medicalAlerts: {
                include: { patient: true },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!worker) redirect('/');

    const activeAlerts = worker.medicalAlerts.filter(a => ['PENDING', 'ESCALATED'].includes(a.status));
    const resolvedAlerts = worker.medicalAlerts.filter(a => a.status === 'RESOLVED');

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Medical Alerts</h1>
                    <p className="text-slate-500">Monitor and respond to critical health events.</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-rose-500" />
                        Active Alerts ({activeAlerts.length})
                    </h2>

                    {activeAlerts.length > 0 ? (
                        <div className="grid gap-4">
                            {activeAlerts.map(alert => (
                                <Link key={alert.id} href={`/alert/${alert.id}`}>
                                    <div className={`glass-panel p-6 border-l-4 ${alert.status === 'ESCALATED' ? 'border-l-indigo-500' : 'border-l-rose-500'} hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden`}>
                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">!</div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 group-hover:text-rose-700 transition-colors">
                                                            {alert.patient.name}
                                                        </h3>
                                                        <p className="text-xs text-slate-500">ID: {alert.patient.patientId}</p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm mt-2 max-w-xl">
                                                    <span className="font-semibold text-slate-700">Detailed Symptoms:</span> {alert.symptoms}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full mb-2">
                                                    {alert.severity} Priority
                                                </span>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(alert.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel p-8 text-center text-slate-400">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
                            <p>No pending alerts. Great job keeping up!</p>
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 mb-6">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Recently Resolved
                    </h2>
                    <div className="glass-panel overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {resolvedAlerts.map(alert => (
                                <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{alert.patient.name}</p>
                                            <p className="text-xs text-slate-500">Resolved on {new Date(alert.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                                        Archived
                                    </span>
                                </div>
                            ))}
                            {resolvedAlerts.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    No history available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
