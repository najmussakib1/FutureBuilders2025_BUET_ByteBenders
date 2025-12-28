'use client';

import { useState } from 'react';
import { submitPrimaryTreatment, escalateToDoctor } from '@/app/actions/alert';
import { Stethoscope, ArrowRight, Check, Activity, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkerIntervention({ alertId }: { alertId: string }) {
    const router = useRouter();
    const [treatment, setTreatment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await submitPrimaryTreatment(alertId, treatment);
        setLoading(false);
        if (result.success) {
            router.refresh();
        } else {
            alert('Failed to submit treatment');
        }
    };

    return (
        <div className="glass-panel p-6 border-l-4 border-teal-500 animate-enter my-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Stethoscope className="mr-2 text-teal-600" />
                Step 2: Community Worker Intervention
            </h3>
            <p className="text-slate-500 mb-4 text-sm">
                Based on the AI assessment, please provide immediate primary care and document your actions below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Care Actions</label>
                    <textarea
                        required
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        placeholder="E.g., Administered ORS, checked BP, kept patient in recovery position..."
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium w-full md:w-auto"
                >
                    {loading ? 'Saving...' : 'Record Care & Proceed'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                </button>
            </form>
        </div>
    );
}

export function DoctorEscalation({ alertId, doctors }: { alertId: string, doctors: any[] }) {
    const router = useRouter();
    const [selectedDoc, setSelectedDoc] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEscalate = async () => {
        if (!selectedDoc) return;
        setLoading(true);
        const result = await escalateToDoctor(alertId, selectedDoc);
        setLoading(false);
        if (result.success) {
            router.refresh();
        } else {
            alert('Escalation failed');
        }
    };

    return (
        <div className="glass-panel p-6 border-l-4 border-indigo-500 animate-enter my-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Activity className="mr-2 text-indigo-600" />
                Step 3: Escalate to Specialist
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
                Treatment recorded. Now select a doctor to take over the case.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {doctors.map(doc => (
                    <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDoc === doc.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-slate-100 bg-white hover:border-indigo-200'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedDoc === doc.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {doc.name.charAt(3)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{doc.name}</p>
                                <p className="text-xs text-slate-500">{doc.specialization}</p>
                            </div>
                            {selectedDoc === doc.id && <Check className="ml-auto text-indigo-600" size={20} />}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleEscalate}
                disabled={!selectedDoc || loading}
                className="btn-premium w-full bg-indigo-600 hover:bg-indigo-700"
            >
                {loading ? 'Forwarding...' : 'Forward Case to Doctor'}
                <MessageSquare className="ml-2 w-4 h-4" />
            </button>
        </div>
    );
}
