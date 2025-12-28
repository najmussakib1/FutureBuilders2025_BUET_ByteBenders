'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getAlertWithAssessment, resolveAlert } from '@/app/actions/alert';
import { CheckCircle, Activity, ClipboardList, ChevronLeft, Stethoscope, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import RiskAssessmentDisplay from '@/components/alert/RiskAssessmentDisplay';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import CaseNotesTimeline from '@/components/alert/CaseNotesTimeline';
import { motion } from 'framer-motion';
import { dispatchAmbulance } from '@/app/actions/ambulance';
import { Truck, MapPin as MapPinIcon, Navigation, Info } from 'lucide-react';
import { updateDoctorLocation } from '@/app/actions/doctor';
import LocationPicker from '@/components/alert/LocationPicker';

export default function DoctorAlertPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('');
    const { data: session } = useSession();
    const router = useRouter();
    const [medicalAlert, setMedicalAlert] = useState<any>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);
    const [dispatching, setDispatching] = useState(false);

    const handleLocationSelect = async (loc: { lat: number, lng: number }) => {
        if (!session?.user?.id) return;
        const result = await updateDoctorLocation(session.user.id, loc.lat, loc.lng);
        if (!result.success) {
            window.alert('Failed to update your location on the map');
        }
    };

    const handleDispatch = async () => {
        setDispatching(true);
        const result = await dispatchAmbulance(id, session?.user?.id || '');
        setDispatching(false);
        if (result.success) {
            window.alert(`Ambulance Dispatched: ${result.ambulance?.vehicle} (${result.ambulance?.name})`);
            fetchAlert(); // Refresh data
        } else {
            window.alert(result.error || 'Failed to dispatch ambulance');
        }
    };

    useEffect(() => {
        params.then(p => setId(p.id));
    }, [params]);

    useEffect(() => {
        if (id) fetchAlert();
    }, [id]);

    const fetchAlert = async () => {
        const result = await getAlertWithAssessment(id);
        if (result.success) {
            setMedicalAlert(result.alert);
        }
        setLoading(false);
    };

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        setResolving(true);
        const result = await resolveAlert(id, notes, session?.user?.id || '');
        setResolving(false);

        if (result.success) {
            router.push('/doctor/dashboard');
        } else {
            // In a real app, show a toast
            window.alert('Failed to resolve case');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Loading Patient Data...</p>
            </div>
        </div>
    );

    if (!medicalAlert) return <div className="p-8 text-center text-rose-500 font-bold">Case Not Found</div>;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <DoctorSidebar
                doctorName={session?.user?.name || 'Doctor'}
                specialization={session?.user?.id ? 'General Medicine' : ''}
            />

            <main className="flex-1 lg:pl-72 relative transition-all duration-300">
                {/* Aurora Background */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
                    {/* Header / Nav */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back to Dashboard
                        </button>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${medicalAlert.status === 'ESCALATED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                            {medicalAlert.status === 'ESCALATED' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                            {medicalAlert.status}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                                Case Review: <span className="text-indigo-700">{medicalAlert.patient.name}</span>
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Clock size={16} /> Reported {new Date(medicalAlert.createdAt).toLocaleString()}</span>
                                <span className="flex items-center gap-1"><Activity size={16} /> Severity: {medicalAlert.severity}</span>
                            </div>
                        </div>
                    </div>

                    {/* Patient Clinical Data */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-panel p-6 border-t-4 border-blue-500"
                        >
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Activity size={18} className="text-blue-600" />
                                Vitals & Symptoms
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reported Symptoms</p>
                                    <div className="flex flex-wrap gap-2">
                                        {JSON.parse(medicalAlert.symptoms).map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-md border border-blue-100">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {medicalAlert.vitalSigns && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vital Signs</p>
                                        <div className="p-4 bg-slate-50 rounded-lg text-sm font-mono text-slate-700 border border-slate-200">
                                            {/* Pretty print vitals if it's JSON, or just display */}
                                            {typeof JSON.parse(medicalAlert.vitalSigns) === 'object' ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(JSON.parse(medicalAlert.vitalSigns)).map(([key, val]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="capitalize text-slate-500">{key}:</span>
                                                            <span className="font-bold">{String(val)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : medicalAlert.vitalSigns}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-panel p-6 border-t-4 border-teal-500"
                        >
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <ClipboardList size={18} className="text-teal-600" />
                                Community Worker Report
                            </h3>
                            <div className="bg-teal-50/50 p-6 rounded-xl border border-teal-100 h-full">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                                        CW
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{medicalAlert.worker.name}</p>
                                        <p className="text-xs text-slate-500">Field Worker • {medicalAlert.worker.village}</p>
                                    </div>
                                </div>
                                <p className="text-slate-700 italic leading-relaxed">
                                    "{medicalAlert.primaryTreatment || 'No specific treatment recorded. Immediate escalation requested.'}"
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Collaborative Care Timeline */}
                    <div className="h-[500px]">
                        <CaseNotesTimeline
                            alertId={id}
                            initialNotes={(medicalAlert.caseNotes as any) || []}
                            currentUserId={session?.user?.id || ''}
                            currentUserRole="DOCTOR"
                        />
                    </div>

                    {/* AI Analysis Component */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {medicalAlert.riskAssessment ? (
                            <RiskAssessmentDisplay
                                assessment={medicalAlert.riskAssessment as any}
                                response={medicalAlert.riskAssessment.emergencyResponse ? {
                                    responseType: medicalAlert.riskAssessment.emergencyResponse.responseType || 'ADVICE_ONLY',
                                    doctorAssigned: medicalAlert.riskAssessment.emergencyResponse.doctorAssigned,
                                    doctorInfo: medicalAlert.riskAssessment.emergencyResponse.doctor ? {
                                        name: medicalAlert.riskAssessment.emergencyResponse.doctor.name,
                                        specialization: medicalAlert.riskAssessment.emergencyResponse.doctor.specialization,
                                        phone: medicalAlert.riskAssessment.emergencyResponse.doctor.phone
                                    } : undefined,
                                    ambulanceDispatched: medicalAlert.riskAssessment.emergencyResponse.ambulanceDispatched,
                                    ambulanceInfo: medicalAlert.riskAssessment.emergencyResponse.ambulance ? {
                                        vehicleNumber: medicalAlert.riskAssessment.emergencyResponse.ambulance.vehicleNumber,
                                        driverName: medicalAlert.riskAssessment.emergencyResponse.ambulance.driverName,
                                        driverPhone: medicalAlert.riskAssessment.emergencyResponse.ambulance.driverPhone
                                    } : undefined,
                                    message: medicalAlert.riskAssessment.emergencyResponse.notes || 'Emergency response initiated.'
                                } : undefined}
                                patient={{
                                    name: medicalAlert.patient.name,
                                    patientId: medicalAlert.patient.patientId,
                                }}
                            />
                        ) : (
                            <div className="glass-panel p-8 text-center animate-pulse">
                                <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p>Loading AI Analysis...</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Diagnosis / Resolution Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-8 border-t-4 border-indigo-600 shadow-xl relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                    <Stethoscope size={20} />
                                </div>
                                Clinical Resolution
                            </h2>

                            <form onSubmit={handleResolve} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                                        Diagnosis & Instructions
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 min-h-[160px] text-slate-800 placeholder:text-slate-400 transition-all font-medium"
                                        placeholder="Enter your clinical diagnosis, prescription details, and specific care instructions for the community worker..."
                                        required
                                    />
                                    <p className="text-xs text-slate-400 mt-2 ml-1 flex items-center gap-1">
                                        <ShieldAlert size={12} />
                                        Resolution will close this case and notify the community worker immediately.
                                    </p>
                                </div>

                                {/* Doctor Location Picker */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                    <LocationPicker
                                        onLocationSelect={handleLocationSelect}
                                        label="Confirm Your Current Location"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                        <Info size={12} />
                                        Setting your location helps find the absolute nearest ambulance.
                                    </p>
                                </div>

                                {/* Ambulance Dispatch Section */}
                                {!medicalAlert.riskAssessment?.emergencyResponse?.ambulanceDispatched && (
                                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4 text-emerald-800">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                                <Truck size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Dispatch Ambulance</h4>
                                                <p className="text-sm opacity-90">Auto-select the nearest responder for {medicalAlert.patient.name}.</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDispatch}
                                            disabled={dispatching}
                                            className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-200"
                                        >
                                            {dispatching ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Locating...
                                                </>
                                            ) : (
                                                <>
                                                    Request Nearest Ambulance
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {medicalAlert.riskAssessment?.emergencyResponse?.ambulanceDispatched && (
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                        <div className="flex items-center gap-4 text-slate-800 mb-4">
                                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                                <Truck size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">Ambulance Dispatched</h4>
                                                <p className="text-sm text-slate-500">Emergency responder is on the way.</p>
                                            </div>
                                            <div className="ml-auto flex flex-col items-end">
                                                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                                    {medicalAlert.riskAssessment.emergencyResponse.status}
                                                </span>
                                                <span className="text-[10px] text-slate-400 mt-1 font-mono">
                                                    Order ID: {medicalAlert.id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Responder Info</p>
                                                <p className="font-bold text-slate-800">{medicalAlert.riskAssessment.emergencyResponse.ambulance?.driverName || 'Assigning...'}</p>
                                                <p className="text-sm text-slate-500">{medicalAlert.riskAssessment.emergencyResponse.ambulance?.vehicleNumber}</p>
                                            </div>
                                            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ETA / Contact</p>
                                                <p className="font-bold text-slate-800">{medicalAlert.riskAssessment.emergencyResponse.ambulance?.driverPhone}</p>
                                                <p className="text-sm text-emerald-600 font-medium">Driver Active</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={resolving}
                                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 hover:shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                                    >
                                        {resolving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={18} />
                                                Submit & Resolve
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
