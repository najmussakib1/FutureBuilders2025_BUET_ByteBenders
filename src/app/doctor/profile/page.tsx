'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Stethoscope,
    MapPin,
    ChevronLeft,
    Save,
    Activity,
    Shield
} from 'lucide-react';
import DoctorSidebar from '@/components/layout/DoctorSidebar';
import LocationPicker from '@/components/alert/LocationPicker';
import { getDoctorData, updateDoctorLocation } from '@/app/actions/doctor';
import { motion } from 'framer-motion';

export default function DoctorProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedLoc, setSelectedLoc] = useState<{ lat: number, lng: number } | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        } else if (session?.user?.id) {
            fetchDoctorData();
        }
    }, [session, status]);

    const fetchDoctorData = async () => {
        console.log('--- DOCTOR PROFILE: FETCHING DATA ---');
        const result = await getDoctorData(session!.user!.id!);
        if (result.success && result.doctor) {
            console.log('--- DOCTOR PROFILE: DATA RECEIVED ---', result.doctor.name);
            const doc = result.doctor as any;
            setDoctor(doc);
            if (doc.lat && doc.lng) {
                console.log('--- DOCTOR PROFILE: SETTING INITIAL LOC ---', { lat: doc.lat, lng: doc.lng });
                setSelectedLoc({ lat: doc.lat, lng: doc.lng });
            }
        }
        setLoading(false);
    };

    const handleLocationSave = async () => {
        console.log('--- DOCTOR PROFILE: SAVE CLICKED ---');
        if (!selectedLoc) {
            console.log('--- DOCTOR PROFILE: ERROR - NO LOCATION SELECTED ---');
            return;
        }
        if (!session?.user?.id) {
            console.log('--- DOCTOR PROFILE: ERROR - NO SESSION ID ---');
            return;
        }

        console.log('--- DOCTOR PROFILE: UPDATING ---', { id: session.user.id, loc: selectedLoc });
        setSaving(true);
        setStatusMsg(null);

        try {
            const result = await updateDoctorLocation(session.user.id, selectedLoc.lat, selectedLoc.lng);
            console.log('--- DOCTOR PROFILE: UPDATE RESULT ---', result);
            setSaving(false);

            if (result.success) {
                setStatusMsg({ type: 'success', text: 'Location updated successfully!' });
                // Auto-hide after 3 seconds
                setTimeout(() => setStatusMsg(null), 3000);
            } else {
                setStatusMsg({ type: 'error', text: result.error || 'Failed to update location' });
            }
        } catch (err) {
            console.error('--- DOCTOR PROFILE: FATAL ERROR ---', err);
            setSaving(false);
            setStatusMsg({ type: 'error', text: 'An unexpected error occurred' });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <DoctorSidebar
                doctorName={session?.user?.name || 'Doctor'}
                specialization="General Medicine"
            />

            <main className="flex-1 lg:pl-72 relative transition-all duration-300">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-3xl -z-10" />

                <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Back
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Profile Info Card */}
                        <div className="md:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-6 text-center"
                            >
                                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4 border-4 border-white shadow-xl">
                                    <User size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{doctor?.name}</h3>
                                <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                                    <Shield size={14} />
                                    Verified Doctor
                                </p>

                                <div className="mt-8 space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Mail size={18} className="text-indigo-500" />
                                        <span className="text-sm truncate font-medium">{doctor?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Stethoscope size={18} className="text-indigo-500" />
                                        <span className="text-sm font-medium">General Medicine</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Location Management */}
                        <div className="md:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-panel p-8"
                            >
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <MapPin className="text-indigo-600" size={20} />
                                        Practice Location
                                    </h3>
                                    <button
                                        onClick={handleLocationSave}
                                        disabled={saving || !selectedLoc}
                                        className="btn-premium py-2 px-6 text-sm flex items-center gap-2"
                                    >
                                        {saving ? 'Saving...' : (
                                            <>
                                                <Save size={16} />
                                                Update Location
                                            </>
                                        )}
                                    </button>
                                </div>

                                {statusMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`mb-6 p-4 rounded-xl text-sm font-medium ${statusMsg.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                                            }`}
                                    >
                                        {statusMsg.text}
                                    </motion.div>
                                )}

                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    Your location is used to calculate the nearest responders when dispatching ambulances.
                                    Please pin your current practice or residential area on the map.
                                </p>

                                <div className="h-[400px]">
                                    <LocationPicker
                                        initialLocation={selectedLoc}
                                        onLocationSelect={(loc) => setSelectedLoc(loc)}
                                        label="Practice Base"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
