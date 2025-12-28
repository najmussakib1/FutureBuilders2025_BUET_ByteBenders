'use client';

import { useState } from 'react';
import { searchPatients } from '@/app/actions/patient';
import { Search, User, Phone, MapPin, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Patient {
    id: string;
    patientId: string;
    name: string;
    age: number;
    gender: string;
    phone?: string | null;
    village: string;
    medicalRecords: any[];
    medicalAlerts: any[];
}

export default function PatientSearch({ workerId }: { workerId: string }) {
    const [query, setQuery] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        const result = await searchPatients(query, workerId);
        setLoading(false);
        setSearched(true);

        if (result.success && result.patients) {
            setPatients(result.patients);
        } else {
            setPatients([]);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by Patient ID, Name, or Phone..."
                        className="input-field pl-12 text-lg"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {loading && (
                <div className="flex justify-center py-12">
                    <div className="spinner"></div>
                </div>
            )}

            {!loading && searched && patients.length === 0 && (
                <div className="text-center py-12 card">
                    <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No patients found</h3>
                    <p className="text-gray-500 mb-6">Try a different search term or create a new patient</p>
                    <Link href="/patient/new" className="btn-primary inline-block">
                        Create New Patient
                    </Link>
                </div>
            )}

            {!loading && patients.length > 0 && (
                <div className="space-y-4 fade-in">
                    {patients.map((patient) => (
                        <Link
                            key={patient.id}
                            href={`/patient/${patient.id}`}
                            className="card block hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                        {patient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{patient.name}</h3>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                {patient.patientId}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <User size={16} />
                                                <span>{patient.age} years • {patient.gender}</span>
                                            </div>
                                            {patient.phone && (
                                                <div className="flex items-center space-x-2">
                                                    <Phone size={16} />
                                                    <span>{patient.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2">
                                                <MapPin size={16} />
                                                <span>{patient.village}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FileText size={16} />
                                                <span>{patient.medicalRecords.length} records</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {patient.medicalAlerts.length > 0 && (
                                    <div className="ml-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                                            <AlertCircle size={16} className="mr-1" />
                                            Active Alert
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
