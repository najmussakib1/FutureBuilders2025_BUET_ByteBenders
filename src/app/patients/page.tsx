import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { db } from '@/lib/prisma';
import { User, Search, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';

export default async function PatientsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/');

    const worker = await db.communityWorker.findUnique({
        where: { email: session.user.email! },
        include: {
            patients: {
                orderBy: { createdAt: 'desc' },
                include: { medicalAlerts: { where: { status: 'PENDING' } } }
            },
        },
    });

    if (!worker) redirect('/');

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">All Patients</h1>
                        <p className="text-slate-500">Manage records for {worker.village}</p>
                    </div>
                    <Link href="/patient/new" className="btn-premium">
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Patient
                    </Link>
                </div>

                <div className="glass-panel p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 text-left">
                                    <th className="pb-4 pt-2 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Patient Info</th>
                                    <th className="pb-4 pt-2 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Demographics</th>
                                    <th className="pb-4 pt-2 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="pb-4 pt-2 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {worker.patients.length > 0 ? (
                                    worker.patients.map((patient) => (
                                        <tr key={patient.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{patient.name}</p>
                                                        <p className="text-xs text-slate-500">ID: {patient.patientId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm text-slate-600">
                                                    <p>{patient.age} yrs • {patient.gender}</p>
                                                    <p className="flex items-center text-slate-400 text-xs mt-0.5">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {patient.village}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {patient.medicalAlerts.length > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                                        High Risk
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                        Stable
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Link
                                                    href={`/patient/${patient.id}`}
                                                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-500">
                                            No patients found. Add your first patient to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
